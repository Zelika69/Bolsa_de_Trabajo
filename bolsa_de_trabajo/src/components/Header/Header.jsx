import React, { useState, useEffect, useRef } from 'react';
import LoginForm from '../LoginForm';
import './Header.css';

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    setShowDropdown(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowDropdown(false);
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
          setShowDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="compact-header">
      <div className="header-container">
        {/* Menú Hamburguesa (solo móvil) */}
        <button className="menu-button" onClick={toggleMobileMenu}>
          ☰
        </button>

        {/* Logo centrado */}
        <div className="logo-center">
          <img 
            src="/logo.png" 
            alt="Logo Empresa" 
            className="logo-image"
          />
        </div>

        {/* Menú principal (desktop) */}
        <nav className={`main-nav ${showMobileMenu ? 'mobile-visible' : ''}`}>
          <ul className="nav-list">
            <li><a href="#" className="nav-link">Productos</a></li>
            <li><a href="#" className="nav-link">Planes y precios</a></li>
            <li><a href="#" className="nav-link">Recursos</a></li>
            <li><a href="#" className="nav-link">Soporte técnico</a></li>
          </ul>
        </nav>

        {/* Sección derecha (perfil) */}
        <div className="right-section">
          {isLoggedIn ? (
            <div 
              className="user-profile"
              onClick={toggleDropdown}
              ref={profileRef}
            >
              <img 
                alt="Perfil" 
                className="profile-image"
                src={user && user.profileImage ? user.profileImage : '/default-profile.png'}
              />
              {showDropdown && (
                <div className="dropdown" ref={dropdownRef}>
                  <button onClick={handleLogout} className="dropdown-item">
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          )}
        </div>
      </div>

      {/* Menú móvil (full screen) */}
      {showMobileMenu && (
        <div className="mobile-menu" onClick={() => setShowMobileMenu(false)}>
          <ul>
            <li><a href="#">Productos</a></li>
            <li><a href="#">Planes y precios</a></li>
            <li><a href="#">Recursos</a></li>
            <li><a href="#">Soporte técnico</a></li>
          </ul>
        </div>
      )}
    </header>
  );
}


export default Header;