const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

let mainWindow;
let backendProcess = null;
let licenseServiceProcess = null;
let printBridgeProcess = null;
let frontendProcess = null;

// Configuración de puertos
const PORTS = {
  backend: 8080,
  license: 8081,
  frontend: 3001,  // Cambiado de 3000 a 3001
  printBridge: 8082
};

// Rutas de los servicios
const PATHS = {
  backend: path.join(__dirname, 'backend', 'backend.jar'),
  licenseService: path.join(__dirname, 'license-service', 'license-service.jar'),
  printBridge: path.join(__dirname, 'puente-impresion'),
  frontend: path.join(__dirname, 'frontend', 'dist')
};

// Función para verificar si un puerto está disponible
function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const testConnection = net.createConnection(port, '127.0.0.1', () => {
      testConnection.destroy();
      resolve(true);
    });
    
    testConnection.on('error', () => {
      resolve(false);
    });
    
    setTimeout(() => {
      testConnection.destroy();
      resolve(false);
    }, 1000);
  });
}

// Función para detectar Java, con soporte para ruta personalizada
function findJavaPath() {
  // 1. Intentar leer ruta personalizada
  const configPath = path.join(__dirname, 'java-path.json');
  if (fs.existsSync(configPath)) {
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (config && config.javaPath && fs.existsSync(config.javaPath)) {
        // Verificar que realmente funciona ejecutando -version
        const result = require('child_process').spawnSync(config.javaPath, ['-version'], {
          stdio: 'pipe',
          timeout: 5000,
          windowsHide: true
        });
        if (result.status === 0) {
          console.log('Java personalizado encontrado y funcional en:', config.javaPath);
          return config.javaPath;
        } else {
          console.log('Java personalizado no funcional en:', config.javaPath);
        }
      }
    } catch (e) {
      console.log('Error leyendo java-path.json:', e.message);
    }
  }

  // 2. Buscar en rutas comunes
  const possiblePaths = [
    // Java Corretto 21 (versiones específicas)
    'C:\\Program Files\\Amazon Corretto\\jdk21.0.7_6\\bin\\java.exe',
    'C:\\Program Files\\Amazon Corretto\\jdk21.0.7\\bin\\java.exe',
    'C:\\Program Files\\Amazon Corretto\\jdk21\\bin\\java.exe',
    'C:\\Program Files\\Amazon Corretto\\jdk-21.0.7\\bin\\java.exe',
    'C:\\Program Files\\Amazon Corretto\\jdk-21\\bin\\java.exe',
    // Rutas comunes de Java en Windows
    'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-17.0.2\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-11\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-11.0.12\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk-8\\bin\\java.exe',
    'C:\\Program Files\\Java\\jdk1.8.0_291\\bin\\java.exe',
    'C:\\Program Files (x86)\\Java\\jdk-8\\bin\\java.exe',
    'C:\\Program Files (x86)\\Java\\jdk1.8.0_291\\bin\\java.exe',
    // JRE paths
    'C:\\Program Files\\Java\\jre1.8.0_291\\bin\\java.exe',
    'C:\\Program Files (x86)\\Java\\jre1.8.0_291\\bin\\java.exe',
    // Más rutas comunes
    'C:\\Program Files\\Eclipse Adoptium\\jdk-17.0.2.8-hotspot\\bin\\java.exe',
    'C:\\Program Files\\Eclipse Adoptium\\jdk-11.0.12.7-hotspot\\bin\\java.exe',
    'C:\\Program Files\\Eclipse Adoptium\\jdk-8.0.302.8-hotspot\\bin\\java.exe',
    // Usar java del PATH como fallback
    'java'
  ];

  for (const javaPath of possiblePaths) {
    if (javaPath === 'java') {
      // Verificar si java está en PATH usando spawnSync
      try {
        const result = require('child_process').spawnSync('java', ['-version'], { 
          stdio: 'pipe',
          timeout: 5000,
          windowsHide: true
        });
        if (result.status === 0) {
          console.log('Java encontrado en PATH');
          return javaPath;
        }
      } catch (error) {
        console.log('Java no encontrado en PATH:', error.message);
      }
      continue;
    }
    // Verificar si el archivo existe y es ejecutable
    try {
      if (fs.existsSync(javaPath)) {
        // Verificar que realmente funciona ejecutando -version
        const result = require('child_process').spawnSync(javaPath, ['-version'], { 
          stdio: 'pipe',
          timeout: 5000,
          windowsHide: true
        });
        if (result.status === 0) {
          console.log('Java encontrado y funcional en:', javaPath);
          return javaPath;
        } else {
          console.log('Java encontrado pero no funcional en:', javaPath);
        }
      }
    } catch (error) {
      console.log('Error verificando Java en', javaPath, ':', error.message);
    }
  }

  console.log('Java no encontrado en ninguna ruta');
  return null; // No se encontró Java
}
// IPC para guardar la ruta personalizada de Java
ipcMain.handle('set-java-path', async (event, javaPath) => {
  const configPath = path.join(__dirname, 'java-path.json');
  try {
    if (!javaPath || typeof javaPath !== 'string' || !fs.existsSync(javaPath)) {
      throw new Error('Ruta de Java inválida o no existe');
    }
    fs.writeFileSync(configPath, JSON.stringify({ javaPath }, null, 2), 'utf-8');
    return { success: true, message: 'Ruta de Java guardada correctamente' };
  } catch (e) {
    return { success: false, message: e.message };
  }
});

