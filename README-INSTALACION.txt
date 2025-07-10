# INSTRUCCIONES DE INSTALACIÓN Y USO - CATASOFT RESTAURANTE

## 1. ¿Qué carpeta entregar al cliente?

Debes entregar SOLO los archivos y carpetas necesarios para la ejecución, NO el código fuente ni carpetas de desarrollo. La estructura recomendada es:

```
restaurante-app/
├── backend/
│   └── backend.jar
├── license-service/
│   └── license-service.jar
├── frontend/
│   ├── dist/           # Solo la carpeta generada por Vite (no src, node_modules, etc.)
│   └── .env            # Archivo de configuración
├── puente-impresion/
│   ├── puente-impresion.exe
│   └── .env
├── launcher/
│   ├── launcher.exe    # El ejecutable generado con PyInstaller
│   └── config.json     # Se genera automáticamente
├── README-INSTALACION.txt
```

## 2. Requisitos previos en la PC del cliente
- **Java** instalado (JDK 17 o superior recomendado)
- **Node.js y npm** instalados
- Permisos de administrador para abrir/cerrar puertos y ejecutar servicios

## 3. Primer uso y configuración
1. Ejecuta `launcher.exe` desde la carpeta `launcher/`.
2. En la interfaz, selecciona la ruta de `java.exe` (por ejemplo, `C:\Program Files\Java\jdk-21\bin\java.exe`) y haz clic en "Guardar".
3. Si es necesario, marca la opción "Mostrar consolas de servicios" para depuración.
4. Usa los botones para:
   - Verificar y cerrar puertos si están ocupados
   - Iniciar todos los servicios
   - Ver logs de cada servicio

## 4. Notas importantes
- El launcher guarda la configuración en `launcher/config.json`.
- Si cambias de PC o de ruta de Java, deberás volver a configurarla.
- Si algún servicio no inicia, revisa los logs y asegúrate de que los puertos estén libres.

## 5. ¿Qué hacer si cambio de PC?
- Lleva toda la carpeta del sistema y repite la configuración de Java en la nueva PC.

## 6. Soporte
Ante cualquier inconveniente, contacta a soporte técnico de Catasoft.

## 7. Cómo compilar el launcher a .exe (para desarrolladores)

Si necesitas volver a generar el archivo `launcher.exe`:

1. Instala Python 3.x desde https://www.python.org/downloads/ (NO uses la versión de Microsoft Store).
2. Instala PyInstaller:
   ```
   pip install pyinstaller
   ```
3. Abre una terminal en la carpeta del launcher y ejecuta:
   ```
   python -m PyInstaller --noconsole --icon=icon.ico launcher.py
   ```
   - Si tienes varios Python instalados, usa `py -m PyInstaller ...`.
   - Si PyInstaller no se reconoce, busca el ejecutable en la carpeta Scripts de tu instalación de Python y ejecútalo con la ruta completa.
4. El archivo `launcher.exe` aparecerá en la carpeta `dist`.
5. Borra las carpetas `build`, `dist` y el archivo `launcher.spec` antes de recompilar si tienes errores.

Si ves errores de DLL o "ordinal no encontrado", asegúrate de usar Python oficial y la última versión de PyInstaller.
