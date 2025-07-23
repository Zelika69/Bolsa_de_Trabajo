import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import './Profile.css';

const ProfileCompany = ({ userId }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    rfc: '',
    direccion: '',
    descripcion: ''
  });
  const [userData, setUserData] = useState({
    nombreUsuario: '',
    correo: '',
    telefono: '',
    nombre: '',
    rutaImagen: '',
    rutaPDF: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await axios.get(`http://localhost:5000/api/empresa/profile/${userId}`);

        if (response.data) {
          setFormData(prev => ({
            ...prev,
            nombre: response.data.nombre || '',
            telefono: response.data.telefono || '',
            rfc: response.data.rfc || '',
            direccion: response.data.direccion || '',
            descripcion: response.data.descripcion || ''
          }));

          setUserData({
            nombreUsuario: response.data.nombreUsuario || '',
            correo: response.data.correo || '',
            telefono: response.data.telefono || '',
            nombre: response.data.nombre || '',
            rutaImagen: response.data.rutaImagen || '',
            rutaPDF: response.data.rutaPDF || ''
          });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await axios.put(`http://localhost:5000/api/empresa/profile/${userId}`, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      setError(error.response?.data?.error || 'Error al actualizar el perfil. Inténtalo de nuevo más tarde.');
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
                `http://127.0.0.1:5000/static/images/empresa/${userData.rutaImagen}` :
                `http://127.0.0.1:5000/static/images/default/company_default.svg`
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

            {userData.rutaPDF && (
              <div className="dashboard-section">
                <div className="section-header">
                  <h3>Documento PDF de la Empresa</h3>
                </div>
                <div className="pdf-viewer">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                    <div style={{ height: '600px' }}>
                      <Viewer fileUrl={`http://127.0.0.1:5000/static/pdfs/${userData.rutaPDF}`} />
                    </div>
                  </Worker>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="dashboard-content">
            <div className="section-header edit-mode-header">
              <h3>Editar Perfil de Empresa</h3>
              <button onClick={toggleEditMode} className="cancel-btn">Cancelar</button>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Nombre de la empresa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="text"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Teléfono de la empresa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rfc">RFC</label>
                <input
                  type="text"
                  id="rfc"
                  name="rfc"
                  value={formData.rfc}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="RFC de la empresa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="direccion">Dirección</label>
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Dirección de la empresa"
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe tu empresa"
                  rows="6"
                />
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
