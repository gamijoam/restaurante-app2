const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const LAUNCHER_DIR = __dirname;

console.log('🚀 Iniciando compilación del sistema Catasoft Restaurante...\n');

async function runCommand(command, cwd, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    
    const process = spawn(command.split(' ')[0], command.split(' ').slice(1), {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    process.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${description} completado\n`);
        resolve();
      } else {
        console.log(`❌ ${description} falló con código ${code}\n`);
        reject(new Error(`${description} falló`));
      }
    });

    process.on('error', (error) => {
      console.log(`❌ Error en ${description}: ${error.message}\n`);
      reject(error);
    });
  });
}

async function copyFiles() {
  console.log('📁 Copiando archivos compilados...');
  
  // Crear directorios si no existen
  const dirs = ['backend', 'license-service', 'puente-impresion', 'frontend'];
  dirs.forEach(dir => {
    const targetDir = path.join(LAUNCHER_DIR, dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
  });

  // Copiar backend
  const backendJar = path.join(ROOT_DIR, 'backend', 'target', 'backend-0.0.1-SNAPSHOT.jar');
  const backendTarget = path.join(LAUNCHER_DIR, 'backend', 'backend.jar');
  if (fs.existsSync(backendJar)) {
    fs.copyFileSync(backendJar, backendTarget);
    console.log('✅ Backend JAR copiado');
  } else {
    console.log('⚠️  Backend JAR no encontrado, saltando...');
  }

  // Copiar license service
  const licenseJar = path.join(ROOT_DIR, 'license-service', 'target', 'license-service-0.0.1-SNAPSHOT.jar');
  const licenseTarget = path.join(LAUNCHER_DIR, 'license-service', 'license-service.jar');
  if (fs.existsSync(licenseJar)) {
    fs.copyFileSync(licenseJar, licenseTarget);
    console.log('✅ License Service JAR copiado');
  } else {
    console.log('⚠️  License Service JAR no encontrado, saltando...');
  }

  // Copiar puente de impresión
  const printBridgeSource = path.join(ROOT_DIR, 'puente-impresion');
  const printBridgeTarget = path.join(LAUNCHER_DIR, 'puente-impresion');
  if (fs.existsSync(printBridgeSource)) {
    // Copiar todo el directorio
    const copyRecursive = (src, dest) => {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    copyRecursive(printBridgeSource, printBridgeTarget);
    console.log('✅ Puente de impresión copiado');
  } else {
    console.log('⚠️  Puente de impresión no encontrado, saltando...');
  }

  // Copiar frontend
  const frontendSource = path.join(ROOT_DIR, 'frontend', 'dist');
  const frontendTarget = path.join(LAUNCHER_DIR, 'frontend', 'dist');
  if (fs.existsSync(frontendSource)) {
    const copyRecursive = (src, dest) => {
      if (fs.statSync(src).isDirectory()) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    };
    copyRecursive(frontendSource, frontendTarget);
    console.log('✅ Frontend copiado');
  } else {
    console.log('⚠️  Frontend dist no encontrado, saltando...');
  }

  console.log('📁 Copiado completado\n');
}

async function installLauncherDependencies() {
  try {
    await runCommand('npm install', LAUNCHER_DIR, 'Instalando dependencias del launcher');
  } catch (error) {
    console.log('⚠️  Error instalando dependencias del launcher, continuando...\n');
  }
}

async function buildLauncher() {
  try {
    await runCommand('npm run build-win', LAUNCHER_DIR, 'Compilando launcher para Windows');
  } catch (error) {
    console.log('⚠️  Error compilando launcher, continuando...\n');
  }
}

async function main() {
  try {
    // Paso 1: Compilar backend
    console.log('🔧 Paso 1: Compilando Backend (Java Spring Boot)');
    await runCommand('mvn clean package -DskipTests', path.join(ROOT_DIR, 'backend'), 'Compilando backend');

    // Paso 2: Compilar license service
    console.log('🔧 Paso 2: Compilando License Service');
    await runCommand('mvn clean package -DskipTests', path.join(ROOT_DIR, 'license-service'), 'Compilando license service');

    // Paso 3: Instalar dependencias del puente de impresión
    console.log('🔧 Paso 3: Instalando dependencias del puente de impresión');
    await runCommand('npm install', path.join(ROOT_DIR, 'puente-impresion'), 'Instalando dependencias del puente de impresión');

    // Paso 4: Compilar frontend
    console.log('🔧 Paso 4: Compilando Frontend (React)');
    await runCommand('npm run build', path.join(ROOT_DIR, 'frontend'), 'Compilando frontend');

    // Paso 5: Copiar archivos al launcher
    console.log('🔧 Paso 5: Copiando archivos al launcher');
    await copyFiles();

    // Paso 6: Instalar dependencias del launcher
    console.log('🔧 Paso 6: Instalando dependencias del launcher');
    await installLauncherDependencies();

    // Paso 7: Compilar launcher
    console.log('🔧 Paso 7: Compilando launcher');
    await buildLauncher();

    console.log('🎉 ¡Sistema compilado exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. El launcher compilado estará en: catasoft-restaurante/dist/');
    console.log('2. Copia la carpeta completa al cliente');
    console.log('3. El cliente solo necesita hacer doble click en el .exe');
    console.log('\n📁 Estructura final:');
    console.log('catasoft-restaurante/');
    console.log('├── dist/ (launcher compilado)');
    console.log('├── backend/backend.jar');
    console.log('├── license-service/license-service.jar');
    console.log('├── puente-impresion/ (código Node.js)');
    console.log('└── frontend/dist/ (archivos React compilados)');

  } catch (error) {
    console.error('❌ Error durante la compilación:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main, copyFiles }; 