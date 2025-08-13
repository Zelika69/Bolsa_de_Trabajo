# Documentación de Tablas SQL - Plataforma Bolsa de Trabajo

## Base de Datos: Bolsade_Trabajo_

### 1. TABLAS PRINCIPALES

#### 1.1 Usuario
**Descripción:** Tabla principal que almacena la información básica de todos los usuarios del sistema.

```sql
CREATE TABLE Usuario (
    ID INT PRIMARY KEY IDENTITY(1,1),
    NombreUsuario VARCHAR(50) NOT NULL UNIQUE,
    Correo VARCHAR(100) UNIQUE,
    Contrasena VARCHAR(255) NOT NULL,
    ROL VARCHAR(100),
    RutaImagen VARCHAR(255)
);
```

**Campos:**
- `ID`: Identificador único del usuario (auto-incremental)
- `NombreUsuario`: Nombre de usuario único en el sistema
- `Correo`: Dirección de correo electrónico única
- `Contrasena`: Contraseña encriptada del usuario
- `ROL`: Tipo de usuario (CANDIDATO, ADMINISTRADOR, EMPRESA)
- `RutaImagen`: Ruta de la imagen de perfil del usuario

#### 1.2 Candidatos
**Descripción:** Información específica de los usuarios que buscan empleo.

```sql
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
```

**Campos:**
- `ID`: Identificador único del candidato
- `ID_Usuario`: Referencia al usuario en la tabla Usuario
- `Telefono`: Número de teléfono del candidato
- `Dirreccion`: Dirección física del candidato
- `CV`: Ruta del archivo CV
- `Educacion`: Información educativa en formato texto
- `Experiencia_Laboral`: Experiencia laboral en formato texto

#### 1.3 Empresa
**Descripción:** Información de las empresas que publican vacantes.

```sql
CREATE TABLE Empresa (
    ID INT PRIMARY KEY IDENTITY,
    ID_Usuario INT,
    Nombre VARCHAR(100),
    RFC VARCHAR(13),
    Direccion VARCHAR(255),
    Telefono VARCHAR(15),
    Descripcion TEXT
);
```

**Campos:**
- `ID`: Identificador único de la empresa
- `ID_Usuario`: Referencia al usuario en la tabla Usuario
- `Nombre`: Nombre comercial de la empresa
- `RFC`: Registro Federal de Contribuyentes
- `Direccion`: Dirección física de la empresa
- `Telefono`: Número de teléfono de la empresa
- `Descripcion`: Descripción de la empresa

#### 1.4 Vacantes
**Descripción:** Ofertas de trabajo publicadas por las empresas.

```sql
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
    Estado VARCHAR(50) DEFAULT 'Abierta',
    CantidadPostulaciones INT DEFAULT 0
);
```

**Campos:**
- `ID`: Identificador único de la vacante
- `ID_Empresa`: Referencia a la empresa que publica
- `Titulo_puesto`: Título del puesto de trabajo
- `Descripcion`: Descripción detallada del puesto
- `Requisitos`: Requisitos necesarios para el puesto
- `Salario`: Salario ofrecido
- `Tipo_Contrato`: Tipo de contrato (Tiempo completo, Medio tiempo, etc.)
- `Ubicacion`: Ubicación del trabajo
- `Fecha_Publicacion`: Fecha de publicación de la vacante
- `Fecha_Cierre`: Fecha de cierre de la vacante
- `Estado`: Estado actual (Abierta, Cerrada)
- `CantidadPostulaciones`: Contador de postulaciones recibidas

#### 1.5 Postulaciones
**Descripción:** Registro de las postulaciones de candidatos a vacantes.

```sql
CREATE TABLE Postulaciones (
    ID INT PRIMARY KEY IDENTITY,
    ID_Candidato INT,
    ID_Vacante INT,
    Fecha_Publicacion DATE,
    Estado VARCHAR(50)
);
```

**Campos:**
- `ID`: Identificador único de la postulación
- `ID_Candidato`: Referencia al candidato que se postula
- `ID_Vacante`: Referencia a la vacante
- `Fecha_Publicacion`: Fecha de la postulación
- `Estado`: Estado de la postulación (Pendiente, Aceptado, Rechazado)

### 2. TABLAS COMPLEMENTARIAS

#### 2.1 Educacion_Candidato
**Descripción:** Información educativa detallada de los candidatos.

```sql
CREATE TABLE Educacion_Candidato (
    ID INT PRIMARY KEY IDENTITY,
    ID_Candidato INT,
    Nivel VARCHAR(50),
    Institucion VARCHAR(100),
    Año_Inicio SMALLINT,
    Año_Fin SMALLINT
);
```

#### 2.2 Experiencia_Candidato
**Descripción:** Experiencia laboral detallada de los candidatos.

