-- =====================================================
-- SCRIPT COMPLETO DE BASE DE DATOS - RESTAURANTE APP
-- =====================================================

-- Limpiar base de datos existente
DROP DATABASE IF EXISTS restaurante_db;
CREATE DATABASE restaurante_db;
USE restaurante_db;

-- =====================================================
-- TABLA: permisos
-- =====================================================
CREATE TABLE permisos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

-- =====================================================
-- TABLA: roles
-- =====================================================
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
);

-- =====================================================
-- TABLA: roles_permisos (relación many-to-many)
-- =====================================================
CREATE TABLE roles_permisos (
    rol_id BIGINT NOT NULL,
    permiso_id BIGINT NOT NULL,
    PRIMARY KEY (rol_id, permiso_id),
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permiso_id) REFERENCES permisos(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: usuarios
-- =====================================================
CREATE TABLE usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    apellido VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA: usuario_roles (relación many-to-many)
-- =====================================================
CREATE TABLE usuario_roles (
    usuario_id BIGINT NOT NULL,
    rol_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: ingredientes
-- =====================================================
CREATE TABLE ingredientes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    stock DOUBLE NOT NULL,
    unidad VARCHAR(20) NOT NULL,
    descripcion VARCHAR(255)
);

-- =====================================================
-- TABLA: productos
-- =====================================================
CREATE TABLE productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    stock DOUBLE
);

-- =====================================================
-- TABLA: receta_ingrediente (relación many-to-many con cantidad)
-- =====================================================
CREATE TABLE receta_ingrediente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    ingrediente_id BIGINT NOT NULL,
    cantidad DOUBLE NOT NULL,
    unidad VARCHAR(20),
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    FOREIGN KEY (ingrediente_id) REFERENCES ingredientes(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: mesas
-- =====================================================
CREATE TABLE mesas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero INTEGER NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL,
    estado VARCHAR(20) NOT NULL,
    posicion_x INTEGER,
    posicion_y INTEGER,
    nombre VARCHAR(255)
);

-- =====================================================
-- TABLA: comandas
-- =====================================================
CREATE TABLE comandas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mesa_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL,
    fecha_hora_creacion DATETIME NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: comanda_items
-- =====================================================
CREATE TABLE comanda_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comanda_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: facturas
-- =====================================================
CREATE TABLE facturas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    comanda_id BIGINT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) NOT NULL,
    fecha_emision DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comanda_id) REFERENCES comandas(id) ON DELETE CASCADE
);

-- =====================================================
-- TABLA: printer_configurations
-- =====================================================
CREATE TABLE printer_configurations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    version BIGINT,
    role VARCHAR(50) NOT NULL UNIQUE,
    printer_type VARCHAR(20) NOT NULL,
    printer_target VARCHAR(100) NOT NULL
);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

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
('FACTURA_ACTUALIZAR', 'Modificar facturas'),
('FACTURA_ELIMINAR', 'Eliminar facturas'),
('MESA_CREAR', 'Crear mesas'),
('MESA_LEER', 'Ver mesas'),
('MESA_ACTUALIZAR', 'Modificar mesas'),
('MESA_ELIMINAR', 'Eliminar mesas'),
('INGREDIENTE_CREAR', 'Crear ingredientes'),
('INGREDIENTE_LEER', 'Ver ingredientes'),
('INGREDIENTE_ACTUALIZAR', 'Modificar ingredientes'),
('INGREDIENTE_ELIMINAR', 'Eliminar ingredientes'),
('REPORTE_LEER', 'Ver reportes'),
('CONFIGURACION_LEER', 'Ver configuraciones'),
('CONFIGURACION_ACTUALIZAR', 'Modificar configuraciones');

-- Insertar roles básicos
INSERT INTO roles (nombre, descripcion) VALUES
('ADMIN', 'Administrador del sistema con todos los permisos'),
('GERENTE', 'Gerente del restaurante con permisos de gestión'),
('CAJERO', 'Cajero con permisos de facturación y caja'),
('MESERO', 'Mesero con permisos de comandas y mesas'),
('COCINERO', 'Cocinero con permisos de cocina');

-- Asignar permisos a roles
-- ADMIN: todos los permisos
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 1, id FROM permisos;

-- GERENTE: todos excepto eliminar usuarios
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 2, id FROM permisos WHERE nombre != 'USUARIO_ELIMINAR';

-- CAJERO: permisos de facturación, comandas, reportes
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 3, id FROM permisos 
WHERE nombre IN (
    'COMANDA_LEER', 'COMANDA_ACTUALIZAR',
    'FACTURA_CREAR', 'FACTURA_LEER', 'FACTURA_ACTUALIZAR',
    'MESA_LEER', 'MESA_ACTUALIZAR',
    'PRODUCTO_LEER', 'INGREDIENTE_LEER',
    'REPORTE_LEER', 'CONFIGURACION_LEER'
);

-- MESERO: permisos de comandas y mesas
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 4, id FROM permisos 
WHERE nombre IN (
    'COMANDA_CREAR', 'COMANDA_LEER', 'COMANDA_ACTUALIZAR',
    'MESA_LEER', 'MESA_ACTUALIZAR',
    'PRODUCTO_LEER'
);

-- COCINERO: permisos de cocina
INSERT INTO roles_permisos (rol_id, permiso_id)
SELECT 5, id FROM permisos 
WHERE nombre IN (
    'COMANDA_LEER', 'COMANDA_ACTUALIZAR',
    'PRODUCTO_LEER', 'INGREDIENTE_LEER', 'INGREDIENTE_ACTUALIZAR'
);

