import React from 'react';
import './Home.css';

const Home = ({ jobs }) => {
  const featuredJobs = jobs.filter(job => job.featured).slice(0, 3); // Mostrar solo las vacantes marcadas como destacadas

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Encuentra tu trabajo ideal</h1>
          <p>Conectamos talento con oportunidades. Descubre miles de vacantes en las mejores empresas.</p>
          <div className="hero-stats">
            <div className="stat">
              <h3>{jobs.length}+</h3>
              <p>Vacantes Activas</p>
            </div>
            <div className="stat">
              <h3>500+</h3>
              <p>Empresas Registradas</p>
            </div>
            <div className="stat">
              <h3>1000+</h3>
              <p>Candidatos Contratados</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="search-container">
          <h2>Busca tu próxima oportunidad</h2>
          <div className="search-form">
            <input 
              type="text" 
              placeholder="¿Qué trabajo buscas?" 
              className="search-input"
            />
            <input 
              type="text" 
              placeholder="Ciudad o ubicación" 
              className="search-input"
            />
            <button className="search-btn">Buscar</button>
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="featured-jobs">
        <div className="container">
          <div className="section-header">
            <h2>Empleos Disponibles</h2>
            <p>Descubre oportunidades que se ajusten a tu perfil profesional</p>
          </div>
          <div className="jobs-grid">
            {featuredJobs.map(job => (
              <div key={job.id} className="job-card featured">
                <div className="job-badge">
                  <span className="featured-badge">Destacada</span>
                </div>
                <div className="job-content">
                  <div className="job-header">
                    <h3 className="job-title">{job.title}</h3>
                    <div className="job-meta">
                      <span className="job-company">{job.company}</span>
                      <div className="job-details">
                        <span className="job-location">📍 {job.location}</span>
                        <span className="job-salary">💰 {job.salary}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="job-type-container">
                    <span className={`job-type ${job.type.replace(' ', '-').toLowerCase()}`}>
                      {job.type}
                    </span>
                    {job.remote && <span className="remote-badge">Remoto</span>}
                    {job.hybrid && <span className="hybrid-badge">Híbrido</span>}
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
                    <button className="view-details-btn">Ver Detalles</button>
                    <button className="apply-btn">Aplicar Ahora</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {featuredJobs.length === 0 && (
            <div className="no-featured-jobs">
              <p>No hay vacantes destacadas disponibles en este momento.</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <div className="container">
          <h2>Explora por Categorías</h2>
          <div className="categories-grid">
            <div className="category-card">
              <div className="category-icon">💻</div>
              <h3>Tecnología</h3>
              <p>Desarrollo, IT, Software</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🎨</div>
              <h3>Diseño</h3>
              <p>UX/UI, Gráfico, Web</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📊</div>
              <h3>Marketing</h3>
              <p>Digital, Ventas, Publicidad</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🏢</div>
              <h3>Administración</h3>
              <p>Recursos Humanos, Finanzas</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>¿Eres una empresa?</h2>
          <p>Publica tus vacantes y encuentra el talento que necesitas</p>
          <button className="cta-btn">Publicar Vacante</button>
        </div>
      </section>
    </div>
  );
};

export default Home;