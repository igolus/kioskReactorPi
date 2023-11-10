const {commandTypeOpenUrl, commandTypeReboot, commandTypePrintTicket, commandTypeSpeak, commandTypeUpdate,
    internalCommandTypeSnap, internalCommandTypeCancelSnap, internalCommandTypeInactivity, commandTypeDeployWebSite,
    commandTypeNGrok
} = require("./commandTypes");
const base64 = require('base-64');

function getOpenUrlCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === commandTypeOpenUrl) {
        return input.commandParam;
    }
    return null;
}


function getUpdateCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === commandTypeUpdate) {
        return true;
    }
    return false;
}

function geRebootCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === commandTypeReboot) {
        return true;
    }
    return false;
}

function getTicketCommand(input) {
    if (input && input.commandType && !input.commandContext && input.commandType.toLowerCase() === commandTypePrintTicket) {
        try {
            let decode = base64.decode(input.commandParam);
            //let decode = input.commandParam;
            return decode;
        }
        catch (err) {
            return null;
        }
    }
    return null;
}

function getTicketCommandTargetIp(input) {
    if (input && input.commandType && input.commandContext && input.commandType.toLowerCase() === commandTypePrintTicket) {
        try {
            let decode = base64.decode(input.commandParam);
            return {
                source: decode,
                ip: input.commandContext
            };
        }
        catch (err) {
            return null;
        }
    }
    return null;
}

function getSnapCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === internalCommandTypeSnap) {
        return true;
    }
    return false;
}

function getCancelSnapCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === internalCommandTypeCancelSnap) {
        return true;
    }
    return false;
}

function getInactivityCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === internalCommandTypeInactivity) {
        return true;
    }
    return false;
}

function getSpeakCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === commandTypeSpeak) {
        return input.commandParam;
    }
    return null;
}

function getDeployWebSiteCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === commandTypeDeployWebSite) {
        return true;
    }
    return false;
}

function getNGrokCommand(input) {
    if (input && input.commandType && input.commandType.toLowerCase() === commandTypeNGrok) {
        return input.commandParam;
    }
    return null;
}



module.exports = {
    getOpenUrlCommand: getOpenUrlCommand,
    geRebootCommand: geRebootCommand,
    getUpdateCommand: getUpdateCommand,
    getTicketCommand: getTicketCommand,
    getTicketCommandTargetIp: getTicketCommandTargetIp,
    getSpeakCommand: getSpeakCommand,
    getNGrokCommand: getNGrokCommand,
    getSnapCommand: getSnapCommand,
    getCancelSnapCommand: getCancelSnapCommand,
    getInactivityCommand: getInactivityCommand,
    getDeployWebSiteCommand: getDeployWebSiteCommand
}

