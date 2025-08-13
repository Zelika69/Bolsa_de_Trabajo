-- Script para crear postulaciones de prueba con candidatos que tienen CV
-- Esto permitirá probar la funcionalidad de descarga de CV para empresas

-- Primero verificamos que existen candidatos con CV
SELECT 
    u.ID as UsuarioID,
    u.NombreUsuario,
    u.Correo,
    c.ID as CandidatoID,
    c.CV
FROM Usuario u
INNER JOIN Candidatos c ON u.ID = c.ID_Usuario
WHERE u.ROL = 'CANDIDATO' AND c.CV IS NOT NULL;

-- Verificamos que existen vacantes
SELECT 
    v.ID as VacanteID,
    v.Titulo_puesto,
    e.ID as EmpresaID,
    e.Nombre as NombreEmpresa
FROM Vacantes v
INNER JOIN Empresa e ON v.ID_Empresa = e.ID;

-- Crear postulaciones de prueba
-- Asumiendo que tenemos candidatos con IDs 1, 2, 3, 4 y vacantes con IDs 1, 2, 3

-- Postulación 1: Juan Pérez (candidato 1) se postula a vacante 1
IF NOT EXISTS (SELECT 1 FROM Postulaciones WHERE ID_Candidato = 1 AND ID_Vacante = 1)
BEGIN
    INSERT INTO Postulaciones (ID_Candidato, ID_Vacante, Fecha_Publicacion, Estado)
    VALUES (1, 1, GETDATE(), 'Pendiente');
END

-- Postulación 2: María García (candidato 2) se postula a vacante 1
IF NOT EXISTS (SELECT 1 FROM Postulaciones WHERE ID_Candidato = 2 AND ID_Vacante = 1)
BEGIN
    INSERT INTO Postulaciones (ID_Candidato, ID_Vacante, Fecha_Publicacion, Estado)
    VALUES (2, 1, GETDATE(), 'Pendiente');
END

-- Postulación 3: Carlos López (candidato 3) se postula a vacante 2
IF NOT EXISTS (SELECT 1 FROM Postulaciones WHERE ID_Candidato = 3 AND ID_Vacante = 2)
BEGIN
    INSERT INTO Postulaciones (ID_Candidato, ID_Vacante, Fecha_Publicacion, Estado)
    VALUES (3, 2, GETDATE(), 'En Revisión');
END

-- Postulación 4: Ana Martínez (candidato 4) se postula a vacante 2
IF NOT EXISTS (SELECT 1 FROM Postulaciones WHERE ID_Candidato = 4 AND ID_Vacante = 2)
BEGIN
    INSERT INTO Postulaciones (ID_Candidato, ID_Vacante, Fecha_Publicacion, Estado)
    VALUES (4, 2, GETDATE(), 'Pendiente');
END

-- Verificar las postulaciones creadas
SELECT 
    p.ID as PostulacionID,
    p.Estado,
    p.Fecha_Publicacion,
    u.NombreUsuario as Candidato,
    c.CV,
    v.Titulo_puesto as Vacante,
    e.Nombre as Empresa
FROM Postulaciones p
INNER JOIN Candidatos c ON p.ID_Candidato = c.ID
INNER JOIN Usuario u ON c.ID_Usuario = u.ID
INNER JOIN Vacantes v ON p.ID_Vacante = v.ID
INNER JOIN Empresa e ON v.ID_Empresa = e.ID
ORDER BY p.Fecha_Publicacion DESC;

-- Verificar que los archivos CV existen en las rutas especificadas
SELECT DISTINCT c.CV as RutaCV
FROM Candidatos c
INNER JOIN Postulaciones p ON c.ID = p.ID_Candidato
WHERE c.CV IS NOT NULL;