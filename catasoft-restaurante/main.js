const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let processes = {};

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'icon.png'),
    title: 'Catasoft Restaurante Launcher'
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  stopAllServices();
  if (process.platform !== 'darwin') app.quit();
});

function startService(name, command, args, options) {
  if (processes[name]) return;
  const proc = spawn(command, args, { ...options, detached: true });
  processes[name] = proc;
  proc.stdout.on('data', data => mainWindow.webContents.send('log', `[${name}] ${data}`));
  proc.stderr.on('data', data => mainWindow.webContents.send('log', `[${name}][ERR] ${data}`));
  proc.on('close', code => {
    mainWindow.webContents.send('log', `[${name}] terminado (código ${code})`);
    delete processes[name];
  });
}

function stopService(name) {
  if (processes[name]) {
    processes[name].kill();
    delete processes[name];
  }
}

function stopAllServices() {
  Object.keys(processes).forEach(stopService);
}

ipcMain.on('start-all', () => {
  // Ajusta las rutas según tu estructura
  startService('backend', 'java', ['-jar', path.join(__dirname, '../backend/backend.jar')]);
  startService('license-service', 'java', ['-jar', path.join(__dirname, '../license-service/license-service.jar')]);
  startService('puente-impresion', path.join(__dirname, '../puente-impresion/puente-impresion.exe'), []);
  startService('frontend', 'npx', ['vite', 'preview', '--port', '5173'], { cwd: path.join(__dirname, '../frontend') });
});
ipcMain.on('stop-all', stopAllServices);

// Puedes agregar más IPC para iniciar/detener servicios individuales si lo deseas 