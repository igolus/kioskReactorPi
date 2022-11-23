const {fireBaseDb} = require("./firebaseUtil");
const { devicesCollection, billingCollection, brandsCollection, versionCollection} = require("./collectionsNames");
const config = require('../../../conf/config.json');
const moment = require("moment");

const createDeviceIdDb = async (deviceId, lite) => {
    const item = await fireBaseDb
        .collection(devicesCollection)
        .doc(deviceId);
    let data = {
        deviceId: deviceId,
        version: "1.0.0"
    };
    if (lite) {
        data.lite = true;
    }
    await item.set(data);
}

const getCurrentDevice = async () => {
    const doc = await fireBaseDb
        .collection(devicesCollection)
        .doc(config.deviceId)
        .get();

    return doc.exists && doc.data();
}

const getDevice = async (deviceId) => {
    const doc = await fireBaseDb
        .collection(devicesCollection)
        .doc(deviceId)
        .get();

    return doc.exists && doc.data();
}

const updateDevice = async (data) => {
    const doc = await fireBaseDb
        .collection(devicesCollection)
        .doc(data.id)

    await doc.set(data);
    return data;
}

module.exports = {
    createDeviceIdDb: createDeviceIdDb,
    getCurrentDevice: getCurrentDevice,
    getDevice: getDevice,
    updateDevice: updateDevice,
}

