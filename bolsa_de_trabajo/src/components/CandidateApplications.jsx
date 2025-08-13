import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './CandidateApplications.css';

const CandidateApplications = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.getCandidateApplications(user.id));
      setApplications(response.data);
      setError('');
    } catch (error) {
      console.error('Error al obtener aplicaciones:', error);
      setError('Error al cargar las aplicaciones');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatSalary = (salary) => {
    if (!salary || salary === 0) return 'No especificado';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(salary);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return '#ffa500';
      case 'aceptado':
        return '#28a745';
      case 'rechazado':
        return '#dc3545';
      case 'en revisión':
        return '#007bff';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pendiente':
        return '⏳';
      case 'aceptado':
        return '✅';
      case 'rechazado':
        return '❌';
      case 'en revisión':
        return '👀';
      default:
        return '❓';
    }
  };

  const openApplicationModal = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = filterStatus === 'all' || app.estado.toLowerCase() === filterStatus;
    const matchesSearch = 
      app.vacante.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.vacante.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getApplicationStats = () => {
    const total = applications.length;
    const pendientes = applications.filter(app => app.estado.toLowerCase() === 'pendiente').length;
    const aceptadas = applications.filter(app => app.estado.toLowerCase() === 'aceptado').length;
    const rechazadas = applications.filter(app => app.estado.toLowerCase() === 'rechazado').length;
    const enRevision = applications.filter(app => app.estado.toLowerCase() === 'en revisión').length;
    
    return { total, pendientes, aceptadas, rechazadas, enRevision };
  };

  const stats = getApplicationStats();

  if (loading) {
    return (
      <div className="candidate-applications">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tus aplicaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-applications">
      <div className="applications-header">
        <h2>Mis Aplicaciones</h2>
        <button 
          className="refresh-btn"
          onClick={fetchApplications}
          disabled={loading}
        >
          🔄 Actualizar
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.total}</h3>
            <p>Total de Aplicaciones</p>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendientes}</h3>
            <p>Pendientes</p>
          </div>
        </div>
        
        <div className="stat-card accepted">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.aceptadas}</h3>
            <p>Aceptadas</p>
          </div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <h3>{stats.rechazadas}</h3>
            <p>Rechazadas</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-filter">
          <input
            type="text"
            placeholder="Buscar por empresa, puesto o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="status-filter">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-select"
          >
            <option value="all">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
            <option value="en revisión">En Revisión</option>
          </select>
        </div>
      </div>

      {/* Lista de aplicaciones */}
      {filteredApplications.length === 0 ? (
        <div className="no-applications">
          {applications.length === 0 ? (
            <>
              <div className="no-applications-icon">📝</div>
              <h3>No tienes aplicaciones aún</h3>
              <p>Cuando apliques a vacantes, aparecerán aquí.</p>
            </>
          ) : (
            <>
              <div className="no-applications-icon">🔍</div>
              <h3>No se encontraron aplicaciones</h3>
              <p>Intenta ajustar los filtros de búsqueda.</p>
            </>
          )}
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="job-info">
                  <h3>{application.vacante.titulo}</h3>
                  <p className="company-name">{application.empresa.nombre}</p>
                  <p className="location">{application.vacante.ubicacion}</p>
                </div>
                <div 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(application.estado) }}
                >
                  {getStatusIcon(application.estado)} {application.estado}
                </div>
              </div>

              <div className="application-details">
                <div className="detail-item">
                  <span className="label">Salario:</span>
                  <span className="value">{formatSalary(application.vacante.salario)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Tipo:</span>
                  <span className="value">{application.vacante.tipoEmpleo}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Aplicado:</span>
                  <span className="value">{formatDate(application.fechaPostulacion)}</span>
                </div>
              </div>

              <div className="application-actions">
                <button 
                  className="btn-view-details"
                  onClick={() => openApplicationModal(application)}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Aplicación</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="application-details-modal">
                <div className="detail-section">
                  <h3>Información del Puesto</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Título:</span>
                      <span className="value">{selectedApplication.vacante.titulo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Empresa:</span>
                      <span className="value">{selectedApplication.empresa.nombre}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Ubicación:</span>
                      <span className="value">{selectedApplication.vacante.ubicacion}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Salario:</span>
                      <span className="value">{formatSalary(selectedApplication.vacante.salario)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Tipo de Empleo:</span>
                      <span className="value">{selectedApplication.vacante.tipoEmpleo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Estado:</span>
                      <span 
                        className="value status-value"
                        style={{ color: getStatusColor(selectedApplication.estado) }}
                      >
                        {getStatusIcon(selectedApplication.estado)} {selectedApplication.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Descripción del Puesto</h3>
                  <p className="job-description">{selectedApplication.vacante.descripcion}</p>
                </div>

                <div className="detail-section">
                  <h3>Información de la Empresa</h3>
                  <p className="company-description">{selectedApplication.empresa.descripcion || 'No disponible'}</p>
                </div>

                <div className="detail-section">
                  <h3>Fechas Importantes</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Fecha de Aplicación:</span>
                      <span className="value">{formatDate(selectedApplication.fechaPostulacion)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Vacante Publicada:</span>
                      <span className="value">{formatDate(selectedApplication.vacante.fechaPublicacion)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Fecha de Cierre:</span>
                      <span className="value">{formatDate(selectedApplication.vacante.fechaCierre)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-close"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="applications-info">
        <p>Mostrando {filteredApplications.length} de {applications.length} aplicaciones</p>
      </div>
    </div>
  );
};

export default CandidateApplications;