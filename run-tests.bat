@echo off
echo ========================================
echo    RESTAURANTE APP - TESTING SUITE
echo ========================================
echo.

echo [1/4] Limpiando proyecto...
call mvn clean
if %errorlevel% neq 0 (
    echo ERROR: Fallo al limpiar proyecto
    pause
    exit /b 1
)

echo.
echo [2/4] Ejecutando pruebas unitarias...
call mvn test
if %errorlevel% neq 0 (
    echo ERROR: Fallo en pruebas unitarias
    pause
    exit /b 1
)

echo.
echo [3/4] Ejecutando pruebas de integración...
call mvn integration-test
if %errorlevel% neq 0 (
    echo ERROR: Fallo en pruebas de integración
    pause
    exit /b 1
)

echo.
echo [4/4] Generando reportes...
call mvn jacoco:report surefire-report:report
if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar reportes
    pause
    exit /b 1
)

echo.
echo ========================================
echo           TESTS COMPLETADOS
echo ========================================
echo.
echo Reportes disponibles en:
echo - Cobertura: target/site/jacoco/index.html
echo - Tests: target/site/surefire-report.html
echo.
echo Presiona cualquier tecla para abrir los reportes...
pause >nul

echo Abriendo reporte de cobertura...
start target/site/jacoco/index.html

echo Abriendo reporte de tests...
start target/site/surefire-report.html

echo.
echo ¡Testing completado exitosamente!
pause 