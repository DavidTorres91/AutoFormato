AutoFormato
AutoFormato es una aplicación web diseñada para capturar imágenes desde la cámara del dispositivo, almacenarlas y generar informes en formato Word que contienen cada imagen con su nombre correspondiente.

Estructura del Proyecto
AutoFormato/
│
├── node_modules/            # Dependencias de Node.js
├── public/                  # Archivos estáticos servidos al cliente
│   ├── index.html           # Página principal
│   ├── script.js            # Scripts de JavaScript para el lado del cliente
│   └── style.css            # Estilos CSS para la página principal
│
├── routes/                  # Rutas del servidor
│   └── index.js             # Archivo que define las rutas API
│
├── utils/                   # Utilidades para el proyecto
│   └── fileUtils.js         # Funciones para generar informes Word
│
├── package.json             # Información del proyecto y dependencias
├── package-lock.json        # Bloqueo de dependencias
├── server.js                # Archivo principal del servidor
└── README.md                # Este archivo
Instalación
Clona el repositorio:

git clone <URL_DEL_REPOSITORIO>
cd AutoFormato
Instala las dependencias:

npm install
Ejecución
Para iniciar el servidor, usa el siguiente comando:

npm start
El servidor se ejecutará en http://localhost:3000.

Uso
Captura de Imágenes:

La aplicación permite capturar imágenes desde la cámara del dispositivo.
Las imágenes se envían al servidor y se almacenan en el directorio especificado.
Generación de Informe:

Una vez capturadas las imágenes, puedes generar un informe en formato Word que contiene todas las imágenes.
El informe será descargado como un archivo .docx con cada imagen y su nombre correspondiente.
Código Relevante
server.js
Configura el servidor Express y las rutas de la API.

const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const indexRouter = require('./routes/index'); // Importar las rutas

const app = express();
const port = 3000;

// Configuración de multer para la carga de imágenes
const upload = multer({ dest: '/storage/emulated/0/autoformato/fotos/' });

// Configuración para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

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
    const newPath = path.join('/storage/emulated/0/autoformato/fotos', newFilename);
    fs.renameSync(req.file.path, newPath);

    res.json({ message: 'Imagen recibida', path: newPath });
});

// Usar el enrutador para las rutas
app.use('/api', indexRouter); // Añadir el prefijo /api para todas las rutas en indexRouter

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
utils/fileUtils.js
Define la función generateReport para crear informes en formato Word.

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, ImageRun } = require('docx');

const generateReport = async (req, res) => {
    const imagesDir = '/storage/emulated/0/autoformato/fotos/';
    const files = fs.readdirSync(imagesDir).filter(file => ['.jpg', '.jpeg', '.png'].includes(path.extname(file).toLowerCase()));

    if (files.length === 0) {
        return res.status(404).json({ message: 'No se encontraron imágenes' });
    }

    const doc = new Document();

    files.forEach(file => {
        const imagePath = path.join(imagesDir, file);
        const image = fs.readFileSync(imagePath);
        const imageExtension = path.extname(file).slice(1);

        doc.addSection({
            properties: {},
            children: [
                new Paragraph({
                    children: [new TextRun({ text: file, bold: true })],
                }),
                new Paragraph({
                    children: [new ImageRun({
                        data: image,
                        transformation: {
                            width: 600,
                            height: 400,
                        },
                    })],
                }),
            ],
        });
    });

    const buffer = await Packer.toBuffer(doc);
    const reportPath = path.join('/storage/emulated/0/autoformato/fotos/', 'informe.docx');
    fs.writeFileSync(reportPath, buffer);

    res.json({ message: 'Informe generado', path: reportPath });
};

module.exports = { generateReport };
