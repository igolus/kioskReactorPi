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

module.exports = {
    getVersion: getVersion,
}