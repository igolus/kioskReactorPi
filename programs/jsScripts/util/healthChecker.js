const {fireBaseDb} = require("../dbUtil/firebaseUtil");
const {brandsCollection, deviceHealthCollection} = require("../dbUtil/collectionsNames");
const conf = require("../../../conf/config.json");
const {getCurrentDevice} = require("../dbUtil/deviceUtil");

(async () => {
    const device = await getCurrentDevice();
    const queryEvent = fireBaseDb
        .collection(brandsCollection)
        .doc(device.brandId)
        .collection(deviceHealthCollection)
        .where('alive', '==', false)
        .where('id', '==', conf.deviceId)

    queryEvent.onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(async (change) => {
            const doc = await fireBaseDb
                .collection(brandsCollection)
                .doc(device.brandId)
                .collection(deviceHealthCollection)
                .doc(device.id)

            let deviceHealth = change.doc.data();
            await doc.set({
                ...deviceHealth,
                alive: true,
            });
        })
    })
})();

