// Utilidad para manejo centralizado de errores

/**
 * Maneja errores de API y devuelve mensajes amigables para el usuario
 * @param {Error|Object} error - Error capturado
 * @param {string} defaultMessage - Mensaje por defecto si no se puede determinar el error
 * @returns {string} Mensaje de error amigable para el usuario
 */
export const handleError = (error, defaultMessage = 'Ha ocurrido un error inesperado') => {
  // Si es un error de red (fetch)
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }
  
  // Si es un error de respuesta HTTP
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    switch (status) {
      case 400:
        return data?.error || 'Los datos enviados no son válidos';
      case 401:
        return 'No tienes autorización para realizar esta acción';
      case 403:
        return 'No tienes permisos para acceder a este recurso';
      case 404:
        return 'El recurso solicitado no fue encontrado';
      case 409:
        return data?.error || 'Ya existe un registro con estos datos';
      case 422:
        return data?.error || 'Los datos proporcionados no son válidos';
      case 500:
        return 'Error interno del servidor. Inténtalo más tarde';
      case 503:
        return 'El servicio no está disponible temporalmente';
      default:
        return data?.error || `Error del servidor (${status})`;
    }
  }
  
  // Si es un error con mensaje personalizado
  if (error.message) {
    return error.message;
  }
  
  // Si es un string
  if (typeof error === 'string') {
    return error;
  }
  
  // Mensaje por defecto
  return defaultMessage;
};

/**
 * Valida si un valor es nulo, indefinido o vacío
 * @param {any} value - Valor a validar
 * @param {string} fallback - Valor de respaldo
 * @returns {string} Valor validado o fallback
 */
export const safeValue = (value, fallback = 'No disponible') => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  return value;
};

/**
 * Valida y formatea nombres de usuario
 * @param {Object} user - Objeto usuario
 * @returns {string} Nombre formateado
 */
export const formatUserName = (user) => {
  if (!user) return 'Usuario';
  
  // Prioridad: nombre completo > nombre > nombreUsuario > Usuario
  if (user.nombre && user.apellido) {
    return `${user.nombre} ${user.apellido}`;
  }
  
  if (user.nombre) {
    return user.nombre;
  }
  
  if (user.nombreUsuario) {
    return user.nombreUsuario;
  }
  
  return 'Usuario';
};

/**
 * Maneja errores de formularios y devuelve mensajes específicos
 * @param {Object} errors - Objeto de errores de validación
 * @returns {Object} Errores formateados
 */
export const formatFormErrors = (errors) => {
  const formattedErrors = {};
  
  Object.keys(errors).forEach(field => {
    const error = errors[field];
    
    if (Array.isArray(error)) {
      formattedErrors[field] = error[0]; // Tomar el primer error
    } else if (typeof error === 'string') {
      formattedErrors[field] = error;
    } else {
      formattedErrors[field] = 'Campo inválido';
    }
  });
  
  return formattedErrors;
};

/**
 * Muestra notificaciones de error de forma controlada
 * @param {string} message - Mensaje de error
 * @param {Function} setError - Función para establecer el error
 * @param {number} duration - Duración en milisegundos (por defecto 5000)
 */
export const showErrorNotification = (message, setError, duration = 5000) => {
  setError(message);
  
  setTimeout(() => {
    setError('');
  }, duration);
};

/**
 * Muestra notificaciones de éxito de forma controlada
 * @param {string} message - Mensaje de éxito
 * @param {Function} setSuccess - Función para establecer el éxito
 * @param {number} duration - Duración en milisegundos (por defecto 3000)
 */
export const showSuccessNotification = (message, setSuccess, duration = 3000) => {
  setSuccess(message);
  
  setTimeout(() => {
    setSuccess('');
  }, duration);
};

/**
 * Valida campos requeridos y devuelve errores
 * @param {Object} data - Datos a validar
 * @param {Array} requiredFields - Campos requeridos
 * @returns {Object} Errores de validación
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  
  requiredFields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && !value.trim())) {
      errors[field] = `Este campo es requerido`;
    }
  });
  
  return errors;
};

/**
 * Previene que se muestren errores técnicos en producción
 * @param {Error} error - Error capturado
 * @param {string} userMessage - Mensaje para mostrar al usuario
 */
export const logError = (error, userMessage = 'Error interno') => {
  // En desarrollo, mostrar el error completo
  if (process.env.NODE_ENV === 'development') {
    console.error('Error detallado:', error);
  } else {
    // En producción, solo log básico
    console.error('Error:', userMessage);
  }
};

/**
 * Wrapper para operaciones async que maneja errores automáticamente
 * @param {Function} asyncOperation - Operación asíncrona
 * @param {Function} setError - Función para establecer errores
 * @param {Function} setLoading - Función para establecer loading
 * @param {string} errorMessage - Mensaje de error personalizado
 */
export const withErrorHandling = async (asyncOperation, setError, setLoading, errorMessage) => {
  try {
    if (setLoading) setLoading(true);
    setError('');
    
    const result = await asyncOperation();
    return result;
  } catch (error) {
    const message = handleError(error, errorMessage);
    setError(message);
    logError(error, message);
    throw error; // Re-throw para que el componente pueda manejar si es necesario
  } finally {
    if (setLoading) setLoading(false);
  }
};