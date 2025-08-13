import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';
import './Home.css';

const Home = ({ jobs }) => {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedJobs, setSavedJobs] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Cargar usuario desde localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Cargar trabajos guardados desde localStorage
    const saved = localStorage.getItem('savedJobs');
    if (saved) {
      setSavedJobs(JSON.parse(saved));
    }

    loadFeaturedJobs();
  }, []);

  const loadFeaturedJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/api/vacantes');
      if (response.ok) {
        const allJobs = await response.json();
        // Filtrar solo las vacantes destacadas
        const featured = allJobs.filter(job => job.destacada).slice(0, 3);
        setFeaturedJobs(featured);
      }
    } catch (error) {
      console.error('Error cargando vacantes destacadas:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleApplyJob = async (job) => {
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
        console.log('Datos del perfil del candidato:', profileData);
        
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
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Cargando vacantes destacadas...</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {featuredJobs.map(job => (
                <div key={job.id} className="job-card featured">
                  <div className="job-badge">
                    <span className="featured-badge">Destacada</span>
                    <button 
                      className={`save-job-btn ${savedJobs.includes(job.id) ? 'saved' : ''}`}
                      onClick={() => toggleSaveJob(job)}
                      title={savedJobs.includes(job.id) ? 'Quitar de guardados' : 'Guardar vacante'}
                    >
                      {savedJobs.includes(job.id) ? '❤️' : '🤍'}
                    </button>
                  </div>
                  <div className="job-content">
                    <div className="job-header">
                      <h3 className="job-title">{job.titulo}</h3>
                      <div className="job-meta">
                        <span className="job-company">{job.nombreEmpresa}</span>
                        <div className="job-details">
                          <span className="job-location">📍 {job.ubicacion}</span>
                          <span className="job-salary">💰 ${job.salario ? job.salario.toLocaleString() : 'No especificado'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="job-type-container">
                      <span className={`job-type ${job.tipoContrato ? job.tipoContrato.replace(' ', '-').toLowerCase() : ''}`}>
                        {job.tipoContrato || 'No especificado'}
                      </span>
                    </div>
                    
                    <div className="job-description">
                      {job.descripcion && job.descripcion.length > 120 
                        ? `${job.descripcion.substring(0, 120)}...` 
                        : job.descripcion || 'Sin descripción disponible'
                      }
                    </div>
                    
                    <div className="job-requirements">
                      <strong>Requisitos:</strong> {job.requisitos || 'No especificados'}
                    </div>
                    
                    <div className="job-actions">
                      <button className="view-details-btn">Ver Detalles</button>
                      <button 
                        className="apply-btn"
                        onClick={() => handleApplyJob(job)}
                      >
                        Aplicar Ahora
                      </button>
                    </div>
                  </div>
                </div>
            ))}
          </div>
          )}
          
          {!loading && featuredJobs.length === 0 && (
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