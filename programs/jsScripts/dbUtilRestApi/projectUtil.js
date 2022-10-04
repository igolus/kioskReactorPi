const {fireBaseDb} = require("./firebaseUtil");
const { projectsCollection, brandsCollection} = require("./collectionsNames");

const getCurrentProject = async (currentDevice) => {
    if (!currentDevice || !currentDevice.projectId) {
        return null;
    }
    const doc = await fireBaseDb
        .collection(brandsCollection)
        .doc(currentDevice.brandId)
        .collection(projectsCollection)
        .doc(currentDevice.projectId)
        .get();
    return doc.exists && doc.data();
}

module.exports = {
    getCurrentProject: getCurrentProject,
}

