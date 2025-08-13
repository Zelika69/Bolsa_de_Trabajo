import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { showSuccessNotification } from '../utils/errorHandler';
import './CompanyVacancies.css';

const CompanyVacancies = ({ companyId }) => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    salario: '',
    tipoContrato: 'Tiempo Completo',
    ubicacion: '',
    fechaCierre: '',
    estado: 'Abierta'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchVacancies();
    fetchCompanyInfo();
  }, [companyId]);

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.getCompanyProfile(companyId));
      if (response.ok) {
        const data = await response.json();
        setCompanyInfo(data);
      } else {
        console.error('Error al cargar información de la empresa');
      }
    } catch (err) {
      console.error('Error de conexión al cargar empresa:', err);
    }
  };

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getCompanyVacantes(companyId));
      if (response.ok) {
        const data = await response.json();
        setVacancies(data);
      } else {
        setError('Error al cargar las vacantes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const validateField = (name, value) => {
    const errors = {};
    
    // Límites basados en el esquema de la base de datos
    const limits = {
      titulo: 100,        // VARCHAR(100)
      ubicacion: 50,      // VARCHAR(50)
      tipoContrato: 50,   // VARCHAR(50)
      salario: 999999999, // MONEY (máximo valor razonable)
      descripcion: 8000,  // TEXT (límite razonable)
      requisitos: 8000    // TEXT (límite razonable)
    };
    
    // Validaciones de longitud
    if (limits[name] && value.length > limits[name]) {
      errors[name] = `Máximo ${limits[name]} caracteres`;
    }
    
    // Validaciones específicas
    switch (name) {
      case 'titulo':
        if (!value.trim()) {
          errors[name] = 'El título es requerido';
        } else if (value.trim().length < 3) {
          errors[name] = 'El título debe tener al menos 3 caracteres';
        }
        break;
      case 'descripcion':
        if (!value.trim()) {
          errors[name] = 'La descripción es requerida';
        } else if (value.trim().length < 50) {
          errors[name] = 'La descripción debe tener al menos 50 caracteres';
        }
        break;
      case 'requisitos':
        if (!value.trim()) {
          errors[name] = 'Los requisitos son requeridos';
        } else if (value.trim().length < 20) {
          errors[name] = 'Los requisitos deben tener al menos 20 caracteres';
        }
        break;
      case 'ubicacion':
        if (!value.trim()) {
          errors[name] = 'La ubicación es requerida';
        }
        break;
      case 'salario':
        if (!value || value <= 0) {
          errors[name] = 'El salario debe ser mayor a 0';
        } else if (value > limits.salario) {
          errors[name] = 'El salario excede el límite máximo';
        }
        break;
      case 'fechaCierre':
        if (value) {
          const today = new Date().toISOString().split('T')[0];
          if (value < today) {
            errors[name] = 'La fecha de cierre debe ser hoy o una fecha futura';
          }
        }
        break;
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Aplicar límites de caracteres en tiempo real
    const limits = {
      titulo: 100,
      ubicacion: 50,
      tipoContrato: 50,
      descripcion: 8000,
      requisitos: 8000
    };
    
    let newValue = value;
    if (limits[name] && value.length > limits[name]) {
      newValue = value.substring(0, limits[name]);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Validar campo y actualizar errores
    const fieldErrors = validateField(name, newValue);
    setValidationErrors(prev => ({
      ...prev,
      [name]: fieldErrors[name] || ''
    }));
  };

  const validateForm = () => {
    const errors = {};
    const requiredFields = ['titulo', 'descripcion', 'requisitos', 'ubicacion', 'salario'];
    
    requiredFields.forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      if (fieldErrors[field]) {
        errors[field] = fieldErrors[field];
      }
    });
    
    // Validación de fecha de cierre
    if (formData.fechaCierre) {
      const today = new Date();
      const closeDate = new Date(formData.fechaCierre);
      if (closeDate <= today) {
        errors.fechaCierre = 'La fecha de cierre debe ser posterior a hoy';
      }
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validar formulario completo
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setError('Por favor corrige los errores en el formulario');
      return;
    }
    
    setValidationErrors({});

    try {
      const url = editingVacancy 
        ? API_ENDPOINTS.updateVacante(companyId, editingVacancy.id)
        : API_ENDPOINTS.createVacante(companyId);
      
      const method = editingVacancy ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSuccessNotification(editingVacancy ? 'Vacante actualizada correctamente' : 'Vacante creada correctamente', setSuccess);
        resetForm();
        fetchVacancies();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al procesar la solicitud');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (vacancy) => {
    setEditingVacancy(vacancy);
    setFormData({
      titulo: vacancy.titulo || '',
      descripcion: vacancy.descripcion || '',
      requisitos: vacancy.requisitos || '',
      salario: vacancy.salario ? vacancy.salario.toString() : '',
      tipoContrato: vacancy.tipoContrato || 'Tiempo Completo',
      ubicacion: vacancy.ubicacion || '',
      fechaCierre: vacancy.fechaCierre ? vacancy.fechaCierre.split('T')[0] : '',
      estado: vacancy.estado || 'Abierta'
    });
    setShowForm(true);
  };

  const handleDelete = async (vacancyId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta vacante?')) {
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.deleteVacante(companyId, vacancyId), {
        method: 'DELETE'
      });

      if (response.ok) {
        showSuccessNotification('Vacante eliminada correctamente', setSuccess);
        fetchVacancies();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar la vacante');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      requisitos: '',
      salario: '',
      tipoContrato: 'Tiempo Completo',
      ubicacion: '',
      fechaCierre: '',
      estado: 'Abierta'
    });
    setEditingVacancy(null);
    setShowForm(false);
    setValidationErrors({});
    setError('');
    setSuccess('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(salary);
  };

  if (loading) {
    return (
      <div className="company-vacancies">
        <div className="loading">Cargando vacantes...</div>
      </div>
    );
  }

  return (
    <div className="company-vacancies">
      <div className="vacancies-header">
        <h2>Gestión de Vacantes</h2>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nueva Vacante
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingVacancy ? 'Editar Vacante' : 'Nueva Vacante'}</h3>
              <button className="close-btn" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="vacancy-form">
              {/* Información de la empresa (solo lectura) */}
              {companyInfo && (
                <div className="company-info-section">
                  <h4>Información de la Empresa</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Empresa</label>
                      <input
                        type="text"
                        value={companyInfo.nombre || 'Empresa no especificada'}
                        disabled
                        className="form-input-disabled"
                      />
                    </div>
                    <div className="form-group">
                      <label>RFC</label>
                      <input
                        type="text"
                        value={companyInfo.rfc || 'No especificado'}
                        disabled
                        className="form-input-disabled"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="titulo">Título del Puesto *</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className={validationErrors.titulo ? 'error' : ''}
                    placeholder="Ej: Desarrollador Frontend Senior"
                    required
                  />
                  <small className="char-count">{formData.titulo.length}/100 caracteres</small>
                  {validationErrors.titulo && (
                    <span className="error-text">{validationErrors.titulo}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="ubicacion">Ubicación *</label>
                  <input
                    type="text"
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    className={validationErrors.ubicacion ? 'error' : ''}
                    placeholder="Ej: Ciudad de México, CDMX"
                    required
                  />
                  <small className="char-count">{formData.ubicacion.length}/50 caracteres</small>
                  {validationErrors.ubicacion && (
                    <span className="error-text">{validationErrors.ubicacion}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className={validationErrors.descripcion ? 'error' : ''}
                  placeholder="Describe las responsabilidades, funciones y objetivos del puesto..."
                  rows="4"
                  required
                />
                <small className="char-count">{formData.descripcion.length}/8000 caracteres (mínimo 50)</small>
                {validationErrors.descripcion && (
                  <span className="error-text">{validationErrors.descripcion}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="requisitos">Requisitos *</label>
                <textarea
                  id="requisitos"
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleInputChange}
                  className={validationErrors.requisitos ? 'error' : ''}
                  placeholder="Lista los requisitos técnicos, habilidades, experiencia y conocimientos necesarios..."
                  rows="3"
                  required
                />
                <small className="char-count">{formData.requisitos.length}/8000 caracteres (mínimo 20)</small>
                {validationErrors.requisitos && (
                  <span className="error-text">{validationErrors.requisitos}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="salario">Salario (MXN) *</label>
                  <input
                    type="number"
                    id="salario"
                    name="salario"
                    value={formData.salario}
                    onChange={handleInputChange}
                    className={validationErrors.salario ? 'error' : ''}
                    placeholder="Ej: 25000"
                    min="1"
                    max="999999999"
                    required
                  />
                  {validationErrors.salario && (
                    <span className="error-text">{validationErrors.salario}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="tipoContrato">Tipo de Contrato *</label>
                  <select
                    id="tipoContrato"
                    name="tipoContrato"
                    value={formData.tipoContrato}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Tiempo Completo">Tiempo Completo</option>
                    <option value="Medio Tiempo">Medio Tiempo</option>
                    <option value="Por Proyecto">Por Proyecto</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Prácticas">Prácticas</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fechaCierre">Fecha de Cierre</label>
                  <input
                    type="date"
                    id="fechaCierre"
                    name="fechaCierre"
                    value={formData.fechaCierre}
                    onChange={handleInputChange}
                    className={validationErrors.fechaCierre ? 'error' : ''}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {validationErrors.fechaCierre && (
                    <span className="error-text">{validationErrors.fechaCierre}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="estado">Estado *</label>
                  <select
                    id="estado"
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Abierta">Abierta</option>
                    <option value="Cerrada">Cerrada</option>
                    <option value="Pausada">Pausada</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingVacancy ? 'Actualizar' : 'Crear'} Vacante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="vacancies-list">
        {vacancies.length === 0 ? (
          <div className="no-vacancies">
            <p>No tienes vacantes publicadas aún.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              Crear tu primera vacante
            </button>
          </div>
        ) : (
          <div className="vacancies-grid">
            {vacancies.map(vacancy => (
              <div key={vacancy.id} className="vacancy-card">
                <div className="vacancy-header">
                  <h3>{vacancy.titulo}</h3>
                  <div className="vacancy-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(vacancy)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(vacancy.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                
                <div className="vacancy-info">
                  <div className="info-item">
                    <span className="label">📍 Ubicación:</span>
                    <span>{vacancy.ubicacion}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">💰 Salario:</span>
                    <span>{formatSalary(vacancy.salario)}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">📋 Tipo:</span>
                    <span>{vacancy.tipoContrato}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">📅 Publicado:</span>
                    <span>{formatDate(vacancy.fechaPublicacion)}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">⏰ Cierre:</span>
                    <span>{formatDate(vacancy.fechaCierre)}</span>
                  </div>
                  
                  <div className="info-item">
                    <span className="label">👥 Postulaciones:</span>
                    <span>{vacancy.cantidadPostulaciones}</span>
                  </div>
                </div>
                
                <div className="vacancy-description">
                  <p>{vacancy.descripcion.length > 150 
                    ? `${vacancy.descripcion.substring(0, 150)}...` 
                    : vacancy.descripcion
                  }</p>
                </div>
                
                <div className="vacancy-footer">
                  <span className={`status-badge status-${vacancy.estado.toLowerCase()}`}>
                    {vacancy.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyVacancies;