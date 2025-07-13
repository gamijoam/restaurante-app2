@echo off
echo ========================================
echo    PUENTE DE IMPRESION V2 (PRODUCCION)
echo ========================================
echo.

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo.
echo Iniciando puente de impresion V2...
echo.

node index-production-v2.js

echo.
echo ========================================
echo    PUENTE DE IMPRESION V2 CERRADO
echo ========================================
echo.
pause 