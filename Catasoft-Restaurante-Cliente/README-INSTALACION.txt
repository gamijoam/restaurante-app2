🍽️ CATASOFT RESTAURANTE - INSTRUCCIONES DE INSTALACIÓN

===============================================================

ESTRUCTURA DEL PROGRAMA
===============================================================

Catasoft-Restaurante-Cliente/
├── backend/
│   └── backend.jar                    # JAR del backend (COMPILAR)
├── frontend/
│   ├── package.json                   # Configuración npm
│   ├── dist/                          # Archivos compilados
│   └── node_modules/                  # Dependencias
├── license-service/
│   ├── license-service.jar            # JAR del license service (COMPILAR)
│   ├── license-db.mv.db              # Base de datos
│   └── license-db.trace.db           # Logs de base de datos
├── puente-impresion/
│   ├── index.js                       # Script principal
│   ├── package.json                   # Configuración npm
│   └── node_modules/                  # Dependencias
├── logs/                              # Logs del sistema
├── config.json                        # Configuración del launcher
├── CatasoftLauncher.exe               # Ejecutable del launcher
└── README-INSTALACION.txt            # Este archivo

===============================================================

REQUISITOS DEL SISTEMA
===============================================================

1. JAVA 17 o superior
   - Descargar desde: https://adoptium.net/
   - Verificar instalación: java -version

2. NODE.JS 18 o superior
   - Descargar desde: https://nodejs.org/
   - Verificar instalación: node --version

3. NPM (incluido con Node.js)
   - Verificar instalación: npm --version

===============================================================

PASOS DE INSTALACIÓN
===============================================================

PASO 1: COMPILAR BACKEND
-------------------------
1. Abrir terminal en la carpeta backend
2. Ejecutar: mvn clean package
3. Copiar el JAR generado a: backend/backend.jar

PASO 2: COMPILAR LICENSE SERVICE
---------------------------------
1. Abrir terminal en la carpeta license-service
2. Ejecutar: mvn clean package
3. Copiar el JAR generado a: license-service/license-service.jar

PASO 3: INSTALAR FRONTEND
--------------------------
1. Abrir terminal en la carpeta frontend
2. Ejecutar: npm install
3. Ejecutar: npm run build
4. Verificar que se creó la carpeta dist/

PASO 4: INSTALAR PUENTE IMPRESIÓN
----------------------------------
1. Abrir terminal en la carpeta puente-impresion
2. Ejecutar: npm install
3. Verificar que se creó la carpeta node_modules/

PASO 5: CONFIGURAR LAUNCHER
-----------------------------
1. Verificar que config.json tenga las rutas correctas
2. Ejecutar: CatasoftLauncher.exe

===============================================================

COMANDOS DE VERIFICACIÓN
===============================================================

# Verificar Java
java -version

# Verificar Node.js
node --version
npm --version

# Verificar estructura
dir backend\backend.jar
dir frontend\dist\index.html
dir license-service\license-service.jar
dir puente-impresion\index.js

===============================================================

SOLUCIÓN DE PROBLEMAS
===============================================================

PROBLEMA: "No se encuentra java"
SOLUCIÓN: Instalar Java 17+ y agregar al PATH

PROBLEMA: "No se encuentra node"
SOLUCIÓN: Instalar Node.js 18+ y agregar al PATH

PROBLEMA: "Puerto en uso"
SOLUCIÓN: Cerrar otros programas que usen puertos 8080, 5173, 8081

PROBLEMA: "Error de dependencias"
SOLUCIÓN: Ejecutar npm install en frontend y puente-impresion

===============================================================

CONTACTO
===============================================================

Para soporte técnico:
- Email: soporte@catasoft.com
- Teléfono: +58 412-XXX-XXXX

===============================================================

© 2025 Catasoft - Sistema de Gestión de Restaurante 