-- Crear usuario administrador
INSERT INTO usuarios (username, password, nombre, email, apellido, activo) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'admin@restaurante.com', 'Sistema', true);

-- Asignar rol de administrador al usuario admin
INSERT INTO usuario_roles (usuario_id, rol_id) VALUES (1, 1);

-- Insertar mesas de ejemplo
INSERT INTO mesas (numero, capacidad, estado, posicion_x, posicion_y, nombre) VALUES
(1, 4, 'LIBRE', 100, 100, 'Mesa 1'),
(2, 6, 'LIBRE', 200, 100, 'Mesa 2'),
(3, 2, 'LIBRE', 300, 100, 'Mesa 3'),
(4, 8, 'LIBRE', 100, 200, 'Mesa 4'),
(5, 4, 'LIBRE', 200, 200, 'Mesa 5');

-- Insertar ingredientes de ejemplo
INSERT INTO ingredientes (nombre, stock, unidad, descripcion) VALUES
('Harina', 50.0, 'kg', 'Harina de trigo'),
('Azúcar', 30.0, 'kg', 'Azúcar refinada'),
('Huevos', 200.0, 'unidades', 'Huevos frescos'),
('Leche', 40.0, 'litros', 'Leche entera'),
('Mantequilla', 25.0, 'kg', 'Mantequilla sin sal'),
('Sal', 10.0, 'kg', 'Sal de mesa'),
('Aceite', 30.0, 'litros', 'Aceite de oliva'),
('Tomates', 50.0, 'kg', 'Tomates frescos'),
('Cebollas', 30.0, 'kg', 'Cebollas blancas'),
('Carne de res', 40.0, 'kg', 'Carne de res molida');

-- Insertar productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
('Hamburguesa Clásica', 'Hamburguesa con carne, lechuga, tomate y queso', 12.50, 0.0),
('Pizza Margherita', 'Pizza con tomate, mozzarella y albahaca', 18.00, 0.0),
('Ensalada César', 'Lechuga, crutones, parmesano y aderezo César', 8.50, 0.0),
('Pasta Carbonara', 'Pasta con salsa cremosa, panceta y parmesano', 15.00, 0.0),
('Sopa del día', 'Sopa casera preparada diariamente', 6.50, 0.0);

-- Insertar recetas de ejemplo
INSERT INTO receta_ingrediente (producto_id, ingrediente_id, cantidad, unidad) VALUES
-- Hamburguesa Clásica
(1, 10, 0.15, 'kg'), -- Carne de res
(1, 8, 0.05, 'kg'),  -- Tomates
(1, 9, 0.03, 'kg'),  -- Cebollas
-- Pizza Margherita
(2, 1, 0.25, 'kg'),  -- Harina
(2, 8, 0.10, 'kg'),  -- Tomates
(2, 4, 0.05, 'litros'), -- Leche (para mozzarella)
-- Ensalada César
(3, 8, 0.08, 'kg'),  -- Tomates
(3, 6, 0.01, 'kg'),  -- Sal
-- Pasta Carbonara
(4, 1, 0.20, 'kg'),  -- Harina (para pasta)
(4, 5, 0.05, 'kg'),  -- Mantequilla
(4, 4, 0.10, 'litros'), -- Leche
-- Sopa del día
(5, 9, 0.05, 'kg'),  -- Cebollas
(5, 8, 0.10, 'kg'),  -- Tomates
(5, 6, 0.01, 'kg');  -- Sal

-- Insertar configuraciones de impresora de ejemplo
INSERT INTO printer_configurations (role, printer_type, printer_target) VALUES
('COCINA', 'THERMAL', 'COM3'),
('CAJA', 'THERMAL', 'COM4'),
('BAR', 'THERMAL', 'COM5');

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_ingredientes_nombre ON ingredientes(nombre);
CREATE INDEX idx_mesas_numero ON mesas(numero);
CREATE INDEX idx_comandas_mesa_id ON comandas(mesa_id);
CREATE INDEX idx_comandas_estado ON comandas(estado);
CREATE INDEX idx_facturas_comanda_id ON facturas(comanda_id);
CREATE INDEX idx_comanda_items_comanda_id ON comanda_items(comanda_id);
CREATE INDEX idx_receta_ingrediente_producto_id ON receta_ingrediente(producto_id);
CREATE INDEX idx_receta_ingrediente_ingrediente_id ON receta_ingrediente(ingrediente_id);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 'Tablas creadas:' as info;
SHOW TABLES;

-- Verificar datos insertados
SELECT 'Usuarios:' as info;
SELECT id, username, nombre, email FROM usuarios;

SELECT 'Roles:' as info;
SELECT id, nombre, descripcion FROM roles;

SELECT 'Permisos:' as info;
SELECT id, nombre, descripcion FROM permisos;

SELECT 'Mesas:' as info;
SELECT id, numero, capacidad, estado, nombre FROM mesas;

SELECT 'Productos:' as info;
SELECT id, nombre, precio, stock FROM productos;

SELECT 'Ingredientes:' as info;
SELECT id, nombre, stock, unidad FROM ingredientes;

SELECT 'Configuraciones de impresora:' as info;
SELECT id, role, printer_type, printer_target FROM printer_configurations;

-- Verificar relaciones
SELECT 'Roles asignados al admin:' as info;
SELECT r.nombre as rol, p.nombre as permiso
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id
JOIN roles r ON ur.rol_id = r.id
JOIN roles_permisos rp ON r.id = rp.rol_id
JOIN permisos p ON rp.permiso_id = p.id
WHERE u.username = 'admin'
ORDER BY r.nombre, p.nombre; 