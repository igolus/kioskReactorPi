wsInit=false;
var ws;

async function initWs() {
    while(!wsInit) {
        try {
            var ws = new WebSocket('ws://localhost:8080')
            wsInit = true;
            console.log("WebSocket initialized")
            ws.onmessage = async (event) => {
                var enc = new TextDecoder("utf-8");
                var buffer = await event.data.arrayBuffer()
                var message = enc.decode(buffer);
                var messageJson = JSON.parse(message)

                if (messageJson.eventType === "qrcode"){
                    for (let i = 0; i < qrCodeListeners.length; i++) {
                        const listenerFunc = qrCodeListeners[i];
                        listenerFunc(messageJson.eventValue);
                    }
                }

                if (messageJson.eventType === "snapready"){
                    for (let i = 0; i < snapReadyListeners.length; i++) {
                        const listenerFunc = snapReadyListeners[i];
                        listenerFunc(messageJson.eventValue);
                    }
                }

                if (messageJson.eventType === "inactivity"){
                    for (let i = 0; i < inactivityListeners.length; i++) {
                        const listenerFunc = inactivityListeners[i];
                        listenerFunc();
                    }
                }
            }
        }
        catch(err) {
            console.log("Cannot connect to web socket")
        }
    }
}

initWs()

let qrCodeListeners = [];
let inactivityListeners = [];
let snapReadyListeners = [];

function addQrcodeListener(listenerFunc) {
    qrCodeListeners.push(listenerFunc)
}

function addInactivityListener(listenerFunc) {
    inactivityListeners.push(listenerFunc)
}

function addSnapReadyListener(listenerFunc) {
    snapReadyListeners.push(listenerFunc)
}


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

