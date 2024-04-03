const { readConfig, writeConfig, writeDeviceAndProjectConfig} = require("../util/configFileUtil");
const shortid = require('shortid');
const {createDeviceIdDb} = require("../dbUtil/deviceUtil");
let conf = readConfig();
const myArgs = process.argv.slice(2);
let isLite = myArgs.length > 0 && myArgs[0].toLowerCase() === 'lite';

(async () => {
    // conf.wsInit = 0;
    // writeConfig(conf);
    if (!conf.deviceId) {
        conf.deviceId = shortid.generate();
        writeConfig(conf);
        await createDeviceIdDb(conf.deviceId, myArgs.length > 0 && isLite);
    }
    await writeDeviceAndProjectConfig(conf.deviceId, isLite);
    process.exit()
})();
