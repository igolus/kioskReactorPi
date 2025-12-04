const fs = require('fs');
const path = require('path');
const { loggerCommand } = require('./loggerUtil');

const CACHE_DIR = path.join(__dirname, '../../../conf');
const DEVICE_CACHE_FILE = path.join(CACHE_DIR, 'device.cache.json');
const PROJECT_CACHE_FILE = path.join(CACHE_DIR, 'project.cache.json');

/**
 * Save device configuration to local cache with timestamp
 * @param {Object} device - Device configuration object
 */
function saveDeviceCache(device) {
    if (!device) return;

    try {
        const cacheData = {
            timestamp: Date.now(),
            data: device
        };
        fs.writeFileSync(DEVICE_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf8');
    } catch (error) {
        loggerCommand.error('Failed to save device cache: ' + error.message);
    }
}

// Default TTL: 10 minutes
const DEFAULT_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Load device configuration from local cache
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 * @returns {Object|null} - Cached device configuration or null if not found/expired
 */
function loadDeviceCache(ttlMs = DEFAULT_CACHE_TTL_MS) {
    try {
        if (!fs.existsSync(DEVICE_CACHE_FILE)) {
            return null;
        }

        const fileContent = fs.readFileSync(DEVICE_CACHE_FILE, 'utf8');
        const cacheData = JSON.parse(fileContent);

        // Handle old format (no timestamp) - treat as expired
        if (!cacheData.timestamp || !cacheData.data) {
            return cacheData; // Return old format data, let caller decide
        }

        // Check if cache is still valid
        const age = Date.now() - cacheData.timestamp;
        if (age > ttlMs) {
            return null;
        }

        return cacheData.data;
    } catch (error) {
        loggerCommand.error('Failed to load device cache: ' + error.message);
        return null;
    }
}

/**
 * Load device configuration from cache ignoring TTL (for fallback when Firebase is down)
 * @returns {Object|null} - Cached device configuration or null if not found
 */
function loadDeviceCacheFallback() {
    try {
        if (!fs.existsSync(DEVICE_CACHE_FILE)) {
            return null;
        }

        const fileContent = fs.readFileSync(DEVICE_CACHE_FILE, 'utf8');
        const cacheData = JSON.parse(fileContent);

        // Handle old format (no timestamp)
        if (!cacheData.timestamp || !cacheData.data) {
            return cacheData;
        }

        return cacheData.data;
    } catch (error) {
        loggerCommand.error('Failed to load device cache fallback: ' + error.message);
        return null;
    }
}

/**
 * Save project configuration to local cache with timestamp
 * @param {Object} project - Project configuration object
 */
function saveProjectCache(project) {
    if (!project) return;

    try {
        const cacheData = {
            timestamp: Date.now(),
            data: project
        };
        fs.writeFileSync(PROJECT_CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf8');
    } catch (error) {
        loggerCommand.error('Failed to save project cache: ' + error.message);
    }
}

/**
 * Load project configuration from local cache
 * @param {number} ttlMs - Time to live in milliseconds (default: 5 minutes)
 * @returns {Object|null} - Cached project configuration or null if not found/expired
 */
function loadProjectCache(ttlMs = DEFAULT_CACHE_TTL_MS) {
    try {
        if (!fs.existsSync(PROJECT_CACHE_FILE)) {
            return null;
        }

        const fileContent = fs.readFileSync(PROJECT_CACHE_FILE, 'utf8');
        const cacheData = JSON.parse(fileContent);

        // Handle old format (no timestamp)
        if (!cacheData.timestamp || !cacheData.data) {
            return cacheData;
        }

        // Check if cache is still valid
        const age = Date.now() - cacheData.timestamp;
        if (age > ttlMs) {
            return null;
        }

        return cacheData.data;
    } catch (error) {
        loggerCommand.error('Failed to load project cache: ' + error.message);
        return null;
    }
}

/**
 * Load project configuration from cache ignoring TTL (for fallback when Firebase is down)
 * @returns {Object|null} - Cached project configuration or null if not found
 */
function loadProjectCacheFallback() {
    try {
        if (!fs.existsSync(PROJECT_CACHE_FILE)) {
            return null;
        }

        const fileContent = fs.readFileSync(PROJECT_CACHE_FILE, 'utf8');
        const cacheData = JSON.parse(fileContent);

        // Handle old format (no timestamp)
        if (!cacheData.timestamp || !cacheData.data) {
            return cacheData;
        }

        return cacheData.data;
    } catch (error) {
        loggerCommand.error('Failed to load project cache fallback: ' + error.message);
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
    } catch (error) {
        loggerCommand.error('Failed to clear cache: ' + error.message);
    }
}

module.exports = {
    saveDeviceCache,
    loadDeviceCache,
    loadDeviceCacheFallback,
    saveProjectCache,
    loadProjectCache,
    loadProjectCacheFallback,
    clearCache
};
