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
    var type = req.body.type;

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
        var db = admin.database();
        var usersRef = db.ref("users");
        var userRef = usersRef.child(userRecord.uid);
        userRef.set({
            name: userRecord.displayName,
            type: type
          });
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
    //get business name
    var businessName;
    var usersRef = db.ref("users");
    var bizRef = usersRef.child(queueName);
    var biz;
    bizRef.once("value", function(data) {
      biz = data.val();
      if(biz && biz.type == 'biz'){
        //name the queue
        businessName = biz.name;
        queueRef.child(queueName)
        .child('name').set(businessName);
        return res.status(201)
        .json(
          queueRef.child(queueName)
          .child('queue')
          .child(tableSize)
          .push(userToEnqueue).key
        );
      }
      else{
        return res.status(404).send("Business Not Found");
      }
    });
  });

  router.post('/dequeue', function(req, res){
    var queueName = req.body.business_id;
    var tableSize = req.body.table_size;
    var db = admin.database();
    var queueRef = db.ref("queues");

    var queueRoot = queueRef
      .child(queueName);
    queueRoot.child('name').once("value", function(data) {
      var businessName = data.val();
      var activeQueue = queueRoot
        .child('queue')
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
          business: businessName
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
  });
  app.use('/api', router);
};
