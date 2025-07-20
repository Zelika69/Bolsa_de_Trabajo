import React, { useState } from 'react';
import './JobForm.css';

const JobForm = ({ onSubmit, setCurrentView, editJob = null }) => {
  const [formData, setFormData] = useState({
    title: editJob?.title || '',
    company: editJob?.company || '',
    location: editJob?.location || '',
    salary: editJob?.salary || '',
    type: editJob?.type || 'Tiempo completo',
    description: editJob?.description || '',
    requirements: editJob?.requirements || '',
    benefits: editJob?.benefits || '',
    experience: editJob?.experience || 'Sin experiencia',
    education: editJob?.education || 'Secundaria',
    category: editJob?.category || 'Tecnología',
    remote: editJob?.remote || false,
    urgent: editJob?.urgent || false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const jobTypes = [
    'Tiempo completo',
    'Medio tiempo',
    'Freelance',
    'Prácticas',
    'Temporal',
    'Por proyecto'
  ];

  const experienceLevels = [
    'Sin experiencia',
    '1-2 años',
    '3-5 años',
    '5-10 años',
    'Más de 10 años'
  ];

  const educationLevels = [
    'Secundaria',
    'Preparatoria',
    'Técnico',
    'Licenciatura',
    'Maestría',
    'Doctorado'
  ];

  const categories = [
    'Tecnología',
    'Diseño',
    'Marketing',
    'Ventas',
    'Administración',
    'Recursos Humanos',
    'Finanzas',
    'Educación',
    'Salud',
    'Ingeniería',
    'Otros'
  ];

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
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'La empresa es requerida';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }
    
    if (!formData.salary.trim()) {
      newErrors.salary = 'El salario es requerido';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (formData.description.length < 50) {
      newErrors.description = 'La descripción debe tener al menos 50 caracteres';
    }
    
    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Los requisitos son requeridos';
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
      onSubmit(formData);
      setSuccess(true);
      setIsLoading(false);
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        setCurrentView('jobs');
      }, 2000);
    }, 1000);
  };

  if (success) {
    return (
      <div className="job-form-container">
        <div className="success-card">
          <div className="success-icon">✅</div>
          <h2>¡Vacante {editJob ? 'Actualizada' : 'Publicada'} Exitosamente!</h2>
          <p>La vacante ha sido {editJob ? 'actualizada' : 'publicada'} correctamente.</p>
          <p>Serás redirigido en unos segundos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-form-container">
      <div className="job-form-card">
        <div className="form-header">
          <h2>{editJob ? 'Editar Vacante' : 'Publicar Nueva Vacante'}</h2>
          <p>Completa todos los campos para {editJob ? 'actualizar' : 'publicar'} la vacante</p>
        </div>
        
        <form onSubmit={handleSubmit} className="job-form">
          {/* Información Básica */}
          <div className="form-section">
            <h3>Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Título del Puesto *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="Ej: Desarrollador Frontend Senior"
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="company">Empresa *</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className={`form-input ${errors.company ? 'error' : ''}`}
                  placeholder="Nombre de la empresa"
                />
                {errors.company && <span className="error-text">{errors.company}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="location">Ubicación *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`form-input ${errors.location ? 'error' : ''}`}
                  placeholder="Ciudad, Estado"
                />
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="salary">Salario *</label>
                <input
                  type="text"
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className={`form-input ${errors.salary ? 'error' : ''}`}
                  placeholder="Ej: $25,000 - $35,000"
                />
                {errors.salary && <span className="error-text">{errors.salary}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Tipo de Empleo *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {jobTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Categoría *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Descripción y Requisitos */}
          <div className="form-section">
            <h3>Descripción y Requisitos</h3>
            
            <div className="form-group">
              <label htmlFor="description">Descripción del Puesto *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe las responsabilidades y funciones del puesto..."
                rows="4"
              />
              {errors.description && <span className="error-text">{errors.description}</span>}
              <small className="char-count">{formData.description.length} caracteres (mínimo 50)</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="requirements">Requisitos *</label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                className={`form-textarea ${errors.requirements ? 'error' : ''}`}
                placeholder="Lista los requisitos técnicos y habilidades necesarias..."
                rows="3"
              />
              {errors.requirements && <span className="error-text">{errors.requirements}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="benefits">Beneficios</label>
              <textarea
                id="benefits"
                name="benefits"
                value={formData.benefits}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Describe los beneficios que ofrece la empresa..."
                rows="3"
              />
            </div>
          </div>
          
          {/* Requisitos Adicionales */}
          <div className="form-section">
            <h3>Requisitos Adicionales</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="experience">Experiencia Requerida</label>
                <select
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="education">Educación Mínima</label>
                <select
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {educationLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="remote"
                    checked={formData.remote}
                    onChange={handleInputChange}
                  />
                  <span>Trabajo remoto disponible</span>
                </label>
              </div>
              
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleInputChange}
                  />
                  <span>Vacante urgente</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => setCurrentView('jobs')}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : (editJob ? 'Actualizar Vacante' : 'Publicar Vacante')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;