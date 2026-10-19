const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 8080;

// Estos dos valores llegan desde un ConfigMap y un Secret de OpenShift.
// Si no existen, usamos valores por defecto para poder correr en local.
const MENSAJE = process.env.APP_MENSAJE || 'Hola desde la API de capybaras (valor por defecto) 🦫';
const SECRETO = process.env.API_SECRETO;

// Datos que sirve la API.
const CAPYBARAS = [
  'El capibara es el roedor más grande del mundo: puede pesar hasta 65 kg.',
  'Es un nadador excelente y aguanta la respiración bajo el agua hasta 5 minutos.',
  'Es muy sociable: vive en grupos de 10 a 20 individuos.',
  'Se lleva bien con casi cualquier animal; por eso se le ve con pájaros y otros encima.',
  'Es herbívoro: come pasto y plantas acuáticas.',
  'Su nombre viene del guaraní "kapiÿva", que significa "señor de las hierbas".'
];

// CORS básico, por si algún día quieres llamar la API desde el navegador.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Liveness: ¿el proceso está vivo?
app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

// Readiness: ¿está listo para recibir tráfico?
app.get('/ready', (req, res) => {
  res.json({ status: 'READY' });
});

// El endpoint principal: devuelve los datos + el pod que respondió.
app.get('/api/capybaras', (req, res) => {
  res.json({
    mensaje: MENSAJE,
    secretoCargado: Boolean(SECRETO),
    pod: os.hostname(),
    capybaras: CAPYBARAS
  });
});

app.listen(PORT, () => {
  console.log(`API de capybaras escuchando en el puerto ${PORT} 🦫`);
});
