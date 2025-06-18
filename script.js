let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let captureBtn = document.getElementById("capture-btn");
let startBtn = document.getElementById("start-btn");
let pdfBtn = document.getElementById("pdf-btn");
let resetBtn = document.getElementById("reset-btn");
let filenameInput = document.getElementById("filename");
let thumbnailsDiv = document.getElementById("photo-thumbnails");

let photos = [];
let currentPosition = null;

const firmaCanvas = document.getElementById("firma-canvas");
const firmaCtx = firmaCanvas.getContext("2d");
let drawing = false;

firmaCanvas.addEventListener("mousedown", e => {
  drawing = true;
  firmaCtx.beginPath();
  firmaCtx.moveTo(e.offsetX, e.offsetY);
});

firmaCanvas.addEventListener("mousemove", e => {
  if (drawing) {
    firmaCtx.lineTo(e.offsetX, e.offsetY);
    firmaCtx.stroke();
  }
});

firmaCanvas.addEventListener("mouseup", () => drawing = false);
firmaCanvas.addEventListener("mouseleave", () => drawing = false);

document.getElementById("clear-firma").onclick = () => {
  firmaCtx.clearRect(0, 0, firmaCanvas.width, firmaCanvas.height);
};

navigator.geolocation.getCurrentPosition(
  (pos) => currentPosition = pos.coords,
  () => alert("No se pudo obtener ubicación")
);

startBtn.onclick = async () => {
  try {
    const constraints = {
      video: {
        facingMode: { exact: "environment" }
      },
      audio: false
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    captureBtn.disabled = false;
  } catch (err) {
    alert("Error accediendo a la cámara: " + err.message);
  }
};

captureBtn.onclick = () => {
  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);

  const now = new Date();
  const timestamp = now.toLocaleString();
  const coords = currentPosition
    ? `${currentPosition.latitude.toFixed(6)}, ${currentPosition.longitude.toFixed(6)}`
    : "Ubicación no disponible";

  context.fillStyle = "white";
  context.font = "20px Arial";
  context.fillText(timestamp, 10, canvas.height - 40);
  context.fillText(coords, 10, canvas.height - 15);

  const imgData = canvas.toDataURL("image/jpeg");
  photos.push({ imgData, timestamp, coords });

  const thumb = document.createElement("img");
  thumb.src = imgData;
  thumbnailsDiv.appendChild(thumb);

  pdfBtn.disabled = false;
};

pdfBtn.onclick = () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  // Validar formulario
  const requiredFields = [
    "nombre", "apellidos", "dni", "codigo", "departamento",
    "provincia", "distrito", "localidad", "utm-este",
    "utm-norte", "zona", "telefono", "inspector"
  ];
  for (const id of requiredFields) {
    if (!document.getElementById(id).value.trim()) {
      alert("Por favor, completa todos los campos del formulario.");
      return;
    }
  }

  const data = requiredFields.reduce((acc, id) => {
    acc[id] = document.getElementById(id).value.trim();
    return acc;
  }, {});

  // Firma
  const firmaImg = firmaCanvas.toDataURL("image/png");

  // Página 1 - Datos
  doc.setFontSize(12);
  doc.text(`Nombre: ${data.nombre} ${data.apellidos}`, 10, 20);
  doc.text(`DNI: ${data.dni}`, 10, 30);
  doc.text(`Código de Usuario: ${data.codigo}`, 10, 40);
  doc.text(`Departamento: ${data.departamento}`, 10, 50);
  doc.text(`Provincia: ${data.provincia}`, 10, 60);
  doc.text(`Distrito: ${data.distrito}`, 10, 70);
  doc.text(`Localidad: ${data.localidad}`, 10, 80);
  doc.text(`Coordenadas UTM: Este ${data["utm-este"]}, Norte ${data["utm-norte"]}`, 10, 90);
  doc.text(`Zona UTM: ${data.zona}`, 10, 100);
  doc.text(`Teléfono: ${data.telefono}`, 10, 110);
  doc.text(`Inspector: ${data.inspector}`, 10, 120);
  doc.text("Firma del inspector:", 10, 130);
  doc.addImage(firmaImg, "PNG", 10, 135, 80, 40);

  // Fotos
  photos.forEach((photo, index) => {
    doc.addPage();
    doc.setFontSize(14);
    doc.text(`Foto ${index + 1}`, 10, 10);
    doc.addImage(photo.imgData, "JPEG", 10, 20, 180, 135);
  });

  const name = filenameInput.value.trim() || "fotos_gps";
  doc.save(name + ".pdf");
};

resetBtn.onclick = () => {
  thumbnailsDiv.innerHTML = "";
  photos = [];
  pdfBtn.disabled = true;
  firmaCtx.clearRect(0, 0, firmaCanvas.width, firmaCanvas.height);
};


