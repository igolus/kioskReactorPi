const firebase = require('firebase/app')
require("firebase/firestore");
const firebaseConfig = require('../../../conf/firebaseconfig.json')
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig)
}
const db = firebase.firestore();

module.exports = {
    fireBaseDb: db
}
