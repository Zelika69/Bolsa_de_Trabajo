# Pruebas de Validación de Candidatos

## Objetivo
Verificar que solo los candidatos registrados pueden aplicar a vacantes y que la lógica de validación funciona correctamente.

## Implementación Realizada

### Frontend (Home.jsx y JobListings.jsx)
- ✅ Validación de autenticación: Usuario debe estar logueado
- ✅ Validación de rol: Solo usuarios con rol 'user' (candidatos) pueden aplicar
- ✅ Validación de perfil: Usuario debe tener nombre y correo completos
- ✅ Mensajes de error específicos para cada caso

### Backend (main.py)
- ✅ Validación de usuario existente
- ✅ Validación de rol CANDIDATO en base de datos
- ✅ Validación de perfil de candidato completo
- ✅ Uso del procedimiento almacenado SP_PostularVacante para prevenir duplicados
- ✅ Manejo de errores específicos (403 para usuarios no candidatos)

## Casos de Prueba Manual

### 1. Usuario No Autenticado
**Pasos:**
1. Abrir la aplicación sin iniciar sesión
2. Intentar aplicar a una vacante

**Resultado Esperado:**
- Mensaje: "Debes iniciar sesión para aplicar a esta vacante"

### 2. Usuario Empresa (Recruiter)
**Pasos:**
1. Iniciar sesión con una cuenta de empresa (ej: techcorp_rh / techcorp123)
2. Ir a la lista de vacantes
3. Intentar aplicar a una vacante

**Resultado Esperado:**
- Mensaje: "Solo los candidatos registrados pueden aplicar a vacantes. Si eres una empresa, puedes publicar vacantes desde tu panel."

### 3. Usuario Administrador
**Pasos:**
1. Iniciar sesión con una cuenta de administrador (ej: admin_sistema / admin123)
2. Ir a la lista de vacantes
3. Intentar aplicar a una vacante

**Resultado Esperado:**
- Mensaje: "Solo los candidatos registrados pueden aplicar a vacantes. Si eres una empresa, puedes publicar vacantes desde tu panel."

### 4. Candidato con Perfil Incompleto
**Pasos:**
1. Iniciar sesión con una cuenta de candidato
2. Asegurarse de que falten datos en el perfil (nombre o correo)
3. Intentar aplicar a una vacante

**Resultado Esperado:**
- Mensaje: "Debes completar tu perfil antes de aplicar a vacantes. Ve a tu perfil para completar la información faltante."

### 5. Candidato Válido
**Pasos:**
1. Iniciar sesión con una cuenta de candidato válida (ej: maria_candidata / maria123)
2. Completar el perfil si es necesario
3. Aplicar a una vacante

**Resultado Esperado:**
- Mensaje: "¡Postulación enviada exitosamente para: [Nombre de la vacante]!"

### 6. Aplicación Duplicada
**Pasos:**
1. Como candidato válido, aplicar a una vacante
2. Intentar aplicar nuevamente a la misma vacante

**Resultado Esperado:**
- Mensaje: "Ya te has postulado a esta vacante"

## Usuarios de Prueba Disponibles

### Candidatos (Pueden aplicar)
- **maria_candidata** / maria123
- **carlos_dev** / carlos456
- **ana_designer** / ana789

### Empresas (No pueden aplicar)
- **techcorp_rh** / techcorp123
- **startup_hiring** / startup456
- **consultora_jobs** / consultora789

### Administradores (No pueden aplicar)
- **admin_sistema** / admin123
- **super_admin** / superadmin456

## Validaciones Implementadas

### Nivel Frontend
1. **Autenticación**: Verificar que el usuario esté logueado
2. **Autorización**: Verificar que el rol sea 'user' (candidato)
3. **Perfil**: Verificar que tenga datos básicos completos

### Nivel Backend
1. **Usuario Existente**: Verificar que el ID de usuario existe
2. **Rol de Base de Datos**: Verificar que el rol sea 'CANDIDATO'
3. **Perfil de Candidato**: Verificar que exista registro en tabla Candidatos
4. **Duplicados**: Usar SP_PostularVacante para prevenir aplicaciones duplicadas
5. **Vacante Válida**: Verificar que la vacante existe y está abierta

## Arquitectura de Seguridad

```
Frontend (React)
├── Validación de autenticación
├── Validación de rol de usuario
├── Validación de perfil completo
└── Mensajes de error específicos

Backend (Flask)
├── Validación de usuario existente
├── Validación de rol en base de datos
├── Validación de perfil de candidato
├── Procedimiento almacenado para duplicados
└── Códigos de error HTTP apropiados

Base de Datos (SQL Server)
├── Restricción única en Postulaciones
├── Procedimiento SP_PostularVacante
├── Roles de usuario definidos
└── Tablas relacionadas correctamente
```

## Notas Importantes

- La validación se realiza tanto en frontend como backend para máxima seguridad
- Los mensajes de error son específicos y ayudan al usuario a entender qué hacer
- El sistema previene aplicaciones duplicadas a nivel de base de datos
- Solo candidatos con perfil completo pueden aplicar
- Las empresas y administradores reciben mensajes apropiados para su rol