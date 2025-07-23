CREATE DATABASE Bolsade_Trabajo_;
USE Bolsade_Trabajo_;

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

--------------------------------------------------------------------------------------------------------
--Creacion de los roles que representarán los tipos de usuario en el sistema 
CREATE ROLE CANDIDATO; -- Rol para los usuarios que buscan empleo (candidatos)
CREATE ROLE ADMINISTRADOR; -- Rol para los usuarios encargados de gestionar la plataforma (administradores)

-- Creamos un login, que es la cuenta que se usara para conectarse al servidor SQL
-- Este login incluye un nombre de usuario y una contraseña segura 
CREATE LOGIN usuario_candidato WITH PASSWORD = 'Password_Segura123!';

-- Creamos un usuario dentro de la base de datos y lo vinculamos con el login anterior
-- Este usuario es el que podrá interactuar con los datos, tablas y funciones
CREATE USER usuario_candidato FOR LOGIN usuario_candidato;

-- Finalmente, agregamos el usuario creado al rol "CANDIDATO".
-- Esto le asigna automáticamente todos los permisos que tenga ese rol, facilitando así la administración de privilegios
ALTER ROLE CANDIDATO ADD MEMBER usuario_candidato;
--------------------------------------------------------------------------------------------------------------
-- Creamos un login para el administrador
-- Este login permite que el usuario "admin_upq" pueda conectarse al servidor de base de datos usando una contraseña segura
CREATE LOGIN admin_upq WITH PASSWORD = 'Admin_Segura123!';

-- Creamos un usuario dentro de la base de datos y lo vinculamos con el login que acabamos de crear.
-- Esto permite que el usuario admin_upq pueda interactuar con los objetos de la base de datos
CREATE USER admin_upq FOR LOGIN admin_upq;

-- Asignamos el rol "ADMINISTRADOR" al usuario admin_upq.
-- Esto le da automáticamente todos los privilegios o permisos que tenga el rol, no necesitamos asignarle permisos uno por uno
ALTER ROLE ADMINISTRADOR ADD MEMBER admin_upq;
-----------------------------------------------------------------------------------------------------------------
-- Asignamos los permisos que tendrá el rol CANDIDATO.
-- Permiso para que el candidato pueda ver (SELECT) y actualizar (UPDATE) su propia información en la tabla "Candidatos".
GRANT SELECT, UPDATE ON Candidatos TO CANDIDATO;

-- Permiso para consultar las vacantes disponibles en la tabla "Vacantes", el candidato no puede modificar esta tabla, solo puede verla.
GRANT SELECT ON Vacantes TO CANDIDATO;

-- Permiso para agregar nuevas postulaciones en la tabla "Postulaciones", esto le permite al candidato postularse a las vacantes de su interés.
GRANT INSERT ON Postulaciones TO CANDIDATO;
-------------------------------------------------------------------------------------------------------------------------------
-- Asignamos los permisos que tendrá el rol ADMINISTRADOR.

-- Permisos completos sobre la tabla "Candidatos":
-- Puede consultar (SELECT), agregar nuevos candidatos (INSERT), actualizar sus datos (UPDATE) y eliminarlos (DELETE).
-- Esto permite una administración total del registro de usuarios candidatos
GRANT SELECT, INSERT, UPDATE, DELETE ON Candidatos TO ADMINISTRADOR;

-- Permisos completos sobre la tabla "Vacantes":
-- El administrador puede ver las vacantes, registrar nuevas, editarlas o eliminarlas. Esto es útil para gestionar las oportunidades laborales disponibles.
GRANT SELECT, INSERT, UPDATE, DELETE ON Vacantes TO ADMINISTRADOR;

-- Permisos para gestionar postulaciones:
-- Puede consultar las postulaciones realizadas por los candidatos y actualizarlas si es necesario.
-- Por ejemplo, puede cambiar su estado (aceptada, en revisión, rechazada, etc.)
GRANT SELECT, UPDATE ON Postulaciones TO ADMINISTRADOR;
------------------------------------------------------------------------------------------------------------------------------
---------FUNCIONES-------------
-- Creamos una función llamada "FN_NumeroPostulacionesVacante".
-- Esta función recibe como parámetro el ID de una vacante y devuelve la cantidad total de postulaciones que tiene esa vacante.
CREATE FUNCTION FN_NumeroPostulacionesVacante
(
    @ID_Vacante INT -- Este es el parámetro de entrada: el identificador de la vacante que queremos consultar.
)
RETURNS INT -- Especificamos que esta función va a devolver un valor entero (INT), que será el número total de postulaciones.
AS
BEGIN
    DECLARE @Total INT; -- Declaramos una variable interna para guardar el conteo de postulaciones.
	-- Usamos una consulta para contar cuántas filas existen en la tabla "Postulaciones" que correspondan al ID de vacante recibido como parámetro.
    SELECT @Total = COUNT(*) FROM Postulaciones WHERE ID_Vacante = @ID_Vacante;
    RETURN @Total; -- Devolvemos el total de postulaciones encontradas.