// Función para detectar Node.js
function findNodePath() {
  const possiblePaths = [
    // Rutas comunes de Node.js en Windows
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Program Files (x86)\\nodejs\\node.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Roaming\\npm\\node.exe',
    'C:\\Users\\' + process.env.USERNAME + '\\AppData\\Local\\Programs\\nodejs\\node.exe',
    // Usar node del PATH como fallback
    'node'
  ];

  for (const nodePath of possiblePaths) {
    if (nodePath === 'node') {
      // Verificar si node está en PATH usando spawnSync
      try {
        const result = require('child_process').spawnSync('node', ['--version'], { 
          stdio: 'pipe',
          timeout: 5000,
          windowsHide: true
        });
        if (result.status === 0) {
          console.log('Node.js encontrado en PATH');
          return nodePath;
        }
      } catch (error) {
        console.log('Node.js no encontrado en PATH:', error.message);
      }
      continue;
    }
    
    // Verificar si el archivo existe y es ejecutable
    try {
      if (fs.existsSync(nodePath)) {
        // Verificar que realmente funciona ejecutando --version
        const result = require('child_process').spawnSync(nodePath, ['--version'], { 
          stdio: 'pipe',
          timeout: 5000,
          windowsHide: true
        });
        if (result.status === 0) {
          console.log('Node.js encontrado y funcional en:', nodePath);
          return nodePath;
        } else {
          console.log('Node.js encontrado pero no funcional en:', nodePath);
        }
      }
    } catch (error) {
      console.log('Error verificando Node.js en', nodePath, ':', error.message);
    }
  }

  console.log('Node.js no encontrado en ninguna ruta');
  return null; // No se encontró Node.js
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    title: 'Catasoft Restaurante - Launcher'
  });

  mainWindow.loadFile('index.html');

  // Abrir DevTools en desarrollo
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

