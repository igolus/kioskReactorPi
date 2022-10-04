const {fireBaseDb} = require("../dbUtil/firebaseUtil");
const {devicesCollection, projectsCollection, brandsCollection} = require("../dbUtil/collectionsNames");
const {readConfig} = require("../util/configFileUtil");
const {loggerWs} = require("../util/loggerUtil");

let config = readConfig();

const listenToDeviceChange = (callBackChange) => {
    const queryDevice = fireBaseDb
        .collection(devicesCollection)
        .where('deviceId', '==', config.deviceId);
    queryDevice.docChanges().forEach(async (change) => {
        let device = change.doc.data();
        callBackChange(device);
    })
}

const listenToProjectChange = (brandId, projectId, callBackChange) => {
    const queryDevice = fireBaseDb
        .collection(brandsCollection)
        .doc(brandId)
        .collection(projectsCollection)
        .doc(projectId)

    queryDevice.onSnapshot(change => {
        let project = change.data();
        callBackChange(project);
    }, err => {
        loggerWs.log(`Encountered error: ${err}`);
    });
}

module.exports = {
    listenToDeviceChange: listenToDeviceChange,
    listenToProjectChange: listenToProjectChange
}
