-- Script para agregar las columnas faltantes a la tabla mesas
-- Ejecutar si ya tienes la tabla mesas creada

-- Agregar columna nombre si no existe
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS nombre VARCHAR(100);

-- Agregar columna posicion_x si no existe
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS posicion_x INT;

-- Agregar columna posicion_y si no existe
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS posicion_y INT;

-- Verificar la estructura final
DESCRIBE mesas; 