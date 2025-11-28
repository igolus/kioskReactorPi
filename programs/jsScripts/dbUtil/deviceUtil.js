const {fireBaseDb} = require("./firebaseUtil");
const { devicesCollection, billingCollection, brandsCollection, versionCollection, icaCollection} = require("./collectionsNames");
const config = require('../../../conf/config.json');
const moment = require("moment");
const { saveDeviceCache, loadDeviceCache } = require('../util/configCache');

// Retry helper with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries - 1;
            const isOfflineError = error.code === 'unavailable' || error.code === 'failed-precondition';

            if (isLastAttempt || !isOfflineError) {
                throw error;
            }

            const delay = initialDelay * Math.pow(2, attempt);
            console.log(`Firebase unavailable, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

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

const getCurrentDevice = async (retries = 3, useCache = true) => {
    try {
        const device = await retryWithBackoff(async () => {
            const doc = await fireBaseDb
                .collection(devicesCollection)
                .doc(config.deviceId)
                .get();

            return doc.exists && doc.data();
        }, retries);

        // Save to cache if successfully loaded
        if (device) {
            saveDeviceCache(device);
        }

        return device;
    } catch (error) {
        // If Firebase is unavailable and cache is enabled, try to load from cache
        if (useCache && (error.code === 'unavailable' || error.code === 'failed-precondition')) {
            console.log('Firebase unavailable, attempting to load device from cache...');
            const cachedDevice = loadDeviceCache();
            if (cachedDevice) {
                console.log('Using cached device configuration');
                cachedDevice.fromCache = true;
                return cachedDevice;
            }
        }
        throw error;
    }
}

const getCurrentBrand = async (brandId, retries = 3) => {
    return retryWithBackoff(async () => {
        const doc = await fireBaseDb
            .collection(brandsCollection)
            .doc(brandId)
            .get();

        return doc.exists && doc.data();
    }, retries);
}

const getIca = async (brandId, retries = 3) => {
    return retryWithBackoff(async () => {
        const doc = await fireBaseDb
            .collection(brandsCollection)
            .doc(brandId)
            .collection(icaCollection)
            .doc("1")
            .get();

        return doc.exists && doc.data();
    }, retries);
}

const getDevice = async (deviceId, retries = 3) => {
    return retryWithBackoff(async () => {
        const doc = await fireBaseDb
            .collection(devicesCollection)
            .doc(deviceId)
            .get();

        return doc.exists && doc.data();
    }, retries);
}

const updateDevice = async (data, retries = 3) => {
    return retryWithBackoff(async () => {
        const doc = await fireBaseDb
            .collection(devicesCollection)
            .doc(data.id)

        await doc.set(data);
        return data;
    }, retries);
}

module.exports = {
    createDeviceIdDb: createDeviceIdDb,
    getCurrentDevice: getCurrentDevice,
    getCurrentBrand: getCurrentBrand,
    getIca: getIca,
    getDevice: getDevice,
    updateDevice: updateDevice,
}

