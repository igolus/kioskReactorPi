const {loggerCommand} = require("../util/loggerUtil");
const {exec} = require("child_process");
const {writeDeviceAndProjectConfig} = require("../util/configFileUtil");
const conf = require ('../../../conf/config.json')
const {execCommandSync} = require("../util/commandUtil");

function execDeploy(url, device, callBack) {
    const command = "sudo rm -rf /var/www/html/* && wget \"" + url+ "\" -O siteContent.zip && " +
        "sudo unzip siteContent.zip -d /var/www/html && rm siteContent.zip && " +
        "wget https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/kioskReactorJs/" + device.id + " &&" +
        "cp device.id /var/www/html/kioskReactorUtil.js"
    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                loggerCommand.error(error)
                return;
            }
            if (stderr) {
                loggerCommand.info(stderr)
                return;
            }
            loggerCommand.info(`command Done`);
            callBack()
        });
    } catch (error) {
        loggerCommand.error("Unable to rune command " + error)
    }
}

function execDeployWindows(url, device, callBack) {
    // const command = "sudo rm -rf /var/www/html/* && wget \"" + url+ "\" -O siteContent.zip && " +
    //     "sudo unzip siteContent.zip -d /var/www/html && rm siteContent.zip && " +
    //     "wget https://us-central1-totemsystem-5889b.cloudfunctions.net/homePage/kioskReactorJs/" + device.id + " &&" +
    //     "cp device.id /var/www/html/kioskReactorUtil.js"
    try {
        console.log("wget \"" + url+ "\" -O siteContent.zip")

        execCommandSync("wget \"" + url+ "\" -O siteContent.zip")
    } catch (error) {
        loggerCommand.error("Unable to rune command " + error)
    }
}

function deployWebSiteCommand (project, device, chromeNavigate) {
    try {
        writeDeviceAndProjectConfig(device).then(() => {
            if (!project.webSiteZipPubliUrl) {
                return;
            }
            if (conf.windows) {
                execDeployWindows(project.webSiteZipPubliUrl,device, () => chromeNavigate(project));
            }
            else {
                execDeploy(project.webSiteZipPubliUrl,device, () => chromeNavigate(project));
            }
        })
    }
    catch (err) {
        loggerCommand.error(err);
    }

}

module.exports = {
    deployWebSiteCommand: deployWebSiteCommand
}
