const {fireBaseDb} = require("./firebaseUtil");
const { projectsCollection, brandsCollection} = require("./collectionsNames");
const { saveProjectCache, loadProjectCache } = require('../util/configCache');

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

const getCurrentProject = async (currentDevice, retries = 3, useCache = true) => {
    if (!currentDevice || !currentDevice.projectId) {
        return null;
    }

    try {
        const project = await retryWithBackoff(async () => {
            const doc = await fireBaseDb
                .collection(brandsCollection)
                .doc(currentDevice.brandId)
                .collection(projectsCollection)
                .doc(currentDevice.projectId)
                .get();
            return doc.exists && doc.data();
        }, retries);

        // Save to cache if successfully loaded
        if (project) {
            saveProjectCache(project);
        }

        return project;
    } catch (error) {
        // If Firebase is unavailable and cache is enabled, try to load from cache
        if (useCache && (error.code === 'unavailable' || error.code === 'failed-precondition')) {
            console.log('Firebase unavailable, attempting to load project from cache...');
            const cachedProject = loadProjectCache();
            if (cachedProject) {
                console.log('Using cached project configuration');
                cachedProject.fromCache = true;
                return cachedProject;
            }
        }
        throw error;
    }
}

module.exports = {
    getCurrentProject: getCurrentProject,
}

