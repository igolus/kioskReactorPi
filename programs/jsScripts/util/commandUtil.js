const {loggerCommand} = require("./loggerUtil");
const {exec, execSync } = require("child_process");

function execCommandSync(command) {
    loggerCommand.info("running command: " + command);
    try {
        execSync(command);
    } catch (error) {
        loggerCommand.error("Unable to run command " + error);
        throw error;
    }
}

function execCommand(command, callBackDone, callBackError) {
    loggerCommand.info("running command: " + command);
    try {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                loggerCommand.error(error)
                return;
            }
            if (stderr) {
                loggerCommand.error(stderr)
                if (callBackError) {
                    callBackError(new Error(stderr));
                }
                return;
            }
            if (stdout) {
                loggerCommand.info(stdout)
            }
            loggerCommand.info(`command Done`);
            if (callBackDone) {
                callBackDone(stdout)
            }
        });
    } catch (error) {
        loggerCommand.error("Unable to run command " + error);
        if (callBackError) {
            callBackError(error);
        }
    }
}

module.exports = {
    execCommand: execCommand,
    execCommandSync: execCommandSync
}
