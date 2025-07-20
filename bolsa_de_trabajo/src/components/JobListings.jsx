import React, { useState } from 'react';
import './JobListings.css';

const JobListings = ({ jobs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeFilters, setActiveFilters] = useState({
    type: 'Todos',
    location: 'Todas',
    experience: 'Todas',
    modality: 'Todas'
  });

  // Opciones de filtros
  const filterOptions = {
    type: ['Todos', 'Tiempo Completo', 'Medio Tiempo', 'Freelance', 'Prácticas'],
    location: ['Todas', 'Ciudad de México', 'Guadalajara', 'Monterrey', 'Remoto'],
    experience: ['Todas', 'Sin experiencia', '1-2 años', '3-5 años', '+5 años'],
    modality: ['Todas', 'Presencial', 'Remoto', 'Híbrido']
  };

  // Filtrar trabajos
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeFilters.type === 'Todos' || job.type === activeFilters.type;
    const matchesLocation = activeFilters.location === 'Todas' || 
                           job.location.includes(activeFilters.location) ||
                           (activeFilters.location === 'Remoto' && job.remote);
    const matchesExperience = activeFilters.experience === 'Todas' || 
                             job.experience === activeFilters.experience;
    const matchesModality = activeFilters.modality === 'Todas' || 
                           (activeFilters.modality === 'Remoto' && job.remote) ||
                           (activeFilters.modality === 'Presencial' && !job.remote) ||
                           (activeFilters.modality === 'Híbrido' && job.hybrid);
    
    return matchesSearch && matchesType && matchesLocation && matchesExperience && matchesModality;
  });

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
                    <h3 className="job-title">{job.title}</h3>
                    <span className={`job-type-badge ${job.type.replace(' ', '-').toLowerCase()}`}>
                      {job.type}
                    </span>
                  </div>
                  
                  <div className="job-company">
                    <strong>{job.company}</strong>
                  </div>
                  
                  <div className="job-details">
                    <div className="job-location">
                      <span className="icon">📍</span>
                      {job.location}
                    </div>
                    <div className="job-salary">
                      <span className="icon">💰</span>
                      {job.salary}
                    </div>
                  </div>
                  
                  <div className="job-description">
                    {job.description.length > 120 
                      ? `${job.description.substring(0, 120)}...` 
                      : job.description
                    }
                  </div>
                  
                  <div className="job-requirements">
                    <strong>Requisitos:</strong> {job.requirements}
                  </div>
                  
                  <div className="job-actions">
                    <button className="view-details-btn">
                      Ver Detalles
                    </button>
                    <button className="apply-btn">
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
              <h2>{selectedJob.title}</h2>
              <button className="close-btn" onClick={closeJobDetail}>×</button>
            </div>
            
            <div className="modal-content">
              <div className="job-info">
                <div className="info-item">
                  <strong>Empresa:</strong> {selectedJob.company}
                </div>
                <div className="info-item">
                  <strong>Ubicación:</strong> {selectedJob.location}
                </div>
                <div className="info-item">
                  <strong>Tipo:</strong> {selectedJob.type}
                </div>
                <div className="info-item">
                  <strong>Salario:</strong> {selectedJob.salary}
                </div>
              </div>
              
              <div className="job-full-description">
                <h3>Descripción del puesto</h3>
                <p>{selectedJob.description}</p>
              </div>
              
              <div className="job-full-requirements">
                <h3>Requisitos</h3>
                <p>{selectedJob.requirements}</p>
              </div>
              
              <div className="modal-actions">
                <button className="apply-btn-large">
                  Aplicar a esta vacante
                </button>
                <button className="save-btn">
                  Guardar vacante
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