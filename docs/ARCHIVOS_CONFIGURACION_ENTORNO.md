# Archivos de Configuración de Entorno

Este documento describe todos los archivos de configuración de entorno presentes en el proyecto, su ubicación, propósito y contenido.

## 📁 Estructura de Archivos de Configuración

### 1. 🖨️ Puente de Impresión - `config.env`

**Ubicación:** `restaurante-app2/puente-impresion/config.env`

**Propósito:** Configuración del WebSocket para la comunicación con el backend y recepción de órdenes de impresión.

**Contenido actual:**
```env
WEBSOCKET_URL=ws://localhost:8080/ws
```

**Variables disponibles:**
- `WEBSOCKET_URL`: URL del WebSocket del backend para recibir órdenes de impresión
- `WEBSOCKET_SERVER_URL`: (Alternativa) URL del servidor WebSocket

**Uso en el código:**
```javascript
// index-production-v2.js
require('dotenv').config({ path: './config.env' });
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || 'ws://localhost:8080/ws';
```

**Configuración para diferentes entornos:**
- **Desarrollo Local:** `ws://localhost:8080/ws`
- **Producción:** `wss://api.tu-dominio.com/ws`

---

### 2. 🖼️ Frontend React - `.env`

**Ubicación:** `restaurante-app2/frontend/.env` (debe ser creado)

**Propósito:** Configuración de la URL base de la API y WebSocket para el frontend React.

**Contenido recomendado:**
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws
VITE_DISABLE_LICENSE=false
```

**Variables disponibles:**
- `VITE_API_BASE_URL`: URL base para las llamadas a la API REST
- `VITE_WS_URL`: URL del WebSocket para comunicación en tiempo real
- `VITE_DISABLE_LICENSE`: Deshabilitar validación de licencias (desarrollo)

**Uso en el código:**
```typescript
// services/api.ts
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

// context/WebSocketContext.tsx
const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8080';
```

**Configuración para diferentes entornos:**
- **Desarrollo Local:** `http://localhost:8080`
- **Producción:** `https://api.tu-dominio.com`

---

### 3. ⚙️ Backend Java - `application.properties`

**Ubicación:** `restaurante-app2/backend/src/main/resources/application.properties`

**Propósito:** Configuración de la base de datos, JWT, y otras configuraciones del servidor Spring Boot.

**Contenido actual:**
```properties
# Configuración de base de datos
spring.datasource.url=jdbc:mariadb://localhost:3306/restaurante_db
spring.datasource.username=root
spring.datasource.password=tu_password

# Configuración JWT
jwt.secret=tu_clave_secreta_jwt
jwt.expiration=86400000

# Configuración del servidor
server.port=8080
```

**Variables principales:**
- `spring.datasource.url`: URL de conexión a la base de datos
- `spring.datasource.username`: Usuario de la base de datos
- `spring.datasource.password`: Contraseña de la base de datos
- `jwt.secret`: Clave secreta para firmar tokens JWT
- `server.port`: Puerto del servidor backend

**Configuración para diferentes entornos:**
- **Desarrollo Local:** `jdbc:mariadb://localhost:3306/restaurante_db`
- **Producción:** `jdbc:mariadb://host_prod:3306/nombre_db_prod`

---

### 4. 🔧 Launcher Python - `config.json`

**Ubicación:** `restaurante-app2/launcher-python/config.json`

**Propósito:** Configuración del launcher principal que gestiona todos los servicios del sistema.

**Contenido actual:**
```json
{
  "backend_port": 8080,
  "frontend_port": 5173,
  "license_port": 8081,
  "backend_path": "../backend",
  "frontend_path": "..\\frontend",
  "license_path": "../license-service",
  "puente_path": "..\\puente-impresion",
  "java_path": "",
  "show_consoles": true,
  "auto_detect_paths": true,
  "exe_paths": {
    "backend_exe": "",
    "frontend_exe": "",
    "license_exe": "",
    "puente_exe": ""
  }
}
```

**Variables principales:**
- `backend_port`: Puerto del servidor backend (8080)
- `frontend_port`: Puerto del servidor frontend (5173)
- `license_port`: Puerto del servicio de licencias (8081)
- `backend_path`: Ruta al directorio del backend
- `frontend_path`: Ruta al directorio del frontend
- `license_path`: Ruta al servicio de licencias
- `puente_path`: Ruta al puente de impresión
- `java_path`: Ruta al ejecutable de Java
- `show_consoles`: Mostrar ventanas de consola
- `auto_detect_paths`: Detección automática de rutas

---

### 5. 🔐 Servicio de Licencias - `application.yml`

**Ubicación:** `restaurante-app2/license-service/src/main/resources/application.yml`

**Propósito:** Configuración del servicio de validación de licencias.

