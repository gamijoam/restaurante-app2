@echo off
echo Iniciando License Service...
echo.
cd license-service
echo Compilando proyecto...
call mvn clean compile
if %errorlevel% neq 0 (
    echo Error compilando el proyecto
    pause
    exit /b 1
)
echo.
echo Iniciando License Service en puerto 8081...
echo URL: http://localhost:8081
echo H2 Console: http://localhost:8081/h2-console
echo.
call mvn spring-boot:run
pause 