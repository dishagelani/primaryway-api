const admin = require('firebase-admin');
const serviceAccount = require('../service-account.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'primarywayapi.appspot.com',
});

const bucket = admin.storage().bucket();

module.exports = { bucket };