**Contenido típico:**
```yaml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:h2:file:./license-db
    username: sa
    password: 
    driver-class-name: org.h2.Driver

jwt:
  secret: license_service_secret_key
  expiration: 86400000
```

**Variables principales:**
- `server.port`: Puerto del servicio de licencias (8081)
- `spring.datasource.url`: URL de la base de datos H2 para licencias
- `jwt.secret`: Clave secreta para tokens de licencia

---

## 🔄 Flujo de Configuración

### Orden de Configuración Recomendado:

1. **Backend** (`application.properties`) - Configurar base de datos
2. **Frontend** (`.env`) - Configurar URL de API
3. **Puente de Impresión** (`config.env`) - Configurar WebSocket
4. **Launcher** (`config.json`) - Configurar rutas y puertos
5. **Servicio de Licencias** (`application.yml`) - Configurar puerto

### Variables de Entorno por Componente:

| Componente | Archivo | Variable Principal | Valor Local | Valor Producción |
|------------|---------|-------------------|-------------|------------------|
| Backend | `application.properties` | `spring.datasource.url` | `jdbc:mariadb://localhost:3306/restaurante_db` | `jdbc:mariadb://host_prod:3306/db_prod` |
| Frontend | `.env` | `VITE_API_BASE_URL` | `http://localhost:8080` | `https://api.tu-dominio.com` |
| Puente Impresión | `config.env` | `WEBSOCKET_URL` | `ws://localhost:8080/ws` | `wss://api.tu-dominio.com/ws` |
| Launcher | `config.json` | `backend_port` | `8080` | `8080` |
| Licencias | `application.yml` | `server.port` | `8081` | `8081` |

---

## 🚨 Archivos Excluidos del Control de Versiones

Los siguientes archivos están excluidos del repositorio Git (`.gitignore`):

- `*.env` - Archivos de entorno
- `config.env` - Configuración específica
- `*.properties` - Propiedades de aplicación
- `*.yml` - Configuración YAML
- `config.json` - Configuración local

**Razón:** Contienen información sensible como contraseñas, claves secretas y configuraciones específicas del entorno.

---

## 📋 Plantillas de Configuración

### Plantilla para Frontend (`.env`):
```env
# Configuración de API
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Configuración de WebSocket
VITE_WS_URL=ws://localhost:8080/ws

# Configuración de licencias
VITE_DISABLE_LICENSE=false

# Configuración de desarrollo
VITE_DEV_MODE=true
```

### Plantilla para Puente de Impresión (`config.env`):
```env
# URL del WebSocket del backend
WEBSOCKET_URL=ws://localhost:8080/ws

# Configuración de impresora (opcional)
PRINTER_NAME=TU_IMPRESORA
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

### Plantilla para Backend (`application.properties`):
```properties
# Configuración de base de datos
spring.datasource.url=jdbc:mariadb://localhost:3306/restaurante_db
spring.datasource.username=root
spring.datasource.password=tu_password
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

# Configuración JWT
jwt.secret=tu_clave_secreta_jwt_muy_segura
jwt.expiration=86400000

# Configuración del servidor
server.port=8080
server.servlet.context-path=/api

# Configuración de logging
logging.level.com.catasoft=DEBUG
logging.file.name=logs/application.log
```

---

## 🔧 Comandos Útiles

### Verificar Configuración:
```bash
# Verificar archivos de configuración
ls -la restaurante-app2/*/.env
ls -la restaurante-app2/puente-impresion/config.env
ls -la restaurante-app2/launcher-python/config.json

# Verificar variables de entorno
echo $VITE_API_BASE_URL
echo $WEBSOCKET_URL
```

### Crear Archivos de Configuración:
```bash
# Frontend
cp restaurante-app2/frontend/.env.example restaurante-app2/frontend/.env

# Puente de impresión
cp restaurante-app2/puente-impresion/config.env.example restaurante-app2/puente-impresion/config.env
```

### Validar Configuración:
```bash
# Validar sintaxis JSON
node -e "JSON.parse(require('fs').readFileSync('launcher-python/config.json'))"

# Validar variables de entorno
node -e "require('dotenv').config(); console.log(process.env)"
```

---

## 📝 Notas Importantes

1. **Seguridad:** Nunca subir archivos de configuración con contraseñas al repositorio
2. **Entornos:** Mantener configuraciones separadas para desarrollo y producción
3. **Backup:** Hacer copias de seguridad de las configuraciones personalizadas
4. **Documentación:** Actualizar este documento cuando se agreguen nuevas variables
5. **Validación:** Verificar que todas las variables estén definidas antes de ejecutar

---

## 🔗 Enlaces Relacionados

- [Guía de Instalación](../instalacion-configuracion/GUIA_INSTALACION.md)
- [Configuración de Entorno](../../CONFIGURACION_ENTORNO.md)
- [Solución de Problemas](../SOLUCION_PROBLEMAS_MOVIL.md) 