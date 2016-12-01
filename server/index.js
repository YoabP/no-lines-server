'use strict'
//set default node enviroment for development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';
console.log('Env: ' + env);

//export the app
module.exports = require ('./app');
