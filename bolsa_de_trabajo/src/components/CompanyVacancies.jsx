import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './CompanyVacancies.css';

const CompanyVacancies = ({ companyId }) => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null);
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

  useEffect(() => {
    fetchVacancies();
  }, [companyId]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

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
        setSuccess(editingVacancy ? 'Vacante actualizada correctamente' : 'Vacante creada correctamente');
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
        setSuccess('Vacante eliminada correctamente');
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
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="titulo">Título del Puesto *</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="ubicacion">Ubicación *</label>
                  <input
                    type="text"
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="requisitos">Requisitos *</label>
                <textarea
                  id="requisitos"
                  name="requisitos"
                  value={formData.requisitos}
                  onChange={handleInputChange}
                  rows="3"
                  required
                />
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
                    min="0"
                    required
                  />
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
                  />
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