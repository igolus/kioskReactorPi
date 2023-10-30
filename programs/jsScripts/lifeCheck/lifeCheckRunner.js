const {getCurrentDevice} = require("../dbUtil/deviceUtil");
const {getBrand} = require("../dbUtil/brandUtil");
const axios = require("axios");
const {loggerCommand, loggerWs} = require("../util/loggerUtil");
const config = require('../../../conf/config.json');

const intervalMs = 1000 * 60 * 5;
//const intervalMs = 10000;

function sendSignal(brand, dataJson, device) {

    axios.post(brand.lifeCheckWebHookUrl, dataJson, )
        .then(response => {
            loggerCommand.info("lifeCheckRunner: life webhook posted to: "
                + brand.lifeCheckWebHookUrl + " device id:" + device.id)
        })
        .catch(error => {
            loggerWs.error('lifeCheckRunner: to trigger webhook', error);
        });
}

(async () => {
    if (!config.deviceId) {
        loggerCommand.info("lifeCheckRunner: No device id !!")
        process.exit()
    }
    let device = await getCurrentDevice();
    if (!device) {
        loggerCommand.info("lifeCheckRunner: No device found")
        process.exit()
    }
    console.log(JSON.stringify(device))
    let brand = await getBrand(device.brandId);
    if (!brand) {
        loggerCommand.info("lifeCheckRunner: no brand found")
        process.exit()
    }
    if (!brand.enableLifeCheckWebHook) {
        loggerCommand.info("lifeCheckRunner: enableLifeCheckWebHook is false ")
        process.exit()
    }
    if (!brand.lifeCheckWebHookUrl || brand.lifeCheckWebHookUrl === "") {
        loggerCommand.info("lifeCheckRunner: lifeCheckWebHookUrl not defined ")
        process.exit()
    }

    const dataJson = {
        deviceId: device.id,
        authKey: brand.authKey,
    }
    sendSignal(brand, dataJson, device);
    setInterval(function() {
        sendSignal(brand, dataJson, device);
    }, intervalMs);
})();
