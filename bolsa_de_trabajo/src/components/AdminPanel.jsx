import React, { useState } from 'react';
import './AdminPanel.css';

const AdminPanel = ({ jobs, setJobs }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingJob, setEditingJob] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    location: 'all',
    dateRange: 'all',
    salary: 'all'
  });
  const [userFilters, setUserFilters] = useState({
    search: '',
    userType: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const handleDeleteJob = (jobId) => {
    setJobs(jobs.filter(job => job.id !== jobId));
    setShowDeleteConfirm(null);
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setActiveTab('edit-job');
  };

  // Funciones para manejar filtros
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleUserFilterChange = (filterType, value) => {
    setUserFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      location: 'all',
      dateRange: 'all',
      salary: 'all'
    });
  };

  const clearUserFilters = () => {
    setUserFilters({
      search: '',
      userType: 'all',
      status: 'all',
      dateRange: 'all'
    });
  };

  // Función para filtrar trabajos
  const getFilteredJobs = () => {
    const sampleJobs = [
      { id: 1, title: 'Desarrollador Frontend React', company: 'TechCorp', location: 'Ciudad de México', salary: '$25,000 - $35,000', type: 'Tiempo completo', status: 'Activo', date: '2024-01-15' },
      { id: 2, title: 'Diseñador UX/UI', company: 'DesignStudio', location: 'Guadalajara', salary: '$20,000 - $30,000', type: 'Tiempo completo', status: 'Activo', date: '2024-01-12' },
      { id: 3, title: 'Desarrollador Backend Node.js', company: 'StartupTech', location: 'Monterrey', salary: '$30,000 - $40,000', type: 'Tiempo completo', status: 'Pausado', date: '2024-01-10' },
      { id: 4, title: 'Analista de Datos', company: 'DataCorp', location: 'Remoto', salary: '$28,000 - $38,000', type: 'Medio tiempo', status: 'Activo', date: '2024-01-08' },
      { id: 5, title: 'Marketing Digital', company: 'AgencyPro', location: 'Puebla', salary: '$18,000 - $25,000', type: 'Freelance', status: 'Activo', date: '2024-01-05' }
    ];

    return sampleJobs.filter(job => {
      const matchesSearch = filters.search === '' || 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = filters.status === 'all' || job.status.toLowerCase() === filters.status.toLowerCase();
      const matchesType = filters.type === 'all' || job.type.toLowerCase() === filters.type.toLowerCase();
      const matchesLocation = filters.location === 'all' || job.location.toLowerCase().includes(filters.location.toLowerCase());
      
      return matchesSearch && matchesStatus && matchesType && matchesLocation;
    });
  };

  // Función para filtrar usuarios
  const getFilteredUsers = () => {
    const sampleUsers = [
      { id: 1, name: 'Juan Pérez', email: 'juan@email.com', type: 'Candidato', date: '2024-01-15', status: 'Activo' },
      { id: 2, name: 'María González', email: 'maria@empresa.com', type: 'Reclutador', date: '2024-01-10', status: 'Activo' },
      { id: 3, name: 'Carlos Rodríguez', email: 'carlos@tech.com', type: 'Candidato', date: '2024-01-08', status: 'Inactivo' },
      { id: 4, name: 'Ana Martínez', email: 'ana@startup.com', type: 'Reclutador', date: '2024-01-05', status: 'Activo' },
      { id: 5, name: 'Luis Fernández', email: 'luis@dev.com', type: 'Candidato', date: '2024-01-03', status: 'Activo' }
    ];

    return sampleUsers.filter(user => {
      const matchesSearch = userFilters.search === '' || 
        user.name.toLowerCase().includes(userFilters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(userFilters.search.toLowerCase());
      
      const matchesType = userFilters.userType === 'all' || user.type.toLowerCase() === userFilters.userType.toLowerCase();
      const matchesStatus = userFilters.status === 'all' || user.status.toLowerCase() === userFilters.status.toLowerCase();
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };



  const renderDashboard = () => (
    <div className="dashboard">
      <h2>Panel de Control</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{jobs.length}</h3>
            <p>Vacantes Activas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>1,234</h3>
            <p>Candidatos Registrados</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>89</h3>
            <p>Empresas Activas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>456</h3>
            <p>Aplicaciones Este Mes</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Actividad Reciente</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">✅</span>
            <div className="activity-content">
              <p><strong>Nueva vacante publicada:</strong> Desarrollador Frontend</p>
              <span className="activity-time">Hace 2 horas</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">👤</span>
            <div className="activity-content">
              <p><strong>Nuevo usuario registrado:</strong> María González</p>
              <span className="activity-time">Hace 4 horas</span>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📝</span>
            <div className="activity-content">
              <p><strong>Aplicación recibida:</strong> Diseñador UX/UI</p>
              <span className="activity-time">Hace 6 horas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobsManagement = () => {
    const filteredJobs = getFilteredJobs();
    
    return (
      <div className="jobs-management">
        <div className="section-header">
          <h2>Gestión de Trabajos ({filteredJobs.length})</h2>
          <button 
            className="btn-primary"
            onClick={() => setActiveTab('add-job')}
          >
            + Agregar Trabajo
          </button>
        </div>
        
        {/* Filtros Avanzados */}
        <div className="filters-container">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Buscar</label>
              <input
                type="text"
                placeholder="Buscar por título o empresa..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Estado</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="cerrado">Cerrado</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Tipo de Trabajo</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los tipos</option>
                <option value="tiempo completo">Tiempo Completo</option>
                <option value="medio tiempo">Medio Tiempo</option>
                <option value="freelance">Freelance</option>
                <option value="prácticas">Prácticas</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Ubicación</label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las ubicaciones</option>
                <option value="ciudad de méxico">Ciudad de México</option>
                <option value="guadalajara">Guadalajara</option>
                <option value="monterrey">Monterrey</option>
                <option value="remoto">Remoto</option>
              </select>
            </div>
            
            <div className="filter-actions">
              <button 
                className="filter-btn clear-filters"
                onClick={clearFilters}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabla de Trabajos */}
        <div className="jobs-table">
          {filteredJobs.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron trabajos que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Empresa</th>
                  <th>Ubicación</th>
                  <th>Salario</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>{job.salary}</td>
                    <td>
                      <span className={`job-type ${job.type.toLowerCase().replace(' ', '-')}`}>
                        {job.type}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${job.status.toLowerCase()}`}>
                        {job.status}
                      </span>
                    </td>
                    <td>{job.date}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => alert(`Ver detalles del trabajo: ${job.title}`)}
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditJob(job)}
                          title="Editar trabajo"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => setShowDeleteConfirm(job.id)}
                          title="Eliminar trabajo"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="confirm-modal">
              <h3>Confirmar Eliminación</h3>
              <p>¿Estás seguro de que quieres eliminar esta vacante?</p>
              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancelar
                </button>
                <button 
                  className="confirm-btn"
                  onClick={() => handleDeleteJob(showDeleteConfirm)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderUsers = () => {
    const filteredUsers = getFilteredUsers();

    return (
      <div className="users-management">
        <div className="section-header">
          <h2>Gestión de Usuarios ({filteredUsers.length})</h2>
        </div>
        
        {/* Filtros de Usuarios */}
        <div className="filters-container">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Buscar Usuario</label>
              <input 
                type="text" 
                placeholder="Buscar por nombre o email..." 
                value={userFilters.search}
                onChange={(e) => handleUserFilterChange('search', e.target.value)}
                className="filter-input" 
              />
            </div>
            
            <div className="filter-group">
              <label>Tipo de Usuario</label>
              <select 
                value={userFilters.userType}
                onChange={(e) => handleUserFilterChange('userType', e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los tipos</option>
                <option value="candidato">Candidatos</option>
                <option value="reclutador">Reclutadores</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Estado</label>
              <select 
                value={userFilters.status}
                onChange={(e) => handleUserFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            
            <div className="filter-actions">
              <button 
                className="filter-btn clear-filters"
                onClick={clearUserFilters}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
        
        {/* Estadísticas de Usuarios */}
        <div className="user-stats">
          <div className="stat-card">
            <h4>Total Usuarios</h4>
            <span className="stat-number">{filteredUsers.length}</span>
          </div>
          <div className="stat-card">
            <h4>Candidatos</h4>
            <span className="stat-number">
              {filteredUsers.filter(u => u.type === 'Candidato').length}
            </span>
          </div>
          <div className="stat-card">
            <h4>Reclutadores</h4>
            <span className="stat-number">
              {filteredUsers.filter(u => u.type === 'Reclutador').length}
            </span>
          </div>
          <div className="stat-card">
            <h4>Usuarios Activos</h4>
            <span className="stat-number">
              {filteredUsers.filter(u => u.status === 'Activo').length}
            </span>
          </div>
        </div>
        
        {/* Tabla de Usuarios */}
        <div className="users-table">
          {filteredUsers.length === 0 ? (
            <div className="no-results">
              <p>No se encontraron usuarios que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Tipo</th>
                  <th>Fecha Registro</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`user-type ${user.type.toLowerCase()}`}>
                        {user.type}
                      </span>
                    </td>
                    <td>{user.date}</td>
                    <td>
                      <span className={`status ${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => alert(`Ver detalles de ${user.name}`)}
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => alert(`Editar usuario ${user.name}`)}
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar a ${user.name}?`)) {
                              alert(`Usuario ${user.name} eliminado`);
                            }
                          }}
                          title="Eliminar usuario"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  const renderAddJob = () => (
    <div className="add-job">
      <div className="section-header">
        <h2>Nueva Vacante</h2>
        <button className="back-btn" onClick={() => setActiveTab('jobs')}>← Volver</button>
      </div>
      
      <div className="job-form">
        <form onSubmit={(e) => {
          e.preventDefault();
          // Aquí iría la lógica para agregar nueva vacante
          alert('Funcionalidad de agregar vacante pendiente de implementar');
        }}>
          <div className="form-row">
            <div className="form-group">
              <label>Título del Puesto</label>
              <input type="text" required className="form-input" />
            </div>
            <div className="form-group">
              <label>Empresa</label>
              <input type="text" required className="form-input" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Ubicación</label>
              <input type="text" required className="form-input" />
            </div>
            <div className="form-group">
              <label>Tipo</label>
              <select className="form-input">
                <option>Tiempo completo</option>
                <option>Medio tiempo</option>
                <option>Freelance</option>
                <option>Prácticas</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Salario</label>
            <input type="text" className="form-input" />
          </div>
          
          <div className="form-group">
            <label>Descripción</label>
            <textarea rows="4" className="form-input"></textarea>
          </div>
          
          <div className="form-group">
            <label>Requisitos</label>
            <textarea rows="4" className="form-input"></textarea>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setActiveTab('jobs')}>Cancelar</button>
            <button type="submit" className="submit-btn">Crear Vacante</button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEditJob = () => (
    <div className="edit-job">
      <div className="section-header">
        <h2>Editar Vacante</h2>
        <button className="back-btn" onClick={() => setActiveTab('jobs')}>← Volver</button>
      </div>
      
      {editingJob && (
        <div className="job-form">
          <form onSubmit={(e) => {
            e.preventDefault();
            // Aquí iría la lógica para actualizar la vacante
            alert('Funcionalidad de editar vacante pendiente de implementar');
          }}>
            <div className="form-row">
              <div className="form-group">
                <label>Título del Puesto</label>
                <input type="text" defaultValue={editingJob.title} required className="form-input" />
              </div>
              <div className="form-group">
                <label>Empresa</label>
                <input type="text" defaultValue={editingJob.company} required className="form-input" />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Ubicación</label>
                <input type="text" defaultValue={editingJob.location} required className="form-input" />
              </div>
              <div className="form-group">
                <label>Tipo</label>
                <select defaultValue={editingJob.type} className="form-input">
                  <option>Tiempo completo</option>
                  <option>Medio tiempo</option>
                  <option>Freelance</option>
                  <option>Prácticas</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label>Salario</label>
              <input type="text" defaultValue={editingJob.salary} className="form-input" />
            </div>
            
            <div className="form-group">
              <label>Descripción</label>
              <textarea rows="4" defaultValue={editingJob.description} className="form-input"></textarea>
            </div>
            
            <div className="form-group">
              <label>Requisitos</label>
              <textarea rows="4" defaultValue={editingJob.requirements} className="form-input"></textarea>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setActiveTab('jobs')}>Cancelar</button>
              <button type="submit" className="submit-btn">Actualizar Vacante</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="settings">
      <h2>Configuración del Sistema</h2>
      
      <div className="settings-sections">
        <div className="settings-section">
          <h3>Configuración General</h3>
          <div className="setting-item">
            <label>Nombre del Sitio</label>
            <input type="text" defaultValue="BolsaTrabajo" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>Email de Contacto</label>
            <input type="email" defaultValue="contacto@bolsatrabajo.com" className="setting-input" />
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Configuración de Vacantes</h3>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked /> 
              Aprobar vacantes automáticamente
            </label>
          </div>
          <div className="setting-item">
            <label>
              <input type="checkbox" defaultChecked /> 
              Notificar nuevas aplicaciones
            </label>
          </div>
        </div>
        
        <div className="settings-section">
          <h3>Configuración de Email</h3>
          <div className="setting-item">
            <label>Servidor SMTP</label>
            <input type="text" placeholder="smtp.gmail.com" className="setting-input" />
          </div>
          <div className="setting-item">
            <label>Puerto</label>
            <input type="number" defaultValue="587" className="setting-input" />
          </div>
        </div>
      </div>
      
      <button className="save-settings-btn" onClick={() => alert('Configuración guardada (funcionalidad pendiente)')}>Guardar Configuración</button>
    </div>
  );

  return (
    <div className="admin-panel">
      <div className="admin-sidebar">
        <h2>Panel de Administración</h2>
        <nav className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`nav-btn ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            💼 Vacantes
          </button>
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Usuarios
          </button>
          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Configuración
          </button>
        </nav>
      </div>
      
      <div className="admin-content">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'jobs' && renderJobsManagement()}
        {activeTab === 'add-job' && renderAddJob()}
        {activeTab === 'edit-job' && renderEditJob()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default AdminPanel;