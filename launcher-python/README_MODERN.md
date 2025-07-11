# 🚀 Launcher Moderno - Catasoft Restaurante

Un launcher moderno y elegante para el sistema de gestión de restaurante, construido con CustomTkinter.

## ✨ Características

- **Interfaz Moderna**: Diseño elegante con CustomTkinter
- **Control Granular**: Iniciar/detener servicios individualmente o todos juntos
- **Monitoreo en Tiempo Real**: Estado visual de cada servicio
- **Visualización de Logs**: Ver logs específicos de cada servicio
- **Configuración Flexible**: Puertos y rutas personalizables
- **Navegador Integrado**: Abrir la aplicación directamente desde el launcher
- **Verificación de Puertos**: Detección automática de conflictos
- **Detección Automática**: Detecta automáticamente la estructura del proyecto
- **Configuración de Ejecutables**: Soporte para archivos .exe personalizados
- **Soporte Completo**: Backend, Frontend, License Service y Puente de Impresión

## 🛠️ Instalación

### 1. Instalar Dependencias

```bash
# Ejecutar el script de instalación
install_dependencies.bat
```

O manualmente:

```bash
pip install customtkinter pillow requests
```

### 2. Configuración Automática

El launcher detecta automáticamente la estructura del proyecto:

- **Estructura de Desarrollo**: `../restaurante-app2/`
- **Estructura Compilada**: `../launcher/`
- **Estructura Local**: `.` (directorio actual)

## 🎯 Uso

### Ejecutar el Launcher

```bash
python modern_launcher.py
```

### Funcionalidades Principales

#### 🚀 Control de Servicios

- **Botón Principal**: Inicia/detiene todos los servicios
- **Botones Individuales**: Control granular de cada servicio
  - 🔧 Backend (Puerto 8080)
  - 🎨 Frontend (Puerto 5173)
  - 🔐 License Service (Puerto 8081)
  - 🖨️ Puente de Impresión

#### 📋 Visualización de Logs

- **Logs del Sistema**: Área de logs general en la parte inferior
- **Logs Específicos**: Botón "📋 Ver Logs" para cada servicio
  - Ventanas independientes para cada servicio
  - Actualización en tiempo real
  - Botón de actualización manual

#### ⚙️ Configuración Avanzada

- **Puertos**: Configurar puertos de cada servicio
- **Rutas**: Configurar rutas de directorios de servicios
- **Ejecutables**: Configurar rutas de archivos .exe personalizados
- **Ruta de Java**: Especificar ruta personalizada de Java
- **Detección Automática**: Opción para detectar rutas automáticamente

#### 🌐 Navegador

- **Abrir Aplicación**: Botón para abrir en el navegador predeterminado
- **URL Automática**: `http://localhost:5173`

## 🔧 Configuración Avanzada

### Estructuras de Proyecto Soportadas

#### Estructura de Desarrollo
```
restaurante-app2/
├── backend/
│   └── backend.jar
├── frontend/
│   ├── package.json
│   └── dist/
├── license-service/
│   └── license-service.jar
└── puente-impresion/
    └── index.js
```

#### Estructura Compilada
```
launcher/
├── backend/
│   └── backend.jar
├── frontend/
│   └── dist/
├── license-service/
│   └── license-service.jar
├── puente-impresion/
│   └── index.js
└── *.exe
```

### Configuración de Ejecutables

Puedes configurar rutas personalizadas para archivos .exe:

```json
{
  "exe_paths": {
    "backend_exe": "C:\\ruta\\a\\backend.exe",
    "frontend_exe": "C:\\ruta\\a\\frontend.exe",
    "license_exe": "C:\\ruta\\a\\license.exe",
    "puente_exe": "C:\\ruta\\a\\puente.exe"
  }
}
```

### Puertos Personalizados

Editar `config.json` o usar la interfaz de configuración:

```json
{
  "backend_port": 8080,
  "frontend_port": 5173,
  "license_port": 8081
}
```

