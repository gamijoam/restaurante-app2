-- Script para configurar la base de datos de manera compatible con Hibernate
-- Ejecutar este script ANTES de iniciar el backend

-- Eliminar tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS usuario_roles;
DROP TABLE IF EXISTS roles_permisos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permisos;
DROP TABLE IF EXISTS facturas;
DROP TABLE IF EXISTS comanda_items;
DROP TABLE IF EXISTS comandas;
DROP TABLE IF EXISTS receta_ingredientes;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS ingredientes;
DROP TABLE IF EXISTS mesas;

-- Crear tabla de permisos (compatible con la entidad Permiso)
CREATE TABLE permisos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

-- Crear tabla de roles (compatible con la entidad Rol)
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

-- Crear tabla de relación rol-permisos (compatible con la entidad)
CREATE TABLE roles_permisos (
    rol_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);

-- Crear tabla de usuarios (compatible con la entidad Usuario)
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL DEFAULT '',
    email VARCHAR(100) NOT NULL DEFAULT '',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de relación usuario-roles (compatible con la entidad)
CREATE TABLE usuario_roles (
    usuario_id BIGINT NOT NULL,
    rol_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Crear tabla de mesas (compatible con la entidad Mesa)
CREATE TABLE mesas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    capacidad INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'LIBRE',
    posicion_x INT,
    posicion_y INT,
    nombre VARCHAR(100)
);

-- Crear tabla de ingredientes (compatible con la entidad Ingrediente)
CREATE TABLE ingredientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    stock DOUBLE NOT NULL DEFAULT 0.0,
    unidad VARCHAR(20) NOT NULL DEFAULT 'gramos',
    descripcion VARCHAR(255)
);

-- Crear tabla de productos (compatible con la entidad Producto)
CREATE TABLE productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50),
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Crear tabla de receta_ingredientes (compatible con la entidad RecetaIngrediente)
CREATE TABLE receta_ingredientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    ingrediente_id BIGINT NOT NULL,
    cantidad DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_producto_ingrediente (producto_id, ingrediente_id)
);

-- Crear tabla de comandas (compatible con la entidad Comanda)
CREATE TABLE comandas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mesa_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'EN_PROCESO',
    fecha_hora_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id)
);

-- Crear tabla de comanda_items (compatible con la entidad ComandaItem)
CREATE TABLE comanda_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comanda_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    notas TEXT,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- Crear tabla de facturas (compatible con la entidad Factura)
CREATE TABLE facturas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comanda_id BIGINT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    fecha_emision TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id)
);

-- Insertar permisos básicos
INSERT INTO permisos (nombre, descripcion) VALUES
('USUARIO_CREAR', 'Crear usuarios'),
('USUARIO_LEER', 'Ver usuarios'),
('USUARIO_ACTUALIZAR', 'Modificar usuarios'),
('USUARIO_ELIMINAR', 'Eliminar usuarios'),
('PRODUCTO_CREAR', 'Crear productos'),
('PRODUCTO_LEER', 'Ver productos'),
('PRODUCTO_ACTUALIZAR', 'Modificar productos'),
('PRODUCTO_ELIMINAR', 'Eliminar productos'),
('COMANDA_CREAR', 'Crear comandas'),
('COMANDA_LEER', 'Ver comandas'),
('COMANDA_ACTUALIZAR', 'Modificar comandas'),
('COMANDA_ELIMINAR', 'Eliminar comandas'),
('FACTURA_CREAR', 'Crear facturas'),
('FACTURA_LEER', 'Ver facturas'),
('REPORTE_LEER', 'Ver reportes'),
('MESA_GESTIONAR', 'Gestionar mesas'),
('INGREDIENTE_GESTIONAR', 'Gestionar ingredientes'),
('RECETA_GESTIONAR', 'Gestionar recetas');

-- Insertar roles básicos
INSERT INTO roles (nombre, descripcion) VALUES
('ADMIN', 'Administrador del sistema'),
('CAJERO', 'Cajero del restaurante'),
('COCINERO', 'Cocinero del restaurante'),
('MESERO', 'Mesero del restaurante');

-- Asignar permisos a roles
-- Admin tiene todos los permisos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'ADMIN';

-- Cajero tiene permisos de comandas, facturas y reportes
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'CAJERO' 
AND p.nombre IN ('COMANDA_CREAR', 'COMANDA_LEER', 'COMANDA_ACTUALIZAR', 'FACTURA_CREAR', 'FACTURA_LEER', 'REPORTE_LEER', 'MESA_GESTIONAR');

-- Cocinero tiene permisos de comandas y productos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'COCINERO' 
AND p.nombre IN ('COMANDA_LEER', 'COMANDA_ACTUALIZAR', 'PRODUCTO_LEER', 'INGREDIENTE_GESTIONAR', 'RECETA_GESTIONAR');

-- Mesero tiene permisos básicos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM roles r, permisos p
WHERE r.nombre = 'MESERO' 
AND p.nombre IN ('COMANDA_CREAR', 'COMANDA_LEER', 'COMANDA_ACTUALIZAR', 'MESA_GESTIONAR');

-- Crear usuario admin por defecto (password: admin123)
INSERT INTO usuarios (username, password, nombre, apellido, email) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Administrador', 'Sistema', 'admin@restaurante.com');

-- Asignar rol admin al usuario admin
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u, roles r
WHERE u.username = 'admin' AND r.nombre = 'ADMIN';

-- Crear un usuario de prueba adicional (password: test123)
INSERT INTO usuarios (username, password, nombre, apellido, email) VALUES
('test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Usuario', 'Prueba', 'test@restaurante.com');

-- Asignar rol MESERO al usuario de prueba
INSERT INTO usuario_roles (usuario_id, rol_id)
SELECT u.id, r.id
FROM usuarios u, roles r
WHERE u.username = 'test' AND r.nombre = 'MESERO'; 