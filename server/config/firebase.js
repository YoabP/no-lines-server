/**
 * firebase configuration
*/
"use strict";

var admin = require("firebase-admin");
var config = require ('./environment');
exports.app = admin.initializeApp({
  credential: admin.credential.cert(config.firebase.serviceAccount),
  databaseURL: config.firebase.databaseURL
});
