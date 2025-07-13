@echo off
chcp 65001 >nul

echo ========================================
echo    PUENTE DE IMPRESION - INICIO SIMPLE
echo ========================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo 📁 Directorio: %~dp0
echo.

:: Crear archivo .env si no existe
if not exist ".env" (
    echo WEBSOCKET_URL=ws://localhost:8080/ws > .env
    echo ✅ Archivo .env creado
)

echo 🚀 Iniciando puente de impresión...
echo ⚠️  Presiona Ctrl+C para detener
echo.

:: Iniciar el puente de impresión
node index.js

echo.
echo 🛑 Puente de impresión detenido
pause 