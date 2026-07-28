const {loggerCommand} = require("../util/loggerUtil");
const config = require("../../../conf/config.json");
const WebSocket = require("ws");


function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

// Une seule connexion vivante à la fois : on attend la fermeture de la socket
// courante avant d'en recréer une, sinon plusieurs sockets restent ouvertes et
// chaque commande (ex: printticket) est traitée plusieurs fois.
async function startSeverAndConfigureListening(callBackData, device, project) {
    loggerCommand.info("Connecting to webSocket: " + config.urlWsLocal);

    return new Promise(resolve => {
        function connect() {
            const wsLocalSocket = new WebSocket(config.urlWsLocal);

            wsLocalSocket.on('open', function open() {
                loggerCommand.info("wsLocalSocket opened on " + config.urlWsLocal);
                wsLocalSocket.send('');
                resolve();
            });

            wsLocalSocket.on('error', (err) => {
                loggerCommand.error("WebSocket local error: " + err.message);
            });

            wsLocalSocket.on("message", function incoming(data) {
                loggerCommand.info("Ws local get message " + data);
                try {
                    const dataJSON = JSON.parse(data.toString());
                    callBackData(dataJSON, wsLocalSocket, device, project);
                } catch (err) {
                    loggerCommand.error("Failed to parse or process message: " + err.message);
                }
            });

            wsLocalSocket.on('close', () => {
                loggerCommand.info("wsLocalSocket closed, reconnecting in 1s...");
                setTimeout(connect, 1000);
            });
        }

        connect();
    });
}

module.exports = {
    startSeverAndConfigureListening: startSeverAndConfigureListening,
    delay: delay,
}