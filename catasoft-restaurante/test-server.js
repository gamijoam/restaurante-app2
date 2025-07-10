const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const FRONTEND_PATH = path.join(__dirname, 'frontend', 'dist');

console.log('=== SERVIDOR HTTP DE PRUEBA ===');
console.log('Puerto:', PORT);
console.log('Directorio frontend:', FRONTEND_PATH);

// Verificar que el directorio existe
if (!fs.existsSync(FRONTEND_PATH)) {
  console.error('❌ Directorio frontend no encontrado:', FRONTEND_PATH);
  process.exit(1);
}

console.log('✅ Directorio frontend encontrado');

// Verificar archivos
try {
  const files = fs.readdirSync(FRONTEND_PATH);
  console.log('📁 Archivos en frontend/dist:', files);
  
  if (!files.includes('index.html')) {
    console.error('❌ index.html no encontrado');
    process.exit(1);
  }
  console.log('✅ index.html encontrado');
  
  const assetsPath = path.join(FRONTEND_PATH, 'assets');
  if (fs.existsSync(assetsPath)) {
    const assetsFiles = fs.readdirSync(assetsPath);
    console.log('📁 Archivos en assets:', assetsFiles);
  }
} catch (error) {
  console.error('❌ Error leyendo directorio:', error);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  console.log('📨 Request:', req.method, req.url);
  
  // Manejar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('🔄 Respondiendo a OPTIONS request');
    res.writeHead(200);
    res.end();
    return;
  }
  
  let filePath = path.join(FRONTEND_PATH, req.url === '/' ? 'index.html' : req.url);
  
  // Verificar si el archivo existe
  if (!fs.existsSync(filePath)) {
    // Para SPA, todas las rutas deben servir index.html
    filePath = path.join(FRONTEND_PATH, 'index.html');
    console.log('📄 Archivo no encontrado, sirviendo index.html');
  }

  const extname = path.extname(filePath);
  let contentType = 'text/html';

  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
    case '.jpeg':
      contentType = 'image/jpeg';
      break;
    case '.svg':
      contentType = 'image/svg+xml';
      break;
    case '.ico':
      contentType = 'image/x-icon';
      break;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      console.error('❌ Error loading file:', filePath, error.message);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found: ' + req.url);
    } else {
      console.log('✅ Serving file:', filePath, 'Content-Type:', contentType, 'Size:', content.length, 'bytes');
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('✅ Servidor HTTP iniciado en puerto', PORT);
  console.log('🌐 URL: http://localhost:' + PORT);
  console.log('📱 Abre tu navegador y ve a: http://localhost:' + PORT);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
}); 