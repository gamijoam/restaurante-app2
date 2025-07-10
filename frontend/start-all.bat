@echo off
REM Script para iniciar backend y license-service junto con el frontend
start "Backend" cmd /c "cd ..\..\backend && java -jar target\backend-0.0.1-SNAPSHOT.jar"
start "LicenseService" cmd /c "cd ..\..\license-service && java -jar target\license-service-1.0.0.jar"
cd frontend
npm run dev
