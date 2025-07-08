# Sistema de Licencias - Restaurante App

## Descripción

El sistema de licencias es un microservicio independiente que permite gestionar licencias para la aplicación de restaurante. Funciona de manera completamente offline una vez activada la licencia.

## Arquitectura

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   RESTAURANT    │ ◄──────────────► │   LICENSE       │
│     APP         │                 │   SERVICE        │
│   (Puerto 8080) │                 │ (Puerto 8081)   │
└─────────────────┘                 └─────────────────┘
```

## Características

- ✅ **100% Offline** después de activación
- ✅ **Fingerprinting del equipo** (CPU + MAC + disco)
- ✅ **Licencias temporales** (mensual, anual, perpetua)
- ✅ **Validación local** con encriptación
- ✅ **Microservicio independiente**
- ✅ **Base de datos separada** (H2)

## Tipos de Licencia

| Tipo | Duración | Descripción |
|------|----------|-------------|
| MONTHLY | 30 días | Licencia mensual |
| ANNUAL | 365 días | Licencia anual |
| PERPETUAL | Sin límite | Licencia perpetua |

## Flujo de Activación

### 1. Cliente instala la aplicación
### 2. Sistema genera fingerprint del equipo
### 3. Cliente envía código de equipo
### 4. Administrador genera licencia
### 5. Cliente recibe código de licencia
### 6. Cliente activa licencia
### 7. Sistema funciona offline

## Instalación y Configuración

### 1. Compilar el microservicio

```bash
cd license-service
mvn clean compile
```

### 2. Ejecutar el microservicio

**Windows:**
```bash
start-license-service.bat
```

**Linux/Mac:**
```bash
chmod +x start-license-service.sh
./start-license-service.sh
```

### 3. Verificar que esté funcionando

```bash
curl http://localhost:8081/api/license/health
```

## Uso del Sistema

### Para el Cliente

1. **Acceder a la página de activación:**
   ```
   http://localhost:3000/license
   ```

2. **Copiar el código del equipo** que aparece en pantalla

3. **Enviar el código** por WhatsApp/email al administrador

4. **Recibir el código de licencia** del administrador

5. **Ingresar el código** en la aplicación

6. **¡Listo!** La aplicación funciona offline

### Para el Administrador

#### Generar Licencia (API)

```bash
curl -X POST http://localhost:8081/api/license/generate \
  -H "Content-Type: application/json" \
  -d '{
    "fingerprint": "FP-ABC123-XYZ789",
    "licenseType": "MONTHLY",
    "clientName": "Restaurante El Buen Sabor",
    "clientContact": "gerente@buensabor.com",
    "notes": "Licencia mensual"
  }'
```

#### Validar Licencia (API)

```bash
curl -X POST http://localhost:8081/api/license/validate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseCode": "LIC-XXXX-XXXX-XXXX",
    "fingerprint": "FP-ABC123-XYZ789"
  }'
```

#### Obtener Estadísticas

```bash
curl http://localhost:8081/api/license/stats
```

## Pruebas del Sistema

### Ejecutar pruebas automáticas

```bash
npm install axios
node test-license-system.js
```

### Pruebas manuales

1. **Verificar salud del servicio:**
   ```
   GET http://localhost:8081/api/license/health
   ```

2. **Generar licencia de prueba:**
   ```
   POST http://localhost:8081/api/license/generate
   ```

3. **Validar licencia:**
   ```
   POST http://localhost:8081/api/license/validate
   ```

## Configuración

### Variables de Entorno

```yaml
# license-service/src/main/resources/application.yml
server:
  port: 8081

license:
  secret-key: "CatasoftLicenseSecretKey2024"
  algorithm: "AES"
  fingerprint-salt: "CatasoftFingerprintSalt2024"
  validation-interval: 86400 # 24 horas
