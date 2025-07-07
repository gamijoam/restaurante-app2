# Guía de Instalación y Configuración - Sistema de Gestión de Restaurantes

## 📋 Prerrequisitos

### Software Requerido

| Componente | Versión Mínima | Descripción |
|------------|----------------|-------------|
| **Java JDK** | 17+ | Runtime de Java para el backend |
| **Node.js** | 18+ | Runtime de JavaScript para el frontend |
| **MariaDB** | 10.5+ | Base de datos principal |
| **Git** | 2.30+ | Control de versiones |
| **Maven** | 3.8+ | Gestor de dependencias Java |

### Hardware Recomendado

| Componente | Especificación Mínima | Recomendada |
|------------|----------------------|-------------|
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4GB | 8GB+ |
| **Almacenamiento** | 10GB libre | 20GB+ |
| **Red** | 10 Mbps | 100 Mbps+ |

---

## 🚀 Instalación Paso a Paso

### 1. Preparación del Entorno

#### Windows
```bash
# Verificar Java
java -version

# Verificar Node.js
node --version
npm --version

# Verificar Git
git --version
```

#### Linux/macOS
```bash
# Instalar Java (Ubuntu/Debian)
sudo apt update
sudo apt install openjdk-17-jdk

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalaciones
java -version
node --version
npm --version
```

### 2. Configuración de MariaDB

#### Instalar MariaDB

**Windows:**
1. Descargar MariaDB desde https://mariadb.org/download/
2. Ejecutar el instalador
3. Configurar contraseña root
4. Agregar al PATH del sistema

**Linux:**
```bash
sudo apt update
sudo apt install mariadb-server mariadb-client
sudo mysql_secure_installation
```

**macOS:**
```bash
brew install mariadb
brew services start mariadb
```

#### Crear Base de Datos
```sql
-- Conectar a MariaDB
mysql -u root -p

-- Crear base de datos
CREATE DATABASE restaurante_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario para la aplicación
CREATE USER 'restaurante_user'@'localhost' IDENTIFIED BY 'restaurante123';
GRANT ALL PRIVILEGES ON restaurante_db.* TO 'restaurante_user'@'localhost';
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
```

### 3. Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/restaurante-app2.git
cd restaurante-app2

# Verificar estructura
ls -la
```

### 4. Configuración del Backend

#### Configurar Base de Datos
```bash
# Editar archivo de configuración
cd backend/src/main/resources
```

Editar `application.properties`:
```properties
# Configuración de Base de Datos
spring.datasource.url=jdbc:mariadb://localhost:3306/restaurante_db
spring.datasource.username=restaurante_user
spring.datasource.password=restaurante123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

# Configuración JPA
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MariaDBDialect

# Configuración Liquibase
spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.xml

# Configuración JWT
jwt.secret=tu_clave_secreta_muy_larga_y_segura_aqui_2025
jwt.expiration=86400000

# Configuración del Servidor
server.port=8080
server.servlet.context-path=/api

# Configuración CORS
spring.web.cors.allowed-origins=http://localhost:5173
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
```

#### Compilar y Ejecutar Backend
```bash
# Navegar al directorio backend
cd backend

# Limpiar y compilar
mvn clean install

# Ejecutar aplicación
mvn spring-boot:run
```

**Verificar que el backend esté funcionando:**
- Abrir http://localhost:8080/api/v1/test
- Debería mostrar información del sistema

### 5. Configuración del Frontend

#### Instalar Dependencias
```bash
# Navegar al directorio frontend
cd frontend

# Instalar dependencias
npm install

# Verificar instalación
npm list --depth=0
```

#### Configurar Variables de Entorno
Crear archivo `.env` en `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws
```

#### Ejecutar Frontend
```bash
# Ejecutar en modo desarrollo
npm run dev

# O construir para producción
npm run build
```

**Verificar que el frontend esté funcionando:**
- Abrir http://localhost:5173
- Debería mostrar la página de login

### 6. Configuración del Sistema de Impresión

#### Instalar Node.js para Impresión
```bash
# Navegar al directorio de impresión
cd puente-impresion

# Instalar dependencias
npm install

# Instalar dependencias de impresión
npm install node-thermal-printer
```

#### Configurar Impresora
```bash
# Listar impresoras disponibles
node listar_impresoras.js

