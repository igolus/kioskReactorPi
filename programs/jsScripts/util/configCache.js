const fs = require('fs');
const path = require('path');

const CACHE_DIR = path.join(__dirname, '../../../conf');
const DEVICE_CACHE_FILE = path.join(CACHE_DIR, 'device.cache.json');
const PROJECT_CACHE_FILE = path.join(CACHE_DIR, 'project.cache.json');

/**
 * Save device configuration to local cache
 * @param {Object} device - Device configuration object
 */
function saveDeviceCache(device) {
    if (!device) return;

    try {
        fs.writeFileSync(DEVICE_CACHE_FILE, JSON.stringify(device, null, 2), 'utf8');
        console.log('Device configuration cached successfully');
    } catch (error) {
        console.error('Failed to save device cache:', error.message);
    }
}

/**
 * Load device configuration from local cache
 * @returns {Object|null} - Cached device configuration or null if not found
 */
function loadDeviceCache() {
    try {
        if (!fs.existsSync(DEVICE_CACHE_FILE)) {
            console.log('No device cache file found');
            return null;
        }

        const data = fs.readFileSync(DEVICE_CACHE_FILE, 'utf8');
        const device = JSON.parse(data);
        console.log('Device configuration loaded from cache');
        return device;
    } catch (error) {
        console.error('Failed to load device cache:', error.message);
        return null;
    }
}

/**
 * Save project configuration to local cache
 * @param {Object} project - Project configuration object
 */
function saveProjectCache(project) {
    if (!project) return;

    try {
        fs.writeFileSync(PROJECT_CACHE_FILE, JSON.stringify(project, null, 2), 'utf8');
        console.log('Project configuration cached successfully');
    } catch (error) {
        console.error('Failed to save project cache:', error.message);
    }
}

/**
 * Load project configuration from local cache
 * @returns {Object|null} - Cached project configuration or null if not found
 */
function loadProjectCache() {
    try {
        if (!fs.existsSync(PROJECT_CACHE_FILE)) {
            console.log('No project cache file found');
            return null;
        }

        const data = fs.readFileSync(PROJECT_CACHE_FILE, 'utf8');
        const project = JSON.parse(data);
        console.log('Project configuration loaded from cache');
        return project;
    } catch (error) {
        console.error('Failed to load project cache:', error.message);
        return null;
    }
}

/**
 * Clear all cached configurations
 */
function clearCache() {
    try {
        if (fs.existsSync(DEVICE_CACHE_FILE)) {
            fs.unlinkSync(DEVICE_CACHE_FILE);
        }
        if (fs.existsSync(PROJECT_CACHE_FILE)) {
            fs.unlinkSync(PROJECT_CACHE_FILE);
        }
        console.log('Cache cleared successfully');
    } catch (error) {
        console.error('Failed to clear cache:', error.message);
    }
}

module.exports = {
    saveDeviceCache,
    loadDeviceCache,
    saveProjectCache,
    loadProjectCache,
    clearCache
};
