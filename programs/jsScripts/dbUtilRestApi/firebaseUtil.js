const admin = require('firebase-admin');
const fireBaseDb = admin.firestore();
const fireBaseStorage = admin.storage();
//const getStorage = require('firebase/storage');
const { getStorage, ref } = require("firebase/storage");

module.exports = {
    fireBaseDb: fireBaseDb,
    fireBaseStorage: fireBaseStorage,
    getStorage: getStorage,
    storageRef: ref,
}