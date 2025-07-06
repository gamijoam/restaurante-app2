-- Script para verificar y corregir roles del usuario admin
USE restaurante_db;

-- Verificar el estado actual
SELECT '=== ESTADO ACTUAL ===' as info;

SELECT 'Usuario admin:' as info;
SELECT id, username, nombre, email, activo FROM usuarios WHERE username = 'admin';

SELECT 'Roles actuales del admin:' as info;
SELECT u.username, r.nombre as rol, r.descripcion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- Verificar que el rol ADMIN existe
SELECT 'Rol ADMIN:' as info;
SELECT id, nombre, descripcion FROM roles WHERE nombre = 'ADMIN';

-- Si el usuario admin no tiene el rol ADMIN, asignárselo
INSERT IGNORE INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u, roles r
WHERE u.username = 'admin' AND r.nombre = 'ADMIN';

-- Verificar el resultado final
SELECT '=== ESTADO FINAL ===' as info;

SELECT 'Roles finales del admin:' as info;
SELECT u.username, r.nombre as rol, r.descripcion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin'
ORDER BY r.nombre;

-- Verificar permisos del admin
SELECT 'Permisos del admin:' as info;
SELECT r.nombre as rol, p.nombre as permiso
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
JOIN roles_permisos rp ON r.id = rp.rol_id
JOIN permisos p ON rp.permiso_id = p.id
WHERE u.username = 'admin'
ORDER BY r.nombre, p.nombre; 