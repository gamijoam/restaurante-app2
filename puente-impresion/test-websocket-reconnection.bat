@echo off
echo ========================================
echo    PRUEBA DE RECONEXION WEBSOCKET
echo ========================================
echo.

echo Verificando que el backend esté corriendo...
timeout /t 2 /nobreak >nul

echo.
echo Ejecutando pruebas de reconexión WebSocket...
echo.

node test-websocket-reconnection.js

echo.
echo ========================================
echo    PRUEBAS COMPLETADAS
echo ========================================
echo.
pause 