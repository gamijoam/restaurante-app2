-- Script de prueba para verificar el login
-- Ejecutar después de clean-database.sql

-- Verificar que el usuario admin existe
SELECT id, username, nombre, apellido, email, activo FROM usuarios WHERE username = 'admin';

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
WHERE r.nombre = 'ADMIN';

-- Crear un usuario de prueba adicional (password: test123)
INSERT INTO usuarios (username, password, nombre, apellido, email) VALUES
('test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuario', 'Prueba', 'test@restaurante.com');

-- Asignar rol MESERO al usuario de prueba
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u, roles r
WHERE u.username = 'test' AND r.nombre = 'MESERO'; 