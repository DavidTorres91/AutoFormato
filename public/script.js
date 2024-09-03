// public/script.js

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const switchCameraBtn = document.getElementById('switch-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const generateReportBtn = document.getElementById('generate-report-btn');

let currentStream = null;
let useRearCamera = true;

captureBtn.addEventListener('click', () => {
    if (currentStream) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            const formData = new FormData();
            formData.append('image', blob, 'captura.jpg');

            fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                showMessage(data.message || 'Error al subir la imagen', data.error ? 'danger' : 'success');
                if (!data.error) {
                    actualizarGaleria();
                }
            })
            .catch(error => {
                showMessage('Error de conexión', 'danger');
                console.error('Error:', error);
            });
        });
    } else {
        showMessage('No hay flujo de video activo', 'warning');
    }
});

function actualizarGaleria() {
    fetch('/api/imagenes')
        .then(response => response.json())
        .then(rutas => {
            const gallery = document.getElementById('gallery');
            if (gallery) {
                gallery.innerHTML = '';
                rutas.forEach(ruta => {
                    const img = document.createElement('img');
                    img.src = ruta;
                    img.alt = 'Imagen capturada';
                    img.className = 'm-2 border rounded';
                    gallery.appendChild(img);
                });
            } else {
                console.error('Elemento #gallery no encontrado en el DOM.');
            }
        })
        .catch(error => {
            showMessage('Error al actualizar la galería', 'danger');
            console.error('Error:', error);
        });
}

generateReportBtn.addEventListener('click', () => {
    fetch('/api/generar-informe')
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                const enlace = document.createElement('a');
                enlace.href = '/storage/informe.docx'; // Ruta del archivo generado
                enlace.download = 'informe.docx';
                enlace.innerText = 'Descargar Informe';
                showMessage(`Informe generado: `, 'success');
                messageDiv.appendChild(enlace);
            } else {
                showMessage('Error al generar el informe', 'danger');
            }
        })
        .catch(error => {
            showMessage('Error de conexión', 'danger');
            console.error('Error:', error);
        });
});

function startVideoStream() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
        video: {
            facingMode: useRearCamera ? 'environment' : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            currentStream = stream;
            video.srcObject = stream;
        })
        .catch(error => {
            showMessage('Error al acceder a la cámara', 'danger');
            console.error('Error al acceder a la cámara:', error);
        });
}

// Toggle between rear and front camera
switchCameraBtn.addEventListener('click', () => {
    useRearCamera = !useRearCamera;
    startVideoStream();
});

function showMessage(message, type) {
    messageDiv.className = `notification alert alert-${type}`;
    messageDiv.textContent = message;
    messageDiv.classList.remove('d-none');
}

// Inicializa el video y la galería
document.addEventListener('DOMContentLoaded', () => {
    startVideoStream();
    actualizarGaleria();
});
