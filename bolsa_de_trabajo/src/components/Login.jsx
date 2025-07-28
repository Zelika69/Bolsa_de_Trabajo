import React, { useState } from 'react';
import './Login.css';
import { API_ENDPOINTS, handleApiError } from '../config/api';

// Función para encriptar contraseña (debe coincidir con Register.jsx)
const encryptPassword = (password) => {
  return btoa(password); // Mismo método que en Register.jsx
};

const Login = ({ onLogin, setCurrentView }) => {
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [showTwoFA, setShowTwoFA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const [tempUserData, setTempUserData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.usuario) {
      newErrors.usuario = 'El usuario/email es requerido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           usuario: formData.usuario,
           contrasena: encryptPassword(formData.password)
         })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.requiere2FA) {
          setTempUserData(data);
          setShowTwoFA(true);
          // Auto-completar código en desarrollo
          if (data.codigo_desarrollo) {
            setTwoFACode(data.codigo_desarrollo);
          }
        }
      } else {
        setErrors({ general: data.error || 'Error en el login' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión con el servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFASubmit = async (e) => {
    e.preventDefault();
    
    if (!twoFACode || twoFACode.length !== 6) {
      setErrors({ general: 'Código 2FA debe tener 6 dígitos' });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(API_ENDPOINTS.verifyTwoFA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_id: tempUserData.usuario_id,
          codigo: twoFACode
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // El backend ya devuelve el rol mapeado en el campo 'role'
        const frontendRole = data.usuario.role;
        
        // Guardar ID de usuario y tipo en localStorage
        localStorage.setItem('userId', data.usuario.id);
        localStorage.setItem('userType', frontendRole);
        
        onLogin({
          id: data.usuario.id,
          name: data.usuario.nombre,
          email: data.usuario.correo,
          role: frontendRole,
          rutaImagen: data.usuario.rutaImagen
        });
      } else {
        setErrors({ general: data.error || 'Código 2FA inválido' });
      }
    } catch (error) {
      setErrors({ general: 'Error de conexión con el servidor' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Iniciar Sesión</h2>
          <p>Accede a tu cuenta para continuar</p>
        </div>
        
        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario">Usuario/Email</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              value={formData.usuario}
              onChange={handleInputChange}
              className={`form-input ${errors.usuario ? 'error' : ''}`}
              placeholder="usuario o email"
            />
            {errors.usuario && <span className="error-text">{errors.usuario}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Tu contraseña"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Recordarme</span>
            </label>
            <a href="#" className="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>
          
          <button 
            type="submit" 
            className={`login-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        {showTwoFA && (
          <div className="two-fa-section">
            <h3>Verificación 2FA</h3>
            <p>Ingresa el código de 6 dígitos:</p>
            <form onSubmit={handleTwoFASubmit}>
              <input
                type="text"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                placeholder="123456"
                maxLength="6"
                className="form-input"
              />
              <button 
                type="submit" 
                className={`login-btn ${isLoading ? 'loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'Verificando...' : 'Verificar'}
              </button>
            </form>
          </div>
        )}
        
        <div className="login-footer">
          <p>
            ¿No tienes cuenta? 
            <button 
              type="button"
              className="link-btn"
              onClick={() => setCurrentView('register')}
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;