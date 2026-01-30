const WebSocket = require("ws");
const config = require("../../../conf/config.json");
const {buildEventJson, eventTypeSnapReady, eventTypeQrCode} = require("../webSocket/eventTypes");


const sendEvent = (event) => {
    try {
        const wsLocalSocket = new WebSocket(config.urlWsLocal);
        wsLocalSocket.on('error', (err) => {
            console.error("WebSocket error in sendEvent: " + err.message);
        });
        wsLocalSocket.onopen = function(open) {
            try {
                wsLocalSocket.send(event, {binary: true});
            } catch (err) {
                console.error("Failed to send event: " + err.message);
            }
            wsLocalSocket.close();
        }
    }
    catch (err) {
        console.log(err);
    }
}

module.exports = {
    sendEvent: sendEvent
}

