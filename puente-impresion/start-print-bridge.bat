@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    GESTOR DEL PUENTE DE IMPRESION
echo ========================================
echo.

:: Configurar variables
set "SCRIPT_DIR=%~dp0"
set "NODE_SCRIPT=%SCRIPT_DIR%start-print-bridge.js"
set "LOG_FILE=%SCRIPT_DIR%print-bridge-manager.log"
set "MAX_RESTARTS=10"
set "RESTART_DELAY=5000"

:: Crear archivo de log
echo [%date% %time%] Iniciando gestor del puente de impresión > "%LOG_FILE%"

:: Verificar que Node.js esté instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado o no está en el PATH
    echo Por favor, instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Verificar que el script existe
if not exist "%NODE_SCRIPT%" (
    echo ❌ ERROR: No se encontró el script %NODE_SCRIPT%
    pause
    exit /b 1
)

echo ✅ Node.js encontrado: 
node --version
echo.
echo 📁 Directorio: %SCRIPT_DIR%
echo 📝 Log file: %LOG_FILE%
echo 🔄 Máximo de reinicios: %MAX_RESTARTS%
echo ⏱️  Delay entre reinicios: %RESTART_DELAY%ms
echo.

:: Función para registrar en log
:log
echo [%date% %time%] %~1 >> "%LOG_FILE%"
echo %~1
goto :eof

:: Función para iniciar el proceso
:start_process
call :log "🔄 Iniciando proceso del puente de impresión..."
node "%NODE_SCRIPT%"
set "EXIT_CODE=%errorlevel%"
call :log "❌ Proceso terminado con código: %EXIT_CODE%"
goto :eof

:: Bucle principal
set "RESTART_COUNT=0"

:main_loop
if %RESTART_COUNT% geq %MAX_RESTARTS% (
    call :log "❌ Máximo número de reinicios alcanzado (%MAX_RESTARTS%). Deteniendo gestor."
    goto :end
)

if %RESTART_COUNT% gtr 0 (
    call :log "⏱️  Esperando %RESTART_DELAY%ms antes del reinicio..."
    timeout /t %RESTART_DELAY% /nobreak >nul
)

call :start_process

set /a "RESTART_COUNT+=1"
call :log "🔄 Reinicio %RESTART_COUNT%/%MAX_RESTARTS%"
goto :main_loop

:end
call :log "🛑 Gestor detenido."
echo.
echo Presione cualquier tecla para cerrar...
pause >nul 