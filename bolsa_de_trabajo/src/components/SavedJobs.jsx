import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './SavedJobs.css';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    // Cargar usuario desde localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    loadSavedJobs();
  }, []);

  const loadSavedJobs = async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener IDs de trabajos guardados desde localStorage
      const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      
      if (savedJobIds.length === 0) {
        setLoading(false);
        return;
      }

      // Obtener todas las vacantes desde la API
      const response = await fetch(API_ENDPOINTS.getAllVacantes);
      if (response.ok) {
        const allJobsData = await response.json();
        setAllJobs(allJobsData);
        
        // Filtrar solo las vacantes guardadas
        const savedJobsData = allJobsData.filter(job => savedJobIds.includes(job.id));
        setSavedJobs(savedJobsData);
      } else {
        setError('Error al cargar las vacantes');
      }
    } catch (error) {
      console.error('Error cargando vacantes guardadas:', error);
      setError('Error de conexión al cargar las vacantes guardadas');
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = (jobId) => {
    const savedJobIds = JSON.parse(localStorage.getItem('savedJobs') || '[]');
    const updatedSavedJobIds = savedJobIds.filter(id => id !== jobId);
    
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobIds));
    setSavedJobs(savedJobs.filter(job => job.id !== jobId));
  };

  const handleApplyJob = async (job, event) => {
    event.stopPropagation();
    
    if (!user) {
      alert('Debes iniciar sesión para aplicar a esta vacante');
      return;
    }

    // Verificar que el usuario sea un candidato registrado
    if (user.role !== 'user') {
      alert('Solo los candidatos registrados pueden aplicar a vacantes. Si eres una empresa, puedes publicar vacantes desde tu panel.');
      return;
    }

    // Verificar si el usuario tiene todos los datos necesarios
    if (!user.nombre || !user.correo) {
      alert('Debes completar tu perfil antes de aplicar a vacantes. Ve a tu perfil para completar la información faltante.');
      return;
    }

    // Verificar perfil completo del candidato
    try {
      const profileResponse = await fetch(API_ENDPOINTS.getCandidateProfile(user.id));
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        // Debug: Mostrar los datos del perfil en la consola
        console.log('Datos del perfil del candidato (SavedJobs):', profileData);
        
        const missingFields = [];
        
        if (!profileData.telefono || profileData.telefono.trim() === '') {
          missingFields.push('teléfono');
          console.log('Campo faltante: teléfono -', profileData.telefono);
        }
        if (!profileData.direccion || profileData.direccion.trim() === '') {
          missingFields.push('dirección');
          console.log('Campo faltante: dirección -', profileData.direccion);
        }
        if (!profileData.cv || profileData.cv.trim() === '') {
          missingFields.push('CV');
          console.log('Campo faltante: CV -', profileData.cv);
        }
        if (!profileData.educacion || profileData.educacion.trim() === '') {
          missingFields.push('educación');
          console.log('Campo faltante: educación -', profileData.educacion);
        }
        if (!profileData.experiencia || profileData.experiencia.trim() === '') {
          missingFields.push('experiencia laboral');
          console.log('Campo faltante: experiencia -', profileData.experiencia);
        }
        
        if (missingFields.length > 0) {
          alert(`Debes completar tu perfil antes de aplicar a vacantes. Campos faltantes: ${missingFields.join(', ')}. Ve a tu perfil para completar la información.`);
          return;
        }
      }
    } catch (error) {
      console.error('Error al verificar perfil:', error);
      // Continuar con la aplicación si hay error en la verificación del perfil
    }

    try {
      const response = await fetch(API_ENDPOINTS.createPostulacion, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          vacanteId: job.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`¡Postulación enviada exitosamente para: ${job.titulo || 'Sin título'}!`);
      } else {
        alert(data.error || 'Error al enviar la postulación');
      }
    } catch (error) {
      console.error('Error al aplicar a la vacante:', error);
      alert('Error de conexión. Inténtalo de nuevo.');
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'No especificado';
    if (typeof salary === 'number') {
      return `$${salary.toLocaleString()}`;
    }
    return salary;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="saved-jobs-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando vacantes guardadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-jobs-container">
      <div className="saved-jobs-header">
        <h1>Vacantes Guardadas</h1>
        <p>Aquí puedes ver todas las vacantes que has guardado para revisar más tarde.</p>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadSavedJobs} className="retry-btn">Reintentar</button>
        </div>
      )}

      {savedJobs.length === 0 ? (
        <div className="no-saved-jobs">
          <div className="no-saved-icon">💾</div>
          <h2>No tienes vacantes guardadas</h2>
          <p>Cuando encuentres vacantes interesantes, puedes guardarlas haciendo clic en el ícono de corazón.</p>
          <p>Así podrás revisarlas más tarde desde aquí.</p>
        </div>
      ) : (
        <div className="saved-jobs-grid">
          {savedJobs.map((job) => (
            <div key={job.id} className="job-card saved-job-card">
              <div className="job-header">
                <h3 className="job-title">{job.titulo || 'Sin título'}</h3>
                <button 
                  className="remove-saved-btn"
                  onClick={() => removeSavedJob(job.id)}
                  title="Quitar de guardados"
                >
                  ❌
                </button>
              </div>
              
              <div className="job-company">
                <span className="company-name">{job.empresa || 'Empresa no especificada'}</span>
              </div>
              
              <div className="job-details">
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{job.ubicacion || 'Ubicación no especificada'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span>{formatSalary(job.salario)}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">📋</span>
                  <span>{job.tipoContrato || 'Tipo no especificado'}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>Publicado: {formatDate(job.fechaPublicacion)}</span>
                </div>
              </div>
              
              <div className="job-description">
                <p>{job.descripcion ? 
                  (job.descripcion.length > 150 ? 
                    `${job.descripcion.substring(0, 150)}...` : 
                    job.descripcion
                  ) : 'Sin descripción disponible'
                }</p>
              </div>
              
              <div className="job-actions">
                <button 
                  className="btn-details"
                  onClick={() => setSelectedJob(job)}
                >
                  Ver Detalles
                </button>
                <button 
                  className="btn-apply"
                  onClick={(e) => handleApplyJob(job, e)}
                >
                  Aplicar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.titulo}</h2>
              <button 
                className="close-modal"
                onClick={() => setSelectedJob(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="job-info-section">
                <h3>Información General</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Empresa:</strong> {selectedJob.empresa || 'No especificada'}
                  </div>
                  <div className="info-item">
                    <strong>Ubicación:</strong> {selectedJob.ubicacion || 'No especificada'}
                  </div>
                  <div className="info-item">
                    <strong>Salario:</strong> {formatSalary(selectedJob.salario)}
                  </div>
                  <div className="info-item">
                    <strong>Tipo de Contrato:</strong> {selectedJob.tipoContrato || 'No especificado'}
                  </div>
                  <div className="info-item">
                    <strong>Fecha de Publicación:</strong> {formatDate(selectedJob.fechaPublicacion)}
                  </div>
                  <div className="info-item">
                    <strong>Fecha de Cierre:</strong> {formatDate(selectedJob.fechaCierre)}
                  </div>
                </div>
              </div>
              
              <div className="job-description-section">
                <h3>Descripción</h3>
                <p>{selectedJob.descripcion || 'Sin descripción disponible'}</p>
              </div>
              
              <div className="job-requirements-section">
                <h3>Requisitos</h3>
                <p>{selectedJob.requisitos || 'Sin requisitos especificados'}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-apply-modal"
                onClick={(e) => {
                  handleApplyJob(selectedJob, e);
                  setSelectedJob(null);
                }}
              >
                Aplicar a esta Vacante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;