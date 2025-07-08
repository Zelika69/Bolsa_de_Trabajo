CREATE DATABASE Bolsa_de_Trabajo;
USE Bolsa_de_Trabajo;

-- Tabla de usuarios
CREATE TABLE Usuario (
    ID INT PRIMARY KEY IDENTITY(1,1),
    NombreUsuario VARCHAR(50) NOT NULL UNIQUE,
	Correo VARCHAR(100) UNIQUE,
    Contrasena VARCHAR(255) NOT NULL,
	ROL VARCHAR(100),
    RutaImagen VARCHAR(255)  -- solo si es una imagen por usuario
);

CREATE TABLE Candidatos(
	ID INT PRIMARY KEY IDENTITY,
	ID_Usuario INT, 
	Telefono VARCHAR(100),
	Dirreccion VARCHAR(100),
	CV VARCHAR(100),
	Educacion TEXT,
	Experiencia_Laboral TEXT,
	FOREIGN KEY (ID_Usuario) REFERENCES Usuario (ID)
);

CREATE TABLE Empresa (
	ID INT PRIMARY KEY IDENTITY,
	ID_Usuario INT,
	Nombre VARCHAR(100),
	RFC VARCHAR(13),
	Direccion VARCHAR(255),
	Telefono VARCHAR(15),
	Descripcion TEXT
);

CREATE TABLE Vacantes (
	ID INT PRIMARY KEY IDENTITY,
	ID_Empresa INT,
	Titulo_puesto VARCHAR(100),
	Descripcion TEXT,
	Requisitos TEXT,
	Salario MONEY,
	Tipo_Contrato VARCHAR(50),
	Ubicacion VARCHAR(50),
	Fecha_Publicacion DATE,
	Fecha_Cierre DATE, 
);

--correcciones
ALTER TABLE Vacantes
ADD Estado VARCHAR(50) DEFAULT 'Abierta';

ALTER TABLE Vacantes
ADD CantidadPostulaciones INT DEFAULT 0;


CREATE TABLE Postulaciones (
	ID INT PRIMARY KEY IDENTITY,
	ID_Candidato INT,
	ID_Vacante INT,
	Fecha_Publicacion DATE,
	Estado VARCHAR(50)
);

CREATE TABLE Educacion_Candidato (
	ID INT PRIMARY KEY IDENTITY,
	ID_Candidato INT,
	Nivel VARCHAR(50),
	Institucion VARCHAR(100),
	Año_Inicio SMALLINT,
	Año_Fin SMALLINT,
);

CREATE TABLE Experiencia_Candidato(
	ID INT PRIMARY KEY IDENTITY,
	ID_Candidato INT,
	Puesto VARCHAR(100),
	Empresa VARCHAR(100),
	Duracion VARCHAR(50),
	Descripcion TEXT
);

CREATE TABLE Habilidades(
	ID INT PRIMARY KEY IDENTITY,
	Nombre VARCHAR(50)
);

CREATE TABLE Candidato_Habilidad (
    ID_Candidato INT FOREIGN KEY REFERENCES Candidatos(ID),
    ID_Habilidad INT FOREIGN KEY REFERENCES Habilidades(ID),
    PRIMARY KEY (ID_Candidato, ID_Habilidad)
);

------------------------------------------------------------------------------------------------------
--Creacion de los roles 
CREATE ROLE CANDIDATO;
CREATE ROLE ADMINISTRADOR;

--Asignamos los roles 
CREATE LOGIN usuario_candidato WITH PASSWORD = 'Password_Segura123!';

-- Crea el usuario en la base de datos actual
CREATE USER usuario_candidato FOR LOGIN usuario_candidato;

-- Asigna el rol CANDIDATO
ALTER ROLE CANDIDATO ADD MEMBER usuario_candidato;
--------------------------------------------------------------------------------------------------------------


--Le asignamos el rol al administrador
CREATE LOGIN admin_upq WITH PASSWORD = 'Admin_Segura123!';

CREATE USER admin_upq FOR LOGIN admin_upq;

ALTER ROLE ADMINISTRADOR ADD MEMBER admin_upq;
-----------------------------------------------------------------------------------------------------------------
--Los permisos que tiene el candidato
--Ver su perfil 
GRANT SELECT, UPDATE ON Candidatos TO CANDIDATO;

-- Ver vacantes
GRANT SELECT ON Vacantes TO CANDIDATO;

-- Insertar postulaciones
GRANT INSERT ON Postulaciones TO CANDIDATO;
-------------------------------------------------------------------------------------------------------------------------------

--Los permisos que tiene el administrador
-- Gestión total de candidatos
GRANT SELECT, INSERT, UPDATE, DELETE ON Candidatos TO ADMINISTRADOR;

-- Gestión total de vacantes
GRANT SELECT, INSERT, UPDATE, DELETE ON Vacantes TO ADMINISTRADOR;

-- Gestión de postulaciones
GRANT SELECT, UPDATE ON Postulaciones TO ADMINISTRADOR;
------------------------------------------------------------------------------------------------------------------------------

