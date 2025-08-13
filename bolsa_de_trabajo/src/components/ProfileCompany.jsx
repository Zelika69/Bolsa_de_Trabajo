import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import './ProfileCandidate.css';
import { API_ENDPOINTS, handleApiError } from '../config/api';

const ProfileCompany = ({ userId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    rfc: '',
    direccion: '',
    descripcion: '',
    // Campos estructurados para dirección
    calle: '',
    colonia: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    // Campos adicionales para empresa
    sector: '',
    tamanoEmpresa: '',
    sitioWeb: '',
    anioFundacion: ''
  });
  const [userData, setUserData] = useState({
    nombreUsuario: '',
    correo: '',
    telefono: '',
    nombre: '',
    rutaImagen: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  // Función para parsear campos concatenados
  const parseCompanyData = (data) => {
    const parsedData = { ...data };
    
    // Parsear dirección
    if (data.direccion) {
      const direccionParts = data.direccion.split(', ');
      if (direccionParts.length >= 4) {
        parsedData.calle = direccionParts[0] || '';
        parsedData.colonia = direccionParts[1] || '';
        parsedData.ciudad = direccionParts[2] || '';
        parsedData.estado = direccionParts[3] || '';
        const cpMatch = data.direccion.match(/CP: (\d{5})/);
        parsedData.codigoPostal = cpMatch ? cpMatch[1] : '';
      }
    }
    
    return parsedData;
  };

  useEffect(() => {
    // Cargar datos del perfil si existen
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(API_ENDPOINTS.getCompanyProfile(userId));
        
        if (response.data) {
          // Parsear los datos concatenados
          const parsedData = parseCompanyData(response.data);
          
          setFormData(prev => ({
            ...prev,
            nombre: response.data.nombre || '',
            telefono: response.data.telefono || '',
            rfc: response.data.rfc || '',
            direccion: response.data.direccion || '',
            descripcion: response.data.descripcion || '',
            // Campos parseados
            calle: parsedData.calle || '',
            colonia: parsedData.colonia || '',
            ciudad: parsedData.ciudad || '',
            estado: parsedData.estado || '',
            codigoPostal: parsedData.codigoPostal || '',
            // Campos adicionales
            sector: response.data.sector || '',
            tamanoEmpresa: response.data.tamanoEmpresa || '',
            sitioWeb: response.data.sitioWeb || '',
            anioFundacion: response.data.anioFundacion || ''
          }));
          
          setUserData({
            nombreUsuario: response.data.nombreUsuario || '',
            correo: response.data.correo || '',
            telefono: response.data.telefono || '',
            nombre: response.data.nombre || '',
            rutaImagen: response.data.rutaImagen || ''
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        let errorMessage = 'Error al cargar datos del perfil';
        
        if (error.response) {
          // El servidor respondió con un código de estado diferente de 2xx
          errorMessage = error.response.data?.error || 
                        `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          // La solicitud se realizó pero no se recibió respuesta
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validar campos requeridos
    const requiredFields = {
      nombre: 'Nombre de la empresa',
      telefono: 'Teléfono',
      rfc: 'RFC',
      calle: 'Calle y Número',
      colonia: 'Colonia/Barrio',
      ciudad: 'Ciudad',
      estado: 'Estado',
      codigoPostal: 'Código Postal',
      sector: 'Sector',
      tamanoEmpresa: 'Tamaño de Empresa'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        setError(`El campo "${label}" es requerido.`);
        setLoading(false);
        return;
      }
    }

    // Validar RFC (formato básico)
    if (formData.rfc && !/^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(formData.rfc.toUpperCase())) {
      setError('El RFC debe tener un formato válido (ej: ABC123456XYZ).');
      setLoading(false);
      return;
    }

    // Validar código postal
    if (formData.codigoPostal && !/^[0-9]{5}$/.test(formData.codigoPostal)) {
      setError('El código postal debe tener exactamente 5 dígitos.');
      setLoading(false);
      return;
    }

    // Validar teléfono
    if (formData.telefono && !/^[0-9]{10}$/.test(formData.telefono.replace(/[\s\-\(\)]/g, ''))) {
      setError('El teléfono debe tener 10 dígitos.');
      setLoading(false);
      return;
    }

    // Validar sitio web si se proporciona
    if (formData.sitioWeb && !/^https?:\/\/.+/.test(formData.sitioWeb)) {
      setError('El sitio web debe comenzar con http:// o https://');
      setLoading(false);
      return;
    }

    // Validar año de fundación
    const currentYear = new Date().getFullYear();
    if (formData.anioFundacion && (formData.anioFundacion < 1800 || formData.anioFundacion > currentYear)) {
      setError(`El año de fundación debe estar entre 1800 y ${currentYear}.`);
      setLoading(false);
      return;
    }

    try {
      // Concatenar campos para envío al backend
      const dataToSend = {
        ...formData,
        // Concatenar dirección
        direccion: `${formData.calle}, ${formData.colonia}, ${formData.ciudad}, ${formData.estado}, CP: ${formData.codigoPostal}`,
        // Normalizar RFC
        rfc: formData.rfc.toUpperCase()
      };

      // Actualizar los datos del perfil
      await axios.put(
        API_ENDPOINTS.updateCompanyProfile(userId),
        dataToSend
      );

      setSuccess(true);
      
      // Actualizar los datos locales con los campos concatenados
      setFormData(prev => ({
        ...prev,
        direccion: dataToSend.direccion,
        rfc: dataToSend.rfc
      }));
      
      // Mostrar mensaje de éxito y cerrar el formulario automáticamente
      setTimeout(() => {
        setSuccess(false);
        setEditMode(false); // Cerrar el formulario de edición
      }, 2000);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(
        error.response?.data?.error ||
        'Error al actualizar el perfil. Inténtalo de nuevo más tarde.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="profile-container">
      <div className="profile-dashboard">
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">¡Perfil actualizado correctamente!</div>}

        <div className="dashboard-header">
          <div className="profile-photo-container">
            <img 
              src={userData.rutaImagen ? 
              API_ENDPOINTS.getUserImage('empresa', userData.rutaImagen) :
              API_ENDPOINTS.getDefaultImage('recruiter')
            } 
              alt="Logo de empresa" 
              className="profile-photo"
            />
          </div>
          <div className="user-info-header">
            <h2 className="profile-name">{userData.nombre || userData.nombreUsuario}</h2>
            <p className="profile-email">{userData.correo}</p>
            <p className="profile-phone">{userData.telefono || 'Sin teléfono'}</p>
          </div>
        </div>

        {!editMode ? (
          <div className="dashboard-content">
            <div className="dashboard-section">
              <div className="section-header">
                <h3>Información de la Empresa</h3>
                <button onClick={toggleEditMode} className="edit-btn">Editar</button>
              </div>
              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">Nombre:</span>
                  <span className="info-value">{formData.nombre || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Teléfono:</span>
                  <span className="info-value">{formData.telefono || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">RFC:</span>
                  <span className="info-value">{formData.rfc || 'No especificado'}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Dirección:</span>
                  <span className="info-value">{formData.direccion || 'No especificada'}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3>Descripción</h3>
                <button onClick={toggleEditMode} className="edit-btn">Editar</button>
              </div>
              <div className="info-card">
                <div className="info-content">
                  {formData.descripcion ? (
                    <p className="info-text">{formData.descripcion}</p>
                  ) : (
                    <p className="info-placeholder">No has añadido una descripción de la empresa</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="section-header edit-mode-header">
              <h3>Editar Perfil de Empresa</h3>
              <button onClick={toggleEditMode} className="cancel-btn">Cancelar</button>
            </div>
            
            <form onSubmit={handleSubmit} className="profile-form">
              {/* Información Básica */}
              <div className="form-section">
                <h4>Información Básica</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre de la Empresa *:</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: TechCorp SA de CV"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rfc">RFC *:</label>
                    <input
                      type="text"
                      id="rfc"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: ABC123456XYZ"
                      maxLength="13"
                      style={{textTransform: 'uppercase'}}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono *:</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: 5512345678"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sitioWeb">Sitio Web:</label>
                    <input
                      type="url"
                      id="sitioWeb"
                      name="sitioWeb"
                      value={formData.sitioWeb}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: https://www.empresa.com"
                    />
                  </div>
                </div>
              </div>

              {/* Información de la Empresa */}
              <div className="form-section">
                <h4>Detalles de la Empresa</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sector">Sector *:</label>
                    <select
                      id="sector"
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Selecciona un sector</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Salud">Salud</option>
                      <option value="Educación">Educación</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Manufactura">Manufactura</option>
                      <option value="Comercio">Comercio</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Construcción">Construcción</option>
                      <option value="Turismo">Turismo</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="tamanoEmpresa">Tamaño de Empresa *:</label>
                    <select
                      id="tamanoEmpresa"
                      name="tamanoEmpresa"
                      value={formData.tamanoEmpresa}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Selecciona el tamaño</option>
                      <option value="Micro (1-10 empleados)">Micro (1-10 empleados)</option>
                      <option value="Pequeña (11-50 empleados)">Pequeña (11-50 empleados)</option>
                      <option value="Mediana (51-250 empleados)">Mediana (51-250 empleados)</option>
                      <option value="Grande (251+ empleados)">Grande (251+ empleados)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="anioFundacion">Año de Fundación:</label>
                    <input
                      type="number"
                      id="anioFundacion"
                      name="anioFundacion"
                      value={formData.anioFundacion}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: 2010"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Dirección Estructurada */}
              <div className="form-section">
                <h4>Dirección</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="calle">Calle y Número *:</label>
                    <input
                      type="text"
                      id="calle"
                      name="calle"
                      value={formData.calle}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: Av. Reforma 123"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="colonia">Colonia/Barrio *:</label>
                    <input
                      type="text"
                      id="colonia"
                      name="colonia"
                      value={formData.colonia}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: Centro Histórico"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ciudad">Ciudad *:</label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: Ciudad de México"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="estado">Estado *:</label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: CDMX"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="codigoPostal">Código Postal *:</label>
                    <input
                      type="text"
                      id="codigoPostal"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Ej: 06000"
                      pattern="[0-9]{5}"
                      maxLength="5"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="form-section">
                <h4>Descripción de la Empresa</h4>
                <div className="form-group">
                  <label htmlFor="descripcion">Descripción:</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Describe tu empresa, sus valores, misión y lo que la hace única..."
                    rows="6"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={`profile-btn ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCompany;