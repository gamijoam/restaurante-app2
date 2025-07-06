# INSTRUCCIONES PARA SETUP COMPLETO DE BASE DE DATOS

## 🚨 IMPORTANTE: Detener el Backend Primero

Antes de ejecutar cualquier script, **DEBES detener el backend** si está corriendo.

```bash
# Si el backend está corriendo, detenerlo con Ctrl+C
# O cerrar la terminal donde está corriendo
```

## 📋 Pasos para Configurar la Base de Datos

### 1. Ejecutar el Script Completo

```bash
# Navegar al directorio del proyecto
cd C:\restaurante-app2

# Ejecutar el script completo
mysql -u root -p < backend/setup-database-complete.sql
```

**Nota:** Si no tienes MySQL en el PATH, usa la ruta completa:
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < backend/setup-database-complete.sql
```

### 2. Verificar que el Script se Ejecutó Correctamente

El script incluye verificaciones automáticas al final. Deberías ver algo como:

```
+---------------------------+
| Tables_in_restaurante_db |
+---------------------------+
| comanda_items            |
| comandas                 |
| facturas                 |
| ingredientes             |
| mesas                    |
| permisos                 |
| printer_configurations   |
| productos                |
| receta_ingrediente       |
| roles                    |
| roles_permisos          |
| usuario_roles           |
| usuarios                 |
+---------------------------+
```

### 3. Verificar Datos Iniciales

El script también muestra los datos insertados:
- 1 usuario admin
- 5 roles (ADMIN, GERENTE, CAJERO, MESERO, COCINERO)
- 28 permisos
- 5 mesas de ejemplo
- 10 ingredientes de ejemplo
- 5 productos de ejemplo
- 13 recetas de ejemplo
- 3 configuraciones de impresora

### 4. Configurar Hibernate para Validación

Asegúrate de que en `backend/src/main/resources/application.properties` tengas:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

**NO uses `update` o `create`** ya que el esquema ya está creado.

### 5. Reiniciar el Backend

```bash
# Navegar al directorio del backend
cd backend

# Compilar y ejecutar
mvn spring-boot:run
```

## 🔍 Verificaciones Adicionales

### Verificar Estructura de Tablas

```sql
USE restaurante_db;

-- Verificar tabla mesas
DESCRIBE mesas;

-- Verificar que las columnas posicion_x y posicion_y existen
SHOW COLUMNS FROM mesas LIKE 'posicion%';
```

### Verificar Usuario Admin

```sql
-- Verificar que el usuario admin existe
SELECT id, username, nombre, email, activo FROM usuarios WHERE username = 'admin';

-- Verificar roles del admin
SELECT r.nombre as rol, p.nombre as permiso
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
JOIN roles_permisos rp ON r.id = rp.rol_id
JOIN permisos p ON rp.permiso_id = p.id
WHERE u.username = 'admin';
```

## 🚨 Solución de Problemas

### Error: "missing column [posicionx]"

Si ves este error, significa que:
1. El backend no se detuvo antes de ejecutar el script
2. Hibernate está en modo `update` en lugar de `validate`

**Solución:**
1. Detener el backend
2. Verificar que `spring.jpa.hibernate.ddl-auto=validate` en `application.properties`
3. Ejecutar el script nuevamente
4. Reiniciar el backend

### Error: "Table doesn't exist"

Si alguna tabla no existe:
1. Verificar que el script se ejecutó completamente
2. Verificar que no hubo errores durante la ejecución
3. Ejecutar el script nuevamente

### Error de Conexión a MySQL

Si no puedes conectar a MySQL:
1. Verificar que MySQL está corriendo
2. Verificar credenciales (usuario/contraseña)
3. Verificar que tienes permisos para crear bases de datos

## ✅ Verificación Final

Una vez que el backend esté corriendo sin errores:

1. **Probar login:**
   - Usuario: `admin`
   - Contraseña: `password`

2. **Verificar endpoints:**
   - `GET /api/auth/test` - Debería devolver datos del usuario
   - `GET /api/usuarios` - Debería listar usuarios
   - `GET /api/mesas` - Debería listar mesas

3. **Verificar en el frontend:**
   - Ir a `http://localhost:3000`
   - Intentar hacer login con admin/password
   - Verificar que las páginas cargan correctamente

## 📝 Notas Importantes

- **Siempre detén el backend** antes de ejecutar scripts SQL
- **Usa `validate`** en lugar de `update` para Hibernate
- **El script es idempotente** - puedes ejecutarlo múltiples veces
- **Los datos de ejemplo** están incluidos para facilitar las pruebas
- **El usuario admin** tiene todos los permisos para testing

## 🆘 Si Algo No Funciona

1. Revisar los logs del backend para errores específicos
2. Verificar que MySQL está corriendo y accesible
3. Verificar que todas las tablas se crearon correctamente
4. Verificar que los datos iniciales se insertaron
5. Verificar la configuración de `application.properties` 