# Probar impresión
node test-print.js
```

---

## 🔧 Configuración Avanzada

### 1. Configuración de Producción

#### Variables de Entorno para Producción
```bash
# Backend (application-prod.properties)
SPRING_PROFILES_ACTIVE=prod
DB_HOST=tu-servidor-db.com
DB_PORT=3306
DB_NAME=restaurante_db
DB_USER=restaurante_user
DB_PASSWORD=password_seguro
JWT_SECRET=clave_super_segura_produccion
```

#### Configuración de Nginx (Opcional)
```nginx
server {
    listen 80;
    server_name tu-restaurante.com;

    # Frontend
    location / {
        root /var/www/restaurante-app2/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 2. Configuración de Base de Datos

#### Optimización de MariaDB
```sql
-- Configurar para mejor rendimiento
SET GLOBAL innodb_buffer_pool_size = 1073741824; -- 1GB
SET GLOBAL innodb_log_file_size = 268435456; -- 256MB
SET GLOBAL max_connections = 200;
```

#### Backup Automático
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u restaurante_user -p restaurante_db > backup_$DATE.sql
```

### 3. Configuración de Seguridad

#### Firewall
```bash
# Ubuntu/Debian
sudo ufw allow 8080/tcp  # Backend
sudo ufw allow 5173/tcp  # Frontend (desarrollo)
sudo ufw allow 3306/tcp  # Base de datos (solo local)
```

#### SSL/TLS (Producción)
```bash
# Instalar certificado SSL
sudo certbot --nginx -d tu-restaurante.com
```

---

## 🧪 Verificación de la Instalación

### 1. Pruebas Básicas

#### Verificar Backend
```bash
# Probar endpoints básicos
curl http://localhost:8080/api/v1/test
curl http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}'
```

#### Verificar Frontend
```bash
# Abrir navegador
http://localhost:5173

# Verificar login
Usuario: admin
Contraseña: admin123
```

#### Verificar Base de Datos
```sql
-- Conectar a MariaDB
mysql -u restaurante_user -p restaurante_db

-- Verificar tablas
SHOW TABLES;

-- Verificar datos iniciales
SELECT * FROM usuarios;
SELECT * FROM permisos;
```

### 2. Pruebas de Funcionalidad

#### Crear Comanda
1. **Iniciar sesión** como admin
2. **Ir a** "Toma de Pedidos"
3. **Seleccionar** mesa
4. **Agregar** productos
5. **Crear** comanda

#### Probar Impresión
1. **Configurar** impresora térmica
2. **Crear** comanda
3. **Verificar** impresión automática

#### Probar Reportes
1. **Ir a** "Reportes"
2. **Seleccionar** fechas
3. **Generar** reporte

---

## 🚨 Solución de Problemas

### Error: "Puerto 8080 ya está en uso"
```bash
# Encontrar proceso
netstat -tulpn | grep :8080

# Terminar proceso
kill -9 <PID>

# O cambiar puerto en application.properties
server.port=8081
```

### Error: "Conexión a base de datos fallida"
```bash
# Verificar MariaDB
sudo systemctl status mariadb

# Reiniciar servicio
sudo systemctl restart mariadb

# Verificar credenciales
mysql -u restaurante_user -p
```

### Error: "Node modules no encontrados"
```bash
# Limpiar cache
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "JWT token inválido"
```bash
# Verificar configuración JWT
# En application.properties
jwt.secret=tu_clave_secreta_muy_larga_y_segura_aqui_2025

# Reiniciar backend
mvn spring-boot:run
```

---

## 📞 Soporte

### Contacto Técnico
- **Email:** soporte@restaurante.com
- **Teléfono:** +1-234-567-8900
- **Horario:** 8:00 AM - 6:00 PM

### Recursos Adicionales
- **Documentación:** `/docs/`
- **API:** http://localhost:8080/api/v1
- **Frontend:** http://localhost:5173
- **Base de Datos:** localhost:3306

### Logs del Sistema
```bash
# Backend logs
tail -f backend/logs/application.log

# Frontend logs
npm run dev

# Base de datos logs
sudo tail -f /var/log/mysql/error.log
```

---

**Fecha de última actualización:** Julio 2025  
**Versión del sistema:** 2.0  
**Compatibilidad:** Windows, Linux, macOS 