--Funcion1: Numero de postulaciones de una vacante
CREATE FUNCTION FN_NumeroPostulacionesVacante
(
    @ID_Vacante INT
)
RETURNS INT
AS
BEGIN
    DECLARE @Total INT;
    SELECT @Total = COUNT(*) FROM Postulaciones WHERE ID_Vacante = @ID_Vacante;
    RETURN @Total;
END;
GO
---------------------------------------------------------------------------------------------------------------------------
--Función2: Estado actual de una vacante
CREATE FUNCTION FN_EstadoVacante
(
    @ID_Vacante INT
)
RETURNS VARCHAR(50)
AS
BEGIN
    DECLARE @Estado VARCHAR(50);
    SELECT @Estado = Estado FROM Vacantes WHERE ID = @ID_Vacante;
    RETURN @Estado;
END;
GO
------------------------------------------------------------------------------------------------------------------------------
--Función3 : Verifica si un candidato ya se postuló
CREATE FUNCTION FN_ExistePostulacion
(
    @ID_Candidato INT,
    @ID_Vacante INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @Existe BIT;
    IF EXISTS (
        SELECT 1 FROM Postulaciones
        WHERE ID_Candidato = @ID_Candidato AND ID_Vacante = @ID_Vacante
    )
        SET @Existe = 1;
    ELSE
        SET @Existe = 0;
    RETURN @Existe;
END;
GO
------------------------------------------------------------------------------------------------------------------------------
--Consultar numero de postulaciones:
SELECT dbo.FN_NumeroPostulacionesVacante(1) AS TotalPostulaciones;

--Consultar estado de vacante:
SELECT dbo.FN_EstadoVacante(3) AS EstadoVacante;

SELECT name
FROM sys.objects
WHERE type = 'FN';

--Verificar si un candidato ya se postuló:
SELECT dbo.FN_ExistePostulacion(1, 2) AS YaPostulado;
--------------------------------------------------------------------------------------------------------------------------------
-- TRIGGERS
CREATE TRIGGER TR_AfterInsert_Postulacion
ON Postulaciones
AFTER INSERT
AS
BEGIN
    UPDATE Vacantes
    SET CantidadPostulaciones = CantidadPostulaciones + 1
    WHERE ID IN (SELECT ID_Vacante FROM inserted);
END;
GO
--------------------------------------------------------------------------------------------------------------------------------

CREATE TRIGGER TR_ValidarCierreVacante
ON Vacantes
AFTER UPDATE
AS
BEGIN
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN Vacantes v ON i.ID = v.ID
        WHERE i.Fecha_Cierre IS NOT NULL
          AND NOT EXISTS (
              SELECT 1
              FROM Postulaciones p
              WHERE p.ID_Vacante = v.ID
          )
    )
    BEGIN
        RAISERROR('No se puede cerrar la vacante porque no hay postulaciones registradas', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO
-------------------------------------------------------------------------------------------------------------------------------
--Inserts para verificar info
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('juan_candidato', 'juan@example.com', 'contrasena123', 'CANDIDATO', NULL);

INSERT INTO Candidatos (ID_Usuario, Telefono, Dirreccion, CV, Educacion, Experiencia_Laboral)
VALUES (1, '4421234567', 'Calle Ficticia 123', 'juan_cv.pdf', 'Licenciatura en Sistemas', '3 años en soporte técnico');

INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('empresa_upq', 'empresa@example.com', 'empresasegura456', 'ADMINISTRADOR', NULL);

INSERT INTO Empresa (ID_Usuario, Nombre, RFC, Direccion, Telefono, Descripcion)
VALUES (2, 'Tech Soluciones SA', 'ABC123456XYZ', 'Av. Empresa 456', '4427654321', 'Empresa de desarrollo web');

SELECT * FROM Empresa;

INSERT INTO Vacantes (
    ID_Empresa,
    Titulo_puesto,
    Descripcion,
    Requisitos,
    Salario,
    Tipo_Contrato,
    Ubicacion,
    Fecha_Publicacion,
    Fecha_Cierre
)
VALUES (
    1,
    'Desarrollador Jr.',
    'Programación en Python y soporte a usuarios.',
    'Python, SQL, trabajo en equipo',
    12000,
    'Tiempo completo',
    'Querétaro',
    GETDATE(),
    DATEADD(DAY, 30, GETDATE())
);

SELECT * FROM Candidatos;
--Verificar la cantidad de postulaciones
SELECT * FROM Postulaciones;

INSERT INTO Postulaciones (ID_Candidato, ID_Vacante, Fecha_Publicacion, Estado)
VALUES (1, 1, GETDATE(), 'Pendiente');

SELECT ID, Titulo_puesto, CantidadPostulaciones
FROM Vacantes
WHERE ID = 1;

SELECT * FROM Usuario;
---------------------------------------------------------------------------------------------------------------------------------
--Procedimientos Almacenados
--1
CREATE PROCEDURE SP_RegistrarCandidato
    @ID_Usuario INT,
    @Telefono VARCHAR(100),
    @Dirreccion VARCHAR(100),
    @CV VARCHAR(100),
    @Educacion TEXT,
    @Experiencia_Laboral TEXT
AS
BEGIN
    INSERT INTO Candidatos (ID_Usuario, Telefono, Dirreccion, CV, Educacion, Experiencia_Laboral)
    VALUES (@ID_Usuario, @Telefono, @Dirreccion, @CV, @Educacion, @Experiencia_Laboral);
END;
GO
--------------------------------------------------------------------------------------------------------------------------------
--2
CREATE PROCEDURE SP_PostularVacante
    @ID_Candidato INT,
    @ID_Vacante INT
AS
BEGIN
    -- Verificar si la vacante existe
    IF NOT EXISTS (
        SELECT 1 FROM Vacantes WHERE ID = @ID_Vacante
    )
    BEGIN
        RAISERROR('La vacante no existe', 16, 1);
        RETURN;
    END;

    -- Verificar si la vacante ya tiene Fecha_Cierre
    IF EXISTS (
        SELECT 1 FROM Vacantes
        WHERE ID = @ID_Vacante AND Fecha_Cierre IS NOT NULL
    )
    BEGIN
        RAISERROR('La vacante está cerrada', 16, 1);
        RETURN;
    END;

    -- Verificar si ya se postuló
    IF EXISTS (
        SELECT 1 FROM Postulaciones
        WHERE ID_Candidato = @ID_Candidato AND ID_Vacante = @ID_Vacante
    )
    BEGIN
        RAISERROR('El candidato ya se ha postulado a esta vacante', 16, 1);
        RETURN;
    END;
---------------------------------------------------------------------------------------------------------------------------
    -- Insertar la postulación
    INSERT INTO Postulaciones (ID_Candidato, ID_Vacante, Fecha_Publicacion, Estado)
    VALUES (@ID_Candidato, @ID_Vacante, GETDATE(), 'Pendiente');
END;
GO
---------------------------------------------------------------------------------------------------------------------------------
--3
CREATE PROCEDURE SP_AceptarCandidato
    @ID_Postulacion INT
AS
BEGIN
    DECLARE @ID_Vacante INT;

    -- Obtener la vacante asociada
    SELECT @ID_Vacante = ID_Vacante FROM Postulaciones WHERE ID = @ID_Postulacion;

    IF @ID_Vacante IS NULL
    BEGIN
        RAISERROR('La postulación no existe', 16, 1);
        RETURN;
    END;

    BEGIN TRANSACTION;

    BEGIN TRY
        -- Marcar la postulación como aceptada
        UPDATE Postulaciones
        SET Estado = 'Aceptado'
        WHERE ID = @ID_Postulacion;

        -- Cerrar la vacante
        UPDATE Vacantes
        SET Fecha_Cierre = GETDATE()
        WHERE ID = @ID_Vacante;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        DECLARE @Msg NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@Msg, 16, 1);
    END CATCH;
