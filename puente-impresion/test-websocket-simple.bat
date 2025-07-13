@echo off
echo ========================================
echo    PRUEBA SIMPLE DE WEBSOCKET
echo ========================================
echo.

echo Verificando que el backend esté corriendo...
timeout /t 2 /nobreak >nul

echo.
echo Ejecutando prueba simple de WebSocket...
echo.

node test-websocket-simple.js

echo.
echo ========================================
echo    PRUEBA COMPLETADA
echo ========================================
echo.
pause 