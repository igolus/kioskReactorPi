const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require('uuid');
const config = require('../../../conf/config.json')
const {eventTypeSnapReady, buildEventJson} = require("../webSocket/eventTypes");
const {loggerCommand} = require("../util/loggerUtil");

let storageBucket;
if (config.bucketName) {
    try {
        const storage = new Storage({
            keyFilename: "../../../conf/myReactorKioskUser.json",
        });
        storageBucket = storage.bucket("totemsystem-5889b.appspot.com");
    }
    catch (err) {
        loggerCommand.error("no bucket configured")
    }
}

const uploadSnap = (ws, device, dataJSON) => {
    if (!storageBucket) {
        return;
    }
    let destination = "devices/" + device.id + "/photos/" + uuidv4() + ".jpg";
    const options = {
        destination: destination,
        preconditionOpts: {ifGenerationMatch: 0},
    };
    storageBucket.upload("../../../snap.jpg", options)
        .then(data => {
            loggerCommand.info('Uploaded a blob or file!');
            const file = storageBucket.file(destination);
            return file.getSignedUrl({
                action: 'read',
                expires: '03-09-2491'
            });
        })
        .then(signedUrls => {
            try {
                ws.send(buildEventJson(eventTypeSnapReady, signedUrls[0], dataJSON.commandParam), {binary: true});
                loggerCommand.info("Snap URL: " + signedUrls[0]);
            } catch (err) {
                loggerCommand.error("Failed to send snap ready event: " + err.message);
            }
        })
        .catch(err => {
            loggerCommand.error("Error uploading snapshot: " + err.message);
        })
}

module.exports = {
    uploadSnap: uploadSnap
}
