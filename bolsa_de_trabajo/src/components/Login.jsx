import React, { useState } from 'react';
import './Login.css';

const Login = ({ onLogin, setCurrentView }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Usuarios de ejemplo para demostración
  const demoUsers = [
    { email: 'admin@bolsatrabajo.com', password: 'admin123', name: 'Administrador', role: 'admin' },
    { email: 'recruiter@empresa.com', password: 'recruiter123', name: 'Reclutador', role: 'recruiter' },
    { email: 'usuario@email.com', password: 'user123', name: 'Usuario', role: 'user' }
  ];

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
    
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
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
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Simular llamada a API
    setTimeout(() => {
      const user = demoUsers.find(
        u => u.email === formData.email && u.password === formData.password
      );
      
      if (user) {
        onLogin({
          id: Date.now(),
          name: user.name,
          email: user.email,
          role: user.role
        });
      } else {
        setErrors({ general: 'Email o contraseña incorrectos' });
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const fillDemoCredentials = (userType) => {
    const user = demoUsers.find(u => u.role === userType);
    if (user) {
      setFormData({
        email: user.email,
        password: user.password
      });
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="tu@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
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
        
        <div className="demo-section">
          <p className="demo-title">Cuentas de demostración:</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="demo-btn admin"
              onClick={() => fillDemoCredentials('admin')}
            >
              Admin
            </button>
            <button 
              type="button" 
              className="demo-btn recruiter"
              onClick={() => fillDemoCredentials('recruiter')}
            >
              Reclutador
            </button>
            <button 
              type="button" 
              className="demo-btn user"
              onClick={() => fillDemoCredentials('user')}
            >
              Usuario
            </button>
          </div>
        </div>
        
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