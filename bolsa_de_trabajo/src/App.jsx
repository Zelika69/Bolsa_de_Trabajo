import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import JobListings from './components/JobListings';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import JobForm from './components/JobForm';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);

  // Cargar sesión desde localStorage al inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);
  const [jobs, setJobs] = useState([
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
    {
      id: 2,
      title: 'Diseñador UX/UI',
      company: 'DesignStudio',
      location: 'Guadalajara',
      salary: '$20,000 - $30,000',
      description: 'Únete a nuestro equipo creativo como diseñador UX/UI. Trabajarás en proyectos innovadores para web y móviles.',
      requirements: 'Figma, Adobe XD, Photoshop',
      type: 'Tiempo Completo',
      experience: 'Sin experiencia',
      remote: false,
      hybrid: true,
      featured: true
    },
    {
      id: 3,
      title: 'Desarrollador Full Stack',
      company: 'InnovaTech',
      location: 'Remoto',
      salary: '$30,000 - $45,000',
      description: 'Desarrollador Full Stack con experiencia en Node.js, React y bases de datos. Oportunidad de trabajo en proyectos...',
      requirements: 'Node.js, React, MongoDB',
      type: 'Tiempo Completo',
      experience: '3-5 años',
      remote: true,
      hybrid: false,
      featured: false
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'DataCorp',
      location: 'Monterrey',
      salary: '$28,000 - $38,000',
      description: 'Buscamos un Data Scientist para análisis de datos y machine learning. Experiencia con Python y SQL requerida.',
      requirements: 'Python, SQL, Machine Learning',
      type: 'Medio Tiempo',
      experience: '1-2 años',
      remote: false,
      hybrid: true,
      featured: false
    },
    {
      id: 5,
      title: 'Desarrollador Backend',
      company: 'StartupTech',
      location: 'Ciudad de México',
      salary: '$32,000 - $42,000',
      description: 'Desarrollador Backend especializado en APIs REST y microservicios. Ambiente dinámico y en crecimiento.',
      requirements: 'Node.js, Express, PostgreSQL',
      type: 'Tiempo Completo',
      experience: '+5 años',
      remote: false,
      hybrid: false,
      featured: true
    }
  ]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('home');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setCurrentView('home');
  };

  const addJob = (newJob) => {
    const job = {
      ...newJob,
      id: jobs.length + 1
    };
    setJobs([...jobs, job]);
  };

  const renderCurrentView = () => {
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
        return user && user.role === 'admin' ? 
          <AdminPanel jobs={jobs} setJobs={setJobs} /> : 
          <div className="access-denied">Acceso denegado</div>;
      case 'add-job':
        return user && (user.role === 'admin' || user.role === 'recruiter') ? 
          <JobForm onSubmit={addJob} setCurrentView={setCurrentView} /> : 
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