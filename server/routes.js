/**
* Main app routes
*/
'use strict';

var express    = require('express');
var admin = require("firebase-admin");

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
    var uid = req.body.uid;
    var tableSize = req.body.table_size;
    var db = admin.database();
    var queueRef = db.ref("queues");

    if(!uid || !queueName || !tableSize){
      return res.status(500).send("Missing Parameters");
    }
    return res.status(201)
      .json(
        queueRef.child(queueName)
        .child(tableSize)
        .push(uid).key
    );
  });
    /*admin.auth().getUser(uid)
    .then(function(userRecord) {
      queueRef.child(queueName)
      .child(tableSize)
      .push(userRecord.uid)
    })
    .catch(function(error) {
      return res.status(500).send(error);
    });*/

  ///});
  router.post('/dequeue', function(req, res){
    var queueName = req.body.business_id;
    var tableSize = req.body.table_size;
    var db = admin.database();
    var queueRef = db.ref("queues");
    var activeQueue = queueRef
      .child(queueName)
      .child(tableSize);
    //TODO fix this
    activeQueue.once("value", function(data) {
      var key, val; //first person on the queue
      data.forEach(function (child){
        key = child.key;
        val = child.val();
        return true;
      });
      admin.auth().getUser(val)
      .then(function(userRecord) {
        var email = userRecord.email;
        console.log(email);
        
        return res.send("placeholder");
      })
      .catch(function(error) {
        return res.status(500).send(error);
      });
    });
  });
  app.use('/api', router);
};
