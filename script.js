// script.js

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

  const firmaImg = firmaCanvas.toDataURL("image/png");

  // Recoger todos los campos dinámicos del formulario generado
  const campos = {};
  document.querySelectorAll("#inspection-form input, #inspection-form textarea, #inspection-form select").forEach(input => {
    if (input.type === "radio") {
      if (input.checked) {
        campos[input.name] = input.value;
      }
    } else {
      const key = input.id || input.name;
      if (key) campos[key] = input.value.trim();
    }
  });

  // Generar la primera página con datos
  let y = 20;
  doc.setFontSize(12);
  for (const [key, value] of Object.entries(campos)) {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(`${key}: ${value}`, 10, y);
    y += 8;
  }

  doc.text("Firma del inspector:", 10, y);
  doc.addImage(firmaImg, "PNG", 10, y + 5, 80, 40);
  y += 50;

  photos.forEach((photo, index) => {
    doc.addPage();
    doc.setFontSize(14);
    doc.text(`Foto ${index + 1}`, 10, 10);
    doc.addImage(photo.imgData, "JPEG", 10, 20, 180, 135);
  });

  const name = filenameInput.value.trim() || "inspeccion";
  doc.save(name + ".pdf");
};

resetBtn.onclick = () => {
  thumbnailsDiv.innerHTML = "";
  photos = [];
  pdfBtn.disabled = true;
  firmaCtx.clearRect(0, 0, firmaCanvas.width, firmaCanvas.height);
};
