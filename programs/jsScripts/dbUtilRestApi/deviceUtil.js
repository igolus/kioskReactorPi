const {fireBaseDb} = require("./firebaseUtil");
const { devicesCollection, billingCollection, brandsCollection, versionCollection} = require("./collectionsNames");
const config = require('../../../conf/config.json');
const moment = require("moment");

const createDeviceIdDb = async (deviceId) => {
    const item = await fireBaseDb
        .collection(devicesCollection)
        .doc(deviceId);
    await item.set({
        deviceId: deviceId,
        version: "1.0.0"
    });
}

const getCurrentDevice = async () => {
    const doc = await fireBaseDb
        .collection(devicesCollection)
        .doc(config.deviceId)
        .get();

    return doc.exists && doc.data();
}

const addBilling = async (deviceId) => {
    const device = await getDevice(deviceId)
    const currentDay = moment().format("YYYYMMDD");

    if (!device) {
        return false;
    }
    const doc = await fireBaseDb
        .collection(brandsCollection)
        .doc(device.brandId)
        .collection(billingCollection)
        .doc(currentDay)

    const item = await doc.get();
    if (!item.exists) {
        await doc.set({
            devices: [{
                deviceId: deviceId
            }],
            billed: false
        });
    }

    else {
        billingData = item.data();
        if (!billingData.devices.find(d=> d.deviceId === deviceId)) {
            await doc.set({
                devices: [...billingData.devices, {
                    deviceId: deviceId
                }]
            });
        }
    }
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
    addBilling: addBilling
}

