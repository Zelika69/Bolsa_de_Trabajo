import React from 'react';
import './Navbar.css';

const Navbar = ({ currentView, setCurrentView, user, onLogout }) => {
  const handleNavClick = (view) => {
    setCurrentView(view);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>BolsaTrabajo</h2>
      </div>
      
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
            <span className="user-welcome">Hola, {user.name}</span>
            <span className="user-role">({user.role})</span>
            <button className="auth-btn logout-btn" onClick={onLogout}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;