END;
GO -- Finaliza la creación de la función.
---------------------------------------------------------------------------------------------------------------------------
--Función2: Estado actual de una vacante
-- Esta función sirve para obtener el estado actual de una vacante específica (por ejemplo: 'Activa', 'Cerrada', 'En revisión', etc.)
CREATE FUNCTION FN_EstadoVacante
(
    @ID_Vacante INT -- Parámetro de entrada: el identificador de la vacante de la cual queremos saber el estado
)
RETURNS VARCHAR(50) -- Indicamos que esta función devuelve una cadena de texto (de hasta 50 caracteres)
AS
BEGIN
    DECLARE @Estado VARCHAR(50); -- Creamos una variable para almacenar temporalmente el estado de la vacante
	-- Buscamos el estado correspondiente en la tabla "Vacantes"
    -- usando el ID que se recibió como parámetro
    SELECT @Estado = Estado FROM Vacantes WHERE ID = @ID_Vacante;
    RETURN @Estado;-- Devolvemos el estado encontrado
END;
GO
------------------------------------------------------------------------------------------------------------------------------
--Función3 : Sirve para verificar si un candidato ya se ha postulado a una vacante específica
CREATE FUNCTION FN_ExistePostulacion
(
    @ID_Candidato INT, -- Parámetro de entrada: el ID del candidato
    @ID_Vacante INT -- Parámetro de entrada: el ID de la vacante
)
RETURNS BIT -- La función devuelve un valor de tipo BIT (es decir, 1 o 0 → verdadero o falso)
AS
BEGIN
    DECLARE @Existe BIT; -- Declaramos una variable que almacenará el resultado (1 si existe la postulación, 0 si no)
	-- Verificamos si hay al menos un registro en la tabla "Postulaciones" que coincida con el candidato y la vacante proporcionados
    IF EXISTS (
        SELECT 1 FROM Postulaciones
        WHERE ID_Candidato = @ID_Candidato AND ID_Vacante = @ID_Vacante
    )
        SET @Existe = 1; -- Si se encontró al menos una coincidencia, asignamos 1 (sí existe)
    ELSE
        SET @Existe = 0; -- Si no hay coincidencia, asignamos 0 (no existe)
    RETURN @Existe; -- Devolvemos el resultado
END;
GO
------------------------------------------------------------------------------------------------------------------------------
--Consultar numero de postulaciones:
SELECT dbo.FN_NumeroPostulacionesVacante(1) AS TotalPostulaciones;

--Consultar estado de vacante:
SELECT dbo.FN_EstadoVacante(3) AS EstadoVacante;

-- Consulta del sistema que muestra todas las funciones definidas por el usuario en la base de datos
-- Esto es útil para verificar qué funciones has creado y tener una lista rápida de ellas
SELECT name
FROM sys.objects
WHERE type = 'FN';

--Verificar si un candidato ya se postuló:
SELECT dbo.FN_ExistePostulacion(1, 2) AS YaPostulado;
--------------------------------------------------------------------------------------------------------------------------------
-- TRIGGERS
-- Creamos un trigger llamado "TR_AfterInsert_Postulacion"
-- Este trigger se ejecuta automáticamente después de que se inserta una nueva postulación en la tabla "Postulaciones"
CREATE TRIGGER TR_AfterInsert_Postulacion
ON Postulaciones -- Especificamos que este trigger se aplica a la tabla "Postulaciones"
AFTER INSERT -- Indica que el trigger se dispara justo después de una inserción de datos
AS
BEGIN
	-- Actualizamos la tabla "Vacantes"
    -- Aumentamos en 1 el valor de "CantidadPostulaciones" para cada vacante relacionada con la nueva postulación insertada
    UPDATE Vacantes
    SET CantidadPostulaciones = CantidadPostulaciones + 1
    WHERE ID IN (SELECT ID_Vacante FROM inserted); -- "inserted" es una tabla virtual que contiene los datos recién insertados en "Postulaciones"
END;
GO
--------------------------------------------------------------------------------------------------------------------------------
-- Creamos un trigger llamado "TR_ValidarCierreVacante"
-- Este trigger se activa automáticamente después de una actualización en la tabla "Vacantes"
CREATE TRIGGER TR_ValidarCierreVacante
ON Vacantes
AFTER UPDATE -- Se ejecuta después de que se realiza una actualización en cualquier registro de la tabla "Vacantes"
AS
BEGIN
	-- Verificamos si alguna vacante actualizada tiene una fecha de cierre (es decir, se intenta cerrar), pero no tiene ninguna postulación asociada
    IF EXISTS (
        SELECT 1
        FROM inserted i -- "inserted" es una tabla virtual con los valores nuevos que se están actualizando
        JOIN Vacantes v ON i.ID = v.ID -- Confirmamos que trabajamos con los mismos registros
        WHERE i.Fecha_Cierre IS NOT NULL -- Si se ha colocado una fecha de cierre
          AND NOT EXISTS (
		  -- Y no existe ninguna postulación para esa vacante
              SELECT 1
              FROM Postulaciones p
              WHERE p.ID_Vacante = v.ID
          )
    )
    BEGIN
	-- Si se cumple la condición anterior, detenemos la transacción y mostramos un mensaje de error
        RAISERROR('No se puede cerrar la vacante porque no hay postulaciones registradas', 16, 1);
        ROLLBACK TRANSACTION; -- Cancelamos los cambios realizados en la transacción
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