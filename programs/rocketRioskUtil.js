var ws = new WebSocket('ws://localhost:8080')

function sendPrintTicket(code) {
    command = {
        commandType: "printticket",
        commandParam: btoa(code),
    }
    if (ws) {
        ws.send(JSON.stringify(command));
    }

}

function speak(message) {
    command = {
        commandType: "speak",
        commandParam: message,
    }
    if (ws) {
        ws.send(JSON.stringify(command));
    }

}

function navigateTo(url) {
    command = {
        commandType: "openurl",
        commandParam: url,
    }
    if (ws) {
        ws.send(JSON.stringify(command));
    }

}