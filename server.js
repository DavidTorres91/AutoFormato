const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const indexRouter = require('./routes/index'); // Importar las rutas

const app = express();
const port = 3000;

// Configuración de multer para la carga de imágenes
const upload = multer({ dest: path.join(__dirname, 'storage/fotos/') });

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));
// Configuración para servir archivos estáticos desde la carpeta 'storage'
app.use('/storage', express.static(path.join(__dirname, 'storage')));

// Usar el enrutador para las rutas de la API
app.use('/api', indexRouter);

// Asegurar que todas las solicitudes GET no capturadas por las rutas anteriores
// devuelvan el archivo index.html para permitir el enrutamiento del lado del cliente
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para recibir imágenes capturadas desde el cliente
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    // Obtener extensión del archivo subido
    const ext = path.extname(req.file.originalname).toLowerCase();

    // Validar que la extensión es de una imagen
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
        fs.unlinkSync(req.file.path); // Eliminar el archivo no válido
        return res.status(400).json({ error: 'El archivo subido no es una imagen válida' });
    }

    // Renombrar el archivo con la extensión correcta
    const newFilename = path.basename(req.file.path) + ext;
    const newPath = path.join(__dirname, 'storage/fotos', newFilename);
    fs.renameSync(req.file.path, newPath);

    res.json({ message: 'Imagen recibida', path: newPath });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
