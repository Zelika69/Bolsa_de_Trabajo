-- Script para agregar soft delete a la tabla Usuario
-- Agregar columna 'eliminado' para implementar soft delete

USE Bolsade_Trabajo_;
GO

-- Agregar la columna eliminado con valor por defecto 0 (activo)
ALTER TABLE Usuario
ADD eliminado BIT DEFAULT 0;
GO

-- Actualizar todos los registros existentes para que estén activos
UPDATE Usuario
SET eliminado = 0
WHERE eliminado IS NULL;
GO

PRINT 'Columna eliminado agregada exitosamente a la tabla Usuario';
PRINT 'Todos los usuarios existentes han sido marcados como activos (eliminado = 0)';
PRINT 'Para eliminar un usuario usar: UPDATE Usuario SET eliminado = 1 WHERE ID = [id_usuario]';
PRINT 'Para consultar solo usuarios activos usar: SELECT * FROM Usuario WHERE eliminado = 0';