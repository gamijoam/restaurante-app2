-- Agrega la columna item_principal_id para soportar adicionales en comanda_items
ALTER TABLE comanda_items
ADD COLUMN item_principal_id BIGINT NULL,
ADD CONSTRAINT fk_item_principal_id FOREIGN KEY (item_principal_id) REFERENCES comanda_items(id) ON DELETE SET NULL; 