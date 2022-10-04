const { Storage } = require("@google-cloud/storage");
const firebaseConfig = require('../../../conf/firebaseconfig.json')
const { v4: uuidv4 } = require('uuid');
const {buildCommandJson, internalCommandTypePlayMp3, commandTypeSnapReady} = require("../webSocket/commandTypes");
const {buildEventJson, eventTypeQrCode, eventTypeSnapReady} = require("../webSocket/eventTypes");

const storage = new Storage({
    keyFilename: "../../../conf/totemsystem-5889b-firebase-adminsdk-p2mja-f9bb68a5da.json",
});

const storageBucket = storage.bucket(firebaseConfig.storageBucket);

const uploadSnap = (ws, device, dataJSON) => {
    let destination = "devices/" + device.id + "/photos/" + uuidv4() + ".jpg";
    const options = {
        destination: destination,
        preconditionOpts: {ifGenerationMatch: 0},
    };
    storageBucket.upload("../../../snap.jpg", options).then(data => {
        console.log('Uploaded a blob or file!');
        const file = storageBucket.file(destination);
        return file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
        }).then(signedUrls => {
            ws.send(buildEventJson(eventTypeSnapReady, signedUrls[0], dataJSON.commandParam), {binary: true});
            console.log(signedUrls[0]);
        });
    })
}
module.exports = {
    uploadSnap: uploadSnap
}