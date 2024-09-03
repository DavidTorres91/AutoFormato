const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { generateReport } = require('../utils/fileUtils');

// Configuración de multer para almacenar las imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = path.join(__dirname, '../storage/fotos');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Endpoint para recibir imágenes capturadas desde el cliente
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    res.status(200).json({ message: 'Imagen subida exitosamente', path: req.file.path });
});

// Endpoint para generar el informe en Word
router.get('/generar-informe', generateReport);

// Endpoint para obtener imágenes
router.get('/imagenes', (req, res) => {
    const directoryPath = path.join(__dirname, '../storage/fotos');
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'No se pudieron listar las imágenes' });
        }

        const imagenes = files.filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
                              .map(file => `/storage/fotos/${file}`);

        res.json(imagenes);
    });
});

module.exports = router;
