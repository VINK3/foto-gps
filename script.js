let imageData = "";
let coords = "";

navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
  document.getElementById("video").srcObject = stream;
}).catch(err => {
  alert("No se pudo acceder a la cámara: " + err);
});

function takePhoto() {
  const canvas = document.getElementById("canvas");
  const video = document.getElementById("video");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  imageData = canvas.toDataURL("image/jpeg");
  document.getElementById("preview").src = imageData;

  navigator.geolocation.getCurrentPosition(pos => {
    coords = `Lat: ${pos.coords.latitude.toFixed(5)}, Lon: ${pos.coords.longitude.toFixed(5)}`;
  }, () => {
    coords = "Ubicación no disponible";
  });
}

function generatePDF() {
  const fileName = (document.getElementById("filename").value || "foto") + ".pdf";
  const dateTime = new Date().toLocaleString();

  import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js').then(jsPDFModule => {
    const { jsPDF } = jsPDFModule;
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Fecha y hora: " + dateTime, 10, 10);
    doc.text("Ubicación: " + coords, 10, 20);

    if (imageData) {
      doc.addImage(imageData, 'JPEG', 10, 30, 180, 120);
    }

    doc.save(fileName);
  });
}
