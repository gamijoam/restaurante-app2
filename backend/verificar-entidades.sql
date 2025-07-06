-- Script para verificar que las entidades coincidan con las tablas
-- Ejecutar después de setup-database.sql

-- Verificar estructura de la tabla usuarios
DESCRIBE usuarios;

-- Verificar estructura de la tabla roles
DESCRIBE roles;

-- Verificar estructura de la tabla permisos
DESCRIBE permisos;

-- Verificar estructura de la tabla roles_permisos
DESCRIBE roles_permisos;

-- Verificar estructura de la tabla usuario_roles
DESCRIBE usuario_roles;

-- Verificar estructura de la tabla mesas
DESCRIBE mesas;

-- Verificar estructura de la tabla ingredientes
DESCRIBE ingredientes;

-- Verificar estructura de la tabla productos
DESCRIBE productos;

-- Verificar estructura de la tabla receta_ingredientes
DESCRIBE receta_ingredientes;

-- Verificar estructura de la tabla comandas
DESCRIBE comandas;

-- Verificar estructura de la tabla comanda_items
DESCRIBE comanda_items;

-- Verificar estructura de la tabla facturas
DESCRIBE facturas;

-- Verificar que el usuario admin existe y tiene los datos correctos
SELECT id, username, nombre, apellido, email, activo, fecha_creacion FROM usuarios WHERE username = 'admin';

-- Verificar que el rol ADMIN existe
SELECT id, nombre, descripcion FROM roles WHERE nombre = 'ADMIN';

-- Verificar que el usuario admin tiene el rol ADMIN
SELECT u.username, r.nombre as rol
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- Verificar que el rol ADMIN tiene permisos
SELECT r.nombre as rol, p.nombre as permiso
FROM roles r
JOIN roles_permisos rp ON r.id = rp.rol_id
JOIN permisos p ON rp.permiso_id = p.id
WHERE r.nombre = 'ADMIN'
LIMIT 5;

-- Verificar que el usuario test existe
SELECT id, username, nombre, apellido, email, activo FROM usuarios WHERE username = 'test';

-- Verificar que el usuario test tiene el rol MESERO
SELECT u.username, r.nombre as rol
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'test'; 