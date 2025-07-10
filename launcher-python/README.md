# Launcher Python para Catasoft Restaurante

Este es el nuevo launcher multiplataforma para iniciar y detener los servicios del sistema Catasoft Restaurante.

## Estructura propuesta

- `launcher.py` — Código principal del launcher (Tkinter)
- `config.json` — Configuración (ruta de java, preferencias, etc.)
- `README.md` — Instrucciones de uso
- `requirements.txt` — Dependencias (solo estándar, pero aquí para PyInstaller)
- `build-exe.bat` — Script para compilar a .exe con PyInstaller
- `/logs/` — Carpeta donde se guardarán los logs de los servicios

## Funcionalidades
- Iniciar/detener todos los servicios (backend, license-service, print-bridge, frontend)
- Guardar y usar ruta personalizada de java.exe
- Mostrar/ocultar consolas de los servicios
- Ver logs en la interfaz

## Para compilar a .exe
1. Instala Python 3.x y pip
2. Instala PyInstaller: `pip install pyinstaller`
3. Ejecuta `build-exe.bat`

---

Cualquier duda, contacta a soporte Catasoft.