function startBackend() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(PATHS.backend, 'backend.jar'))) {
      reject(new Error('Backend JAR no encontrado'));
      return;
    }

    // Enviar actualización de estado
    mainWindow.webContents.send('status-update', { service: 'backend', status: 'starting', message: 'Iniciando...' });

    // Usar la función de detección de Java
    const javaPath = findJavaPath();
    if (!javaPath) {
      mainWindow.webContents.send('status-update', { service: 'backend', status: 'error', message: 'Java no encontrado' });
      reject(new Error('Java no encontrado'));
      return;
    }
    
    console.log('Iniciando backend con Java:', javaPath);
    console.log('Backend JAR path:', path.join(PATHS.backend, 'backend.jar'));
    
    backendProcess = spawn(javaPath, ['-jar', 'backend.jar'], {
      cwd: PATHS.backend,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let backendStarted = false;

    backendProcess.stdout.on('data', (data) => {
      console.log('Backend:', data.toString());
      const output = data.toString();
      
      // Detectar cuando el backend está realmente listo
      if (output.includes('Started BackendApplication') || 
          output.includes('Tomcat started on port(s)') || 
          output.includes('Started Application') ||
          output.includes('Started RestauranteApplication')) {
        
        if (!backendStarted) {
          backendStarted = true;
          console.log('Backend detectado como iniciado, verificando puerto...');
          
          // Verificar que el puerto esté realmente disponible
          setTimeout(() => {
            const net = require('net');
            const testConnection = net.createConnection(8080, '127.0.0.1', () => {
              testConnection.destroy();
              console.log('Backend puerto 8080 confirmado como disponible');
              mainWindow.webContents.send('status-update', { service: 'backend', status: 'running', message: 'Ejecutándose' });
              resolve();
            });
            
            testConnection.on('error', () => {
              console.log('Puerto 8080 aún no disponible, esperando...');
            });
          }, 2000);
        }
      }
    });

    backendProcess.stderr.on('data', (data) => {
      console.error('Backend Error:', data.toString());
    });

    backendProcess.on('error', (error) => {
      console.error('Error iniciando backend:', error);
      mainWindow.webContents.send('status-update', { service: 'backend', status: 'error', message: 'Error: ' + error.message });
      reject(error);
    });

    backendProcess.on('exit', (code, signal) => {
      console.log('Backend process exited with code:', code, 'signal:', signal);
      if (code !== 0 && !backendStarted) {
        mainWindow.webContents.send('status-update', { service: 'backend', status: 'error', message: 'Proceso terminado con código: ' + code });
      }
    });

    setTimeout(() => {
      if (!backendStarted) {
        mainWindow.webContents.send('status-update', { service: 'backend', status: 'error', message: 'Timeout' });
        reject(new Error('Timeout iniciando backend'));
      }
    }, 30000);
  });
}

function startLicenseService() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(PATHS.licenseService, 'license-service.jar'))) {
      reject(new Error('License Service JAR no encontrado'));
      return;
    }

    // Enviar actualización de estado
    mainWindow.webContents.send('status-update', { service: 'license', status: 'starting', message: 'Iniciando...' });

    // Usar la función de detección de Java
    const javaPath = findJavaPath();
    if (!javaPath) {
      mainWindow.webContents.send('status-update', { service: 'license', status: 'error', message: 'Java no encontrado' });
      reject(new Error('Java no encontrado'));
      return;
    }
    
    console.log('Iniciando license service con Java:', javaPath);
    console.log('License Service JAR path:', path.join(PATHS.licenseService, 'license-service.jar'));
    
    licenseServiceProcess = spawn(javaPath, ['-jar', 'license-service.jar'], {
      cwd: PATHS.licenseService,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let licenseStarted = false;

    licenseServiceProcess.stdout.on('data', (data) => {
      console.log('License Service:', data.toString());
      const output = data.toString();
      
      // Detectar cuando el license service está realmente listo
      if (output.includes('Started LicenseServiceApplication') || 
          output.includes('Tomcat started on port(s)') || 
          output.includes('Started Application')) {
        
        if (!licenseStarted) {
          licenseStarted = true;
          console.log('License Service detectado como iniciado, verificando puerto...');
          
          // Verificar que el puerto esté realmente disponible
          setTimeout(() => {
            const net = require('net');
            const testConnection = net.createConnection(8081, '127.0.0.1', () => {
              testConnection.destroy();
              console.log('License Service puerto 8081 confirmado como disponible');
              mainWindow.webContents.send('status-update', { service: 'license', status: 'running', message: 'Ejecutándose' });
              resolve();
            });
            
            testConnection.on('error', () => {
              console.log('Puerto 8081 aún no disponible, esperando...');
            });
          }, 2000);
        }
      }
    });

    licenseServiceProcess.stderr.on('data', (data) => {
      console.error('License Service Error:', data.toString());
    });

    licenseServiceProcess.on('error', (error) => {
      console.error('Error iniciando license service:', error);
      mainWindow.webContents.send('status-update', { service: 'license', status: 'error', message: 'Error: ' + error.message });
      reject(error);
    });

    licenseServiceProcess.on('exit', (code, signal) => {
      console.log('License Service process exited with code:', code, 'signal:', signal);
      if (code !== 0 && !licenseStarted) {
        mainWindow.webContents.send('status-update', { service: 'license', status: 'error', message: 'Proceso terminado con código: ' + code });
      }
    });

    setTimeout(() => {
      if (!licenseStarted) {
        mainWindow.webContents.send('status-update', { service: 'license', status: 'error', message: 'Timeout' });
        reject(new Error('Timeout iniciando license service'));
      }
    }, 30000);
  });
}

