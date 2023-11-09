const textToSpeech = require('@google-cloud/text-to-speech');
const env=require('dotenv').config()
const fs = require('fs');
const util = require('util');
const client = new textToSpeech.TextToSpeechClient();
const { exec, spawn} = require('child_process');
const { v4: uuidv4 } = require('uuid');
const {loggerCommand} = require("../util/loggerUtil");
const {internalCommandTypePlayMp3, buildCommandJson} = require("../webSocket/commandTypes");
const conf = require ('../../../conf/config.json')
const {execCommand, execCommandSync} = require("../util/commandUtil");
async function startNGrok() {
    try {
        console.log("startNGrok");
        if (conf.windows) {
            execCommand("C:\\kioskReactor\\ngrok tcp 3389");
        }
    }
    catch (err) {
        loggerCommand.error(err);
    }
}

async function stopNGrok() {
    try {
        console.log("stopNGrok");
        if (conf.windows) {
            execCommand("taskkill /IM \"ngrok.exe\" /F");
        }
    }
    catch (err) {
        loggerCommand.error(err);
    }
}

module.exports = {
    startNGrok: startNGrok,
    stopNGrok: stopNGrok,
}