```

### Base de Datos

El microservicio usa H2 como base de datos local:

- **URL:** `jdbc:h2:file:./license-db`
- **Console:** `http://localhost:8081/h2-console`
- **Usuario:** `sa`
- **Contraseña:** (vacía)

## API Endpoints

### License Service (Puerto 8081)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/license/generate` | Generar nueva licencia |
| POST | `/api/license/validate` | Validar licencia |
| GET | `/api/license/status/{code}` | Estado de licencia |
| POST | `/api/license/renew/{code}` | Renovar licencia |
| GET | `/api/license/stats` | Estadísticas |
| GET | `/api/license/health` | Salud del servicio |

### Restaurant App (Puerto 8080)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/license/validate` | Validar licencia |
| GET | `/api/license/status/{code}` | Estado de licencia |
| GET | `/api/license/health` | Salud del servicio |

## Seguridad

### Encriptación

- **Algoritmo:** AES-256
- **Clave secreta:** Configurable en `application.yml`
- **Salt:** Para fingerprinting único

### Fingerprinting

El sistema genera un identificador único basado en:

- Sistema operativo
- Arquitectura del procesador
- Direcciones MAC
- Información de Java
- Usuario del sistema

### Validación

- **Offline:** Una vez activada, funciona sin internet
- **Local:** Validación con checksums locales
- **Temporal:** Verificación de fechas de expiración

## Mantenimiento

### Backup de Licencias

```bash
# Copiar base de datos H2
cp license-service/license-db.mv.db backup/
```

### Logs

```bash
# Ver logs del servicio
tail -f license-service/logs/application.log
```

### Monitoreo

```bash
# Verificar estadísticas
curl http://localhost:8081/api/license/stats
```

## Solución de Problemas

### Servicio no inicia

1. **Verificar puerto:**
   ```bash
   netstat -an | grep 8081
   ```

2. **Verificar Java:**
   ```bash
   java -version
   ```

3. **Verificar Maven:**
   ```bash
   mvn -version
   ```

### Licencia no válida

1. **Verificar fingerprint:**
   - Asegurar que sea el mismo equipo
   - No cambiar hardware significativamente

2. **Verificar fecha:**
   - Licencia no expirada
   - Reloj del sistema correcto

3. **Verificar activación:**
   - Licencia activada en este equipo
   - No activada en otro equipo

### Error de comunicación

1. **Verificar servicios:**
   ```bash
   curl http://localhost:8081/api/license/health
   curl http://localhost:8080/api/license/health
   ```

2. **Verificar CORS:**
   - Configuración de seguridad
   - Headers correctos

## Desarrollo

### Estructura del Proyecto

```
license-service/
├── src/main/java/com/catasoft/license/
│   ├── LicenseServiceApplication.java
│   ├── controller/
│   │   └── LicenseController.java
│   ├── service/
│   │   └── LicenseService.java
│   ├── model/
│   │   ├── License.java
│   │   ├── Activation.java
│   │   └── LicenseType.java
│   ├── repository/
│   │   ├── LicenseRepository.java
│   │   └── ActivationRepository.java
│   └── config/
│       └── SecurityConfig.java
└── src/main/resources/
    └── application.yml
```

### Agregar Nuevos Tipos de Licencia

1. **Agregar al enum:**
   ```java
   public enum LicenseType {
       MONTHLY("Mensual", 30),
       ANNUAL("Anual", 365),
       PERPETUAL("Perpetua", -1),
       CUSTOM("Personalizada", 0); // Nuevo tipo
   }
   ```

2. **Actualizar lógica en LicenseService**

### Personalizar Fingerprinting

Modificar `FingerprintService.java` para incluir más información del sistema.

## Contacto

Para soporte técnico o consultas sobre el sistema de licencias:

- **Email:** soporte@catasoft.com
- **WhatsApp:** +1234567890
- **Documentación:** Ver este archivo

---

**Versión:** 1.0.0  
**Fecha:** Diciembre 2024  
**Desarrollado por:** Catasoft 