function startPrintBridge() {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(path.join(PATHS.printBridge, 'package.json'))) {
      reject(new Error('Print Bridge no encontrado'));
      return;
    }

    // Enviar actualización de estado
    mainWindow.webContents.send('status-update', { service: 'print', status: 'starting', message: 'Iniciando...' });

    // Usar la función de detección de Node.js
    const nodePath = findNodePath();
    if (!nodePath) {
      mainWindow.webContents.send('status-update', { service: 'print', status: 'error', message: 'Node.js no encontrado' });
      reject(new Error('Node.js no encontrado'));
      return;
    }
    
    console.log('Iniciando print bridge con Node.js:', nodePath);
    
    printBridgeProcess = spawn(nodePath, ['index.js'], {
      cwd: PATHS.printBridge,
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    printBridgeProcess.stdout.on('data', (data) => {
      console.log('Print Bridge:', data.toString());
      if (data.toString().includes('Conectado al broker STOMP')) {
        mainWindow.webContents.send('status-update', { service: 'print', status: 'running', message: 'Ejecutándose' });
        resolve();
      }
    });

    printBridgeProcess.stderr.on('data', (data) => {
      console.error('Print Bridge Error:', data.toString());
    });

    printBridgeProcess.on('error', (error) => {
      mainWindow.webContents.send('status-update', { service: 'print', status: 'error', message: 'Error: ' + error.message });
      reject(error);
    });

    // Timeout más largo para el print bridge ya que necesita conectarse a STOMP
    setTimeout(() => {
      mainWindow.webContents.send('status-update', { service: 'print', status: 'error', message: 'Timeout' });
      reject(new Error('Timeout iniciando print bridge'));
    }, 45000);
  });
}

