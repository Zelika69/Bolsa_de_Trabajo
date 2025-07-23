-- Inserts de ejemplo para las tablas Usuario y Candidatos
-- Primero insertamos usuarios con rol CANDIDATO

USE Bolsade_Trabajo_;

-- Insertar usuarios candidatos
INSERT INTO Usuario (NombreUsuario, Correo, Contrasena, ROL, RutaImagen) VALUES
('juan_perez', 'juan.perez@email.com', 'password123', 'CANDIDATO', 'juan_perez.jpg'),
('maria_garcia', 'maria.garcia@email.com', 'password456', 'CANDIDATO', 'maria_garcia.jpg'),
('carlos_lopez', 'carlos.lopez@email.com', 'password789', 'CANDIDATO', 'carlos_lopez.jpg'),
('ana_martinez', 'ana.martinez@email.com', 'password321', 'CANDIDATO', 'ana_martinez.jpg'),
('luis_rodriguez', 'luis.rodriguez@email.com', 'password654', 'CANDIDATO', 'luis_rodriguez.jpg'),
('sofia_hernandez', 'sofia.hernandez@email.com', 'password987', 'CANDIDATO', 'sofia_hernandez.jpg'),
('diego_torres', 'diego.torres@email.com', 'password147', 'CANDIDATO', 'diego_torres.jpg'),
('laura_flores', 'laura.flores@email.com', 'password258', 'CANDIDATO', 'laura_flores.jpg'),
('miguel_sanchez', 'miguel.sanchez@email.com', 'password369', 'CANDIDATO', 'miguel_sanchez.jpg'),
('patricia_morales', 'patricia.morales@email.com', 'password741', 'CANDIDATO', 'patricia_morales.jpg');

-- Insertar datos de candidatos relacionados con los usuarios
-- Nota: Los IDs de usuario se asignan automáticamente, por lo que usamos los IDs correspondientes

INSERT INTO Candidatos (ID_Usuario, Telefono, Dirreccion, CV, Educacion, Experiencia_Laboral) VALUES
-- Juan Pérez (asumiendo ID_Usuario = 1)
(1, '555-0101', 'Av. Reforma 123, Ciudad de México', '/static/cv/cv_juan_perez.pdf', 
 'Licenciatura en Ingeniería en Sistemas Computacionales - Instituto Tecnológico de México (2018-2022)', 
 'Desarrollador Junior en TechCorp (2022-2023): Desarrollo de aplicaciones web con React y Node.js. Participación en proyectos de migración de sistemas legacy.'),

-- María García (asumiendo ID_Usuario = 2)
(2, '555-0102', 'Calle Juárez 456, Guadalajara, Jalisco', '/static/cv/cv_maria_garcia.pdf',
 'Licenciatura en Administración de Empresas - Universidad de Guadalajara (2019-2023)',
 'Asistente Administrativa en Corporativo ABC (2023-presente): Gestión de documentos, atención al cliente y apoyo en procesos administrativos.'),

-- Carlos López (asumiendo ID_Usuario = 3)
(3, '555-0103', 'Blvd. Independencia 789, Monterrey, Nuevo León', '/static/cv/cv_carlos_lopez.pdf',
 'Ingeniería Industrial - Tecnológico de Monterrey (2017-2021)',
 'Analista de Procesos en ManufacturaXYZ (2021-2024): Optimización de procesos productivos, reducción de costos del 15% en línea de producción.'),

-- Ana Martínez (asumiendo ID_Usuario = 4)
(4, '555-0104', 'Av. Universidad 321, Puebla, Puebla', '/static/cv/cv_ana_martinez.pdf',
 'Licenciatura en Diseño Gráfico - Universidad Popular Autónoma del Estado de Puebla (2020-2024)',
 'Diseñadora Freelance (2023-presente): Creación de identidades corporativas, diseño web y material publicitario para pequeñas empresas.'),

-- Luis Rodríguez (asumiendo ID_Usuario = 5)
(5, '555-0105', 'Calle Morelos 654, Tijuana, Baja California', '/static/cv/cv_luis_rodriguez.pdf',
 'Técnico en Mecánica Automotriz - CONALEP (2018-2020)',
 'Mecánico en Taller AutoFix (2020-2024): Diagnóstico y reparación de vehículos, especialización en sistemas eléctricos automotrices.'),

-- Sofía Hernández (asumiendo ID_Usuario = 6)
(6, '555-0106', 'Av. Revolución 987, Mérida, Yucatán', '/static/cv/cv_sofia_hernandez.pdf',
 'Licenciatura en Psicología - Universidad Autónoma de Yucatán (2018-2022)',
 'Psicóloga Clínica en Centro de Salud Mental (2022-presente): Atención psicológica individual y grupal, especialización en terapia cognitivo-conductual.'),

-- Diego Torres (asumiendo ID_Usuario = 7)
(7, '555-0107', 'Calle Hidalgo 147, Querétaro, Querétaro', '/static/cv/cv_diego_torres.pdf',
 'Licenciatura en Marketing - Universidad Tecnológica de Querétaro (2019-2023)',
 'Coordinador de Marketing Digital en StartupQro (2023-presente): Gestión de redes sociales, campañas publicitarias digitales, incremento del 40% en engagement.'),

-- Laura Flores (asumiendo ID_Usuario = 8)
(8, '555-0108', 'Av. Constitución 258, León, Guanajuato', '/static/cv/cv_laura_flores.pdf',
 'Licenciatura en Contaduría Pública - Universidad de León (2017-2021)',
 'Contadora en Despacho Fiscal Flores & Asociados (2021-2024): Elaboración de declaraciones fiscales, auditorías internas, asesoría fiscal a PYMES.'),

-- Miguel Sánchez (asumiendo ID_Usuario = 9)
(9, '555-0109', 'Calle Zaragoza 369, Toluca, Estado de México', '/static/cv/cv_miguel_sanchez.pdf',
 'Ingeniería en Telecomunicaciones - Instituto Politécnico Nacional (2016-2020)',
 'Ingeniero de Redes en TelecomMX (2020-2024): Diseño e implementación de redes de telecomunicaciones, mantenimiento de infraestructura de fibra óptica.'),

-- Patricia Morales (asumiendo ID_Usuario = 10)
(10, '555-0110', 'Av. Insurgentes 741, Cuernavaca, Morelos', '/static/cv/cv_patricia_morales.pdf',
 'Licenciatura en Enfermería - Universidad Autónoma del Estado de Morelos (2018-2022)',
 'Enfermera en Hospital General de Cuernavaca (2022-presente): Atención a pacientes en área de urgencias, administración de medicamentos, apoyo en procedimientos médicos.');

-- Verificar los datos insertados
SELECT 
    u.ID as UsuarioID,
    u.NombreUsuario,
    u.Correo,
    u.ROL,
    c.ID as CandidatoID,
    c.Telefono,
    c.Dirreccion,
    c.CV
FROM Usuario u
INNER JOIN Candidatos c ON u.ID = c.ID_Usuario
WHERE u.ROL = 'CANDIDATO'
ORDER BY u.ID;