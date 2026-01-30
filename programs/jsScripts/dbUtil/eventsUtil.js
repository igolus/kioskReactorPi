const {fireBaseDb} = require("./firebaseUtil");
const { eventsCollection, brandsCollection, devicesCollection, commandsCollection} = require("./collectionsNames");
const {loggerWs} = require("../util/loggerUtil");

const listenToCommands = (deviceId, triggerCallBack) => {
    const queryEvent = fireBaseDb
        .collection(devicesCollection).doc(deviceId)
        .collection(commandsCollection)
        .where('processed', '==', false)

    queryEvent.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(async (change) => {
            if (change.type !== 'added') {
                return;
            }
            try {
                let event = change.doc.data();
                loggerWs.info("Detecting change doc command" + JSON.stringify(change.doc.data()))
                if (change.type === 'added') {
                   let orderDoc = await
                        fireBaseDb
                            .collection(devicesCollection).doc(deviceId)
                            .collection(commandsCollection)
                            .doc(change.doc.id);
                    await orderDoc.set({...event, processed: true})
                    loggerWs.info("triggerCallBack command")
                    triggerCallBack(event);
                }
            } catch (err) {
                loggerWs.error(`Error processing command: ${err.message}`, err);
            }
        });
    }, err => {
        loggerWs.error(`Encountered error: ${err}`, err);
    });
}

const listenToEvents = (deviceId, triggerCallBack) => {
    const queryEvent = fireBaseDb
        .collection(devicesCollection).doc(deviceId)
        .collection(eventsCollection)
        .where('processed', '==', false)

    queryEvent.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(async (change) => {
            if (change.type !== 'added') {
                return;
            }
            try {
                let event = change.doc.data();
                loggerWs.info("Detecting change doc event" + JSON.stringify(change.doc.data()))
                if (change.type === 'added') {
                    let orderDoc = await
                        fireBaseDb
                            .collection(devicesCollection).doc(deviceId)
                            .collection(eventsCollection)
                            .doc(change.doc.id);
                    await orderDoc.set({...event, processed: true})
                    loggerWs.info("triggerCallBack event")
                    triggerCallBack(event);
                }
            } catch (err) {
                loggerWs.error(`Error processing event: ${err.message}`, err);
            }
        });
    }, err => {
        loggerWs.error(`Encountered error: ${err}`, err);
    });
}




module.exports = {
    listenToCommands: listenToCommands,
    listenToEvents: listenToEvents,
}
