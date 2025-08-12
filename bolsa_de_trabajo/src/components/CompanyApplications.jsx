import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './CompanyApplications.css';

const CompanyApplications = ({ companyId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');

  useEffect(() => {
    fetchApplications();
  }, [companyId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getCompanyApplications(companyId));
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Error al cargar las postulaciones');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(API_ENDPOINTS.updateApplicationStatus(applicationId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus })
      });

      if (response.ok) {
        // Actualizar la lista de postulaciones
        setApplications(applications.map(app => 
          app.id === applicationId 
            ? { ...app, estado: newStatus }
            : app
        ));
        setShowModal(false);
        setSelectedApplication(null);
      } else {
        setError('Error al actualizar el estado');
      }
    } catch (err) {
      setError('Error de conexión');
    }
  };

  const openApplicationModal = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pendiente': return '#f39c12';
      case 'Aceptado': return '#27ae60';
      case 'Rechazado': return '#e74c3c';
      case 'En Revisión': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'Todos' || app.estado === filterStatus
  );

  if (loading) {
    return (
      <div className="applications-loading">
        <div className="loading-spinner"></div>
        <p>Cargando postulaciones...</p>
      </div>
    );
  }

  return (
    <div className="company-applications">
      <div className="applications-header">
        <h2>Postulaciones Recibidas</h2>
        <div className="applications-filters">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En Revisión">En Revisión</option>
            <option value="Aceptado">Aceptado</option>
            <option value="Rechazado">Rechazado</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {filteredApplications.length === 0 ? (
        <div className="no-applications">
          <div className="no-applications-icon">📋</div>
          <h3>No hay postulaciones</h3>
          <p>Aún no has recibido postulaciones para tus vacantes.</p>
        </div>
      ) : (
        <div className="applications-grid">
          {filteredApplications.map((application) => (
            <div key={application.id} className="application-card">
              <div className="application-header">
                <div className="candidate-info">
                  <div className="candidate-avatar">
                    {application.candidato.rutaImagen ? (
                      <img 
                        src={`http://localhost:5000${application.candidato.rutaImagen}`} 
                        alt={application.candidato.nombreUsuario}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {application.candidato.nombreUsuario.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="candidate-details">
                    <h3>{application.candidato.nombreUsuario}</h3>
                    <p className="candidate-email">{application.candidato.correo}</p>
                  </div>
                </div>
                <div 
                  className="application-status"
                  style={{ backgroundColor: getStatusColor(application.estado) }}
                >
                  {application.estado}
                </div>
              </div>

              <div className="application-body">
                <div className="vacancy-info">
                  <h4>{application.vacante.titulo}</h4>
                  <div className="vacancy-details">
                    <span className="salary">{formatSalary(application.vacante.salario)}</span>
                    <span className="location">📍 {application.vacante.ubicacion}</span>
                  </div>
                </div>

                <div className="application-date">
                  <small>Postulado el {formatDate(application.fechaPostulacion)}</small>
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
              <h2>Detalles del Candidato</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="candidate-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {selectedApplication.candidato.rutaImagen ? (
                      <img 
                        src={`http://localhost:5000${selectedApplication.candidato.rutaImagen}`} 
                        alt={selectedApplication.candidato.nombreUsuario}
                      />
                    ) : (
                      <div className="avatar-placeholder-large">
                        {selectedApplication.candidato.nombreUsuario.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="profile-info">
                    <h3>{selectedApplication.candidato.nombreUsuario}</h3>
                    <p>{selectedApplication.candidato.correo}</p>
                    <p>{selectedApplication.candidato.telefono}</p>
                    <p>{selectedApplication.candidato.direccion}</p>
                  </div>
                </div>

                <div className="profile-sections">
                  <div className="profile-section">
                    <h4>Educación</h4>
                    <p>{selectedApplication.candidato.educacion || 'No especificada'}</p>
                  </div>

                  <div className="profile-section">
                    <h4>Experiencia Laboral</h4>
                    <p>{selectedApplication.candidato.experienciaLaboral || 'No especificada'}</p>
                  </div>

                  {selectedApplication.candidato.cv && (
                    <div className="profile-section">
                      <h4>Currículum Vitae</h4>
                      <a 
                        href={`http://localhost:5000${selectedApplication.candidato.cv}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cv-link"
                      >
                        📄 Descargar CV
                      </a>
                    </div>
                  )}

                  <div className="profile-section">
                    <h4>Vacante Aplicada</h4>
                    <div className="applied-vacancy">
                      <h5>{selectedApplication.vacante.titulo}</h5>
                      <p>Salario: {formatSalary(selectedApplication.vacante.salario)}</p>
                      <p>Ubicación: {selectedApplication.vacante.ubicacion}</p>
                      <p>Fecha de postulación: {formatDate(selectedApplication.fechaPostulacion)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedApplication.estado === 'Pendiente' && (
                <>
                  <button 
                    className="btn-accept"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'Aceptado')}
                  >
                    ✓ Aceptar Candidato
                  </button>
                  <button 
                    className="btn-review"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'En Revisión')}
                  >
                    👁️ Marcar en Revisión
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'Rechazado')}
                  >
                    ✗ Rechazar
                  </button>
                </>
              )}
              {selectedApplication.estado === 'En Revisión' && (
                <>
                  <button 
                    className="btn-accept"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'Aceptado')}
                  >
                    ✓ Aceptar Candidato
                  </button>
                  <button 
                    className="btn-reject"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'Rechazado')}
                  >
                    ✗ Rechazar
                  </button>
                </>
              )}
              <button 
                className="btn-cancel"
                onClick={() => setShowModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyApplications;