const {loggerCommand} = require("../util/loggerUtil");
const {exec} = require("child_process");

function execDeploy(url, callBack) {
    const command = "sudo rm -rf /var/www/html/* && wget \"" + url+ "\" -O siteContent.zip && " +
        "sudo unzip siteContent.zip -d /var/www/html && rm siteContent.zip && " +
        "wget https://raw.githubusercontent.com/igolus/rocketKioskPi/master/programs/rocketKioskUtil.js &&" +
        "cp rocketKioskUtil.js /var/www/html"
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

function deployWebSiteCommand (project, chromeNavigate) {
    try {
        if (!project.webSiteZipPubliUrl) {
            return;
        }
        execDeploy(project.webSiteZipPubliUrl,() => chromeNavigate(project));
    }
    catch (err) {
        loggerCommand.error(err);
    }

}

module.exports = {
    deployWebSiteCommand: deployWebSiteCommand
}