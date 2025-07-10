# Documentación del Launcher - Catasoft Restaurante

## Índice
1. [Descripción General](#descripción-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración del Launcher](#configuración-del-launcher)
4. [Compilación del Launcher](#compilación-del-launcher)
5. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
6. [Distribución al Cliente](#distribución-al-cliente)
7. [Mantenimiento](#mantenimiento)

---

## Descripción General

El launcher es una aplicación Python que automatiza el inicio de todos los servicios necesarios para el sistema de restaurante:

- **Backend**: Servicio Java (puerto 8080)
- **License Service**: Servicio de licencias Java (puerto 8081)
- **Print Bridge**: Servicio de impresión Node.js (puerto 8082)
- **Frontend**: Aplicación React servida con `serve` (puerto 5173)

---

## Estructura del Proyecto

```
launcher/
├── launcher.exe                    # Ejecutable principal
├── package.json                    # Dependencias del launcher
├── package-lock.json              # Lock de dependencias
├── node_modules/                  # Dependencias instaladas
├── backend/
│   └── backend.jar               # Servicio backend
├── license-service/
│   └── license-service.jar       # Servicio de licencias
├── frontend/
│   └── dist/                     # Build del frontend
├── puente-impresion/
│   └── puente-impresion.exe     # Servicio de impresión
└── logs/                         # Logs de todos los servicios
```

---

## Configuración del Launcher

### Dependencias Requeridas

#### 1. Node.js y npm
```bash
# Verificar instalación
node --version
npm --version
```

#### 2. Java Runtime Environment (JRE)
```bash
# Verificar instalación
java -version
```

#### 3. Dependencias del Launcher
```bash
cd launcher
npm install
```

Esto instalará:
- `serve`: Para servir el frontend React
- Otras dependencias necesarias

### Configuración del Frontend

El launcher usa `serve` para servir el frontend de forma nativa:

```python
# Configuración en launcher.py
if platform.system() == 'Windows':
    serve_bin = os.path.join(BASE_DIR, 'node_modules', '.bin', 'serve.cmd')
else:
    serve_bin = os.path.join(BASE_DIR, 'node_modules', '.bin', 'serve')

SERVICES['frontend'] = {
    'name': 'Frontend',
    'cmd': [serve_bin, '-s', 'dist', '-l', '5173'],
    'cwd': os.path.join(BASE_DIR, 'frontend'),
    'log': os.path.join(LOGS_DIR, 'frontend.log'),
    'process': None
}
```

---

## Compilación del Launcher

### Requisitos Previos

1. **Python 3.10+ instalado**
2. **PyInstaller instalado**
```bash
pip install pyinstaller
```

3. **Archivo de ícono** (`icon.ico`) en la carpeta del proyecto

### Comando de Compilación

```bash
cd restaurante-app2/launcher-python
pyinstaller --onefile --noconsole --icon=icon.ico launcher.py
```

### Opciones de Compilación

- `--onefile`: Crea un solo archivo ejecutable
- `--noconsole`: No muestra ventana de consola (para GUI)
- `--icon=icon.ico`: Asigna ícono personalizado al ejecutable

### Ubicación del Resultado

El ejecutable se genera en: `restaurante-app2/launcher-python/dist/launcher.exe`

---

## Errores Comunes y Soluciones

### 1. Error: "El sistema no puede encontrar el archivo especificado"

**Causa**: `serve` no está en el PATH o no se encuentra la ruta.

**Solución**:
```python
# Usar ruta local en vez de global
serve_bin = os.path.join(BASE_DIR, 'node_modules', '.bin', 'serve.cmd')
```

### 2. Error: "%1 no es una aplicación Win32 válida"

**Causa**: En Windows, `serve` es un archivo `.cmd`, no `.exe`.

**Solución**:
```python
# Detectar sistema operativo
if platform.system() == 'Windows':
    serve_bin = os.path.join(BASE_DIR, 'node_modules', '.bin', 'serve.cmd')
else:
    serve_bin = os.path.join(BASE_DIR, 'node_modules', '.bin', 'serve')
```

### 3. Error: "Missing script: dev"

**Causa**: El launcher intenta ejecutar `npm run dev` pero no existe el script.

**Solución**: Usar `serve` para servir archivos estáticos en vez de modo desarrollo.

### 4. Ícono no aparece al copiar el .exe

**Causa**: Caché de íconos de Windows no actualizada.

**Soluciones**:
```bash
# Opción 1: Forzar actualización de íconos
ie4uinit.exe -show

# Opción 2: Reiniciar Explorador de Windows
taskkill /f /im explorer.exe
start explorer.exe

# Opción 3: Usar ruta absoluta en compilación
pyinstaller --onefile --noconsole --icon="C:\ruta\completa\icon.ico" launcher.py
```

### 5. Puerto ya en uso

**Causa**: Otro proceso está usando el puerto requerido.

**Solución**:
```bash
# Verificar puertos en uso
netstat -ano | findstr :5173

# Matar proceso específico
taskkill /PID [PID] /F
```

### 6. Java no encontrado

**Causa**: Java no está instalado o no está en el PATH.

**Solución**:
1. Instalar Java Runtime Environment (JRE)
2. Configurar PATH de Java
3. O especificar ruta manual en el launcher

---

## Distribución al Cliente

### Estructura Mínima Requerida

```
cliente/
├── launcher.exe
├── package.json
├── package-lock.json
├── node_modules/
├── backend/
│   └── backend.jar
├── license-service/
│   └── license-service.jar
├── frontend/
│   └── dist/
├── puente-impresion/
│   └── puente-impresion.exe
└── logs/
```

### Pasos de Instalación

1. **Copiar toda la carpeta** `launcher/` al cliente
2. **Verificar que Java esté instalado** en el cliente
3. **Ejecutar** `launcher.exe`
4. **Configurar ruta de Java** si es necesario
5. **Hacer clic en "Iniciar Todos"**

### Verificación de Funcionamiento

1. **Backend**: http://localhost:8080
2. **License Service**: http://localhost:8081
3. **Frontend**: http://localhost:5173
4. **Print Bridge**: Puerto 8082

---

## Mantenimiento

### Actualización del Frontend

1. **Compilar nuevo build**:
```bash
cd frontend
npm run build
```

2. **Copiar carpeta `dist`** al cliente

### Actualización del Launcher

1. **Modificar** `launcher.py`
2. **Recompilar**:
```bash
pyinstaller --onefile --noconsole --icon=icon.ico launcher.py
```

3. **Reemplazar** `launcher.exe` en el cliente

### Logs y Debugging

Los logs se guardan en la carpeta `logs/`:
- `backend.log`: Logs del servicio backend
- `license.log`: Logs del servicio de licencias
- `frontend.log`: Logs del servidor frontend
- `print.log`: Logs del puente de impresión

### Comandos Útiles

```bash
# Verificar puertos en uso
netstat -ano | findstr :5173

# Matar proceso en puerto específico
taskkill /PID [PID] /F

# Verificar servicios Java
jps -l

# Verificar instalación de serve
npx serve --version
```

---

## Notas Importantes

1. **El launcher requiere Node.js** para ejecutar `serve`
2. **Java debe estar instalado** para los servicios backend
3. **Los puertos 8080, 8081, 5173, 8082** deben estar libres
4. **El frontend debe estar compilado** (`npm run build`) antes de distribuir
5. **El ícono puede no aparecer inmediatamente** al copiar el .exe (problema de caché de Windows)

---

## Contacto y Soporte

Para problemas técnicos o consultas sobre el launcher, revisar:
1. Los logs en la carpeta `logs/`
2. La documentación de PyInstaller
3. La documentación de `serve`
4. Los logs del sistema de Windows

---

*Última actualización: Julio 2024* 