-- Agregar campo Destacada a la tabla Vacantes
ALTER TABLE Vacantes
ADD Destacada BIT DEFAULT 0;

-- Actualizar algunas vacantes existentes como destacadas usando criterios automáticos
-- Criterio 1: Las 3 vacantes más recientes
WITH VacantesRecientes AS (
    SELECT TOP 3 ID
    FROM Vacantes
    WHERE Estado = 'Abierta'
    ORDER BY Fecha_Publicacion DESC
)
UPDATE Vacantes
SET Destacada = 1
WHERE ID IN (SELECT ID FROM VacantesRecientes);

-- Criterio 2: Vacantes con salario más alto (si hay menos de 3 recientes)
WITH VacantesAltoSalario AS (
    SELECT TOP 3 ID
    FROM Vacantes
    WHERE Estado = 'Abierta' AND Destacada = 0
    ORDER BY Salario DESC
)
UPDATE Vacantes
SET Destacada = 1
WHERE ID IN (SELECT ID FROM VacantesAltoSalario)
AND (SELECT COUNT(*) FROM Vacantes WHERE Destacada = 1) < 3;

-- Asegurar que solo haya máximo 3 vacantes destacadas
WITH VacantesDestacadas AS (
    SELECT ID, ROW_NUMBER() OVER (ORDER BY Fecha_Publicacion DESC, Salario DESC) as rn
    FROM Vacantes
    WHERE Destacada = 1
)
UPDATE Vacantes
SET Destacada = 0
WHERE ID IN (
    SELECT ID FROM VacantesDestacadas WHERE rn > 3
);