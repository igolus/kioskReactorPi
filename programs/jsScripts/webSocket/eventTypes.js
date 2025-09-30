const {cleanJson} = require("./commandTypes");

function buildEventJson(eventType, eventValue, eventContext) {
        return JSON.stringify(cleanJson({
            "eventType": eventType,
            "eventValue": eventValue,
            "eventContext": eventContext
        }));
}

module.exports = {
    eventTypeQrCode: "QR_CODE",
    eventTypeSnapReady :"snapready",
    eventTypeInactivity :"inactivity",
    eventTypePrintFromUrl :"printfromurl",
    eventTypePaymentDone: "paymentdone",
    buildEventJson: buildEventJson
}
