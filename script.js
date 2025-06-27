
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let baseImageData = null;
let userHasDrawn = false;  

.logo-cars {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 80px; /* tamaño chico */
  height: auto;
}

const image = new Image();
image.src = 'parabrisa.png';
image.crossOrigin = 'anonymous';
image.onload = () => {
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  baseImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
};


let drawing = false;

function getPos(evt) {
  const rect = canvas.getBoundingClientRect();
  if (evt.touches) {
    return {
      x: evt.touches[0].clientX - rect.left,
      y: evt.touches[0].clientY - rect.top
    };
  } else {
    return {
      x: evt.offsetX,
      y: evt.offsetY
    };
  }
}

function startDraw(evt) {
  evt.preventDefault();
  drawing = true;
  const pos = getPos(evt);
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
}

function draw(evt) {
  if (!drawing) return;
  evt.preventDefault();
  const pos = getPos(evt);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'red';
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pos.x, pos.y);
  userHasDrawn = true;  
}

function endDraw(evt) {
  evt.preventDefault();
  drawing = false;
  ctx.beginPath();
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);

canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', draw, { passive: false });
canvas.addEventListener('touchend', endDraw);
canvas.addEventListener('touchcancel', endDraw);

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  userHasDrawn = false;  
}

window.onload = () => {
  const { jsPDF } = window.jspdf;

  document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const taller = document.getElementById('taller').value.trim();
    const serieNumero = document.getElementById('serieNumero').value.trim();
    const siniestro = document.getElementById('siniestro').value.trim();
    const fecha = document.getElementById('fecha').value.trim();
    const dificultadVisual = document.getElementById('dificultadVisual').value.trim();

    if (!taller || !serieNumero || !siniestro || !fecha) {
      alert("Por favor complete todos los campos antes de generar el PDF.");
      return;
    }

    
    if (userHasDrawn && !dificultadVisual) {
      alert("Si realizaste un dibujo, completá el campo 'Dificulta visual'.");
      return;
    }

    const pdf = new jsPDF();
    pdf.text(`Taller: ${taller}`, 10, 20);
    pdf.text(`Serie y Número: ${serieNumero}`, 10, 30);
    pdf.text(`Siniestro: ${siniestro}`, 10, 40);
    pdf.text(`Fecha: ${fecha}`, 10, 50);
    pdf.text(`Dificultad visual: ${dificultadVisual}`, 10, 60);

    try {
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, 'PNG', 10, 70, 180, 120);
    } catch (error) {
      alert("Error al convertir el canvas. Asegúrate de usar Live Server.");
      return;
    }

    const table = document.getElementById('tablaPiezas').cloneNode(true);
    const inputs = table.querySelectorAll('input');
    inputs.forEach(input => {
      const td = input.parentElement;
      td.textContent = input.value;
    });

    pdf.autoTable({ html: table, startY: 195 });
    pdf.save("formulario_con_dibujo.pdf");
  });
};
