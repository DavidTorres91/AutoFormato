const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, TextRun, ImageRun } = require('docx');

const generateReport = async (req, res) => {
    const directoryPath = path.join(__dirname, '../storage/fotos');

    // Revisa que las imágenes existan en el directorio
    const imageFiles = fs.readdirSync(directoryPath).filter(file => file.endsWith('.jpg') || file.endsWith('.png'));

    // Crear el documento
    const doc = new Document({
        sections: imageFiles.map(imageFile => {
            const imagePath = path.join(directoryPath, imageFile);
            const image = fs.readFileSync(imagePath);

            return {
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Imagen: ${imageFile}`,
                                bold: true,
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: image,
                                transformation: {
                                    width: 600,
                                    height: 400,
                                },
                            }),
                        ],
                    }),
                ],
            };
        }),
    });

    // Guarda el documento generado en un archivo
    try {
        const buffer = await Packer.toBuffer(doc);
        const reportPath = path.join(__dirname, '../storage/informe.docx');
        fs.writeFileSync(reportPath, buffer);

        res.json({
            message: 'Informe generado correctamente',
            path: `/storage/informe.docx`,
        });
    } catch (error) {
        console.error('Error al generar el informe:', error);
        res.status(500).json({ error: 'Error al generar el informe' });
    }
};

module.exports = {
    generateReport,
};
