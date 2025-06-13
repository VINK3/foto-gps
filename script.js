window.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const captureBtn = document.getElementById('capture-btn');
  const pdfBtn = document.getElementById('pdf-btn');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const preview = document.getElementById('preview');
  let imageData = '';
  let coords = 'Ubicación no disponible';

  // Iniciar cámara
  startBtn.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      captureBtn.disabled = false;
      startBtn.disabled = true;
    } catch (err) {
      alert('Error al acceder a la cámara: ' + err.message);
    }
  });

  // Capturar foto y ubicación
  captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    imageData = canvas.toDataURL('image/jpeg');
    preview.src = imageData;
    pdfBtn.disabled = false;

    // Obtener ubicación
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          coords = `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
        },
        (error) => {
          console.warn('Error al obtener ubicación:', error.message);
        }
      );
    }
  });

  // Generar PDF
  pdfBtn.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const filename = (document.getElementById('filename').value || 'foto') + '.pdf';
    const timestamp = new Date().toLocaleString();

    doc.setFontSize(12);
    doc.text(`Fecha y hora: ${timestamp}`, 10, 10);
    doc.text(`Ubicación: ${coords}`, 10, 20);
    if (imageData) {
      doc.addImage(imageData, 'JPEG', 10, 30, 180, 120);
    }
    doc.save(filename);
  });
});

