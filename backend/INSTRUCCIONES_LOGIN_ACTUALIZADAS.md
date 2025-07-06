# Instrucciones Actualizadas para Solucionar el Problema de Login

## Problema Identificado
El backend está alterando automáticamente las tablas porque Hibernate está configurado en modo `update`. Esto causa conflictos con el script SQL que ejecutas. Además, hay inconsistencias entre las entidades Java y las tablas de la base de datos.

## Solución Paso a Paso

### 1. DETENER el Backend
Si el backend está corriendo, deténlo completamente.

### 2. Ejecutar el Script SQL Actualizado
En HeidiSQL, ejecuta el nuevo script:
```sql
source backend/setup-database.sql
```

**IMPORTANTE:** Este script es compatible con las entidades de Hibernate y no causará conflictos.

### 3. Si ya ejecutaste el script anterior
Si ya tienes las tablas creadas y necesitas corregir tablas específicas:

**Para ingredientes:**
```sql
source backend/fix-ingredientes.sql
```

**Para mesas:**
```sql
source backend/fix-mesas.sql
```

### 4. Verificar que las Tablas se Crearon Correctamente
Ejecuta el script de verificación:
```sql
source backend/verificar-entidades.sql
```

### 5. Iniciar el Backend
```bash
cd backend
mvn spring-boot:run
```

### 6. Probar el Login
**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

**O también:**
- Usuario: `test`
- Contraseña: `test123`

### 7. Verificar Endpoints
- `GET http://localhost:8080/api/auth/test-usuario/admin` - Verificar que el usuario existe
- `POST http://localhost:8080/api/auth/login` - Probar el login

## Cambios Realizados

### 1. Configuración de Hibernate
- Cambiado de `spring.jpa.hibernate.ddl-auto=update` a `spring.jpa.hibernate.ddl-auto=validate`
- Ahora Hibernate solo valida el esquema, no lo altera

### 2. Script SQL Compatible
- Creado `setup-database.sql` que es compatible con las entidades de Hibernate
- Incluye todos los campos necesarios con los tipos correctos
- Corregido el mapeo de columnas para coincidir con las entidades

### 3. Correcciones Específicas
- **Tabla `comandas`**: Cambiado `fecha_creacion` por `fecha_hora_creacion` y agregado campo `total`
- **Tabla `facturas`**: Cambiado `fecha_creacion` por `fecha_emision` y agregado campo `impuesto`
- **Tabla `ingredientes`**: Agregado campo `descripcion`, cambiado `unidad_medida` por `unidad`, y `stock` de DECIMAL a DOUBLE
- **Tabla `mesas`**: Agregados campos `nombre`, `posicion_x`, y `posicion_y`
- **Uso `VARCHAR` en lugar de `ENUM`** para los estados

### 4. Estructura de Tablas Corregida
- `usuarios`: Campos obligatorios marcados como `NOT NULL`
- `roles`: Compatible con la entidad `Rol`
- `permisos`: Compatible con la entidad `Permiso`
- `roles_permisos`: Nombre correcto de la tabla de relación
- `usuario_roles`: Tabla de relación usuario-roles
- `comandas`: Incluye `fecha_hora_creacion` y `total`
- `facturas`: Incluye `fecha_emision` e `impuesto`
- `ingredientes`: Incluye `descripcion`, `unidad` y `stock` como DOUBLE
- `mesas`: Incluye `nombre`, `posicion_x`, y `posicion_y`

## Si el Problema Persiste

### Verificar Logs del Backend
Busca errores específicos en la consola del backend:
- Errores de validación de esquema
- Errores de conexión a la base de datos
- Errores de serialización JSON

### Probar con curl
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Verificar Base de Datos
```sql
-- Verificar que no hay tablas duplicadas o conflictivas
SHOW TABLES;

-- Verificar la estructura de la tabla usuarios
DESCRIBE usuarios;

-- Verificar la estructura de la tabla ingredientes
DESCRIBE ingredientes;

-- Verificar la estructura de la tabla mesas
DESCRIBE mesas;

-- Verificar que el usuario admin tiene la contraseña correcta
SELECT username, password FROM usuarios WHERE username = 'admin';
```

## Notas Importantes

1. **Nunca ejecutes el script SQL mientras el backend esté corriendo**
2. **Siempre detén el backend antes de ejecutar scripts SQL**
3. **El modo `validate` de Hibernate es más seguro para producción**
4. **Las credenciales están hasheadas con BCrypt**
5. **Ejecuta el script de verificación para confirmar que todo está correcto**

## Credenciales de Prueba

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | ADMIN |
| test | test123 | MESERO |

## Scripts Disponibles

1. **`setup-database.sql`** - Script principal para crear la base de datos
2. **`fix-ingredientes.sql`** - Script para corregir solo la tabla ingredientes
3. **`fix-mesas.sql`** - Script para corregir solo la tabla mesas
4. **`verificar-entidades.sql`** - Script para verificar que todo esté correcto
5. **`INSTRUCCIONES_LOGIN_ACTUALIZADAS.md`** - Estas instrucciones 