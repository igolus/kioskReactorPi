const {GlobalKeyboardListener} = require("node-global-key-listener");
const {loggerCommand, loggerWs} = require("../util/loggerUtil");
const {sendEvent} = require("../CommandSender/SendEventUtil");
const {buildEventJson, eventTypeQrCode} = require("../webSocket/eventTypes");

let v;
try {
    v = new GlobalKeyboardListener();
} catch (err) {
    loggerCommand.error("Failed to initialize keyboard listener: " + err.message);
    process.exit(1);
}

let buffer = "";
v.addListener(function (e, down) {
    if (e.rawKey._nameRaw == "VK_RETURN" && e.state == "UP") {
        loggerCommand.info("QR Code detected: " + buffer);
        try {
            sendEvent(buildEventJson(eventTypeQrCode, buffer))
        }
        catch (error) {
            loggerCommand.error(error.message)
        }

        buffer = "";
        return
    }
    //console.log(e.name)
    //console.log(JSON.stringify(e))
    if (e.state == "UP" && e.name.length == 1) {

        buffer +=e.name.toString();
    }
    if (e.state == "UP" && e.name == "COMMA") {

        buffer += ',';
    }
    if (e.state == "UP" && e.name == "DOT") {

        buffer += '.';
    }

});
