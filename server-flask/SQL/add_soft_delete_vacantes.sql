-- Script para agregar soft delete a la tabla Vacantes
-- Agregar columna 'eliminado' para implementar soft delete en vacantes

USE [Bolsa_de_Trabajo];
GO

-- Agregar la columna eliminado con valor por defecto 0 (activo)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Vacantes') AND name = 'eliminado')
BEGIN
    ALTER TABLE Vacantes
    ADD eliminado BIT DEFAULT 0;
    
    PRINT 'Columna eliminado agregada exitosamente a la tabla Vacantes';
    PRINT 'Todas las vacantes existentes han sido marcadas como activas (eliminado = 0)';
    PRINT 'Para eliminar una vacante usar: UPDATE Vacantes SET eliminado = 1 WHERE ID = [id_vacante]';
    PRINT 'Para consultar solo vacantes activas usar: SELECT * FROM Vacantes WHERE eliminado = 0';
END
ELSE
BEGIN
    PRINT 'La columna eliminado ya existe en la tabla Vacantes';
END
GO