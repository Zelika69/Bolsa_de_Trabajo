import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyVacancies from './CompanyVacancies';
import CompanyApplications from './CompanyApplications';
import './CompanyDashboard.css';

const CompanyDashboard = () => {
  const [activeTab, setActiveTab] = useState('vacancies');
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está logueado y es una empresa
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'recruiter') {
      navigate('/');
      return;
    }

    setUserInfo(user);
  }, [navigate]);

  if (!userInfo) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="company-dashboard">
      <div className="dashboard-header">
        <h1>Panel de Empresa</h1>
        <p>Bienvenido, {userInfo.name}</p>
      </div>

      <div className="dashboard-nav">
        <button 
          className={`nav-btn ${activeTab === 'vacancies' ? 'active' : ''}`}
          onClick={() => setActiveTab('vacancies')}
        >
          📋 Gestionar Vacantes
        </button>
        <button 
          className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          👥 Postulaciones Recibidas
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'vacancies' && (
          <CompanyVacancies companyId={userInfo.id} />
        )}
        {activeTab === 'applications' && (
          <CompanyApplications companyId={userInfo.id} />
        )}
      </div>
    </div>
  );
};

export default CompanyDashboard;