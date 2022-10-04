const {cleanJson} = require("./commandTypes");

function buildEventJson(eventType, eventValue, eventContext) {
        return JSON.stringify(cleanJson({
            "eventType": eventType,
            "eventValue": eventValue,
            "eventContext": eventContext
        }));
}

module.exports = {
    eventTypeQrCode: "qrcode",
    eventTypeSnapReady :"snapready",
    eventTypeInactivity :"inactivity",
    buildEventJson: buildEventJson
}
