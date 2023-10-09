const {GlobalKeyboardListener} = require("node-global-key-listener");
const {loggerCommand, loggerWs} = require("../util/loggerUtil");
const {sendEvent} = require("../CommandSender/SendEventUtil");
const {buildEventJson, eventTypeQrCode} = require("../webSocket/eventTypes");

const v = new GlobalKeyboardListener();
let buffer = "";
v.addListener(function (e, down) {
    if (e.rawKey._nameRaw == "VK_RETURN" && e.state == "UP") {
        loggerCommand.info("QR Code detected: " + buffer);
        sendEvent(buildEventJson(eventTypeQrCode, buffer))
        buffer = "";
        return
    }

    if (e.state == "UP") {
        buffer +=e.name.toString();
    }

});