function startFrontend() {
  // Mover los require aquí arriba para evitar errores de inicialización
  const fs = require('fs');
  const path = require('path');
  const http = require('http');

  return new Promise((resolve, reject) => {
    console.log('=== INICIANDO FRONTEND ===');
    
    if (!fs.existsSync(PATHS.frontend)) {
      console.error('❌ Frontend dist no encontrado en:', PATHS.frontend);
      reject(new Error('Frontend dist no encontrado'));
      return;
    }

    console.log('✅ Frontend dist encontrado en:', PATHS.frontend);
    
    // Verificar archivos del frontend
    try {
      const files = fs.readdirSync(PATHS.frontend);
      console.log('📁 Archivos en frontend/dist:', files);
      
      if (!files.includes('index.html')) {
        console.error('❌ index.html no encontrado en frontend/dist');
        reject(new Error('index.html no encontrado'));
        return;
      }
      console.log('✅ index.html encontrado');
    } catch (error) {
      console.error('❌ Error leyendo directorio frontend:', error);
      reject(error);
      return;
    }

    // Enviar actualización de estado
    mainWindow.webContents.send('status-update', { service: 'frontend', status: 'starting', message: 'Iniciando...' });

    console.log('🚀 Iniciando servidor HTTP para frontend en puerto:', PORTS.frontend);
    console.log('📂 Directorio frontend:', PATHS.frontend);

    // Usar un servidor HTTP más simple
    const server = http.createServer((req, res) => {
      console.log('📨 Frontend request:', req.method, req.url);
      
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
      
      let filePath = path.join(PATHS.frontend, req.url === '/' ? 'index.html' : req.url);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(filePath)) {
        // Para SPA, todas las rutas deben servir index.html
        filePath = path.join(PATHS.frontend, 'index.html');
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
        case '.woff':
          contentType = 'font/woff';
          break;
        case '.woff2':
          contentType = 'font/woff2';
          break;
        case '.ttf':
          contentType = 'font/ttf';
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

    console.log('🔧 Configurando servidor HTTP...');
    
    server.listen(PORTS.frontend, '127.0.0.1', () => {
      console.log('✅ Frontend servidor HTTP iniciado en puerto', PORTS.frontend);
      
      // Verificar que el puerto esté realmente disponible
      setTimeout(() => {
        console.log('🔍 Verificando que el puerto esté disponible...');
        const net = require('net');
        const testConnection = net.createConnection(PORTS.frontend, '127.0.0.1', () => {
          testConnection.destroy();
          console.log('✅ Frontend puerto', PORTS.frontend, 'confirmado como disponible');
          mainWindow.webContents.send('status-update', { service: 'frontend', status: 'running', message: 'Ejecutándose' });
          resolve();
        });
        
        testConnection.on('error', (err) => {
          console.log('❌ Puerto', PORTS.frontend, 'aún no disponible, error:', err.message);
        });
      }, 1000);
    });

    server.on('error', (error) => {
      console.error('❌ Frontend server error:', error);
      mainWindow.webContents.send('status-update', { service: 'frontend', status: 'error', message: 'Error: ' + error.message });
      reject(error);
    });

    // Timeout después de 10 segundos
    setTimeout(() => {
      console.log('⏰ Timeout iniciando frontend');
      mainWindow.webContents.send('status-update', { service: 'frontend', status: 'error', message: 'Timeout' });
      reject(new Error('Timeout iniciando frontend'));
    }, 10000);
  });
}

function stopAllServices() {
  const processes = [backendProcess, licenseServiceProcess, printBridgeProcess];
  
  processes.forEach(process => {
    if (process && !process.killed) {
      process.kill('SIGTERM');
    }
  });
}

// Eventos IPC
ipcMain.handle('start-services', async () => {
  try {
    mainWindow.webContents.send('status-update', { service: 'all', status: 'starting', message: 'Iniciando servicios...' });
    
    // Iniciar servicios en paralelo
    await Promise.all([
      startBackend(),
      startLicenseService(),
      startPrintBridge(),
      startFrontend()
    ]);

    mainWindow.webContents.send('status-update', { service: 'all', status: 'running', message: 'Todos los servicios están ejecutándose' });
    
    // Abrir el navegador automáticamente
    setTimeout(() => {
      require('electron').shell.openExternal(`http://localhost:${PORTS.frontend}`);
    }, 2000);

    return { success: true, message: 'Servicios iniciados correctamente' };
  } catch (error) {
    mainWindow.webContents.send('status-update', { service: 'all', status: 'error', message: error.message });
    return { success: false, message: error.message };
  }
});

ipcMain.handle('stop-services', async () => {
  try {
    stopAllServices();
    mainWindow.webContents.send('status-update', { service: 'all', status: 'stopped', message: 'Servicios detenidos' });
    return { success: true, message: 'Servicios detenidos correctamente' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('open-frontend', () => {
  require('electron').shell.openExternal(`http://localhost:${PORTS.frontend}`);
});

ipcMain.handle('show-logs', () => {
  try {
    // Crear una ventana de logs
    const logWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      title: 'Logs del Sistema - Catasoft Restaurante'
    });

    // Crear contenido HTML para los logs
    const logContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Logs del Sistema</title>
        <style>
          body { font-family: 'Consolas', 'Monaco', monospace; margin: 20px; background: #1e1e1e; color: #fff; }
          .log-section { margin-bottom: 20px; }
          .log-title { font-weight: bold; color: #4CAF50; margin-bottom: 10px; }
          .log-content { background: #2d2d2d; padding: 10px; border-radius: 5px; max-height: 300px; overflow-y: auto; }
          .log-line { margin: 2px 0; font-size: 12px; }
          .error { color: #f44336; }
          .info { color: #2196F3; }
          .success { color: #4CAF50; }
          .warning { color: #ff9800; }
          .timestamp { color: #888; font-size: 10px; }
          .status-indicator { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; }
          .status-running { background: #4CAF50; }
          .status-stopped { background: #f44336; }
          .status-starting { background: #ff9800; }
          .refresh-btn { background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin: 10px 0; }
          .refresh-btn:hover { background: #45a049; }
        </style>
      </head>
      <body>
        <h1>Logs del Sistema Catasoft Restaurante</h1>
        <button class="refresh-btn" onclick="refreshStatus()">🔄 Actualizar Estado</button>
        
        <div class="log-section">
          <div class="log-title">
            <span class="status-indicator status-running" id="backend-status"></span>
            Backend (Java)
          </div>
          <div class="log-content" id="backend-logs">
            <div class="log-line info">Estado: Ejecutándose</div>
            <div class="log-line info">Puerto: 8080</div>
            <div class="log-line info">URL: http://localhost:8080</div>
            <div class="log-line info">JAR: backend/backend.jar</div>
          </div>
        </div>
        
        <div class="log-section">
          <div class="log-title">
            <span class="status-indicator status-running" id="license-status"></span>
            License Service
          </div>
          <div class="log-content" id="license-logs">
            <div class="log-line info">Estado: Ejecutándose</div>
            <div class="log-line info">Puerto: 8081</div>
            <div class="log-line info">URL: http://localhost:8081</div>
            <div class="log-line info">JAR: license-service/license-service.jar</div>
          </div>
        </div>
        
        <div class="log-section">
          <div class="log-title">
            <span class="status-indicator status-running" id="print-status"></span>
            Print Bridge
          </div>
          <div class="log-content" id="print-logs">
            <div class="log-line info">Estado: Ejecutándose</div>
            <div class="log-line info">Conectado a: ws://localhost:8080/ws</div>
            <div class="log-line info">Directorio: puente-impresion</div>
          </div>
        </div>
        
        <div class="log-section">
          <div class="log-title">
            <span class="status-indicator status-starting" id="frontend-status"></span>
            Frontend
          </div>
          <div class="log-content" id="frontend-logs">
            <div class="log-line info">Estado: Iniciando...</div>
            <div class="log-line info">Puerto: 3001</div>
            <div class="log-line info">URL: http://localhost:3001</div>
            <div class="log-line info">Login: http://localhost:3001/login</div>
            <div class="log-line info">Directorio: frontend/dist</div>
            <div class="log-line warning">⚠️ Verificando servidor HTTP...</div>
          </div>
        </div>
        
        <div class="log-section">
          <div class="log-title">Información del Sistema</div>
          <div class="log-content">
            <div class="log-line info">Directorio del launcher: ${__dirname}</div>
            <div class="log-line info">Backend JAR: ${PATHS.backend}</div>
            <div class="log-line info">License Service JAR: ${PATHS.licenseService}</div>
            <div class="log-line info">Print Bridge: ${PATHS.printBridge}</div>
            <div class="log-line info">Frontend: ${PATHS.frontend}</div>
            <div class="log-line info">Java Path: ${findJavaPath()}</div>
            <div class="log-line info">Node.js Path: ${findNodePath()}</div>
          </div>
        </div>
        
        <script>
          console.log('Ventana de logs abierta');
          
          // Función para actualizar estado de puertos
          async function refreshStatus() {
            try {
              const response = await fetch('http://localhost:3001');
              if (response.ok) {
                document.getElementById('frontend-status').className = 'status-indicator status-running';
                document.getElementById('frontend-logs').innerHTML = 
                  '<div class="log-line success">✅ Estado: Ejecutándose</div>' +
                  '<div class="log-line info">Puerto: 3001</div>' +
                  '<div class="log-line info">URL: http://localhost:3001</div>' +
                  '<div class="log-line info">Login: http://localhost:3001/login</div>' +
                  '<div class="log-line info">Directorio: frontend/dist</div>' +
                  '<div class="log-line success">✅ Servidor HTTP funcionando</div>';
              }
            } catch (error) {
              document.getElementById('frontend-status').className = 'status-indicator status-stopped';
              document.getElementById('frontend-logs').innerHTML = 
                '<div class="log-line error">❌ Estado: Error</div>' +
                '<div class="log-line info">Puerto: 3001</div>' +
                '<div class="log-line info">URL: http://localhost:3001</div>' +
                '<div class="log-line info">Login: http://localhost:3001/login</div>' +
                '<div class="log-line info">Directorio: frontend/dist</div>' +
                '<div class="log-line error">❌ Error: ' + error.message + '</div>';
            }
          }
          
          // Actualizar cada 3 segundos
          setInterval(refreshStatus, 3000);
          
          // Actualizar inmediatamente
          refreshStatus();
        </script>
      </body>
      </html>
    `;

    logWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(logContent));
    
    return { success: true };
  } catch (error) {
    console.error('Error al mostrar logs:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('check-services', () => {
  const status = {
    backend: backendProcess && !backendProcess.killed,
    licenseService: licenseServiceProcess && !licenseServiceProcess.killed,
    printBridge: printBridgeProcess && !printBridgeProcess.killed,
    frontend: true // Siempre disponible si el servidor está corriendo
  };
  return status;
});

ipcMain.handle('check-java', () => {
  const javaPath = findJavaPath();
  const javaExists = javaPath !== 'java' || require('child_process').spawnSync('java', ['-version'], { stdio: 'ignore' }).status === 0;
  
  return {
    javaPath: javaPath,
    javaExists: javaExists,
    message: javaExists ? 
      `Java encontrado en: ${javaPath}` : 
      'Java no encontrado. Por favor instale Java 8 o superior.'
  };
});

ipcMain.handle('check-node', () => {
  const nodePath = findNodePath();
  const nodeExists = nodePath !== null;
  
  return {
    nodePath: nodePath,
    nodeExists: nodeExists,
    message: nodeExists ? 
      `Node.js encontrado en: ${nodePath}` : 
      'Node.js no encontrado. Por favor instale Node.js.'
  };
});

ipcMain.handle('check-ports', async () => {
  const backendPort = await checkPort(8080);
  const licensePort = await checkPort(8081);
  const frontendPort = await checkPort(3001);
  
  const portsOk = backendPort && licensePort && frontendPort;
  const message = `Backend (8080): ${backendPort ? 'OK' : 'NO'}, License (8081): ${licensePort ? 'OK' : 'NO'}, Frontend (3001): ${frontendPort ? 'OK' : 'NO'}`;
  
  return {
    portsOk: portsOk,
    message: message,
    backend: backendPort,
    license: licensePort,
    frontend: frontendPort
  };
});

// Eventos de la aplicación
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    stopAllServices();
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  stopAllServices();
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  dialog.showErrorBox('Error', `Error inesperado: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
}); 