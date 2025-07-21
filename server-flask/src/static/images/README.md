# Estructura de Carpetas para Imágenes - Bolsa de Trabajo

Esta carpeta contiene todas las imágenes utilizadas en la aplicación de Bolsa de Trabajo, organizadas por categorías.

## Estructura de Carpetas

### `/candidato/`
- **Propósito**: Fotos de perfil de usuarios con rol CANDIDATO
- **Formato recomendado**: JPG, PNG
- **Tamaño recomendado**: 200x200px (cuadrado)
- **Ejemplos**: `usuario1.jpg`, `usuario2.jpg`, `usuario3.jpg`

### `/administrador/`
- **Propósito**: Fotos de perfil de usuarios con rol ADMINISTRADOR
- **Formato recomendado**: JPG, PNG
- **Tamaño recomendado**: 200x200px (cuadrado)
- **Ejemplos**: `admin1.jpg`, `admin2.jpg`

### `/empresa/`
- **Propósito**: Fotos de perfil de usuarios con rol EMPRESA/RECRUITER
- **Formato recomendado**: JPG, PNG
- **Tamaño recomendado**: 200x200px (cuadrado)
- **Ejemplos**: `empresa1.jpg`, `empresa2.jpg`

### `/logos/`
- **Propósito**: Logos de empresas para mostrar en vacantes y perfiles
- **Formato recomendado**: PNG (con transparencia), SVG
- **Tamaño recomendado**: 100x100px o vectorial
- **Ejemplos**: `techcorp_logo.png`, `startup_logo.svg`

### `/vacantes/`
- **Propósito**: Imágenes relacionadas con vacantes específicas
- **Formato recomendado**: JPG, PNG
- **Tamaño recomendado**: 800x400px (banner)
- **Ejemplos**: `vacante_dev.jpg`, `vacante_design.jpg`

### `/default/`
- **Propósito**: Imágenes por defecto cuando no hay imagen específica
- **Contenido**:
  - `user_default.png` - Avatar por defecto para candidatos
  - `admin_default.png` - Avatar por defecto para administradores
  - `company_default.png` - Logo por defecto para empresas
  - `job_default.jpg` - Imagen por defecto para vacantes

## Convenciones de Nomenclatura

1. **Usuarios**: `usuario{numero}.jpg` o `{nombre_usuario}.jpg`
2. **Logos**: `{nombre_empresa}_logo.{ext}`
3. **Vacantes**: `vacante_{categoria}.jpg`
4. **Por defecto**: `{tipo}_default.{ext}`

## Acceso desde Frontend

Las imágenes se acceden mediante la URL:
```
http://127.0.0.1:5000/static/images/{categoria}/{nombre_archivo}
```

### Ejemplos de URLs:
- Foto de candidato: `http://127.0.0.1:5000/static/images/candidato/usuario1.jpg`
- Logo de empresa: `http://127.0.0.1:5000/static/images/logos/techcorp_logo.png`
- Imagen por defecto: `http://127.0.0.1:5000/static/images/default/user_default.png`

## Configuración en Base de Datos

En la tabla `Usuario`, el campo `RutaImagen` debe contener solo el nombre del archivo:
- ✅ Correcto: `usuario1.jpg`
- ❌ Incorrecto: `static/images/candidato/usuario1.jpg`

El frontend construye la URL completa basándose en el rol del usuario y la ruta almacenada.