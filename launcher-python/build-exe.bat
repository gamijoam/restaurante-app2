@echo off
REM Compila launcher.py a .exe usando PyInstaller
pyinstaller --onefile --noconsole --icon=icon.ico launcher.py
pause
