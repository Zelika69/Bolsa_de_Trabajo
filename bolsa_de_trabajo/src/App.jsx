import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import JobListings from './components/JobListings';
import SavedJobs from './components/SavedJobs';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import JobForm from './components/JobForm';
import ProfileCandidate from './components/ProfileCandidate';
import ProfileCompany from './components/ProfileCompany';
import ProfileRouter from './components/ProfileRouter';
import CompanyDashboard from './components/CompanyDashboard';

// Los datos de trabajos ahora se cargan dinámicamente desde la API

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar sesión y trabajos al inicializar
  useEffect(() => {
    // Cargar usuario
    const loadUser = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('user');
        }
      }
    };

    // Cargar trabajos desde localStorage (los datos reales vienen de la API en JobListings)
    const loadJobs = () => {
      setLoading(true);
      // Los trabajos ahora se manejan dinámicamente en cada componente
      setTimeout(() => {
        const savedJobs = localStorage.getItem('jobs');
        setJobs(savedJobs ? JSON.parse(savedJobs) : []);
        setLoading(false);
      }, 500);
    };

    loadUser();
    loadJobs();
  }, []);

  // Persistir trabajos cuando cambian
  useEffect(() => {
    if (jobs.length > 0) {
      localStorage.setItem('jobs', JSON.stringify(jobs));
    }
  }, [jobs]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userId', userData.id); // Sincronizar userId
    
    // Establecer userType basado en el rol del usuario
    const userType = userData.role; // Usar directamente el rol del backend
    localStorage.setItem('userType', userType);
    
    setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    setCurrentView('home');
  };

  const addJob = (newJob) => {
    const jobWithId = {
      ...newJob,
      id: Date.now(), // Mejor que jobs.length + 1
      createdAt: new Date().toISOString()
    };
    setJobs([...jobs, jobWithId]);
  };

  const renderCurrentView = () => {
    if (loading) {
      return <div className="loading-spinner">Cargando...</div>;
    }

    switch(currentView) {
      case 'home':
        return <Home jobs={jobs} />;
      case 'jobs':
        return <JobListings jobs={jobs} />;
      case 'saved-jobs':
        return user?.role === 'user' ? 
          <SavedJobs /> : 
          <div className="access-denied">Acceso denegado. Solo los candidatos pueden ver vacantes guardadas.</div>;
      case 'login':
        return <Login onLogin={handleLogin} setCurrentView={setCurrentView} />;
      case 'register':
        return <Register setCurrentView={setCurrentView} />;
      case 'admin':
        return user?.role === 'admin' ? 
          <AdminPanel jobs={jobs} setJobs={setJobs} /> : 
          <div className="access-denied">Acceso denegado</div>;
      case 'add-job':
        return user?.role === 'admin' || user?.role === 'recruiter' ? 
          <JobForm onSubmit={addJob} setCurrentView={setCurrentView} /> : 
          <div className="access-denied">Acceso denegado</div>;
      case 'profile':
        return <ProfileRouter user={user} setCurrentView={setCurrentView} />;
      case 'profileCandidate':
        return user ? <ProfileCandidate user={user} /> : <div>Por favor inicie sesión</div>;
      case 'profileCompany':
        return user ? <ProfileCompany user={user} /> : <div>Por favor inicie sesión</div>;
      case 'company-dashboard':
        return user?.role === 'recruiter' ? 
          <CompanyDashboard /> : 
          <div className="access-denied">Acceso denegado</div>;
      default:
        return <Home jobs={jobs} />;
    }
  };

  return (
    <div className="App">
      <Navbar 
        currentView={currentView} 
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;