const {constants} = require("../constants/constants");
const {buildEventJson, eventTypeSnapReady, eventTypeInactivity} = require("../webSocket/eventTypes");

function inactivityCommand (project, ws, chromeNavigate) {
    if (project.useInactivityTouchScreen) {
        if (project.inactivityTouchScreenAction === constants.GO_TO_HOME_PAGE_ACTION) {
            chromeNavigate(project.homePageUrl)
        }
        else if (project.inactivityTouchScreenAction === constants.TRIGGER_WEB_HOOK_ACTION) {
            ws.send(buildEventJson(eventTypeInactivity), {binary: true});
        }
    }
}

module.exports = {
    inactivityCommand: inactivityCommand
}