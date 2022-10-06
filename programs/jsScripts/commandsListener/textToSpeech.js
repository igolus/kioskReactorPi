const textToSpeech = require('@google-cloud/text-to-speech');
const env=require('dotenv').config()
const fs = require('fs');
const util = require('util');
const client = new textToSpeech.TextToSpeechClient();
const { exec, spawn} = require('child_process');
const { v4: uuidv4 } = require('uuid');
const {loggerCommand} = require("../util/loggerUtil");
const {internalCommandTypePlayMp3, buildCommandJson} = require("../webSocket/commandTypes");

async function speak(message, ws, project) {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return;
    }
    const voice = project.cloudTextToSpeechVoiceName || "fr-FR-Wavenet-A";
    const languageCode = voice.substring(0, 5)
    console.log(voice)
    console.log(languageCode)
    try {
        const request = {
            input: {text: message},
            voice: {
                languageCode: languageCode,
                name: voice,
                ssmlGender: 'NEUTRAL',
            },
            audioConfig: {audioEncoding: 'MP3'},
        };

        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);

        let fileName = uuidv4() + ".mp3";
        await writeFile("../" + fileName, response.audioContent, 'binary');
        ws.send(buildCommandJson(internalCommandTypePlayMp3, fileName), {binary: true});
    }
    catch (err) {
        loggerCommand.error(err);
    }
}

module.exports = {
    speak: speak
}