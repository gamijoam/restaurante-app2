# INSTRUCCIONES PARA DEBUGGEAR ROLES DEL USUARIO ADMIN

## 🔍 Problema Identificado

El usuario admin solo ve las opciones básicas (Tomar Pedido, Caja, Cocina) en lugar de todas las opciones de administrador.

## 🎯 Posibles Causas

1. **Roles incorrectos en la base de datos**
2. **Token no incluye los roles correctos**
3. **Frontend no decodifica correctamente los roles**
4. **Lógica de autorización incorrecta en el Navbar**

## 📋 Pasos para Debuggear

### 1. Verificar Roles en la Base de Datos

Ejecuta el script de verificación:

```bash
# Si tienes MySQL en el PATH
mysql -u root -p < backend/verificar-roles-admin.sql

# Si no tienes MySQL en el PATH, usa la ruta completa
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < backend/verificar-roles-admin.sql
```

**Resultado esperado:**
- El usuario admin debe tener el rol "ADMIN"
- El rol ADMIN debe tener todos los permisos

### 2. Corregir Roles si es Necesario

Si el usuario admin no tiene el rol ADMIN, ejecuta:

```bash
mysql -u root -p < backend/fix-admin-roles.sql
```

### 3. Verificar el Token en el Frontend

1. **Abrir las herramientas de desarrollador** en el navegador (F12)
2. **Ir a la pestaña Console**
3. **Hacer login** con admin/password
4. **Revisar los logs** que aparecen en la consola:
   - `Token payload:` - Debe mostrar el contenido del token
   - `Roles from token:` - Debe mostrar los roles extraídos

**Resultado esperado:**
```javascript
Token payload: {roles: ["ADMIN"], sub: "admin", ...}
Roles from token: ["ADMIN"]
```

### 4. Verificar la Lógica del Navbar

El Navbar ahora verifica:
- `roles.includes('ADMIN')` - Para administradores
- `roles.includes('GERENTE')` - Para gerentes
- `esAdminOGerente` - Para mostrar opciones avanzadas

### 5. Probar el Login

1. **Cerrar sesión** si estás logueado
2. **Hacer login** con admin/password
3. **Verificar** que aparecen todas las opciones:
   - Tomar Pedido
   - Cocina
   - Caja
   - Mapa de Mesas
   - Gestión de Mesas
   - Reportes
   - Gestionar Usuarios
   - Facturación
   - Ingredientes
   - Gestión de Recetas
   - Impresoras
   - Ayuda Inventario

## 🚨 Si el Problema Persiste

### Opción 1: Verificar Token Manualmente

1. **Abrir las herramientas de desarrollador**
2. **Ir a Application > Local Storage**
3. **Buscar la clave `authToken`**
4. **Copiar el token**
5. **Ir a jwt.io** y pegar el token
6. **Verificar** que el campo `roles` contiene `["ADMIN"]`

### Opción 2: Verificar Backend

Hacer una petición al endpoint de test:

```bash
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:8080/api/auth/test-usuario/admin
```

### Opción 3: Debuggear el Backend

Agregar logs en el JwtService:

```java
// En JwtService.generateToken()
System.out.println("Generating token for user: " + usuario.getUsername());
System.out.println("User roles: " + roleNames);
```

## ✅ Verificación Final

Una vez corregido, el usuario admin debería ver:

- **Opciones básicas:** Tomar Pedido, Cocina, Caja
- **Opciones avanzadas:** Todas las opciones de gestión

## 📝 Notas Importantes

- **Los roles en la base de datos** no tienen prefijo `ROLE_`
- **El token incluye los roles** como array de strings
- **El frontend decodifica** los roles del token automáticamente
- **El Navbar verifica** los roles para mostrar opciones

## 🆘 Si Nada Funciona

1. **Limpiar localStorage** del navegador
2. **Reiniciar el backend**
3. **Hacer login nuevamente**
4. **Verificar logs** en la consola del navegador
5. **Verificar logs** del backend 