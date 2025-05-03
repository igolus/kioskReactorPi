const { Storage } = require("@google-cloud/storage");
const {loggerCommand} = require("../util/loggerUtil");
const path = require('path');
const fs = require('fs');

const uploadLogs = (device) => {
    try {
        const logDir = path.resolve(__dirname, '../../../logs');

        // Trouver le fichier le plus récent dans le dossier de logs
        const files = fs.readdirSync(logDir)
            .filter(file => file.endsWith('.log'))
            .map(file => ({
                name: file,
                time: fs.statSync(path.join(logDir, file)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // décroissant

        if (files.length === 0) {
            console.log("Aucun fichier log trouvé.");
            return;
        }

        const latestFile = files[0].name;
        const logPath = path.join(logDir, latestFile);
        const destination = `devices/${device.id}/logs/${latestFile}`;

        const storage = new Storage({
            keyFilename: path.resolve(__dirname, '../../../conf/myReactorKioskUser.json'),
        });

        const storageBucket = storage.bucket("totemsystem-5889b.appspot.com");

        const options = {
            destination: destination,
            preconditionOpts: { ifGenerationMatch: 0 },
        };

        storageBucket.upload(logPath, options)
            .then(() => {
                console.log('Log uploaded to bucket.');
                const file = storageBucket.file(destination);
                return file.getSignedUrl({
                    action: 'read',
                    expires: '03-09-2491',
                });
            })
            .then(signedUrls => {
                console.log('URL signée :', signedUrls[0]);
                // Tu peux l’envoyer ici via websocket si nécessaire
            })
            .catch(err => {
                console.error('Erreur upload/log:', err);
            });
    } catch (err) {
        console.error("Erreur globale dans uploadLogs:", err);
    }
}

const uploadDmpLogs = (device) => {
    try {
        const dmpLogFiles = ['dmp-connect.log', 'dmpconnect-js2.log'];
        const dmpLogDir = 'C:\\Program Files (x86)\\DmpConnect-JS2';

        const storage = new Storage({
            keyFilename: path.resolve(__dirname, '../../../conf/myReactorKioskUser.json'),
        });

        const storageBucket = storage.bucket("totemsystem-5889b.appspot.com");

        dmpLogFiles.forEach(fileName => {
            const filePath = path.join(dmpLogDir, fileName);

            if (!fs.existsSync(filePath)) {
                console.warn(`Fichier non trouvé : ${filePath}`);
                return;
            }

            const destination = `devices/${device.id}/dmp-logs/${fileName}`;
            const options = {
                destination: destination,
                preconditionOpts: { ifGenerationMatch: 0 },
            };

            storageBucket.upload(filePath, options)
                .then(() => {
                    console.log(`Upload OK : ${fileName}`);
                    return storageBucket.file(destination).getSignedUrl({
                        action: 'read',
                        expires: '03-09-2491',
                    });
                })
                .then(signedUrls => {
                    console.log(`URL pour ${fileName} : ${signedUrls[0]}`);
                    // ws.send(...) si tu veux transmettre quelque chose ici
                })
                .catch(err => {
                    console.error(`Erreur upload ${fileName} :`, err);
                });
        });

    } catch (err) {
        console.error("Erreur globale dans uploadDmpLogs:", err);
    }
};

module.exports = {
    uploadLogs: uploadLogs,
    uploadDmpLogs: uploadDmpLogs
}
