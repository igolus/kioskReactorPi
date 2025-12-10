const {fireBaseDb} = require("./firebaseUtil");
const { projectsCollection, brandsCollection} = require("./collectionsNames");
const { saveProjectCache, loadProjectCache, loadProjectCacheFallback } = require('../util/configCache');

// Track if initial load has been done (first call always goes to Firebase)
let initialProjectLoadDone = false;

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

    // 1. Check cache first (with TTL validation) - but only after initial load
    if (useCache && initialProjectLoadDone) {
        const cachedProject = loadProjectCache();
        if (cachedProject) {
            cachedProject.fromCache = true;
            return cachedProject;
        }
    }

    // 2. Cache expired/missing or first call - fetch from Firebase
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
            initialProjectLoadDone = true;
        }

        return project;
    } catch (error) {
        // 3. Firebase unavailable - fallback to cache (ignore TTL)
        if (useCache && (error.code === 'unavailable' || error.code === 'failed-precondition')) {
            console.log('Firebase unavailable, attempting to load project from cache (fallback)...');
            const cachedProject = loadProjectCacheFallback();
            if (cachedProject) {
                cachedProject.fromCache = true;
                initialProjectLoadDone = true;
                return cachedProject;
            }
        }
        throw error;
    }
}

module.exports = {
    getCurrentProject: getCurrentProject,
}

