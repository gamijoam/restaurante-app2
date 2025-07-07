-- Insertar permisos del sistema
INSERT INTO permisos (nombre, descripcion, activo) VALUES
('VER_REPORTES', 'Permite ver reportes de ventas y estadísticas', TRUE),
('EDITAR_PRODUCTOS', 'Permite crear, editar y eliminar productos', TRUE),
('CREAR_USUARIOS', 'Permite crear y gestionar usuarios del sistema', TRUE),
('GESTIONAR_MESAS', 'Permite gestionar el estado y configuración de mesas', TRUE),
('VER_FACTURAS', 'Permite ver el historial de facturación', TRUE),
('GESTIONAR_INGREDIENTES', 'Permite gestionar el inventario de ingredientes', TRUE),
('GESTIONAR_RECETAS', 'Permite crear y editar recetas de productos', TRUE),
('GESTIONAR_ROLES', 'Permite asignar roles y permisos a usuarios', TRUE),
('TOMAR_PEDIDOS', 'Permite tomar pedidos en las mesas', TRUE),
('VER_COCINA', 'Permite ver los pedidos en cocina', TRUE),
('VER_CAJA', 'Permite acceder a la vista de caja', TRUE),
('CONFIGURAR_IMPRESORAS', 'Permite configurar impresoras del sistema', TRUE);

-- Insertar usuario gerente por defecto (password: admin123)
INSERT INTO usuarios (username, password, nombre, email, apellido, activo, fecha_creacion) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', 'Administrador', 'admin@restaurante.com', 'Sistema', TRUE, NOW());

-- Asignar rol de gerente al usuario admin
INSERT INTO usuario_roles (usuario_id, rol) VALUES
(1, 'ROLE_GERENTE');

-- Asignar todos los permisos al usuario admin
INSERT INTO usuario_permisos (usuario_id, permiso_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11), (1, 12);

-- Insertar mesas básicas
INSERT INTO mesas (numero, capacidad, estado, posicion_x, posicion_y) VALUES
(1, 4, 'LIBRE', 100, 100),
(2, 4, 'LIBRE', 200, 100),
(3, 6, 'LIBRE', 300, 100),
(4, 2, 'LIBRE', 100, 200),
(5, 4, 'LIBRE', 200, 200),
(6, 8, 'LIBRE', 300, 200);

-- Insertar productos básicos
INSERT INTO productos (nombre, descripcion, precio, activo) VALUES
('Hamburguesa Clásica', 'Hamburguesa con carne, lechuga, tomate y queso', 8.50, TRUE),
('Pizza Margherita', 'Pizza con tomate, mozzarella y albahaca', 12.00, TRUE),
('Ensalada César', 'Lechuga romana, crutones, parmesano y aderezo César', 7.50, TRUE),
('Pasta Carbonara', 'Pasta con salsa cremosa, panceta y parmesano', 11.00, TRUE),
('Coca Cola', 'Refresco de cola 330ml', 2.50, TRUE),
('Agua Mineral', 'Agua mineral sin gas 500ml', 1.50, TRUE);

-- Insertar ingredientes básicos
INSERT INTO ingredientes (nombre, stock, unidad, activo) VALUES
('Carne de Res', 50.00, 'kg', TRUE),
('Pan de Hamburguesa', 100.00, 'unidades', TRUE),
('Lechuga', 20.00, 'kg', TRUE),
('Tomate', 15.00, 'kg', TRUE),
('Queso Cheddar', 25.00, 'kg', TRUE),
('Harina de Trigo', 100.00, 'kg', TRUE),
('Mozzarella', 30.00, 'kg', TRUE),
('Albahaca', 5.00, 'kg', TRUE),
('Pasta Spaghetti', 80.00, 'kg', TRUE),
('Panceta', 20.00, 'kg', TRUE),
('Parmesano', 15.00, 'kg', TRUE);

-- Insertar recetas básicas
INSERT INTO receta_ingredientes (producto_id, ingrediente_id, cantidad, unidad) VALUES
-- Hamburguesa Clásica
(1, 1, 0.150, 'kg'), -- Carne
(1, 2, 1.000, 'unidades'), -- Pan
(1, 3, 0.050, 'kg'), -- Lechuga
(1, 4, 0.030, 'kg'), -- Tomate
(1, 5, 0.030, 'kg'), -- Queso

-- Pizza Margherita
(2, 6, 0.200, 'kg'), -- Harina
(2, 7, 0.100, 'kg'), -- Mozzarella
(2, 4, 0.050, 'kg'), -- Tomate
(2, 8, 0.005, 'kg'), -- Albahaca

-- Pasta Carbonara
(4, 9, 0.200, 'kg'), -- Pasta
(4, 10, 0.050, 'kg'), -- Panceta
(4, 11, 0.020, 'kg'); -- Parmesano 

-- Mesa especial para ventas rápidas
INSERT INTO mesas (id, numero, capacidad, estado, posicion_x, posicion_y, nombre, activo)
VALUES (9999, 9999, 2, 'LIBRE', 114, 300, 'VENTA RÁPIDA', true); 