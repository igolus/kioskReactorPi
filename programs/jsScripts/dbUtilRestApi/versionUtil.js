const {fireBaseDb} = require("./firebaseUtil");
const {versionCollection} = require("./collectionsNames");
const versionId = "OTbqvl7k8F5CndasQc4m";

const getVersion = async () => {
    const doc = await fireBaseDb
        .collection(versionCollection)
        .doc(versionId)
        .get();

    return doc.exists && doc.data();
}

const PATCH = "patch";
const MINOR = "minor";
const MAJOR = "major";

const updateVersionRelease = async (type) => {
    const versionItem = await getVersion();
    let versionValues = versionItem.version.split(".");
    if (type === PATCH) {
        versionValues[2] = parseInt(versionValues[2]) + 1;
    }
    else if (type === MINOR) {
        versionValues[1] = parseInt(versionValues[1]) + 1;
    }
    else if (type === MAJOR) {
        versionValues[0] = parseInt(versionValues[0]) + 1;
    }

    const newVersion = versionValues.join('.');
    console.log("New version: " + newVersion)
    await updateVersion({version: newVersion})
}

const updateVersion = async (data) => {
    const doc = await fireBaseDb
        .collection(versionCollection)
        .doc(versionId)

    await doc.set(data);
    return data;
}

module.exports = {
    getVersion: getVersion,
    updateVersion: updateVersion,
    updateVersionRelease: updateVersionRelease,
    PATCH: PATCH,
    MINOR: MINOR,
    MAJOR: MAJOR
}