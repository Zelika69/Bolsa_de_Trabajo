-- Inserts para probar imágenes por defecto
-- Usuarios sin RutaImagen (NULL) para cada rol

-- Usuario ADMINISTRADOR sin imagen (mostrará admin_default.svg)
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen) 
VALUES ('admin_test', 'admin.test@example.com', 'hashed_password_admin', 'ADMINISTRADOR', NULL);

-- Usuario CANDIDATO sin imagen (mostrará user_default.svg)
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen) 
VALUES ('candidato_test', 'candidato.test@example.com', 'hashed_password_candidato', 'CANDIDATO', NULL);

-- Insertar en tabla Candidatos para el usuario CANDIDATO
INSERT INTO Candidatos (UsuarioID, Nombre, Apellido, Telefono, Direccion, FechaNacimiento, Experiencia, Habilidades) 
VALUES (LAST_INSERT_ID(), 'Juan', 'Pérez', '555-0123', 'Calle Test 123', '1990-01-01', 'Sin experiencia', 'Pruebas');

-- Usuario EMPRESA sin imagen (mostrará company_default.svg)
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen) 
VALUES ('empresa_test', 'empresa.test@example.com', 'hashed_password_empresa', 'EMPRESA', NULL);

-- Insertar en tabla Empresa para el usuario EMPRESA
INSERT INTO Empresa (UsuarioID, NombreEmpresa, Descripcion, Direccion, Telefono, SitioWeb) 
VALUES (LAST_INSERT_ID(), 'Empresa Test S.A.', 'Empresa de pruebas', 'Av. Test 456', '555-0456', 'www.empresatest.com');

-- Verificar los inserts
SELECT 
    u.ID,
    u.NombreUsuario,
    u.Correo,
    u.ROL,
    u.RutaImagen,
    CASE 
        WHEN u.ROL = 'ADMINISTRADOR' THEN 'admin'
        WHEN u.ROL = 'CANDIDATO' THEN 'user'
        WHEN u.ROL = 'EMPRESA' THEN 'recruiter'
    END AS frontend_role,
    CASE 
        WHEN u.RutaImagen IS NULL AND u.ROL = 'ADMINISTRADOR' THEN 'admin_default.svg'
        WHEN u.RutaImagen IS NULL AND u.ROL = 'CANDIDATO' THEN 'user_default.svg'
        WHEN u.RutaImagen IS NULL AND u.ROL = 'EMPRESA' THEN 'company_default.svg'
        ELSE u.RutaImagen
    END AS imagen_a_mostrar
FROM Usuario u 
WHERE u.NombreUsuario IN ('admin_test', 'candidato_test', 'empresa_test')
ORDER BY u.ROL;

-- Comentarios para uso:
-- 1. Ejecutar estos inserts en la base de datos
-- 2. Hacer login con cualquiera de estos usuarios:
--    - admin_test / admin.test@example.com
--    - candidato_test / candidato.test@example.com  
--    - empresa_test / empresa.test@example.com
-- 3. Verificar que se muestre la imagen por defecto correspondiente al rol
-- 4. Las contraseñas necesitan ser hasheadas según el método usado en la aplicación