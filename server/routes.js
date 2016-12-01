/**
* Main app routes
*/
'use strict';

var express    = require('express');
var admin = require("firebase-admin");
var mail = require('./config/mail');

module.exports = function(app){
  //Routes for the API
  var router = express.Router();

  router.use(function(req, res, next) {
    next();
  });

  //general routes
  router.get('/', function(req,res){
    res.json({
      owner: 'Yoab Pizarro',
      description: 'API for no-lines queues'
    });
  });

  router.post('/users/new',function (req,res){
    var email = req.body.email;
    var pass  = req.body.password;
    var name  = req.body.name;

    if(!email || !pass || !name){
      return res.status(500).send("Missing Parameters");
    }
    admin.auth().createUser({
      email: email,
      emailVerified: false,
      password: pass,
      displayName: name,
      disabled: false
    })
      .then(function(userRecord) {
          return res.status(201).json(userRecord);
        })
      .catch(function(error) {
        return res.status(500).send(error);
      });
  });

  //API routes
  router.post('/enqueue',function(req, res){
    var queueName = req.body.business_id;
    var name = req.body.name;
    var email = req.body.email;
    var tableSize = req.body.table_size;
    var db = admin.database();
    var queueRef = db.ref("queues");

    if(!email || !queueName || !tableSize){
      return res.status(500).send("Missing Parameters");
    }
    var userToEnqueue = {
      name: req.body.name,
      email: email,
    }
    return res.status(201)
      .json(
        queueRef.child(queueName)
        .child(tableSize)
        .push(userToEnqueue).key
    );
  });

  router.post('/dequeue', function(req, res){
    var queueName = req.body.business_id;
    var tableSize = req.body.table_size;
    var db = admin.database();
    var queueRef = db.ref("queues");
    var activeQueue = queueRef
      .child(queueName)
      .child(tableSize);
    activeQueue.once("value", function(data) {
      var key, val; //first person on the queue
      data.forEach(function (child){
        key = child.key;
        val = child.val();
        return true;
      });
      var reciever = {
        email: val.email,
        name: val.name,
        business: queueName
      };
      mail.sendMail(reciever);
      //remove from queue
      var userRef = activeQueue.child(key);
      userRef.remove()
      .then(function() {
        console.log("Remove succeeded.")
      })
      .catch(function(error) {
        console.log("Remove failed: " + error.message)
      });
      return res.send("sent");
    });
  });
  app.use('/api', router);
};
