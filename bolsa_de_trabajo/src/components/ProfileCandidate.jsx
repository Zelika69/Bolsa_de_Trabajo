import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Profile.css';
import './ProfileCandidate.css';
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

  // Función para parsear campos concatenados
  const parseProfileData = (data) => {
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
    
    // Parsear educación
    if (data.educacion) {
      const educacionMatch = data.educacion.match(/^(.+?) en (.+?) - (.+?) \((\d{4})\)/);
      if (educacionMatch) {
        parsedData.nivelEducativo = educacionMatch[1] || '';
        parsedData.carrera = educacionMatch[2] || '';
        parsedData.institucion = educacionMatch[3] || '';
        parsedData.anioGraduacion = educacionMatch[4] || '';
      }
    }
    
    // Parsear experiencia
    if (data.experiencia) {
      const experienciaMatch = data.experiencia.match(/^(.+?) en (.+?) - (.+?)(?:\s\((.+?)\))?(?:\. (.+))?$/);
      if (experienciaMatch) {
        parsedData.puestoActual = experienciaMatch[1] || '';
        parsedData.empresaActual = experienciaMatch[2] || '';
        parsedData.aniosExperiencia = experienciaMatch[3] || '';
        parsedData.periodoTrabajo = experienciaMatch[4] || '';
        parsedData.descripcionExperiencia = experienciaMatch[5] || '';
      }
    }
    
    return parsedData;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get(API_ENDPOINTS.getCandidateProfile(userId));
        
        if (response.data) {
          // Parsear los datos concatenados
          const parsedData = parseProfileData(response.data);
          
          setFormData(prev => ({
            ...prev,
            direccion: response.data.direccion || '',
            educacion: response.data.educacion || '',
            experiencia: response.data.experiencia || '',
            cvFileName: response.data.cv_nombre || '',
            // Campos parseados
            calle: parsedData.calle || '',
            colonia: parsedData.colonia || '',
            ciudad: parsedData.ciudad || '',
            estado: parsedData.estado || '',
            codigoPostal: parsedData.codigoPostal || '',
            nivelEducativo: parsedData.nivelEducativo || '',
            carrera: parsedData.carrera || '',
            institucion: parsedData.institucion || '',
            anioGraduacion: parsedData.anioGraduacion || '',
            puestoActual: parsedData.puestoActual || '',
            empresaActual: parsedData.empresaActual || '',
            aniosExperiencia: parsedData.aniosExperiencia || '',
            periodoTrabajo: parsedData.periodoTrabajo || '',
            descripcionExperiencia: parsedData.descripcionExperiencia || ''
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
      // Validar campos requeridos
      const requiredFields = {
        calle: 'Calle y Número',
        colonia: 'Colonia/Barrio',
        ciudad: 'Ciudad',
        estado: 'Estado',
        codigoPostal: 'Código Postal',
        nivelEducativo: 'Nivel Educativo',
        carrera: 'Carrera/Especialidad',
        institucion: 'Institución',
        anioGraduacion: 'Año de Graduación',
        puestoActual: 'Puesto Actual/Más Reciente',
        empresaActual: 'Empresa Actual/Más Reciente',
        aniosExperiencia: 'Años de Experiencia'
      };

      for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData[field] || formData[field].toString().trim() === '') {
          setError(`El campo "${label}" es requerido.`);
          setLoading(false);
          return;
        }
      }

      // Validar código postal
      if (formData.codigoPostal && !/^[0-9]{5}$/.test(formData.codigoPostal)) {
        setError('El código postal debe tener exactamente 5 dígitos.');
        setLoading(false);
        return;
      }

      // Validar año de graduación
      const currentYear = new Date().getFullYear();
      if (formData.anioGraduacion && (formData.anioGraduacion < 1950 || formData.anioGraduacion > currentYear + 5)) {
        setError(`El año de graduación debe estar entre 1950 y ${currentYear + 5}.`);
        setLoading(false);
        return;
      }

      // Concatenar campos estructurados para envío al backend
      const profileData = {
        direccion: `${formData.calle}, ${formData.colonia}, ${formData.ciudad}, ${formData.estado}, CP: ${formData.codigoPostal}`,
        educacion: `${formData.nivelEducativo} en ${formData.carrera} - ${formData.institucion} (${formData.anioGraduacion})`,
        experiencia: `${formData.puestoActual} en ${formData.empresaActual} - ${formData.aniosExperiencia}${formData.periodoTrabajo ? ` (${formData.periodoTrabajo})` : ''}${formData.descripcionExperiencia ? `. ${formData.descripcionExperiencia}` : ''}`
      };

      await axios.put(API_ENDPOINTS.updateCandidateProfile(userId), profileData);

      // Actualizar los datos locales con los campos concatenados
      setFormData(prev => ({
        ...prev,
        direccion: profileData.direccion,
        educacion: profileData.educacion,
        experiencia: profileData.experiencia
      }));

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
                
                {/* Sección de Dirección Estructurada */}
                <div className="form-section">
                  <h4>Dirección</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="calle">Calle y Número *:</label>
                      <input
                        type="text"
                        id="calle"
                        name="calle"
                        value={formData.calle || ''}
                        onChange={handleInputChange}
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
                        value={formData.colonia || ''}
                        onChange={handleInputChange}
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
                        value={formData.ciudad || ''}
                        onChange={handleInputChange}
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
                        value={formData.estado || ''}
                        onChange={handleInputChange}
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
                        value={formData.codigoPostal || ''}
                        onChange={handleInputChange}
                        placeholder="Ej: 06000"
                        pattern="[0-9]{5}"
                        maxLength="5"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sección de Educación Estructurada */}
                <div className="form-section">
                  <h4>Educación</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="nivelEducativo">Nivel Educativo *:</label>
                      <select
                        id="nivelEducativo"
                        name="nivelEducativo"
                        value={formData.nivelEducativo || ''}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona un nivel</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Preparatoria">Preparatoria/Bachillerato</option>
                        <option value="Técnico">Técnico</option>
                        <option value="Licenciatura">Licenciatura</option>
                        <option value="Ingeniería">Ingeniería</option>
                        <option value="Maestría">Maestría</option>
                        <option value="Doctorado">Doctorado</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="carrera">Carrera/Especialidad *:</label>
                      <input
                        type="text"
                        id="carrera"
                        name="carrera"
                        value={formData.carrera || ''}
                        onChange={handleInputChange}
                        placeholder="Ej: Ingeniería en Sistemas"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="institucion">Institución *:</label>
                      <input
                        type="text"
                        id="institucion"
                        name="institucion"
                        value={formData.institucion || ''}
                        onChange={handleInputChange}
                        placeholder="Ej: Universidad Nacional Autónoma de México"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="anioGraduacion">Año de Graduación *:</label>
                      <input
                        type="number"
                        id="anioGraduacion"
                        name="anioGraduacion"
                        value={formData.anioGraduacion || ''}
                        onChange={handleInputChange}
                        placeholder="Ej: 2023"
                        min="1950"
                        max={new Date().getFullYear() + 5}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Sección de Experiencia Laboral Estructurada */}
                <div className="form-section">
                  <h4>Experiencia Laboral</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="puestoActual">Puesto Actual/Más Reciente *:</label>
                      <input
                        type="text"
                        id="puestoActual"
                        name="puestoActual"
                        value={formData.puestoActual || ''}
                        onChange={handleInputChange}
                        placeholder="Ej: Desarrollador Frontend"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="empresaActual">Empresa Actual/Más Reciente *:</label>
                      <input
                        type="text"
                        id="empresaActual"
                        name="empresaActual"
                        value={formData.empresaActual || ''}
                        onChange={handleInputChange}
                        placeholder="Ej: TechCorp SA de CV"
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="aniosExperiencia">Años de Experiencia *:</label>
                      <select
                        id="aniosExperiencia"
                        name="aniosExperiencia"
                        value={formData.aniosExperiencia || ''}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona experiencia</option>
                        <option value="Sin experiencia">Sin experiencia</option>
                        <option value="Menos de 1 año">Menos de 1 año</option>
                        <option value="1-2 años">1-2 años</option>
                        <option value="3-5 años">3-5 años</option>
                        <option value="6-10 años">6-10 años</option>
                        <option value="Más de 10 años">Más de 10 años</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="periodoTrabajo">Período de Trabajo:</label>
                      <input
                        type="text"
                        id="periodoTrabajo"
                        name="periodoTrabajo"
                        value={formData.periodoTrabajo || ''}
                        onChange={handleInputChange}
                        placeholder="Ej: Enero 2022 - Presente"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="descripcionExperiencia">Descripción de Responsabilidades:</label>
                    <textarea
                      id="descripcionExperiencia"
                      name="descripcionExperiencia"
                      value={formData.descripcionExperiencia || ''}
                      onChange={handleInputChange}
                      placeholder="Describe tus principales responsabilidades y logros..."
                      rows="4"
                    />
                  </div>
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