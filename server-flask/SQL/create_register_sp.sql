-- Procedimiento Almacenado para Registrar Usuario y Datos Adicionales
CREATE PROCEDURE sp_RegisterUser
    @NombreUsuario NVARCHAR(50),
    @Correo NVARCHAR(100),
    @Contrasena NVARCHAR(255),
    @ROL NVARCHAR(50),
    @RutaImagen NVARCHAR(255) = NULL,
    @NombreEmpresa NVARCHAR(255) = NULL, -- Solo para rol EMPRESA
    @RFC NVARCHAR(20) = NULL,          -- Solo para rol EMPRESA
    @DireccionEmpresa NVARCHAR(255) = NULL, -- Solo para rol EMPRESA
    @TelefonoEmpresa NVARCHAR(20) = NULL,  -- Solo para rol EMPRESA
    @DescripcionEmpresa NVARCHAR(MAX) = NULL, -- Solo para rol EMPRESA

    @TelefonoCandidato NVARCHAR(20) = NULL, -- Solo para rol CANDIDATO
    @DireccionCandidato NVARCHAR(255) = NULL, -- Solo para rol CANDIDATO
    @CVPath NVARCHAR(255) = NULL       -- Solo para rol CANDIDATO
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @UsuarioID INT;

    BEGIN TRY

        -- 1. Insertar en la tabla Usuario
        INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
        VALUES (@NombreUsuario, @Correo, @Contrasena, @ROL, @RutaImagen);

        SET @UsuarioID = SCOPE_IDENTITY(); -- Obtener el ID del usuario recién insertado

        -- 2. Insertar en la tabla correspondiente según el ROL
        IF @ROL = 'EMPRESA'
        BEGIN
            INSERT INTO Empresa (ID_Usuario, Nombre, RFC, Direccion, Telefono, Descripcion)
            VALUES (@UsuarioID, @NombreEmpresa, @RFC, @DireccionEmpresa, @TelefonoEmpresa, @DescripcionEmpresa);
        END
        ELSE IF @ROL = 'CANDIDATO'
        BEGIN
            INSERT INTO Candidatos (ID_Usuario, Telefono, Dirreccion, CV)
            VALUES (@UsuarioID, @TelefonoCandidato, @DireccionCandidato, @CVPath);
        END



        SELECT @UsuarioID AS NewUserID; -- Devolver el ID del nuevo usuario

    END TRY
    BEGIN CATCH


        -- Lanzar el error para que sea capturado por la aplicación
        DECLARE @ErrorMessage NVARCHAR(MAX) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();

        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END;