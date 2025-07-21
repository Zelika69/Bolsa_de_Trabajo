-- Inserts para usuarios con diferentes roles según el mapeo del frontend
-- Mapeo: ADMINISTRADOR->admin, CANDIDATO->user, EMPRESA->recruiter

-- Usuario ADMINISTRADOR (rol 'admin' en frontend)
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('admin_sistema', 'admin@bolsatrabajo.com', 'admin123', 'ADMINISTRADOR', 'usuario2.jpg');

INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('super_admin', 'superadmin@bolsatrabajo.com', 'superadmin456', 'ADMINISTRADOR', 'usuario3.jpg');

-- Usuarios CANDIDATO (rol 'user' en frontend)
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('maria_candidata', 'maria@example.com', 'maria123', 'CANDIDATO', 'usuario1.jpg');

INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('carlos_dev', 'carlos@example.com', 'carlos456', 'CANDIDATO', 'usuario2.jpg');

INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('ana_designer', 'ana@example.com', 'ana789', 'CANDIDATO', 'usuario3.jpg');

-- Usuarios EMPRESA (rol 'recruiter' en frontend)
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('techcorp_rh', 'rh@techcorp.com', 'techcorp123', 'EMPRESA', 'usuario1.jpg');

INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('startup_hiring', 'hiring@startup.com', 'startup456', 'EMPRESA', 'usuario2.jpg');

INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen)
VALUES ('consultora_jobs', 'jobs@consultora.com', 'consultora789', 'EMPRESA', 'usuario3.jpg');

-- Inserts complementarios para candidatos
INSERT INTO Candidatos (ID_Usuario, Telefono, Dirreccion, CV, Educacion, Experiencia_Laboral)
VALUES 
((SELECT ID FROM Usuario WHERE NombreUsuario = 'maria_candidata'), '4421111111', 'Av. Principal 100', 'maria_cv.pdf', 'Ing. en Sistemas', '2 años en desarrollo web'),
((SELECT ID FROM Usuario WHERE NombreUsuario = 'carlos_dev'), '4422222222', 'Calle Secundaria 200', 'carlos_cv.pdf', 'Lic. en Informática', '5 años en backend'),
((SELECT ID FROM Usuario WHERE NombreUsuario = 'ana_designer'), '4423333333', 'Blvd. Diseño 300', 'ana_cv.pdf', 'Lic. en Diseño Gráfico', '3 años en UX/UI');

-- Inserts complementarios para empresas
INSERT INTO Empresa (ID_Usuario, Nombre, RFC, Direccion, Telefono, Descripcion)
VALUES 
((SELECT ID FROM Usuario WHERE NombreUsuario = 'techcorp_rh'), 'TechCorp SA de CV', 'TCO123456ABC', 'Torre Corporativa 1', '4425551111', 'Empresa líder en tecnología'),
((SELECT ID FROM Usuario WHERE NombreUsuario = 'startup_hiring'), 'Startup Innovadora SC', 'SIN789012DEF', 'Hub de Innovación 2', '4425552222', 'Startup de desarrollo de apps'),
((SELECT ID FROM Usuario WHERE NombreUsuario = 'consultora_jobs'), 'Consultora RH Plus SA', 'CRP345678GHI', 'Centro de Negocios 3', '4425553333', 'Consultoría en recursos humanos');

-- Verificar los inserts
SELECT u.ID, u.NombreUsuario, u.Correo, u.ROL, u.RutaImagen,
       CASE 
           WHEN u.ROL = 'ADMINISTRADOR' THEN 'admin'
           WHEN u.ROL = 'CANDIDATO' THEN 'user' 
           WHEN u.ROL = 'EMPRESA' THEN 'recruiter'
           ELSE 'unknown'
       END as RolFrontend
FROM Usuario u
ORDER BY u.ROL, u.NombreUsuario;