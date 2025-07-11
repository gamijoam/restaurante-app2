@echo off
echo Compilando Launcher Moderno a .exe...
echo.

echo Limpiando archivos anteriores...
if exist "dist" rmdir /s /q "dist"
if exist "build" rmdir /s /q "build"
if exist "modern_launcher.spec" del "modern_launcher.spec"

echo.
echo Compilando con PyInstaller...
pyinstaller --onefile --windowed --icon=icon.ico --name="Catasoft_Restaurante_Launcher" modern_launcher.py

echo.
echo Compilación completada!
echo El ejecutable se encuentra en: dist\Catasoft_Restaurante_Launcher.exe
echo.
pause 