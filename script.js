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
  const doc = new jsPDF();

  photos.forEach((photo, index) => {
    if (index !== 0) doc.addPage();
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
};

