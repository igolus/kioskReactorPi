function buildCommandJson(commandType, commandParam, commandContext) {
    return JSON.stringify(cleanJson({
        "commandType": commandType,
        "commandParam": commandParam,
        "commandContext": commandContext
    }));
}

function cleanJson(data) {
    const dataClone = {...data}
    console.log("dataClone :" + JSON.stringify(dataClone) )
    Object.keys(dataClone).forEach(key => {
        if (dataClone[key] === null) {
            delete dataClone[key];
        }
    });

    return dataClone;
}

module.exports = {
    commandTypeOpenUrl:"openurl",
    commandTypeReboot:"reboot",
    commandTypeUpdate:"update",
    commandTypePrintTicket:"printticket",
    commandTypeSpeak:"speak",
    commandTypePrintFromUrl:"printfromurl",
    internalCommandTypePlayMp3 :"playmp3",
    internalCommandTypeSnap :"snap",
    internalCommandTypeCancelSnap :"cancelsnap",
    internalCommandTypeInactivity :"inactivity",
    commandTypeDeployWebSite:"deploywebsite",
    commandTypeNGrok:"ngrok",
    buildCommandJson: buildCommandJson,
    cleanJson: cleanJson
}
