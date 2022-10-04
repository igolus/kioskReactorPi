const {loggerCommand} = require("../util/loggerUtil");
const config = require("../../../conf/config.json");
const WebSocket = require("ws");
const firebase = require('firebase')
const serviceAccount = require('../../../conf/totemsystem-5889b-firebase-adminsdk-p2mja-f9bb68a5da.json');
const admin = require('firebase-admin');
const firebaseConfig = require('../../../conf/firebaseconfig.json')
firebase.initializeApp(firebaseConfig)

function initializeFirebase() {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: firebaseConfig.databaseURL,
        storageBucket: firebaseConfig.storageBucket
    });
}


function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

async function startSeverAndConfigureListening(callBackData, device, project) {
    let init = false;
    loggerCommand.info("Connecting to webSocket: " + config.urlWsLocal);
    while (!init) {
        try {
            const wsLocalSocket = new WebSocket(config.urlWsLocal);

            wsLocalSocket.on('open', function open() {
                loggerCommand.info("wsLocalSocket opened on " + config.urlWsLocal);
                wsLocalSocket.send('');
            });


            wsLocalSocket.on("message", function incoming(data) {
                loggerCommand.info("Ws local get message " + data);
                const dataJSON = JSON.parse(data.toString())
                callBackData(dataJSON, wsLocalSocket, device, project)
            });

            wsLocalSocket.onerror = function (error) {
                loggerCommand.info("no web socket local");
                loggerCommand.info(error);
            };

            wsLocalSocket.onopen = function (error) {
                loggerCommand.info("Web socket local opened");
                init=true;
            };

            //init=true;
            await delay(1000)
        }
        catch (err) {
            loggerCommand.error(err);
        }
    }

}

module.exports = {
    startSeverAndConfigureListening: startSeverAndConfigureListening,
    delay: delay,
    initializeFirebase: initializeFirebase
}