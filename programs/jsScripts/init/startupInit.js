const {initializeFirebase} = require("../commandsListener/commandUtil");
initializeFirebase();
const { readConfig, writeConfig, writeDeviceAndProjectConfig} = require("../util/configFileUtil");
const shortid = require('shortid');
const {createDeviceIdDb} = require("../dbUtil/deviceUtil");
let conf = readConfig();

(async () => {
    if (!conf.deviceId) {
        conf.deviceId = shortid.generate();
        writeConfig(conf);
        await createDeviceIdDb(conf.deviceId);
    }
    await writeDeviceAndProjectConfig(conf.deviceId)
})();
