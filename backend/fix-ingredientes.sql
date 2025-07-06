-- Script para agregar la columna descripcion a la tabla ingredientes
-- Ejecutar si ya tienes la tabla ingredientes creada

-- Agregar columna descripcion si no existe
ALTER TABLE ingredientes ADD COLUMN IF NOT EXISTS descripcion VARCHAR(255);

-- Cambiar el tipo de stock de DECIMAL a DOUBLE si es necesario
ALTER TABLE ingredientes MODIFY COLUMN stock DOUBLE NOT NULL DEFAULT 0.0;

-- Cambiar el nombre de la columna unidad_medida a unidad si es necesario
ALTER TABLE ingredientes CHANGE COLUMN unidad_medida unidad VARCHAR(20) NOT NULL DEFAULT 'gramos';

-- Verificar la estructura final
DESCRIBE ingredientes; 