```sql
CREATE TABLE Experiencia_Candidato(
    ID INT PRIMARY KEY IDENTITY,
    ID_Candidato INT,
    Puesto VARCHAR(100),
    Empresa VARCHAR(100),
    Duracion VARCHAR(50),
    Descripcion TEXT
);
```

#### 2.3 Habilidades
**Descripción:** Catálogo de habilidades disponibles.

```sql
CREATE TABLE Habilidades(
    ID INT PRIMARY KEY IDENTITY,
    Nombre VARCHAR(50)
);
```

#### 2.4 Candidato_Habilidad
**Descripción:** Relación muchos a muchos entre candidatos y habilidades.

```sql
CREATE TABLE Candidato_Habilidad (
    ID_Candidato INT FOREIGN KEY REFERENCES Candidatos(ID),
    ID_Habilidad INT FOREIGN KEY REFERENCES Habilidades(ID),
    PRIMARY KEY (ID_Candidato, ID_Habilidad)
);
```

### 3. FUNCIONES

#### 3.1 FN_NumeroPostulacionesVacante
**Descripción:** Retorna el número total de postulaciones para una vacante específica.

```sql
CREATE FUNCTION FN_NumeroPostulacionesVacante(@ID_Vacante INT)
RETURNS INT
```

#### 3.2 FN_EstadoVacante
**Descripción:** Obtiene el estado actual de una vacante específica.

```sql
CREATE FUNCTION FN_EstadoVacante(@ID_Vacante INT)
RETURNS VARCHAR(50)
```

#### 3.3 FN_ExistePostulacion
**Descripción:** Verifica si un candidato ya se ha postulado a una vacante específica.

```sql
CREATE FUNCTION FN_ExistePostulacion(@ID_Candidato INT, @ID_Vacante INT)
RETURNS BIT
```

### 4. PROCEDIMIENTOS ALMACENADOS

#### 4.1 SP_RegistrarCandidato
**Descripción:** Registra un nuevo candidato en el sistema.

```sql
CREATE PROCEDURE SP_RegistrarCandidato
    @ID_Usuario INT,
    @Telefono VARCHAR(100),
    @Dirreccion VARCHAR(100),
    @CV VARCHAR(100),
    @Educacion TEXT,
    @Experiencia_Laboral TEXT
```

#### 4.2 SP_PostularVacante
**Descripción:** Permite a un candidato postularse a una vacante con validaciones.

```sql
CREATE PROCEDURE SP_PostularVacante
    @ID_Candidato INT,
    @ID_Vacante INT
```

#### 4.3 SP_AceptarCandidato
**Descripción:** Acepta la postulación de un candidato y cierra la vacante.

```sql
CREATE PROCEDURE SP_AceptarCandidato
    @ID_Postulacion INT
```

### 5. TRIGGERS

#### 5.1 TR_AfterInsert_Postulacion
**Descripción:** Se ejecuta después de insertar una nueva postulación, actualiza automáticamente el contador de postulaciones en la vacante.

```sql
CREATE TRIGGER TR_AfterInsert_Postulacion
ON Postulaciones
AFTER INSERT
```

#### 5.2 TR_ValidarCierreVacante
**Descripción:** Valida que una vacante no se pueda cerrar si no tiene postulaciones.

```sql
CREATE TRIGGER TR_ValidarCierreVacante
ON Vacantes
AFTER UPDATE
```

### 6. ROLES Y PERMISOS

#### 6.1 Roles Definidos
- **CANDIDATO**: Para usuarios que buscan empleo
- **ADMINISTRADOR**: Para gestión de la plataforma

#### 6.2 Permisos por Rol

**CANDIDATO:**
- SELECT, UPDATE en Candidatos
- SELECT en Vacantes
- INSERT en Postulaciones

**ADMINISTRADOR:**
- SELECT, INSERT, UPDATE, DELETE en Candidatos
- SELECT, INSERT, UPDATE, DELETE en Vacantes
- SELECT, UPDATE en Postulaciones

### 7. RELACIONES ENTRE TABLAS

```
Usuario (1) -----> (1) Candidatos
Usuario (1) -----> (1) Empresa
Empresa (1) -----> (N) Vacantes
Candidatos (1) -----> (N) Postulaciones
Vacantes (1) -----> (N) Postulaciones
Candidatos (1) -----> (N) Educacion_Candidato
Candidatos (1) -----> (N) Experiencia_Candidato
Candidatos (N) -----> (N) Habilidades (a través de Candidato_Habilidad)
```

### 8. NOTAS IMPORTANTES

- La base de datos utiliza `IDENTITY` para campos auto-incrementales
- Los campos de texto largo utilizan el tipo `TEXT`
- Las fechas utilizan el tipo `DATE`
- El salario utiliza el tipo `MONEY`
- Se implementan validaciones a través de triggers y procedimientos almacenados
- El sistema maneja roles y permisos a nivel de base de datos

---

**Fecha de creación:** $(Get-Date)
**Versión:** 1.0
**Autor:** Sistema de Gestión Bolsa de Trabajo