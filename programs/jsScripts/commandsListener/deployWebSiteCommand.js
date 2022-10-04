const { Storage } = require("@google-cloud/storage");
const {constants} = require("../constants/constants");
const {buildEventJson, eventTypeSnapReady, eventTypeInactivity} = require("../webSocket/eventTypes");
const firebaseConfig = require("../../../conf/firebaseconfig.json");
const {loggerCommand} = require("../util/loggerUtil");
const {exec} = require("child_process");

const storage = new Storage({
    keyFilename: "../../../conf/totemsystem-5889b-firebase-adminsdk-p2mja-f9bb68a5da.json",
});

const storageBucket = storage.bucket(firebaseConfig.storageBucket);

function execDeploy(callBack) {
    //loggerCommand.info("running command: " + command);
    const command = "sudo rm -rf /var/www/html/* && sudo unzip ../../../siteContent.zip -d /var/www/html"
    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                loggerCommand.error(error)
                return;
            }
            if (stderr) {
                loggerCommand.error(stderr)
                return;
            }
            loggerCommand.info(`command Done`);
            callBack()
        });
    } catch (error) {
        loggerCommand.error("Unable to rune command " + error)
    }
}

function deployWebSiteCommand (project, chromeNavigate) {
    try {
        const options = {
            destination: '../../../siteContent.zip',
        };

        // Downloads the file
        storageBucket.file(`projects/${project.id}/site/siteContent.zip`).download(options)
            .then(() => {
                execDeploy(() => chromeNavigate(project));

            })
    }
    catch (err) {
        loggerCommand.error(err);
    }

}

module.exports = {
    deployWebSiteCommand: deployWebSiteCommand
}