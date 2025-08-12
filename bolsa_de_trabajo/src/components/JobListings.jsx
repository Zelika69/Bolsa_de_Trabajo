import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './JobListings.css';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    type: 'Todos',
    location: 'Todas',
    experience: 'Todas',
    modality: 'Todas'
  });

  // Cargar usuario y trabajos guardados
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }
  }, []);

  const toggleSaveJob = (job) => {
    const jobId = job.id;
    let updatedSavedJobs;
    
    if (savedJobs.includes(jobId)) {
      updatedSavedJobs = savedJobs.filter(id => id !== jobId);
    } else {
      updatedSavedJobs = [...savedJobs, jobId];
    }
    
    setSavedJobs(updatedSavedJobs);
    localStorage.setItem('savedJobs', JSON.stringify(updatedSavedJobs));
  };

  const handleApplyJob = async (job, event) => {
    event.stopPropagation(); // Evitar que se abra el modal de detalles
    
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

  // Obtener vacantes desde la API
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.getAllVacantes);
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      } else {
        setError('Error al cargar las vacantes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Opciones de filtros
  const filterOptions = {
    type: ['Todos', 'Tiempo Completo', 'Medio Tiempo', 'Por Proyecto', 'Freelance', 'Prácticas'],
    location: ['Todas', 'Ciudad de México', 'Guadalajara', 'Monterrey', 'Querétaro', 'Remoto'],
    experience: ['Todas', 'Sin experiencia', '1-2 años', '3-5 años', '+5 años'],
    modality: ['Todas', 'Presencial', 'Remoto', 'Híbrido']
  };

  // Filtrar trabajos
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.titulo && job.titulo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (job.nombreEmpresa && job.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (job.descripcion && job.descripcion.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (job.requisitos && job.requisitos.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = activeFilters.type === 'Todos' || (job.tipoContrato && job.tipoContrato === activeFilters.type);
    const matchesLocation = activeFilters.location === 'Todas' || 
                           (job.ubicacion && job.ubicacion.toLowerCase().includes(activeFilters.location.toLowerCase()));
    const matchesExperience = activeFilters.experience === 'Todas'; // Por ahora no tenemos campo de experiencia
    const matchesModality = activeFilters.modality === 'Todas' || 
                           (activeFilters.modality === 'Remoto' && job.ubicacion.toLowerCase().includes('remoto'));
    
    return matchesSearch && matchesType && matchesLocation && matchesExperience && matchesModality;
  });

  // Función para formatear salario
  const formatSalary = (salary) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0
    }).format(salary);
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="job-listings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando vacantes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-listings">
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={fetchJobs} className="retry-btn">Reintentar</button>
        </div>
      </div>
    );
  }

  // Función para cambiar filtros
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setActiveFilters({
      type: 'Todos',
      location: 'Todas',
      experience: 'Todas',
      modality: 'Todas'
    });
    setSearchTerm('');
  };

  const handleJobClick = (job) => {
    setSelectedJob(job);
  };

  const closeJobDetail = () => {
    setSelectedJob(null);
  };

  return (
    <div className="job-listings">
      <div className="listings-header">
        <h1>Todas las Vacantes</h1>
        <p>Encuentra tu trabajo ideal entre {jobs.length} oportunidades disponibles</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-section">
        <div className="search-container">
          <div className="search-icon">🔍</div>
          <input
            type="text"
            placeholder="Buscar empleos, empresas o habilidades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-main"
          />
        </div>
      </div>

      {/* Filtros tipo pill */}
      <div className="filters-section">
        <div className="filter-category">
          <span className="filter-label">🏷️ Tipo:</span>
          <div className="filter-pills">
            {filterOptions.type.map(option => (
              <button
                key={option}
                className={`filter-pill ${activeFilters.type === option ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-category">
          <span className="filter-label">📍 Ubicación:</span>
          <div className="filter-pills">
            {filterOptions.location.map(option => (
              <button
                key={option}
                className={`filter-pill ${activeFilters.location === option ? 'active' : ''}`}
                onClick={() => handleFilterChange('location', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-category">
          <span className="filter-label">💼 Experiencia:</span>
          <div className="filter-pills">
            {filterOptions.experience.map(option => (
              <button
                key={option}
                className={`filter-pill ${activeFilters.experience === option ? 'active' : ''}`}
                onClick={() => handleFilterChange('experience', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-category">
          <span className="filter-label">🏠 Modalidad:</span>
          <div className="filter-pills">
            {filterOptions.modality.map(option => (
              <button
                key={option}
                className={`filter-pill ${activeFilters.modality === option ? 'active' : ''}`}
                onClick={() => handleFilterChange('modality', option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-actions">
          <button className="clear-all-btn" onClick={clearAllFilters}>
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Resultados */}
      <div className="results-section">
        <div className="results-header">
          <span className="results-count">
            {filteredJobs.length} vacante{filteredJobs.length !== 1 ? 's' : ''} encontrada{filteredJobs.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="jobs-container">
          {filteredJobs.length === 0 ? (
            <div className="no-results">
              <h3>No se encontraron vacantes</h3>
              <p>Intenta ajustar tus filtros de búsqueda</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map(job => (
                <div 
                  key={job.id} 
                  className="job-card"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="job-card-header">
                    <h3 className="job-title">{job.titulo || 'Sin título'}</h3>
                    <div className="job-header-actions">
                      <span className={`job-type-badge ${job.tipoContrato ? job.tipoContrato.replace(' ', '-').toLowerCase() : 'sin-tipo'}`}>
                        {job.tipoContrato || 'Sin especificar'}
                      </span>
                      <button 
                        className={`save-job-btn ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job);
                        }}
                        title={savedJobs.includes(job.id) ? 'Quitar de guardados' : 'Guardar vacante'}
                      >
                        {savedJobs.includes(job.id) ? '❤️' : '🤍'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="job-company">
                    <strong>{job.nombreEmpresa || 'Empresa no especificada'}</strong>
                  </div>
                  
                  <div className="job-details">
                    <div className="job-location">
                      <span className="icon">📍</span>
                      {job.ubicacion || 'Ubicación no especificada'}
                    </div>
                    <div className="job-salary">
                      <span className="icon">💰</span>
                      {formatSalary(job.salario)}
                    </div>
                    <div className="job-applications">
                      <span className="icon">👥</span>
                      {job.cantidadPostulaciones} postulaciones
                    </div>
                  </div>
                  
                  <div className="job-description">
                    {job.descripcion && job.descripcion.length > 120
                      ? `${job.descripcion.substring(0, 120)}...`
                      : (job.descripcion || 'Sin descripción disponible')
                    }
                  </div>
                  
                  <div className="job-requirements">
                    <strong>Requisitos:</strong> {job.requisitos && job.requisitos.length > 80 
                      ? `${job.requisitos.substring(0, 80)}...` 
                      : (job.requisitos || 'Sin requisitos especificados')
                    }
                  </div>
                  
                  <div className="job-date">
                    <span className="icon">📅</span>
                    Publicado: {formatDate(job.fechaPublicacion)}
                  </div>
                  
                  <div className="job-actions">
                    <button className="view-details-btn">
                      Ver Detalles
                    </button>
                    <button 
                      className="apply-btn"
                      onClick={(e) => handleApplyJob(job, e)}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles del trabajo */}
      {selectedJob && (
        <div className="job-modal-overlay" onClick={closeJobDetail}>
          <div className="job-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedJob.titulo || 'Sin título'}</h2>
              <button className="close-btn" onClick={closeJobDetail}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="job-info">
                <div className="info-item">
                  <strong>Empresa:</strong> {selectedJob.nombreEmpresa || 'No especificada'}
                </div>
                <div className="info-item">
                  <strong>Ubicación:</strong> {selectedJob.ubicacion || 'No especificada'}
                </div>
                <div className="info-item">
                  <strong>Tipo de Contrato:</strong> {selectedJob.tipoContrato || 'Sin especificar'}
                </div>
                <div className="info-item">
                  <strong>Salario:</strong> {formatSalary(selectedJob.salario)}
                </div>
                <div className="info-item">
                  <strong>Estado:</strong> {selectedJob.estado}
                </div>
                <div className="info-item">
                  <strong>Postulaciones:</strong> {selectedJob.cantidadPostulaciones}
                </div>
                <div className="info-item">
                  <strong>Fecha de Publicación:</strong> {formatDate(selectedJob.fechaPublicacion)}
                </div>
                {selectedJob.fechaCierre && (
                  <div className="info-item">
                    <strong>Fecha de Cierre:</strong> {formatDate(selectedJob.fechaCierre)}
                  </div>
                )}
              </div>
              
              <div className="job-full-description">
                <h3>Descripción del puesto</h3>
                <p>{selectedJob.descripcion || 'Sin descripción disponible'}</p>
              </div>
              
              <div className="job-requirements-full">
                <h3>Requisitos</h3>
                <p>{selectedJob.requisitos || 'Sin requisitos especificados'}</p>
              </div>
              
              <div className="job-full-requirements">
                <h3>Requisitos</h3>
                <p>{selectedJob.requirements}</p>
              </div>
              
              <div className="modal-actions">
                <button 
                  className="apply-btn-large"
                  onClick={(e) => handleApplyJob(selectedJob, e)}
                >
                  Aplicar a esta vacante
                </button>
                <button 
                  className={`save-btn ${savedJobs.includes(selectedJob.id) ? 'saved' : ''}`}
                  onClick={() => toggleSaveJob(selectedJob)}
                >
                  {savedJobs.includes(selectedJob.id) ? '❤️ Guardada' : '🤍 Guardar vacante'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;