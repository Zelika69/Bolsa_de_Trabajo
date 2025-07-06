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

