const firebase = require('firebase')
require("firebase/firestore");
const firebaseConfig = require('../../conf/firebaseconfig.json')
firebase.initializeApp(firebaseConfig)
const db = firebase.firestore();

// db.
// const {getBrand} = require("./dbUtil/brandUtil");

(async () => {
    //device = await getCurrentDevice();

    const doc = await db
        .collection("brands")
        .doc("8wB54UfkjD7TWyIomq8X")
        .get();

    //const brand = await getBrand("8wB54UfkjD7TWyIomq8X");
    console.log(JSON.stringify(doc.data()))
})();