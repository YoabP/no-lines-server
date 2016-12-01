/**
*  Main app file
*/
'use strict';

//dependencies
var express  = require ('express');
var config   = require ('./config/environment');

//connect to firebase
require('./config/firebase');
//setup server
var app = express();
require ('./config/express')(app);
require ('./routes') (app);
//error handling
app.use(function (err, req, res, next) {
  console.log('hand');
  if(!err) return next();
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(config.port);
console.log('Server listening on port: ' + config.port);
module.exports = app;
