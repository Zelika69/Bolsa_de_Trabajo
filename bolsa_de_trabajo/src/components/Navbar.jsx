import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { API_ENDPOINTS } from '../config/api';

const Navbar = ({ currentView, setCurrentView, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Cerrar menú móvil al navegar
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Cerrar menú móvil al redimensionar la ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Debug: mostrar información del usuario
  console.log('Usuario en Navbar:', user);
  
  // Debug específico para imágenes
  if (user) {
    console.log('rutaImagen:', user.rutaImagen);
    console.log('role:', user.role);
    console.log('rutaImagen es null/undefined:', user.rutaImagen == null);
    
    const defaultImageUrl = API_ENDPOINTS.getDefaultImage(user.role);
    console.log('URL imagen por defecto:', defaultImageUrl);
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>BolsaTrabajo</h2>
        </div>
        
        {/* Menú hamburguesa */}
        <div 
          className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
          <div className="hamburger-line"></div>
        </div>
        
        {/* Menú desktop */}
        <div className="navbar-menu">
          <ul className="navbar-nav">
            <li className={`nav-item ${currentView === 'home' ? 'active' : ''}`}>
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('home')}
              >
                Inicio
              </button>
            </li>
            
            <li className={`nav-item ${currentView === 'jobs' ? 'active' : ''}`}>
              <button 
                className="nav-link" 
                onClick={() => handleNavClick('jobs')}
              >
                Vacantes
              </button>
            </li>
            
            {user && (user.role === 'admin' || user.role === 'recruiter') && (
              <li className={`nav-item ${currentView === 'add-job' ? 'active' : ''}`}>
                <button 
                  className="nav-link" 
                  onClick={() => handleNavClick('add-job')}
                >
                  Publicar Vacante
                </button>
              </li>
            )}
            
            {user && user.role === 'admin' && (
              <li className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}>
                <button 
                  className="nav-link" 
                  onClick={() => handleNavClick('admin')}
                >
                  Administración
                </button>
              </li>
            )}
          </ul>
        </div>
        
        {/* Auth buttons desktop */}
        <div className="navbar-auth">
          {!user ? (
            <>
              <button 
                className={`auth-btn login-btn ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => handleNavClick('login')}
              >
                Iniciar Sesión
              </button>
              <button 
                className={`auth-btn register-btn ${currentView === 'register' ? 'active' : ''}`}
                onClick={() => handleNavClick('register')}
              >
                Registrarse
              </button>
            </>
          ) : (
            <div className="user-menu">
              <div className="user-info">
                <img 
                   src={user.rutaImagen ? 
                  API_ENDPOINTS.getUserImage(user.role === 'admin' ? 'administrador' : user.role === 'recruiter' ? 'empresa' : 'candidato', user.rutaImagen) :
                  API_ENDPOINTS.getDefaultImage(user.role)
                } 
                   alt="Foto de perfil" 
                   className="user-photo"
                  />
                <span className="user-welcome">Hola, {user.name}</span>
                <span className="user-role">
                  {user.role === 'admin' ? 'ADMINISTRADOR' : 
                   user.role === 'recruiter' ? 'EMPRESA' : 
                   user.role === 'user' ? 'CANDIDATO' : 'USER'}
                </span>
              </div>
              <div className="user-actions">
                <button 
                  className={`profile-btn ${currentView === 'profile' ? 'active' : ''}`}
                  onClick={() => handleNavClick('profile')}
                >
                  Perfil
                </button>
                <button className="auth-btn logout-btn" onClick={onLogout}>
                  Salir
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Menú móvil */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        {user && (
          <div className="mobile-user-info">
            <img 
              src={user.rutaImagen ? 
                API_ENDPOINTS.getUserImage(user.role === 'admin' ? 'administrador' : user.role === 'recruiter' ? 'empresa' : 'candidato', user.rutaImagen) :
                API_ENDPOINTS.getDefaultImage(user.role)
              } 
              alt="Foto de perfil" 
              className="mobile-user-photo"
            />
            <div className="mobile-user-details">
              <h4>Hola, {user.name}</h4>
              <p>
                {user.role === 'admin' ? 'ADMINISTRADOR' : 
                 user.role === 'recruiter' ? 'EMPRESA' : 
                 user.role === 'user' ? 'CANDIDATO' : 'USER'}
              </p>
            </div>
          </div>
        )}
        
        <nav className="mobile-nav">
          <button 
            className={`mobile-nav-link ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            🏠 Inicio
          </button>
          
          <button 
            className={`mobile-nav-link ${currentView === 'jobs' ? 'active' : ''}`}
            onClick={() => handleNavClick('jobs')}
          >
            💼 Vacantes
          </button>
          
          {user && (user.role === 'admin' || user.role === 'recruiter') && (
            <button 
              className={`mobile-nav-link ${currentView === 'add-job' ? 'active' : ''}`}
              onClick={() => handleNavClick('add-job')}
            >
              ➕ Publicar Vacante
            </button>
          )}
          
          {user && user.role === 'admin' && (
            <button 
              className={`mobile-nav-link ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => handleNavClick('admin')}
            >
              ⚙️ Administración
            </button>
          )}
          
          {user && (
            <button 
              className={`mobile-nav-link ${currentView === 'profile' ? 'active' : ''}`}
              onClick={() => handleNavClick('profile')}
            >
              👤 Perfil
            </button>
          )}
        </nav>
        
        <div className="mobile-auth">
          {!user ? (
            <>
              <button 
                className={`mobile-auth-btn ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => handleNavClick('login')}
              >
                Iniciar Sesión
              </button>
              <button 
                className={`mobile-auth-btn mobile-register-btn ${currentView === 'register' ? 'active' : ''}`}
                onClick={() => handleNavClick('register')}
              >
                Registrarse
              </button>
            </>
          ) : (
            <button 
              className="mobile-auth-btn mobile-logout-btn" 
              onClick={() => {
                onLogout();
                setIsMobileMenuOpen(false);
              }}
            >
              🚪 Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;