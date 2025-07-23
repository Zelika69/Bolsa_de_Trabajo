import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import JobListings from './components/JobListings';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import JobForm from './components/JobForm';
import ProfileCandidate from './components/ProfileCandidate';
import ProfileCompany from './components/ProfileCompany';
import ProfileRouter from './components/ProfileRouter';

// Datos iniciales podrían moverse a un archivo aparte
const initialJobs = [
  {
    id: 1,
    title: 'Desarrollador Frontend React',
    company: 'TechCorp',
    location: 'Ciudad de México',
    salary: '$25,000 - $35,000',
    description: 'Buscamos un desarrollador Frontend con experiencia en React y TypeScript. CSS y HTML avanzado.',
    requirements: 'React, TypeScript, Tailwind CSS',
    type: 'Tiempo Completo',
    experience: '1-2 años',
    remote: false,
    hybrid: false,
    featured: true
  },
  // ... otros trabajos
];

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

    // Cargar trabajos (en un caso real sería una API call)
    const loadJobs = () => {
      setLoading(true);
      // Simular carga de API
      setTimeout(() => {
        const savedJobs = localStorage.getItem('jobs');
        setJobs(savedJobs ? JSON.parse(savedJobs) : initialJobs);
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