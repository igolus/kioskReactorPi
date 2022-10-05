const {LoggingWinston} = require("@google-cloud/logging-winston");
const conf = require("../../../conf/config.json");
const {createLogger, format, transports} = require("winston");
const {kioskFormat} = require("./loggerUtil");
require('dotenv').config()
const { combine, splat, timestamp} = format;
const timeout = 10000;

const loggingHealth= new LoggingWinston({
    logName: "healthDevice.log"
});

const healthLogger = createLogger({
    level: 'info',
    format: combine(
        format.colorize(),
        splat(),
        timestamp(),
        kioskFormat
    ),
    transports: [
        loggingHealth
    ],
    //keyFilename: '../../../conf/totemsystem-5889b-firebase-adminsdk-p2mja-f9bb68a5da.json',
});


function intervalFunc() {
    healthLogger.info(conf.deviceId);
}

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    setInterval(intervalFunc,timeout);
}


