import React, { useState } from 'react';
import './Register.css';
import axios from 'axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';




const Register = ({ setCurrentView }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'user',
    company: '',
    nombreUsuario: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Limpiar error del servidor cuando se modifique cualquier campo
    if (errors.server) {
      setErrors(prev => ({
        ...prev,
        server: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es requerido';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es requerido';
    }
    
    if (!formData.nombreUsuario.trim()) {
      newErrors.nombreUsuario = 'El nombre de usuario es requerido';
    }
    
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
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^[0-9+\s]+$/.test(formData.phone)) {
      newErrors.phone = 'Teléfono no válido';
    }
    
    if (formData.userType === 'recruiter' && !formData.company.trim()) {
      newErrors.company = 'El nombre de la empresa es requerido para reclutadores';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }
    
    return newErrors;
  };

  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    try {
    // Preparar datos exactamente como los espera el backend
    const dataToSend = {
      nombreUsuario: formData.nombreUsuario,
      correo: formData.email,
            contrasena: formData.password,
      userType: formData.userType,
      // Campos para candidato
      nombreCandidato: formData.firstName,
      apellidoCandidato: formData.lastName,
      telefonoCandidato: formData.phone,
      // Campos para empresa
      nombreEmpresa: formData.company,
      telefonoEmpresa: formData.phone // Mismo teléfono para empresa
      };
      
      // Llamada a la API de registro
      const response = await axios.post(API_ENDPOINTS.register, dataToSend);
      
      if (response.status === 201) {
        // Guardar ID de usuario y tipo en localStorage para uso posterior
        localStorage.setItem('userId', response.data.usuario_id);
        localStorage.setItem('userType', formData.userType);
        
        setSuccess(true);
        
        // Obtener mensaje personalizado del backend
        const mainMessage = '¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.';
        const detailMessage = response.data.detail || '';
        
        // Mostrar mensaje de éxito con detalles adicionales
        setSuccessMessage(`${mainMessage}\n${detailMessage}`);
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          // Redirigir al login para que el usuario pueda iniciar sesión
          setCurrentView('login');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        // Mostrar error del servidor
        setErrors(prev => ({
          ...prev,
          server: error.response.data.error
        }));
      } else if (error.request) {
        // Error de conexión (no hubo respuesta)
        setErrors(prev => ({
          ...prev,
          server: 'No se pudo conectar al servidor. Inténtalo de nuevo más tarde.'
        }));
      } else {
        // Error genérico
        setErrors(prev => ({
          ...prev,
          server: 'Error al crear la cuenta. Inténtalo de nuevo más tarde.'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>¡Registro Exitoso!</h2>
          <p>{successMessage || 'Tu cuenta ha sido creada correctamente.'}</p>
          <p>Serás redirigido al login en unos segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h2>Crear Cuenta</h2>
          <p>Únete a nuestra plataforma de empleos</p>
        </div>
        
        <form onSubmit={handleSubmit} className="register-form">
          {errors.server && (
            <div className="error-banner">
              <span className="error-text">{errors.server}</span>
            </div>
          )}
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">Nombre *</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`form-input ${errors.firstName ? 'error' : ''}`}
                placeholder="Tu nombre"
              />
              {errors.firstName && <span className="error-text">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Apellido *</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`form-input ${errors.lastName ? 'error' : ''}`}
                placeholder="Tu apellido"
              />
              {errors.lastName && <span className="error-text">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="nombreUsuario">Nombre de Usuario *</label>
            <input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleInputChange}
              className={`form-input ${errors.nombreUsuario ? 'error' : ''}`}
              placeholder="Nombre de usuario único"
            />
            {errors.nombreUsuario && <span className="error-text">{errors.nombreUsuario}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
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
            <label htmlFor="phone">Teléfono *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="+52 123 456 7890"
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Contraseña *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Contraseña *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repite tu contraseña"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="userType">Tipo de Usuario *</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="user">Candidato</option>
              <option value="recruiter">Reclutador/Empresa</option>
            </select>
          </div>
          
          {formData.userType === 'recruiter' && (
            <div className="form-group">
              <label htmlFor="company">Empresa *</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={`form-input ${errors.company ? 'error' : ''}`}
                placeholder="Nombre de tu empresa"
              />
              {errors.company && <span className="error-text">{errors.company}</span>}
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleInputChange}
                className={errors.acceptTerms ? 'error' : ''}
              />
              <span>
                Acepto los <a href="#" className="link">términos y condiciones</a> y la 
                <a href="#" className="link"> política de privacidad</a>
              </span>
            </label>
            {errors.acceptTerms && <span className="error-text">{errors.acceptTerms}</span>}
          </div>
          
          <button 
            type="submit" 
            className={`register-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Creando cuenta...
              </>
            ) : 'Crear Cuenta'}
          </button>
        </form>
        
        <div className="register-footer">
          <p>
            ¿Ya tienes cuenta? 
            <button 
              type="button"
              className="link-btn"
              onClick={() => setCurrentView('login')}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;