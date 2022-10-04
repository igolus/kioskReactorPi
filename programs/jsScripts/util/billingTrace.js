const conf = require("../../../conf/config.json");
const {addBilling} = require("../dbUtil/deviceUtil");

function intervalFunc() {
    addBilling(conf.deviceId);
}

addBilling(conf.deviceId);
setInterval(intervalFunc,1000 * 3600 * 24);

