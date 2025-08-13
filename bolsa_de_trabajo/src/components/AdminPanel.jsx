import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import { API_ENDPOINTS } from '../config/api';
import { 
  handleError, 
  safeValue, 
  formatUserName, 
  showErrorNotification, 
  showSuccessNotification,
  withErrorHandling,
  logError 
} from '../utils/errorHandler';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingJob, setEditingJob] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingApplication, setEditingApplication] = useState(null);
  const [editingCandidato, setEditingCandidato] = useState(null);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados para datos
  const [users, setUsers] = useState([]);
  const [vacantes, setVacantes] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    type: 'all',
    location: 'all',
    dateRange: 'all',
    salary: 'all',
    incluirEliminadas: false
  });
  const [userFilters, setUserFilters] = useState({
    search: '',
    userType: 'all',
    status: 'all',
    dateRange: 'all'
  });
  
  const [empresaFilters, setEmpresaFilters] = useState({
    incluirEliminadas: false
  });
  
  // Estados para formularios
  const [jobForm, setJobForm] = useState({
    titulo: '',
    descripcion: '',
    requisitos: '',
    salario: '',
    ubicacion: '',
    tipo_trabajo: 'Tiempo completo',
    estado: 'Abierta',
    fecha_cierre: ''
  });
  
  const [userForm, setUserForm] = useState({
    nombre_usuario: '',
    email: '',
    rol: 'CANDIDATO',
    telefono: '',
    direccion: ''
  });
  
  const [validationErrors, setValidationErrors] = useState({});

  // Efectos para cargar datos
  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'jobs') loadVacantes();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'applications') loadPostulaciones();
    if (activeTab === 'candidatos') loadCandidatos();
    if (activeTab === 'empresas') loadEmpresas();
    if (activeTab === 'edit-job') loadEmpresas();
  }, [activeTab]);

  // Recargar vacantes cuando cambie el filtro incluirEliminadas
  useEffect(() => {
    if (activeTab === 'jobs') {
      loadVacantes();
    }
  }, [filters.incluirEliminadas]);

  // Funciones de API
  const loadDashboardData = async () => {
     try {
       setLoading(true);
       const response = await fetch(API_ENDPOINTS.admin.getEstadisticas);
       const data = await response.json();
       setEstadisticas(data);
     } catch (error) {
       setError('Error al cargar estadísticas');
     } finally {
       setLoading(false);
     }
   };
 
   const loadVacantes = async () => {
    try {
      setLoading(true);
      setError('');
      const url = `${API_ENDPOINTS.admin.getVacantes}?incluir_eliminadas=${filters.incluirEliminadas}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No se encontraron vacantes en el sistema.');
        } else if (response.status === 500) {
          throw new Error('Error interno del servidor. Por favor, contacta al administrador.');
        } else if (response.status >= 400) {
          throw new Error(`Error del servidor: ${response.status}. Por favor, intenta nuevamente.`);
        }
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Formato de datos inválido recibido del servidor.');
      }
      
      setVacantes(data);
    } catch (error) {
     const errorMessage = handleError(error, 'Error al cargar las vacantes');
     showErrorNotification(errorMessage, setError);
     logError(error, errorMessage);
     setVacantes([]);
   } finally {
      setLoading(false);
    }
  };
 
   const loadUsers = async () => {
     try {
       setLoading(true);
       const response = await fetch(API_ENDPOINTS.admin.getUsers);
       const data = await response.json();
       setUsers(data);
     } catch (error) {
      const errorMessage = handleError(error, 'Error al cargar los usuarios');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
       setLoading(false);
     }
   };
 
   const loadEmpresas = async (incluirEliminadas = empresaFilters.incluirEliminadas) => {
     try {
       const url = incluirEliminadas 
         ? `${API_ENDPOINTS.admin.getEmpresas}?incluir_eliminadas=true`
         : API_ENDPOINTS.admin.getEmpresas;
       const response = await fetch(url);
       const data = await response.json();
       setEmpresas(data);
     } catch (error) {
       const errorMessage = handleError(error, 'Error al cargar las empresas');
       showErrorNotification(errorMessage, setError);
       logError(error, errorMessage);
     }
   };

   const loadCandidatos = async () => {
     try {
       setLoading(true);
       const response = await fetch(API_ENDPOINTS.admin.getCandidatos);
       const data = await response.json();
       setCandidatos(data);
     } catch (error) {
       const errorMessage = handleError(error, 'Error al cargar los candidatos');
       showErrorNotification(errorMessage, setError);
       logError(error, errorMessage);
     } finally {
       setLoading(false);
     }
   };

   const loadPostulaciones = async () => {
     try {
       setLoading(true);
       setError('');
       const response = await fetch(API_ENDPOINTS.admin.getPostulaciones);
       
       if (!response.ok) {
         if (response.status === 404) {
           throw new Error('No se encontraron postulaciones en el sistema.');
         } else if (response.status === 500) {
           throw new Error('Error interno del servidor. Por favor, contacta al administrador.');
         } else if (response.status >= 400) {
           throw new Error(`Error del servidor: ${response.status}. Por favor, intenta nuevamente.`);
         }
       }
       
       const data = await response.json();
       
       if (!Array.isArray(data)) {
         throw new Error('Formato de datos inválido recibido del servidor.');
       }
       
       setPostulaciones(data);
     } catch (error) {
       const errorMessage = handleError(error, 'Error al cargar las postulaciones');
       showErrorNotification(errorMessage, setError);
       logError(error, errorMessage);
       setPostulaciones([]);
     } finally {
       setLoading(false);
     }
   };

   // Filtros para postulaciones
   const [applicationFilters, setApplicationFilters] = useState({
     search: '',
     estado: 'all',
     empresa: 'all',
     fechaDesde: '',
     fechaHasta: ''
   });

   const handleApplicationFilterChange = (filterType, value) => {
     setApplicationFilters(prev => ({
       ...prev,
       [filterType]: value
     }));
   };

   const clearApplicationFilters = () => {
     setApplicationFilters({
       search: '',
       estado: 'all',
       empresa: 'all',
       fechaDesde: '',
       fechaHasta: ''
     });
   };

   // Función para filtrar postulaciones
   const getFilteredApplications = () => {
     try {
       if (!postulaciones || postulaciones.length === 0) {
         return [];
       }
       
       return postulaciones.filter(application => {
         const matchesSearch = applicationFilters.search === '' || 
           (application.nombreCandidato && application.nombreCandidato.toLowerCase().includes(applicationFilters.search.toLowerCase())) ||
           (application.tituloVacante && application.tituloVacante.toLowerCase().includes(applicationFilters.search.toLowerCase())) ||
           (application.nombreEmpresa && application.nombreEmpresa.toLowerCase().includes(applicationFilters.search.toLowerCase()));
         
         const matchesEstado = applicationFilters.estado === 'all' || (application.estado && application.estado.toLowerCase() === applicationFilters.estado.toLowerCase());
         
         const matchesEmpresa = applicationFilters.empresa === 'all' || (application.nombreEmpresa && application.nombreEmpresa.toLowerCase().includes(applicationFilters.empresa.toLowerCase()));
         
         let matchesFecha = true;
         if (applicationFilters.fechaDesde || applicationFilters.fechaHasta) {
           const fechaPostulacion = new Date(application.fechaPostulacion);
           if (applicationFilters.fechaDesde) {
             const fechaDesde = new Date(applicationFilters.fechaDesde);
             matchesFecha = matchesFecha && fechaPostulacion >= fechaDesde;
           }
           if (applicationFilters.fechaHasta) {
             const fechaHasta = new Date(applicationFilters.fechaHasta);
             fechaHasta.setHours(23, 59, 59, 999); // Incluir todo el día
             matchesFecha = matchesFecha && fechaPostulacion <= fechaHasta;
           }
         }
         
         return matchesSearch && matchesEstado && matchesEmpresa && matchesFecha;
       });
     } catch (error) {
       console.error('Error al filtrar postulaciones:', error);
       setError('Error al filtrar las postulaciones. Por favor, intenta nuevamente.');
       return [];
     }
   };

   // Obtener lista única de empresas para el filtro
   const getUniqueEmpresas = () => {
     const empresas = [...new Set(postulaciones.map(p => p.nombreEmpresa).filter(Boolean))];
     return empresas.sort();
   };

  // Validaciones
  const validateJobForm = (form, isEditing = false) => {
    const errors = {};
    if (!form.titulo.trim()) errors.titulo = 'El título es requerido';
    if (!form.descripcion.trim()) errors.descripcion = 'La descripción es requerida';
    if (!form.ubicacion.trim()) errors.ubicacion = 'La ubicación es requerida';
    // Solo validar empresa_id al crear, no al editar
    if (!isEditing && !form.empresa_id) errors.empresa_id = 'Debe seleccionar una empresa';
    if (form.salario_min && form.salario_max && parseFloat(form.salario_min) > parseFloat(form.salario_max)) {
      errors.salario = 'El salario mínimo no puede ser mayor al máximo';
    }
    return errors;
  };

  const validateUserForm = (form) => {
    const errors = {};
    if (!form.nombre_usuario.trim()) errors.nombre_usuario = 'El nombre es requerido';
    if (!form.email.trim()) errors.email = 'El email es requerido';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email inválido';
    }
    return errors;
  };

  // CRUD Operations
  const handleCreateJob = async (e) => {
    e.preventDefault();
    const errors = validateJobForm(jobForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.admin.createVacante, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm)
      });
      
      if (response.ok) {
        showSuccessNotification('Vacante creada exitosamente', setSuccess);
        setJobForm({
          titulo: '',
          descripcion: '',
          requisitos: '',
          salario_min: '',
          salario_max: '',
          ubicacion: '',
          tipo_trabajo: 'Tiempo completo',
          empresa_id: '',
          estado: 'Activa'
        });
        setValidationErrors({});
        loadVacantes();
        setActiveTab('jobs');
      } else {
        const errorData = await response.json();
        const errorMessage = handleError(errorData, 'Error al crear la vacante');
        showErrorNotification(errorMessage, setError);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error de conexión al crear la vacante');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    const errors = validateJobForm(jobForm, true); // Pasar true para indicar que es edición
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      // Mapear campos del frontend al formato esperado por el backend
      const dataToSend = {
        titulo: jobForm.titulo,
        descripcion: jobForm.descripcion,
        requisitos: jobForm.requisitos,
        salario: parseFloat(jobForm.salario) || 0,
        tipoContrato: jobForm.tipo_trabajo,
        ubicacion: jobForm.ubicacion,
        fechaCierre: jobForm.fecha_cierre || null,
        estado: jobForm.estado
      };
      
      // Si se marcó la opción de activar vacante eliminada, agregar eliminado: 0
      if (jobForm.activar) {
        dataToSend.eliminado = 0;
      }
      
      const response = await fetch(API_ENDPOINTS.admin.updateVacante(editingJob.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (response.ok) {
        showSuccessNotification('Vacante actualizada exitosamente', setSuccess);
        setEditingJob(null);
        setValidationErrors({});
        loadVacantes();
        setActiveTab('jobs');
      } else {
        const errorData = await response.json();
        const errorMessage = handleError(errorData, 'Error al actualizar la vacante');
        showErrorNotification(errorMessage, setError);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error de conexión al actualizar la vacante');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.admin.deleteVacante(jobId), {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showSuccessNotification('Vacante eliminada exitosamente', setSuccess);
        loadVacantes();
      } else {
        const errorData = await response.json();
        const errorMessage = handleError(errorData, 'Error al eliminar la vacante');
        showErrorNotification(errorMessage, setError);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error de conexión al eliminar la vacante');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const errors = validateUserForm(userForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.admin.createUser, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      
      if (response.ok) {
        showSuccessNotification('Usuario creado exitosamente', setSuccess);
        setUserForm({
          nombre_usuario: '',
          email: '',
          rol: 'CANDIDATO',
          telefono: '',
          direccion: ''
        });
        setValidationErrors({});
        loadUsers();
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        const errorMessage = handleError(errorData, 'Error al crear el usuario');
        showErrorNotification(errorMessage, setError);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error de conexión al crear el usuario');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const errors = validateUserForm(userForm);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      setLoading(true);
      
      // Mapear campos del frontend al formato esperado por el backend
      const dataToSend = {
        nombreUsuario: userForm.nombre_usuario,
        correo: userForm.email,
        rol: userForm.rol,
        telefono: userForm.telefono || '',
        direccion: userForm.direccion || ''
      };
      
      const response = await fetch(API_ENDPOINTS.admin.updateUser(editingUser.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      if (response.ok) {
        showSuccessNotification('Usuario actualizado exitosamente', setSuccess);
        setEditingUser(null);
        setValidationErrors({});
        loadUsers();
      } else {
        const errorData = await response.json();
        const errorMessage = handleError(errorData, 'Error al actualizar el usuario');
        showErrorNotification(errorMessage, setError);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error de conexión al actualizar el usuario');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.admin.deleteUser(userId), {
        method: 'DELETE'
      });
      
      if (response.ok) {
        showSuccessNotification('Usuario eliminado exitosamente', setSuccess);
        loadUsers();
      } else {
        const errorData = await response.json();
        const errorMessage = handleError(errorData, 'Error al eliminar el usuario');
        showErrorNotification(errorMessage, setError);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error de conexión al eliminar el usuario');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setJobForm({
      titulo: job.titulo || '',
      descripcion: job.descripcion || '',
      requisitos: job.requisitos || '',
      salario: job.salario || '',
      ubicacion: job.ubicacion || '',
      tipo_trabajo: job.tipoContrato || 'Tiempo completo',
      estado: job.estado || 'Abierta',
      fecha_cierre: job.fechaCierre ? job.fechaCierre.split('T')[0] : ''
    });
    setActiveTab('edit-job');
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      nombre_usuario: user.nombreUsuario || '',
      email: user.correo || '',
      rol: user.rol || 'CANDIDATO',
      telefono: user.telefono || '',
      direccion: user.direccion || ''
    });
    setActiveTab('edit-user');
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
      salary: 'all',
      incluirEliminadas: false
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
    try {
      if (!vacantes || vacantes.length === 0) {
        return [];
      }
      
      return vacantes.filter(job => {
        const matchesSearch = filters.search === '' || 
          (job.titulo && job.titulo.toLowerCase().includes(filters.search.toLowerCase())) ||
          (job.nombreEmpresa && job.nombreEmpresa.toLowerCase().includes(filters.search.toLowerCase()));
        
        const matchesStatus = filters.status === 'all' || (job.estado && job.estado.toLowerCase() === filters.status.toLowerCase());
        const matchesType = filters.type === 'all' || (job.tipoContrato && job.tipoContrato.toLowerCase() === filters.type.toLowerCase());
        const matchesLocation = filters.location === 'all' || (job.ubicacion && job.ubicacion.toLowerCase().includes(filters.location.toLowerCase()));
        
        return matchesSearch && matchesStatus && matchesType && matchesLocation;
      });
    } catch (error) {
      console.error('Error al filtrar vacantes:', error);
      setError('Error al filtrar las vacantes. Por favor, intenta nuevamente.');
      return [];
    }
  };

  // Función para filtrar usuarios
  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = userFilters.search === '' || 
        user.nombreUsuario.toLowerCase().includes(userFilters.search.toLowerCase()) ||
        user.correo.toLowerCase().includes(userFilters.search.toLowerCase());
      
      const matchesType = userFilters.userType === 'all' || user.rol.toLowerCase() === userFilters.userType.toLowerCase();
      const matchesStatus = userFilters.status === 'all' || 
                           (userFilters.status === 'activo' && user.activo) ||
                           (userFilters.status === 'inactivo' && !user.activo);
      
      return matchesSearch && matchesType && matchesStatus;
    });
  };

  // Función para mostrar mensajes
  const showMessage = (message, type = 'success') => {
    if (type === 'success') {
      setSuccess(message);
      setError('');
    } else {
      setError(message);
      setSuccess('');
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };



  const renderDashboard = () => (
    <div className="dashboard">
      <h2>Panel de Control</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-content">
            <h3>{estadisticas.vacantes_activas || vacantes.length}</h3>
            <p>Vacantes Activas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{estadisticas.candidatos_registrados || users.filter(u => u.rol === 'CANDIDATO').length}</h3>
            <p>Candidatos Registrados</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{estadisticas.empresas_activas || empresas.length}</h3>
            <p>Empresas Activas</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{estadisticas.postulaciones_mes || postulaciones.length}</h3>
            <p>Aplicaciones Este Mes</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Actividad Reciente</h3>
        <div className="activity-list">
          {loading ? (
            <div className="loading">Cargando actividad...</div>
          ) : (
            <>
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
            </>
          )}
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
                <option value="abierta">Abierta</option>
                <option value="cerrada">Cerrada</option>
                <option value="pausada">Pausada</option>
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
            
            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.incluirEliminadas}
                  onChange={(e) => handleFilterChange('incluirEliminadas', e.target.checked)}
                  className="filter-checkbox"
                />
                Incluir vacantes eliminadas
              </label>
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
          {loading ? (
            <div className="loading-message">
              <p>Cargando vacantes...</p>
            </div>
          ) : error ? (
            <div className="error-message">
              <p>{error}</p>
              <button 
                className="retry-btn"
                onClick={loadVacantes}
              >
                Reintentar
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="no-results">
              {vacantes.length === 0 ? (
                <p>No hay vacantes registradas en el sistema.</p>
              ) : (
                <>
                  <p>No se encontraron vacantes que coincidan con los filtros seleccionados.</p>
                  <button 
                    className="clear-filters-btn"
                    onClick={clearFilters}
                  >
                    Limpiar filtros
                  </button>
                </>
              )}
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
                  <th>Eliminado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(job => (
                  <tr key={job.id}>
                    <td>{job.id}</td>
                    <td>{job.titulo}</td>
                    <td>{job.nombreEmpresa}</td>
                    <td>{job.ubicacion}</td>
                    <td>
                      {job.salario 
                        ? `$${job.salario.toLocaleString()}`
                        : 'No especificado'
                      }
                    </td>
                    <td>
                      <span className={`job-type ${(job.tipoContrato || '').toLowerCase().replace(' ', '-')}`}>
                        {job.tipoContrato}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${(job.estado || '').toLowerCase()}`}>
                        {job.estado}
                      </span>
                    </td>
                    <td>
                      <span className={`eliminado-status ${job.eliminado ? 'eliminado' : 'activo'}`}>
                        {job.eliminado ? '🗑️ Sí' : '✅ No'}
                      </span>
                    </td>
                    <td>{job.fechaPublicacion ? new Date(job.fechaPublicacion).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => alert(`Ver detalles del trabajo: ${job.titulo || job.title}`)}
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
                <option value="empresa">Empresas</option>
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
              {filteredUsers.filter(u => u.rol === 'CANDIDATO').length}
            </span>
          </div>
          <div className="stat-card">
            <h4>Empresas</h4>
            <span className="stat-number">
              {filteredUsers.filter(u => u.rol === 'EMPRESA').length}
            </span>
          </div>
          <div className="stat-card">
            <h4>Usuarios Activos</h4>
            <span className="stat-number">
              {filteredUsers.filter(u => u.activo === true).length}
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
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{formatUserName(user)}</td>
                    <td>{user.correo}</td>
                    <td>
                      <span className={`user-type ${(user.rol || '').toLowerCase()}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${user.activo ? 'activo' : 'inactivo'}`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => alert(`Ver detalles de ${formatUserName(user)}`)}
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEditUser(user)}
                          title="Editar usuario"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar a ${formatUserName(user)}?`)) {
                              handleDeleteUser(user.id);
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

  const renderAddJob = () => {
    useEffect(() => {
      loadEmpresas();
    }, []);

    return (
      <div className="add-job">
        <div className="section-header">
          <h2>Nueva Vacante</h2>
          <button className="back-btn" onClick={() => setActiveTab('jobs')}>← Volver</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="job-form">
          <form onSubmit={handleCreateJob}>
            <div className="form-group">
              <label htmlFor="titulo">Título de la Vacante *</label>
              <input
                type="text"
                id="titulo"
                value={jobForm.titulo}
                onChange={(e) => setJobForm({...jobForm, titulo: e.target.value})}
                className={validationErrors.titulo ? 'form-input error' : 'form-input'}
                placeholder="Ej: Desarrollador Frontend React"
              />
              {validationErrors.titulo && <span className="error-text">{validationErrors.titulo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="empresa_id">Empresa *</label>
              <select
                id="empresa_id"
                value={jobForm.empresa_id}
                onChange={(e) => setJobForm({...jobForm, empresa_id: e.target.value})}
                className={validationErrors.empresa_id ? 'form-input error' : 'form-input'}
              >
                <option value="">Seleccionar empresa</option>
                {empresas.map(empresa => (
                  <option key={empresa.id} value={empresa.id}>
                    {empresa.nombre_empresa}
                  </option>
                ))}
              </select>
              {validationErrors.empresa_id && <span className="error-text">{validationErrors.empresa_id}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                value={jobForm.descripcion}
                onChange={(e) => setJobForm({...jobForm, descripcion: e.target.value})}
                className={validationErrors.descripcion ? 'form-input error' : 'form-input'}
                rows="4"
                placeholder="Describe las responsabilidades y funciones del puesto"
              />
              {validationErrors.descripcion && <span className="error-text">{validationErrors.descripcion}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="requisitos">Requisitos</label>
              <textarea
                id="requisitos"
                value={jobForm.requisitos}
                onChange={(e) => setJobForm({...jobForm, requisitos: e.target.value})}
                className="form-input"
                rows="3"
                placeholder="Especifica los requisitos y habilidades necesarias"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="salario_min">Salario Mínimo</label>
                <input
                  type="number"
                  id="salario_min"
                  value={jobForm.salario_min}
                  onChange={(e) => setJobForm({...jobForm, salario_min: e.target.value})}
                  className="form-input"
                  placeholder="25000"
                />
              </div>
              <div className="form-group">
                <label htmlFor="salario_max">Salario Máximo</label>
                <input
                  type="number"
                  id="salario_max"
                  value={jobForm.salario_max}
                  onChange={(e) => setJobForm({...jobForm, salario_max: e.target.value})}
                  className="form-input"
                  placeholder="35000"
                />
              </div>
            </div>
            {validationErrors.salario && <span className="error-text">{validationErrors.salario}</span>}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ubicacion">Ubicación *</label>
                <input
                  type="text"
                  id="ubicacion"
                  value={jobForm.ubicacion}
                  onChange={(e) => setJobForm({...jobForm, ubicacion: e.target.value})}
                  className={validationErrors.ubicacion ? 'form-input error' : 'form-input'}
                  placeholder="Ciudad, País o Remoto"
                />
                {validationErrors.ubicacion && <span className="error-text">{validationErrors.ubicacion}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="tipo_trabajo">Tipo de Trabajo</label>
                <select
                  id="tipo_trabajo"
                  value={jobForm.tipo_trabajo}
                  onChange={(e) => setJobForm({...jobForm, tipo_trabajo: e.target.value})}
                  className="form-input"
                >
                  <option value="Tiempo completo">Tiempo completo</option>
                  <option value="Medio tiempo">Medio tiempo</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Prácticas">Prácticas</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                value={jobForm.estado}
                onChange={(e) => setJobForm({...jobForm, estado: e.target.value})}
                className="form-input"
              >
                <option value="Activa">Activa</option>
                <option value="Pausada">Pausada</option>
                <option value="Cerrada">Cerrada</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setActiveTab('jobs')}>Cancelar</button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Creando...' : 'Crear Vacante'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderEditJob = () => {
    return (
      <div className="edit-job">
        <div className="section-header">
          <h2>Editar Vacante</h2>
          <button className="back-btn" onClick={() => setActiveTab('jobs')}>← Volver</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {editingJob && (
          <div className="job-form">
            <form onSubmit={handleUpdateJob}>
              <div className="form-group">
                <label htmlFor="titulo">Título de la Vacante *</label>
                <input
                  type="text"
                  id="titulo"
                  value={jobForm.titulo}
                  onChange={(e) => setJobForm({...jobForm, titulo: e.target.value})}
                  className={validationErrors.titulo ? 'form-input error' : 'form-input'}
                  placeholder="Ej: Desarrollador Frontend React"
                />
                {validationErrors.titulo && <span className="error-text">{validationErrors.titulo}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="empresa_nombre">Empresa</label>
                <input
                  type="text"
                  id="empresa_nombre"
                  value={editingJob?.nombreEmpresa || ''}
                  className="form-input"
                  disabled
                  style={{backgroundColor: '#f5f5f5', color: '#666'}}
                />
              </div>



              <div className="form-group">
                <label htmlFor="descripcion">Descripción *</label>
                <textarea
                  id="descripcion"
                  value={jobForm.descripcion}
                  onChange={(e) => setJobForm({...jobForm, descripcion: e.target.value})}
                  className={validationErrors.descripcion ? 'form-input error' : 'form-input'}
                  rows="4"
                  placeholder="Describe las responsabilidades y funciones del puesto"
                />
                {validationErrors.descripcion && <span className="error-text">{validationErrors.descripcion}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="requisitos">Requisitos</label>
                <textarea
                  id="requisitos"
                  value={jobForm.requisitos}
                  onChange={(e) => setJobForm({...jobForm, requisitos: e.target.value})}
                  className="form-input"
                  rows="3"
                  placeholder="Especifica los requisitos y habilidades necesarias"
                />
              </div>

              <div className="form-group">
                <label htmlFor="salario">Salario</label>
                <input
                  type="number"
                  id="salario"
                  value={jobForm.salario}
                  onChange={(e) => setJobForm({...jobForm, salario: e.target.value})}
                  className="form-input"
                  placeholder="30000"
                />
                {validationErrors.salario && <span className="error-text">{validationErrors.salario}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ubicacion">Ubicación *</label>
                  <input
                    type="text"
                    id="ubicacion"
                    value={jobForm.ubicacion}
                    onChange={(e) => setJobForm({...jobForm, ubicacion: e.target.value})}
                    className={validationErrors.ubicacion ? 'form-input error' : 'form-input'}
                    placeholder="Ciudad, País o Remoto"
                  />
                  {validationErrors.ubicacion && <span className="error-text">{validationErrors.ubicacion}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="tipo_trabajo">Tipo de Trabajo</label>
                  <select
                    id="tipo_trabajo"
                    value={jobForm.tipo_trabajo}
                    onChange={(e) => setJobForm({...jobForm, tipo_trabajo: e.target.value})}
                    className="form-input"
                  >
                    <option value="Tiempo completo">Tiempo completo</option>
                    <option value="Medio tiempo">Medio tiempo</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Prácticas">Prácticas</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="estado">Estado</label>
                  <select
                    id="estado"
                    value={jobForm.estado}
                    onChange={(e) => setJobForm({...jobForm, estado: e.target.value})}
                    className="form-input"
                  >
                    <option value="Abierta">Abierta</option>
                    <option value="Cerrada">Cerrada</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fecha_cierre">Fecha de Cierre</label>
                  <input
                    type="date"
                    id="fecha_cierre"
                    value={jobForm.fecha_cierre}
                    onChange={(e) => setJobForm({...jobForm, fecha_cierre: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Campo para activar vacante eliminada */}
              {editingJob?.eliminado && (
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={jobForm.activar || false}
                      onChange={(e) => setJobForm({...jobForm, activar: e.target.checked})}
                      className="filter-checkbox"
                    />
                    Activar vacante (quitar de eliminadas)
                  </label>
                  <small className="form-help-text">
                    Marque esta opción para reactivar la vacante eliminada
                  </small>
                </div>
              )}
              
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setActiveTab('jobs')}>Cancelar</button>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Actualizando...' : 'Actualizar Vacante'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar el formulario de editar usuario
  const renderEditUser = () => (
    <div className="edit-user">
      <div className="section-header">
        <h2>Editar Usuario</h2>
        <button className="back-btn" onClick={() => setActiveTab('users')}>← Volver</button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {editingUser && (
        <div className="user-form">
          <form onSubmit={handleUpdateUser}>
            <div className="form-group">
              <label htmlFor="nombre_usuario">Nombre de Usuario *</label>
              <input
                type="text"
                id="nombre_usuario"
                value={userForm.nombre_usuario}
                onChange={(e) => setUserForm({...userForm, nombre_usuario: e.target.value})}
                className={validationErrors.nombre_usuario ? 'form-input error' : 'form-input'}
                placeholder="Nombre completo del usuario"
              />
              {validationErrors.nombre_usuario && <span className="error-text">{validationErrors.nombre_usuario}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                className={validationErrors.email ? 'form-input error' : 'form-input'}
                placeholder="correo@ejemplo.com"
              />
              {validationErrors.email && <span className="error-text">{validationErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="rol">Rol</label>
              <select
                id="rol"
                value={userForm.rol}
                onChange={(e) => setUserForm({...userForm, rol: e.target.value})}
                className="form-input"
                disabled
              >
                <option value="CANDIDATO">Candidato</option>
                <option value="EMPRESA">Empresa</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  value={userForm.telefono}
                  onChange={(e) => setUserForm({...userForm, telefono: e.target.value})}
                  className="form-input"
                  placeholder="Número de teléfono"
                />
              </div>
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  value={userForm.direccion}
                  onChange={(e) => setUserForm({...userForm, direccion: e.target.value})}
                  className="form-input"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setActiveTab('users')}>Cancelar</button>
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Actualizando...' : 'Actualizar Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  // Funciones CRUD para Candidatos (disponibles globalmente)
  const handleUpdateCandidato = async (candidatoData) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.admin.updateCandidato(candidatoData.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(candidatoData),
      });

      if (response.ok) {
        showSuccessNotification('Candidato actualizado exitosamente', setSuccess);
        await loadCandidatos();
        setEditingCandidato(null);
      } else {
        throw new Error('Error al actualizar candidato');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error al actualizar candidato');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidato = async (candidatoId) => {
    console.log('handleDeleteCandidato iniciado con ID:', candidatoId);
    try {
      setLoading(true);
      console.log('Enviando petición DELETE a:', API_ENDPOINTS.admin.deleteCandidato(candidatoId));
      const response = await fetch(API_ENDPOINTS.admin.deleteCandidato(candidatoId), {
        method: 'DELETE',
      });

      console.log('Respuesta recibida:', response.status, response.ok);
      if (response.ok) {
        console.log('Eliminación exitosa, recargando candidatos...');
        showSuccessNotification('Candidato eliminado exitosamente', setSuccess);
        await loadCandidatos();
        setShowDeleteConfirm(null);
      } else {
        console.error('Error en la respuesta:', response.status);
        throw new Error('Error al eliminar candidato');
      }
    } catch (error) {
      console.error('Error en handleDeleteCandidato:', error);
      const errorMessage = handleError(error, 'Error al eliminar candidato');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Funciones CRUD para Empresas
  const handleUpdateEmpresa = async (empresaData) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.admin.updateEmpresa(empresaData.id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(empresaData),
      });

      if (response.ok) {
        showSuccessNotification('Empresa actualizada exitosamente', setSuccess);
        await loadEmpresas();
        setEditingEmpresa(null);
      } else {
        throw new Error('Error al actualizar empresa');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error al actualizar empresa');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmpresa = async (empresaId) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.admin.deleteEmpresa(empresaId), {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccessNotification('Empresa eliminada exitosamente', setSuccess);
        await loadEmpresas();
        setShowDeleteConfirm(null);
      } else {
        throw new Error('Error al eliminar empresa');
      }
    } catch (error) {
      const errorMessage = handleError(error, 'Error al eliminar empresa');
      showErrorNotification(errorMessage, setError);
      logError(error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Función para renderizar la gestión de aplicaciones
  const renderApplications = () => {
    const filteredApplications = getFilteredApplications();
    const uniqueEmpresas = getUniqueEmpresas();

    const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
      try {
        setLoading(true);
        setError('');
        const response = await fetch(API_ENDPOINTS.admin.updatePostulacion(applicationId), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ estado: newStatus })
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo actualizar el estado`);
        }
        
        showSuccessNotification('Estado de postulación actualizado exitosamente', setSuccess);
        await loadPostulaciones(); // Usar la función mejorada
      } catch (error) {
        const errorMessage = handleError(error, 'Error al actualizar estado de postulación');
        showErrorNotification(errorMessage, setError);
        logError(error, errorMessage);
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteApplication = async (applicationId) => {
      if (confirm('¿Estás seguro de eliminar esta postulación? Esta acción no se puede deshacer.')) {
        try {
          setLoading(true);
          setError('');
          const response = await fetch(API_ENDPOINTS.admin.deletePostulacion(applicationId), {
            method: 'DELETE'
          });
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo eliminar la postulación`);
          }
          
          showSuccessNotification('Postulación eliminada exitosamente', setSuccess);
          await loadPostulaciones(); // Usar la función mejorada
        } catch (error) {
          const errorMessage = handleError(error, 'Error al eliminar postulación');
          showErrorNotification(errorMessage, setError);
          logError(error, errorMessage);
        } finally {
          setLoading(false);
        }
      }
    };

    const handleBulkStatusUpdate = async (status) => {
      const selectedIds = filteredApplications
        .filter(app => document.querySelector(`input[data-app-id="${app.id}"]:checked`))
        .map(app => app.id);
      
      if (selectedIds.length === 0) {
        setError('Por favor, selecciona al menos una postulación');
        return;
      }
      
      if (confirm(`¿Actualizar el estado de ${selectedIds.length} postulación(es) a "${status}"?`)) {
        try {
          setLoading(true);
          const promises = selectedIds.map(id => 
            fetch(API_ENDPOINTS.admin.updatePostulacion(id), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ estado: status })
            })
          );
          
          await Promise.all(promises);
          showSuccessNotification(`${selectedIds.length} postulación(es) actualizada(s) exitosamente`, setSuccess);
          await loadPostulaciones();
          
          // Desmarcar todas las casillas
          selectedIds.forEach(id => {
            const checkbox = document.querySelector(`input[data-app-id="${id}"]`);
            if (checkbox) checkbox.checked = false;
          });
        } catch (error) {
          setError('Error al actualizar postulaciones en lote');
        } finally {
          setLoading(false);
        }
      }
    };

    const exportToCSV = () => {
      try {
        const headers = ['ID', 'Candidato', 'Email Candidato', 'Vacante', 'Empresa', 'Fecha', 'Estado'];
        const csvContent = [
          headers.join(','),
          ...filteredApplications.map(app => [
            app.id,
            `"${app.nombreCandidato || 'N/A'}"`,
            `"${app.emailCandidato || 'N/A'}"`,
            `"${app.tituloVacante || 'N/A'}"`,
            `"${app.nombreEmpresa || 'N/A'}"`,
            app.fechaPostulacion ? new Date(app.fechaPostulacion).toLocaleDateString() : 'N/A',
            `"${app.estado || 'Pendiente'}"`
          ].join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `postulaciones_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessNotification('Archivo CSV exportado exitosamente', setSuccess);
      } catch (error) {
        setError('Error al exportar datos');
      }
    };

    // Funciones CRUD para Empresas (movidas fuera del renderizado)

    return (
      <div className="applications-management">
        <div className="section-header">
          <h2>Gestión de Postulaciones</h2>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={exportToCSV}
              disabled={filteredApplications.length === 0}
              title="Exportar datos filtrados a CSV"
            >
              📊 Exportar CSV
            </button>
            <button 
              className="btn btn-primary"
              onClick={loadPostulaciones}
              disabled={loading}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {/* Filtros Avanzados */}
        <div className="filters-section">
          <h3>Filtros de Búsqueda</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Buscar:</label>
              <input
                type="text"
                placeholder="Candidato, vacante o empresa..."
                value={applicationFilters.search}
                onChange={(e) => handleApplicationFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Estado:</label>
              <select
                value={applicationFilters.estado}
                onChange={(e) => handleApplicationFilterChange('estado', e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en revisión">En Revisión</option>
                <option value="aceptado">Aceptado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Empresa:</label>
              <select
                value={applicationFilters.empresa}
                onChange={(e) => handleApplicationFilterChange('empresa', e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las empresas</option>
                {uniqueEmpresas.map(empresa => (
                  <option key={empresa} value={empresa}>{empresa}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Fecha desde:</label>
              <input
                type="date"
                value={applicationFilters.fechaDesde}
                onChange={(e) => handleApplicationFilterChange('fechaDesde', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <label>Fecha hasta:</label>
              <input
                type="date"
                value={applicationFilters.fechaHasta}
                onChange={(e) => handleApplicationFilterChange('fechaHasta', e.target.value)}
                className="filter-input"
              />
            </div>
            
            <div className="filter-group">
              <button 
                className="btn btn-secondary"
                onClick={clearApplicationFilters}
                title="Limpiar todos los filtros"
              >
                🗑️ Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
        
        {/* Estadísticas */}
        <div className="applications-stats">
          <div className="stat-card">
            <h3>{postulaciones.length}</h3>
            <p>Total Postulaciones</p>
          </div>
          <div className="stat-card">
            <h3>{filteredApplications.length}</h3>
            <p>Filtradas</p>
          </div>
          <div className="stat-card">
            <h3>{postulaciones.filter(p => p.estado?.toLowerCase() === 'pendiente').length}</h3>
            <p>Pendientes</p>
          </div>
          <div className="stat-card">
            <h3>{postulaciones.filter(p => p.estado?.toLowerCase() === 'aceptado').length}</h3>
            <p>Aceptadas</p>
          </div>
          <div className="stat-card">
            <h3>{postulaciones.filter(p => p.estado?.toLowerCase() === 'rechazado').length}</h3>
            <p>Rechazadas</p>
          </div>
        </div>
        
        {/* Acciones en lote */}
        {filteredApplications.length > 0 && (
          <div className="bulk-actions">
            <h4>Acciones en Lote:</h4>
            <div className="bulk-buttons">
              <button 
                className="btn btn-success"
                onClick={() => handleBulkStatusUpdate('Aceptado')}
              >
                ✅ Aceptar Seleccionadas
              </button>
              <button 
                className="btn btn-warning"
                onClick={() => handleBulkStatusUpdate('En Revisión')}
              >
                👁️ Marcar En Revisión
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => handleBulkStatusUpdate('Rechazado')}
              >
                ❌ Rechazar Seleccionadas
              </button>
            </div>
          </div>
        )}
        
        {/* Tabla de postulaciones */}
        <div className="applications-table">
          <table>
            <thead>
              <tr>
                <th>
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      const checkboxes = document.querySelectorAll('input[data-app-id]');
                      checkboxes.forEach(cb => cb.checked = e.target.checked);
                    }}
                    title="Seleccionar todas"
                  />
                </th>
                <th>ID</th>
                <th>Candidato</th>
                <th>Email</th>
                <th>Vacante</th>
                <th>Empresa</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="loading">Cargando postulaciones...</td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan="9" className="no-data">
                    {postulaciones.length === 0 
                      ? 'No hay postulaciones registradas' 
                      : 'No se encontraron postulaciones con los filtros aplicados'
                    }
                  </td>
                </tr>
              ) : (
                filteredApplications.map(application => (
                  <tr key={application.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        data-app-id={application.id}
                        title="Seleccionar esta postulación"
                      />
                    </td>
                    <td>{application.id}</td>
                    <td>{safeValue(application.nombreCandidato, 'Candidato no disponible')}</td>
                    <td>{safeValue(application.emailCandidato, 'Email no disponible')}</td>
                    <td>{safeValue(application.tituloVacante, 'Vacante no disponible')}</td>
                    <td>{safeValue(application.nombreEmpresa, 'Empresa no disponible')}</td>
                    <td>{application.fechaPostulacion ? new Date(application.fechaPostulacion).toLocaleDateString('es-ES') : 'N/A'}</td>
                    <td>
                      <select
                        value={application.estado || 'Pendiente'}
                        onChange={(e) => handleUpdateApplicationStatus(application.id, e.target.value)}
                        className={`status-select ${(application.estado || 'pendiente').toLowerCase().replace(' ', '-')}`}
                        disabled={loading}
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="En Revisión">En Revisión</option>
                        <option value="Aceptado">Aceptado</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-btn"
                          onClick={() => {
                            // Aquí podrías abrir un modal con detalles completos
                            alert(`Detalles de postulación:\n\nID: ${application.id}\nCandidato: ${application.nombreCandidato}\nEmail: ${application.emailCandidato}\nVacante: ${application.tituloVacante}\nEmpresa: ${application.nombreEmpresa}\nFecha: ${application.fechaPostulacion ? new Date(application.fechaPostulacion).toLocaleString('es-ES') : 'N/A'}\nEstado: ${application.estado || 'Pendiente'}`);
                          }}
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDeleteApplication(application.id)}
                          title="Eliminar postulación"
                          disabled={loading}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Información adicional */}
        <div className="table-info">
          <p>Mostrando {filteredApplications.length} de {postulaciones.length} postulaciones</p>
          {applicationFilters.search || applicationFilters.estado !== 'all' || applicationFilters.empresa !== 'all' || applicationFilters.fechaDesde || applicationFilters.fechaHasta ? (
            <p className="filter-info">🔍 Filtros activos aplicados</p>
          ) : null}
        </div>
      </div>
    );
  };

  // Función para renderizar la gestión de candidatos
  const renderCandidatos = () => {
    console.log('Renderizando candidatos, showDeleteConfirm actual:', showDeleteConfirm);
    return (
      <div className="candidatos-management">
        <div className="section-header">
          <h2>Gestión de Candidatos ({candidatos.length})</h2>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={loadCandidatos}
              disabled={loading}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="candidatos-table-container">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th className="col-usuario">Usuario</th>
                  <th className="col-email">Email</th>
                  <th className="col-telefono">Teléfono</th>
                  <th className="col-direccion">Dirección</th>
                  <th className="col-educacion">Educación</th>
                  <th className="col-experiencia">Experiencia</th>
                  <th className="col-cv">CV</th>
                  <th className="col-estado">Estado</th>
                  <th className="col-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="loading-cell">Cargando candidatos...</td>
                  </tr>
                ) : candidatos.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="no-data-cell">No hay candidatos registrados</td>
                  </tr>
                ) : (
                  candidatos.map(candidato => (
                    <tr key={candidato.id} className="data-row">
                      <td className="cell-id">{candidato.id}</td>
                      <td className="cell-usuario">
                        <div className="user-info">
                          <span className="username">{candidato.nombreUsuario || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="cell-email">
                        <span className="email-text">{candidato.correo || 'N/A'}</span>
                      </td>
                      <td className="cell-telefono">{candidato.telefono || 'N/A'}</td>
                      <td className="cell-direccion">
                        <span className="direccion-text" title={candidato.dirreccion}>
                          {candidato.dirreccion ? 
                            (candidato.dirreccion.length > 30 ? 
                              candidato.dirreccion.substring(0, 30) + '...' : 
                              candidato.dirreccion
                            ) : 'N/A'
                          }
                        </span>
                      </td>
                      <td className="cell-educacion">
                        <span className="educacion-text" title={candidato.educacion}>
                          {candidato.educacion ? 
                            (candidato.educacion.length > 40 ? 
                              candidato.educacion.substring(0, 40) + '...' : 
                              candidato.educacion
                            ) : 'Sin información'
                          }
                        </span>
                      </td>
                      <td className="cell-experiencia">
                        <span className="experiencia-text" title={candidato.experiencia_laboral}>
                          {candidato.experiencia_laboral ? 
                            (candidato.experiencia_laboral.length > 40 ? 
                              candidato.experiencia_laboral.substring(0, 40) + '...' : 
                              candidato.experiencia_laboral
                            ) : 'Sin experiencia'
                          }
                        </span>
                      </td>
                      <td className="cell-cv">
                        <span className={`cv-status ${candidato.cv ? 'disponible' : 'sin-cv'}`}>
                          {candidato.cv ? '📄 Disponible' : '❌ Sin CV'}
                        </span>
                      </td>
                      <td className="cell-estado">
                        <span className={`status-badge ${!candidato.eliminado ? 'activo' : 'eliminado'}`}>
                          {!candidato.eliminado ? '✅ Activo' : '🚫 Eliminado'}
                        </span>
                      </td>
                      <td className="cell-acciones">
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => setEditingCandidato(candidato)}
                            title="Editar candidato"
                          >
                            ✏️
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => {
                              console.log('Botón eliminar clickeado para candidato:', candidato.id, candidato.nombreUsuario);
                              const deleteData = {type: 'candidato', id: candidato.id, name: candidato.nombreUsuario};
                              console.log('Estableciendo showDeleteConfirm con:', deleteData);
                              setShowDeleteConfirm(deleteData);
                              console.log('Estado showDeleteConfirm después de setear:', showDeleteConfirm);
                            }}
                            title="Eliminar candidato"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Modal de edición de candidato */}
        {editingCandidato && (
          <div className="modal-overlay" onClick={() => setEditingCandidato(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Editar Candidato</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateCandidato(editingCandidato);
              }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Usuario (No editable)</label>
                    <input 
                      type="text" 
                      value={editingCandidato.nombreUsuario || ''} 
                      disabled 
                      className="readonly-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email (No editable)</label>
                    <input 
                      type="email" 
                      value={editingCandidato.correo || ''} 
                      disabled 
                      className="readonly-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input 
                      type="tel" 
                      value={editingCandidato.telefono || ''} 
                      onChange={(e) => setEditingCandidato({...editingCandidato, telefono: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Dirección</label>
                    <input 
                      type="text" 
                      value={editingCandidato.dirreccion || ''} 
                      onChange={(e) => setEditingCandidato({...editingCandidato, dirreccion: e.target.value})}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Educación</label>
                    <textarea 
                      value={editingCandidato.educacion || ''} 
                      onChange={(e) => setEditingCandidato({...editingCandidato, educacion: e.target.value})}
                      rows="3"
                      placeholder="Información educativa del candidato"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Experiencia Laboral</label>
                    <textarea 
                      value={editingCandidato.experiencia_laboral || ''} 
                      onChange={(e) => setEditingCandidato({...editingCandidato, experiencia_laboral: e.target.value})}
                      rows="3"
                      placeholder="Experiencia laboral del candidato"
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select 
                      value={editingCandidato.eliminado ? 'false' : 'true'} 
                      onChange={(e) => setEditingCandidato({...editingCandidato, eliminado: e.target.value === 'false'})}
                    >
                      <option value="true">Activo</option>
                      <option value="false">Eliminado</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingCandidato(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Función para renderizar la gestión de empresas
  const renderEmpresas = () => {
    return (
      <div className="empresas-management">
        <div className="section-header">
          <h2>Gestión de Empresas ({empresas.length})</h2>
          <div className="header-actions">
            <div className="filter-group">
              <label>
                <input
                  type="checkbox"
                  checked={empresaFilters.incluirEliminadas}
                  onChange={(e) => {
                    const newValue = e.target.checked;
                    setEmpresaFilters(prev => ({ ...prev, incluirEliminadas: newValue }));
                    loadEmpresas(newValue);
                  }}
                />
                Mostrar empresas eliminadas
              </label>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => loadEmpresas()}
              disabled={loading}
            >
              🔄 Actualizar
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="empresas-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>RFC</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="loading">Cargando empresas...</td>
                </tr>
              ) : empresas.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No hay empresas registradas</td>
                </tr>
              ) : (
                empresas.map(empresa => (
                  <tr key={empresa.id}>
                    <td>{empresa.id}</td>
                    <td>{empresa.nombre || 'N/A'}</td>
                    <td>{empresa.correo || 'N/A'}</td>
                    <td>{empresa.rfc || 'N/A'}</td>
                    <td>{empresa.telefono || 'N/A'}</td>
                    <td>{empresa.direccion || 'N/A'}</td>
                    <td>
                      <span className={`status ${empresa.eliminado ? 'inactivo' : 'activo'}`}>
                        {empresa.eliminado ? 'Eliminada' : 'Activa'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => setEditingEmpresa(empresa)}
                          title="Editar empresa"
                        >
                          ✏️
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => setShowDeleteConfirm({type: 'empresa', id: empresa.id, name: empresa.nombre})}
                          title="Eliminar empresa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Modal de edición de empresa */}
        {editingEmpresa && (
          <div className="modal-overlay" onClick={() => setEditingEmpresa(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Editar Empresa</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateEmpresa(editingEmpresa);
              }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email (No editable)</label>
                    <input 
                      type="email" 
                      value={editingEmpresa.correo || ''} 
                      disabled 
                      className="readonly-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>Nombre (No editable)</label>
                    <input 
                      type="text" 
                      value={editingEmpresa.nombre || ''} 
                      disabled
                      className="readonly-field"
                    />
                  </div>
                  <div className="form-group">
                    <label>RFC (No editable)</label>
                    <input 
                      type="text" 
                      value={editingEmpresa.rfc || ''} 
                      disabled
                      className="readonly-field"
                      maxLength="13"
                      placeholder="RFC de la empresa"
                    />
                  </div>
                  <div className="form-group">
                    <label>Teléfono (No editable)</label>
                    <input 
                      type="tel" 
                      value={editingEmpresa.telefono || ''} 
                      disabled
                      className="readonly-field"
                      maxLength="15"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Dirección</label>
                    <input 
                      type="text" 
                      value={editingEmpresa.direccion || ''} 
                      onChange={(e) => setEditingEmpresa({...editingEmpresa, direccion: e.target.value})}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción</label>
                    <textarea 
                      value={editingEmpresa.descripcion || ''} 
                      onChange={(e) => setEditingEmpresa({...editingEmpresa, descripcion: e.target.value})}
                      rows="3"
                      placeholder="Descripción de la empresa"
                    />
                  </div>
                  <div className="form-group">
                    <label>Estado</label>
                    <select 
                      value={editingEmpresa.eliminado ? 'false' : 'true'} 
                      onChange={(e) => setEditingEmpresa({...editingEmpresa, eliminado: e.target.value === 'false'})}
                    >
                      <option value="true">Activa</option>
                      <option value="false">Eliminada</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingEmpresa(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => (
    <div className="settings">
      <h2>Configuración del Sistema</h2>
      
      <div className="settings-unavailable">
        <div className="unavailable-icon">⚙️</div>
        <h3>Funcionalidad No Disponible</h3>
        <p>La sección de configuración estará disponible en la próxima actualización del sistema.</p>
        <p>Mientras tanto, puede contactar al administrador del sistema para realizar cambios de configuración.</p>
      </div>
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
            className={`nav-btn ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            📝 Postulaciones
          </button>
          <button 
            className={`nav-btn ${activeTab === 'candidatos' ? 'active' : ''}`}
            onClick={() => setActiveTab('candidatos')}
          >
            👤 Candidatos
          </button>
          <button 
            className={`nav-btn ${activeTab === 'empresas' ? 'active' : ''}`}
            onClick={() => setActiveTab('empresas')}
          >
            🏢 Empresas
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
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'add-job' && renderAddJob()}
        {activeTab === 'edit-job' && renderEditJob()}
        {activeTab === 'edit-user' && renderEditUser()}
        {activeTab === 'applications' && renderApplications()}
        {activeTab === 'candidatos' && renderCandidatos()}
        {activeTab === 'empresas' && renderEmpresas()}
        {activeTab === 'settings' && renderSettings()}
      </div>
      
      {/* Modal de confirmación de eliminación - Nivel global */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="confirm-modal">
            <h3>Confirmar Eliminación</h3>
            {console.log('Modal de confirmación renderizado con:', showDeleteConfirm)}
            <p>
              {typeof showDeleteConfirm === 'object' 
                ? `¿Estás seguro de que quieres eliminar ${showDeleteConfirm.type === 'candidato' ? 'al candidato' : 'la empresa'} "${showDeleteConfirm.name}"? Esta acción realizará una eliminación suave.`
                : '¿Estás seguro de que quieres eliminar esta vacante?'
              }
            </p>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                className="confirm-btn"
                onClick={() => {
                  console.log('Botón confirmar eliminación clickeado:', showDeleteConfirm);
                  if (typeof showDeleteConfirm === 'object') {
                    if (showDeleteConfirm.type === 'candidato') {
                      console.log('Llamando handleDeleteCandidato con ID:', showDeleteConfirm.id);
                      handleDeleteCandidato(showDeleteConfirm.id);
                    } else if (showDeleteConfirm.type === 'empresa') {
                      handleDeleteEmpresa(showDeleteConfirm.id);
                    }
                  } else {
                    handleDeleteJob(showDeleteConfirm);
                  }
                }}
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

export default AdminPanel;