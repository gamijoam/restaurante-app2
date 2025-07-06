-- Verificar roles del usuario admin
USE restaurante_db;

-- Verificar que el usuario admin existe
SELECT 'Usuario admin:' as info;
SELECT id, username, nombre, email, activo FROM usuarios WHERE username = 'admin';

-- Verificar roles asignados al admin
SELECT 'Roles del admin:' as info;
SELECT u.username, r.nombre as rol, r.descripcion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- Verificar permisos del admin
SELECT 'Permisos del admin:' as info;
SELECT r.nombre as rol, p.nombre as permiso, p.descripcion
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
JOIN roles_permisos rp ON r.id = rp.rol_id
JOIN permisos p ON rp.permiso_id = p.id
WHERE u.username = 'admin'
ORDER BY r.nombre, p.nombre;

-- Verificar todos los roles disponibles
SELECT 'Todos los roles disponibles:' as info;
SELECT id, nombre, descripcion FROM roles;

-- Verificar todos los permisos disponibles
SELECT 'Todos los permisos disponibles:' as info;
SELECT id, nombre, descripcion FROM permisos; 