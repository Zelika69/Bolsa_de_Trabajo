import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import axios from 'axios';

const ProfileCandidate = ({ userId }) => {
  const [formData, setFormData] = useState({
    direccion: '',
    educacion: '',
    experiencia: '',
    cv: null,
    cvFileName: ''
  });
  const [userData, setUserData] = useState({
    nombreUsuario: '',
    correo: '',
    telefono: '',
    rutaImagen: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  
  // Estado para el visor de CV (ahora solo mostramos el enlace)
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(`http://localhost:5000/api/candidato/profile/${userId}`);
        
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            direccion: response.data.direccion || '',
            educacion: response.data.educacion || '',
            experiencia: response.data.experiencia || '',
            cvFileName: response.data.cv_nombre || ''
          }));
          
          setUserData({
            nombreUsuario: response.data.nombreUsuario || '',
            correo: response.data.correo || '',
            telefono: response.data.telefono || '',
            rutaImagen: response.data.rutaImagen || ''
          });
          
          // Guardar la URL del CV si existe
          if (response.data.cv) {
            setPdfUrl(`http://localhost:5000${response.data.cv}`);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del perfil:', error);
        let errorMessage = 'Error al cargar datos del perfil';
        
        if (error.response) {
          errorMessage = error.response.data?.error || 
                        `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        cv: file,
        cvFileName: file.name
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Primero actualizamos los datos del perfil
      const profileResponse = await axios.put(
        `http://localhost:5000/api/candidato/profile/${userId}`,
        {
          direccion: formData.direccion,
          educacion: formData.educacion,
          experiencia: formData.experiencia
        }
      );

      // Si hay un archivo CV para subir
      if (formData.cv) {
        const formDataFile = new FormData();
        formDataFile.append('cv', formData.cv);

        await axios.post(
          `http://localhost:5000/api/candidato/upload-cv/${userId}`,
          formDataFile,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
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
  
  const handleDownloadCV = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
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
                `http://127.0.0.1:5000/static/images/candidato/${userData.rutaImagen}` :
                `http://127.0.0.1:5000/static/images/default/user_default.svg`
              } 
              alt="Foto de perfil" 
              className="profile-photo"
            />
          </div>
          <div className="user-info-header">
            <h2 className="profile-name">{userData.nombreUsuario}</h2>
            <p className="profile-email">{userData.correo}</p>
            <p className="profile-phone">{userData.telefono || 'Sin teléfono'}</p>
          </div>
        </div>

        {!editMode ? (
          <div className="dashboard-content">
            <div className="dashboard-section">
              <div className="section-header">
                <h3>Información Personal</h3>
                <button onClick={toggleEditMode} className="edit-btn">Editar</button>
              </div>
              <div className="info-card">
                <div className="info-item">
                  <span className="info-label">Dirección:</span>
                  <span className="info-value">{formData.direccion || 'No especificada'}</span>
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3>Educación</h3>
                <button onClick={toggleEditMode} className="edit-btn">Editar</button>
              </div>
              <div className="info-card">
                <div className="info-content">
                  {formData.educacion ? (
                    <p className="info-text">{formData.educacion}</p>
                  ) : (
                    <p className="info-placeholder">No has añadido información sobre tu educación</p>
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3>Experiencia Laboral</h3>
                <button onClick={toggleEditMode} className="edit-btn">Editar</button>
              </div>
              <div className="info-card">
                <div className="info-content">
                  {formData.experiencia ? (
                    <p className="info-text">{formData.experiencia}</p>
                  ) : (
                    <p className="info-placeholder">No has añadido información sobre tu experiencia laboral</p>
                  )}
                </div>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3>Curriculum Vitae</h3>
                <button onClick={toggleEditMode} className="edit-btn">Editar</button>
              </div>
              <div className="info-card">
                <div className="info-item">
                  {formData.cvFileName ? (
                    <div className="cv-info">
                      <span className="info-value">{formData.cvFileName}</span>
                      <button onClick={handleDownloadCV} className="view-btn">Descargar CV</button>
                    </div>
                  ) : (
                    <span className="info-placeholder">No has subido tu CV</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-content">
            <div className="section-header edit-mode-header">
              <h3>Editar Perfil</h3>
              <button onClick={toggleEditMode} className="cancel-btn">Cancelar</button>
            </div>
            
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Tu dirección completa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="educacion">Educación</label>
                <textarea
                  id="educacion"
                  name="educacion"
                  value={formData.educacion}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe tu formación académica"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="experiencia">Experiencia Laboral</label>
                <textarea
                  id="experiencia"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe tu experiencia laboral"
                  rows="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="cv">Curriculum Vitae (PDF)</label>
                <div className="file-input-container">
                  <input
                    type="file"
                    id="cv"
                    name="cv"
                    onChange={handleFileChange}
                    className="file-input"
                    accept=".pdf"
                  />
                  <div className="file-input-label">
                    {formData.cvFileName ? formData.cvFileName : 'Seleccionar archivo'}
                  </div>
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

export default ProfileCandidate;