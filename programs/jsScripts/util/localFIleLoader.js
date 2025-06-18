const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000; // Tu peux changer le port si besoin

app.use(cors());

app.get('/checkup', (req, res) => {
    const filePath = path.join(__dirname, '../../../scriptUtil/infoSystem/system_info.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erreur lecture fichier :', err);
            return res.status(500).send('Erreur serveur');
        }
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`Serveur Node.js en écoute sur http://localhost:${PORT}`);
});
