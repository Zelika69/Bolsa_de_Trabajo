import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import axios from 'axios';
import { API_ENDPOINTS, handleApiError } from '../config/api';

const ProfileCandidate = ({ userId, updateUser }) => {
  const [formData, setFormData] = useState({
    direccion: '',
    educacion: '',
    experiencia: '',
    cv: null,
    cvFileName: '',
    profileImage: null
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
        
        const response = await axios.get(API_ENDPOINTS.getCandidateProfile(userId));
        
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            direccion: response.data.direccion || '',
            educacion: response.data.educacion || '',
            experiencia: response.data.experiencia || '',
            cvFileName: response.data.cv_nombre || ''
          }));
          
          setUserData({
            nombreUsuario: response.data.nombreUsuario || 'Usuario',
            correo: response.data.correo || '',
            telefono: response.data.telefono || '',
            rutaImagen: response.data.rutaImagen || ''
          });
          
          // Guardar la URL del CV si existe
          if (response.data.cv) {
            setPdfUrl(API_ENDPOINTS.getStaticFile(response.data.cv));
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setError('Solo se permiten archivos JPG, JPEG, PNG o GIF');
        return;
      }
      
      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        setError('El archivo es demasiado grande. Máximo 5MB permitido.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      setError(''); // Limpiar errores previos
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Actualizar perfil básico
      const profileData = {
        direccion: formData.direccion,
        educacion: formData.educacion,
        experiencia: formData.experiencia
      };

      await axios.put(API_ENDPOINTS.updateCandidateProfile(userId), profileData);

      // Subir CV si se seleccionó uno nuevo
      if (formData.cv) {
        const cvFormData = new FormData();
        cvFormData.append('cv', formData.cv);
        
        await axios.post(API_ENDPOINTS.uploadCV(userId), cvFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Actualizar la URL del PDF después de subir
        setPdfUrl(API_ENDPOINTS.getStaticFile(`candidato/${formData.cvFileName}`));
      }

      // Subir imagen de perfil si se seleccionó una nueva
      if (formData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.profileImage);
        
        const imageResponse = await axios.post(API_ENDPOINTS.uploadProfileImage(userId), imageFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Actualizar la imagen en el estado local
        if (imageResponse.data && imageResponse.data.filename) {
          setUserData(prev => ({
            ...prev,
            rutaImagen: imageResponse.data.filename
          }));
          
          // Actualizar el estado global del usuario si updateUser está disponible
          if (updateUser) {
            updateUser({ rutaImagen: imageResponse.data.filename });
          }
        }
      }

      setSuccess(true);
      
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
              API_ENDPOINTS.getUserImage('candidato', userData.rutaImagen) :
              API_ENDPOINTS.getDefaultImage('user')
            } 
              alt="Foto de perfil" 
              className="profile-photo"
            />
          </div>
          <div className="user-info-header">
            <h2 className="profile-name">{userData.nombreUsuario || 'Usuario'}</h2>
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
              </div>
              <div className="info-card">
                <p className="education-text">{formData.educacion || 'No especificada'}</p>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3>Experiencia Laboral</h3>
              </div>
              <div className="info-card">
                <p className="experience-text">{formData.experiencia || 'No especificada'}</p>
              </div>
            </div>

            <div className="dashboard-section">
              <div className="section-header">
                <h3>Currículum Vitae</h3>
              </div>
              <div className="info-card">
                {formData.cvFileName ? (
                  <div className="cv-info">
                    <span className="cv-filename">{formData.cvFileName}</span>
                    <button onClick={handleDownloadCV} className="download-btn">
                      Ver CV
                    </button>
                  </div>
                ) : (
                  <p>No hay CV subido</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="edit-form-container">
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-section">
                <h3>Editar Información Personal</h3>
                
                <div className="form-group">
                  <label htmlFor="direccion">Dirección:</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleInputChange}
                    placeholder="Ingresa tu dirección"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="educacion">Educación:</label>
                  <textarea
                    id="educacion"
                    name="educacion"
                    value={formData.educacion}
                    onChange={handleInputChange}
                    placeholder="Describe tu formación académica"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experiencia">Experiencia Laboral:</label>
                  <textarea
                    id="experiencia"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={handleInputChange}
                    placeholder="Describe tu experiencia laboral"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cv">Subir CV (PDF):</label>
                  <input
                    type="file"
                    id="cv"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  {formData.cvFileName && (
                    <span className="file-name">Archivo actual: {formData.cvFileName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="profileImage">Imagen de Perfil:</label>
                  <input
                    type="file"
                    id="profileImage"
                    accept=".jpg,.jpeg,.png,.gif"
                    onChange={handleImageChange}
                  />
                  {formData.profileImage && (
                    <div className="image-preview">
                      <span className="file-name">Archivo seleccionado: {formData.profileImage.name}</span>
                      <img 
                        src={URL.createObjectURL(formData.profileImage)} 
                        alt="Vista previa" 
                        className="preview-image"
                        style={{ maxWidth: '200px', maxHeight: '200px', marginTop: '10px' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" disabled={loading} className="save-btn">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button type="button" onClick={toggleEditMode} className="cancel-btn">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCandidate;