# Instrucciones para Solucionar el Problema de Login

## Problema Identificado
El error se debe a una recursión infinita en la serialización JSON cuando se intenta generar el JWT. Esto ocurre porque las entidades `Rol` y `Permiso` tienen una relación bidireccional.

## Soluciones Implementadas

### 1. Corregir el JwtService
- Modificado para extraer solo los nombres de los roles en lugar de las entidades completas
- Evita la recursión infinita en la serialización

### 2. Agregar Anotaciones Jackson
- `@JsonManagedReference` en `Rol.permisos` y `Usuario.roles`
- `@JsonBackReference` en `Permiso.roles`
- Previene la recursión infinita en la serialización JSON

### 3. Corregir el AuthService
- Actualizado para usar las entidades `Rol` en lugar de enums
- Agregado `RolRepository` para buscar roles desde la base de datos

## Pasos para Probar

### 1. Ejecutar el Script SQL
```sql
-- Ejecutar en tu base de datos MySQL
source backend/clean-database.sql
source backend/test-login.sql
```

### 2. Reiniciar el Backend
```bash
cd backend
mvn spring-boot:run
```

### 3. Probar el Login
**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

**O también:**
- Usuario: `test`
- Contraseña: `test123`

### 4. Verificar Endpoints
- `GET /api/auth/test-usuario/admin` - Verificar que el usuario existe
- `POST /api/auth/login` - Probar el login
- `GET /api/auth/verificar-sesion` - Verificar la sesión (requiere token)

## Estructura de la Base de Datos
- Tabla `usuarios` con campos: id, username, password, nombre, apellido, email, activo, fecha_creacion
- Tabla `roles` con campos: id, nombre, descripcion
- Tabla `permisos` con campos: id, nombre, descripcion
- Tabla `usuario_roles` (relación muchos a muchos)
- Tabla `roles_permisos` (relación muchos a muchos)

## Roles Disponibles
- `ADMIN` - Administrador del sistema
- `CAJERO` - Cajero del restaurante
- `COCINERO` - Cocinero del restaurante
- `MESERO` - Mesero del restaurante

## Si el Problema Persiste

1. **Verificar logs del backend** para ver errores específicos
2. **Verificar que la base de datos esté limpia** ejecutando el script SQL
3. **Verificar que el backend esté corriendo** en el puerto 8080
4. **Probar con Postman o curl** para aislar si es problema del frontend o backend

### Comando curl para probar:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
``` 