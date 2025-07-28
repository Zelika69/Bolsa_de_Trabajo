# Configuración para Acceso desde Múltiples Dispositivos

## Cambios Implementados

### 1. Configuración Centralizada de API

Se creó el archivo `src/config/api.js` que:
- Detecta automáticamente la IP del servidor
- Centraliza todas las URLs de la API
- Maneja errores de conexión de forma consistente
- Se adapta automáticamente al entorno (desarrollo/producción)

### 2. Actualizaciones en Componentes

Todos los componentes ahora usan la configuración centralizada:
- ✅ `Login.jsx` - Autenticación y 2FA
- ✅ `Register.jsx` - Registro de usuarios
- ✅ `ProfileRouter.jsx` - Enrutamiento de perfiles
- ✅ `ProfileCandidate.jsx` - Perfil de candidatos
- ✅ `ProfileCompany.jsx` - Perfil de empresas
- ✅ `Navbar.jsx` - Imágenes de usuario

### 3. Configuración de Servidores

#### Frontend (Vite)
- ✅ `vite.config.js` configurado con `host: '0.0.0.0'`
- ✅ Nuevo script `npm run dev:network` para acceso en red
- ✅ Puerto fijo 5173 con `strictPort: true`

#### Backend (Flask)
- ✅ CORS configurado para permitir múltiples orígenes
- ✅ Servidor ejecutándose en `host='0.0.0.0'`
- ✅ Manejo mejorado de archivos estáticos

## Cómo Usar

### Opción 1: Inicio Rápido (Recomendado)

1. **Iniciar el servidor Flask:**
   ```bash
   cd server-flask
   python main.py
   ```

2. **Iniciar el servidor Vite para red:**
   ```bash
   cd bolsa_de_trabajo
   npm run dev:network
   ```

3. **Obtener tu IP local:**
   ```bash
   ipconfig  # Windows
   ifconfig  # macOS/Linux
   ```

4. **Acceder desde otros dispositivos:**
   - URL: `http://[TU_IP_LOCAL]:5173`
   - Ejemplo: `http://192.168.1.100:5173`

### Opción 2: Configuración Manual

Si prefieres usar `npm run dev` normal:

1. El sistema detectará automáticamente si estás accediendo desde otra IP
2. Las llamadas API se ajustarán automáticamente
3. No necesitas cambiar nada en el código

## Configuración de Firewall

### Windows (Requerido)

Ejecuta PowerShell como Administrador:

```powershell
# Permitir Flask Server (puerto 5000)
netsh advfirewall firewall add rule name="Flask Server Port 5000" dir=in action=allow protocol=TCP localport=5000

# Permitir Vite Server (puerto 5173)
netsh advfirewall firewall add rule name="Vite Dev Server Port 5173" dir=in action=allow protocol=TCP localport=5173
```

### Verificar Configuración

```bash
# Verificar que los puertos estén abiertos
netstat -ano | findstr :5000
netstat -ano | findstr :5173
```

## Solución de Problemas

### 1. No puedo acceder desde otro dispositivo

**Verificar:**
- ✅ Ambos dispositivos en la misma red Wi-Fi
- ✅ Firewall configurado correctamente
- ✅ Servidores ejecutándose
- ✅ IP correcta (usar `ipconfig`)

### 2. Error de CORS

**Solución:**
- El servidor Flask ya está configurado para permitir todos los orígenes
- Si persiste, reinicia el servidor Flask

### 3. Imágenes no cargan

**Solución:**
- Las URLs de imágenes se ajustan automáticamente
- Verifica que el servidor Flask esté ejecutándose
- Revisa la consola del navegador para errores específicos

### 4. API calls fallan

**Debug:**
- Abre la consola del navegador
- Busca el mensaje: "🔧 Configuración de API"
- Verifica que la `baseURL` sea correcta

## Características Técnicas

### Detección Automática de IP

El sistema detecta automáticamente:
- Si estás en `localhost` → usa `http://localhost:5000`
- Si estás en otra IP → usa `http://[IP_ACTUAL]:5000`
- En producción → usa `REACT_APP_API_URL`

### Manejo de Errores

Todos los componentes usan `handleApiError()` para:
- Mostrar mensajes de error consistentes
- Diferenciar entre errores de red y servidor
- Proporcionar información útil para debugging

### Scripts Disponibles

```bash
# Desarrollo normal (solo localhost)
npm run dev

# Desarrollo con acceso en red
npm run dev:network

# Construcción para producción
npm run build

# Vista previa de producción
npm run preview
```

## Variables de Entorno (Opcional)

Para producción, puedes configurar:

```env
# .env
REACT_APP_API_URL=http://tu-servidor-produccion.com:5000
```

## Notas de Seguridad

⚠️ **Importante para Producción:**
- Cambiar CORS de `"*"` a dominios específicos
- Usar HTTPS en lugar de HTTP
- Configurar variables de entorno apropiadas
- Nunca usar `debug=True` en Flask

## Estructura de Archivos Modificados

```
bolsa_de_trabajo/
├── src/
│   ├── config/
│   │   └── api.js              # ✨ NUEVO - Configuración centralizada
│   └── components/
│       ├── Login.jsx           # ✅ Actualizado
│       ├── Register.jsx        # ✅ Actualizado
│       ├── ProfileRouter.jsx   # ✅ Actualizado
│       ├── ProfileCandidate.jsx # ✅ Actualizado
│       ├── ProfileCompany.jsx  # ✅ Actualizado
│       └── Navbar.jsx          # ✅ Actualizado
├── package.json                # ✅ Nuevo script dev:network
└── vite.config.js              # ✅ Configurado para red

server-flask/
└── main.py                     # ✅ CORS mejorado
```

¡Tu aplicación ahora está lista para ser utilizada desde múltiples dispositivos en la red! 🚀