END;
GO
---------------------------------------------------------------------------------------------------------------------------------------

--Pruebas
--1 Registrar candidato
EXEC SP_RegistrarCandidato
    @ID_Usuario = 2,
    @Telefono = '555-1234',
    @Dirreccion = 'Calle Ejemplo 123',
    @CV = 'cv_jose.pdf',
    @Educacion = 'Licenciatura en Sistemas',
    @Experiencia_Laboral = '2 años en desarrollo';

--2
EXEC SP_PostularVacante
    @ID_Candidato = 1,
    @ID_Vacante = 2;

SELECT ID, Titulo_puesto FROM Vacantes;

INSERT INTO Vacantes (
    ID_Empresa, Titulo_puesto, Descripcion, Requisitos,
    Salario, Tipo_Contrato, Ubicacion, Fecha_Publicacion, Fecha_Cierre
)
VALUES (
    1, 'Desarrollador Junior', 'Programar aplicaciones', 'SQL, C#',
    15000, 'Tiempo Completo', 'Querétaro',
    GETDATE(), NULL
);

SELECT * FROM Vacantes;


--3
-- Agregar una nueva vacante adicional
INSERT INTO Vacantes (
    ID_Empresa,
    Titulo_puesto,
    Descripcion,
    Requisitos,
    Salario,
    Tipo_Contrato,
    Ubicacion,
    Fecha_Publicacion,
    Fecha_Cierre
)
VALUES (
    1,
    'Tester QA',
    'Pruebas de calidad de software',
    'Conocimiento en pruebas, documentación',
    11000,
    'Tiempo Completo',
    'Querétaro',
    GETDATE(),
    NULL
);

-- Verificar que se insertó correctamente
SELECT ID, Titulo_puesto, Estado FROM Vacantes;

-- Postular un candidato diferente a la vacante recién creada
EXEC SP_PostularVacante
    @ID_Candidato = 3,  
    @ID_Vacante = 3;    

-- Verificar postulaciones
SELECT * FROM Postulaciones;

-- Aceptar la postulacion recien creada
EXEC SP_AceptarCandidato
    @ID_Postulacion = 1; -- Ajusta al ID correcto

SELECT * FROM Vacantes;
