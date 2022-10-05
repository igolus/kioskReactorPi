const firebase = require('firebase')
const admin = require('firebase-admin');
//const firebaseConfig = require('../../conf/firebaseconfig.json')
//firebase.initializeApp(firebaseConfig)

//const serviceAccount = require('../../conf/totemsystem-5889b-a39ccea0194c.json');
// const serviceAccount = require('../../conf/totemsystem-5889b-firebase-adminsdk-p2mja-94ef50a2a7.json');
// const firebaseConfig = require('../../conf/firebaseconfig.json')
// firebase.initializeApp(firebaseConfig)
//
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: firebaseConfig.databaseURL,
//     storageBucket: firebaseConfig.storageBucket
// });
//
// const {getBrand} = require("./dbUtil/brandUtil");
//
// (async () => {
//     //device = await getCurrentDevice();
//     const brand = await getBrand("8wB54UfkjD7TWyIomq8X");
//     console.log(JSON.stringify(brand))
// })();