### Ruta de Java

Si Java no está en el PATH del sistema:

```json
{
  "java_path": "C:\\Program Files\\Java\\jdk-17\\bin"
}
```

## 📁 Estructura de Archivos

```
launcher-python/
├── modern_launcher.py      # Launcher principal
├── config.json            # Configuración
├── requirements_modern.txt # Dependencias
├── install_dependencies.bat # Script de instalación
├── build_modern_exe.bat   # Script de compilación
└── README_MODERN.md       # Este archivo
```

## 🏗️ Compilación a EXE

### Requisitos

- PyInstaller instalado: `pip install pyinstaller`

### Compilar

```bash
# Ejecutar script de compilación
build_modern_exe.bat
```

O manualmente:

```bash
pyinstaller --onefile --windowed --icon=icon.ico --name="CatasoftLauncher" modern_launcher.py
```

### Archivo Resultante

- `dist/CatasoftLauncher.exe` - Ejecutable independiente

## 🔍 Solución de Problemas

### Servicios No Inician

1. **Verificar Puertos**: El launcher muestra el estado de los puertos al inicio
2. **Verificar Rutas**: Asegurar que las rutas en `config.json` sean correctas
3. **Verificar Java**: Si hay problemas con el backend/license, configurar `java_path`
4. **Revisar Logs**: Usar los botones "Ver Logs" para diagnosticar problemas
5. **Detección Automática**: Usar el botón "🔍 Detectar Rutas" en configuración

### Frontend No Carga

- **Puerto Correcto**: El frontend usa el puerto 5173 (Vite)
- **Comando Correcto**: Se usa `npm run dev` en lugar de `npm start`
- **Verificar Dependencias**: Asegurar que `npm install` se ejecutó en el directorio frontend
- **Estructura Compilada**: Si usa estructura compilada, verificar que `dist/` existe

### Backend No Inicia

- **Java Path**: Configurar la ruta correcta de Java
- **JAR Files**: Verificar que `backend.jar` existe en el directorio backend
- **Puerto Libre**: Asegurar que el puerto 8080 esté disponible

### Puente de Impresión No Inicia

- **Node.js**: Asegurar que Node.js esté instalado
- **Dependencias**: Ejecutar `npm install` en el directorio puente-impresion
- **Archivo index.js**: Verificar que `index.js` existe en el directorio

## 📊 Monitoreo

### Logs en Tiempo Real

- **Logs del Sistema**: Área general en la parte inferior
- **Logs Específicos**: Ventanas independientes por servicio
- **Límite de Logs**: Máximo 1000 entradas por servicio
- **Timestamps**: Cada entrada incluye hora de generación

### Estados Visuales

- 🔴 **Detenido**: Servicio no está ejecutándose
- 🟢 **Ejecutándose**: Servicio activo y funcionando
- ⚠️ **Puerto en Uso**: Conflicto de puertos detectado

## 🎨 Personalización

### Temas

El launcher usa CustomTkinter con tema oscuro por defecto:

```python
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")
```

### Colores Disponibles

- `"blue"` (predeterminado)
- `"green"`
- `"dark-blue"`

## 📝 Notas de Desarrollo

### Arquitectura

- **Threading**: Cada servicio se ejecuta en hilos separados
- **Logs Asíncronos**: Lectura de logs en tiempo real
- **Interfaz Responsiva**: Actualizaciones sin bloquear la UI
- **Detección Inteligente**: Búsqueda automática de estructuras de proyecto

### Dependencias

- `customtkinter`: Interfaz moderna
- `pillow`: Manejo de imágenes
- `requests`: Verificación de servicios (futuro)

## 🤝 Contribución

Para contribuir al desarrollo:

1. Fork del repositorio
2. Crear rama feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -am 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

© 2025 Catasoft - Sistema de Gestión de Restaurante

---

**Versión**: 2.1  
**Última Actualización**: Enero 2025  
**Compatibilidad**: Windows 10/11, Python 3.8+ 