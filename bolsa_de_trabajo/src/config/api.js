// Configuración de API para manejar URLs dinámicas

// Función para obtener la IP local del servidor
const getServerIP = () => {
  // En desarrollo, intentar detectar la IP automáticamente
  if (process.env.NODE_ENV === 'development') {
    // Usar la IP que Vite detecta automáticamente
    const hostname = window.location.hostname;
    
    // Si estamos en localhost, usar localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // Si estamos accediendo desde otra IP, usar esa misma IP para el backend
    return `http://${hostname}:5000`;
  }
  
  // En producción, usar la URL configurada
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// URL base de la API
export const API_BASE_URL = getServerIP();

// URLs específicas de la API
export const API_ENDPOINTS = {
  // Autenticación
  login: `${API_BASE_URL}/api/login`,
  verifyTwoFA: `${API_BASE_URL}/api/verify-2fa`,
  register: `${API_BASE_URL}/api/register`,
  
  // Usuarios
  getUser: (userId) => `${API_BASE_URL}/api/usuarios/${userId}`,
  
  // Candidatos
  getCandidateProfile: (userId) => `${API_BASE_URL}/api/candidato/profile/${userId}`,
  updateCandidateProfile: (userId) => `${API_BASE_URL}/api/candidato/profile/${userId}`,
  uploadCV: (userId) => `${API_BASE_URL}/api/candidato/upload-cv/${userId}`,
  
  // Empresas
  getCompanyProfile: (userId) => `${API_BASE_URL}/api/empresa/profile/${userId}`,
  updateCompanyProfile: (userId) => `${API_BASE_URL}/api/empresa/profile/${userId}`,
  
  // Archivos estáticos
  getStaticFile: (path) => `${API_BASE_URL}${path}`,
  getUserImage: (userType, imageName) => `${API_BASE_URL}/static/images/${userType}/${imageName}`,
  getDefaultImage: (userRole) => {
    const imageMap = {
      admin: 'admin_default.svg',
      recruiter: 'company_default.svg',
      user: 'user_default.svg'
    };
    return `${API_BASE_URL}/static/images/default/${imageMap[userRole] || 'user_default.svg'}`;
  }
};

// Configuración de Axios por defecto
export const axiosConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Función helper para manejar errores de API
export const handleApiError = (error) => {
  if (error.response) {
    // El servidor respondió con un código de estado diferente de 2xx
    return error.response.data?.error || 
           `Error ${error.response.status}: ${error.response.statusText}`;
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  } else {
    // Algo pasó al configurar la solicitud
    return error.message || 'Error desconocido';
  }
};

// Debug: mostrar configuración en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configuración de API:', {
    baseURL: API_BASE_URL,
    hostname: window.location.hostname,
    environment: process.env.NODE_ENV
  });
}