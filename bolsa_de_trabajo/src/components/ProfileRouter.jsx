import React, { useEffect, useState } from 'react';
import ProfileCandidate from './ProfileCandidate';
import ProfileCompany from './ProfileCompany';
import axios from 'axios';

const ProfileRouter = ({ setCurrentView }) => {
  const [userType, setUserType] = useState('');
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Obtener ID del usuario del localStorage
    const storedUserId = localStorage.getItem('userId');

    if (!storedUserId) {
      // Si no hay ID de usuario, redirigir al login
      setCurrentView('login');
      return;
    }

    setUserId(storedUserId);
    
    // Verificar el tipo de usuario directamente desde la base de datos
    const verifyUserType = async () => {
      try {
        setLoading(true);
        // Obtener información del usuario desde el backend
        const response = await axios.get(`http://localhost:5000/api/usuarios/${storedUserId}`);
        
        if (response.data && response.data.rol) {
          // Mapear roles del backend a roles del frontend
          const frontendRole = response.data.rol === 'CANDIDATO' ? 'user' : 
                              response.data.rol === 'EMPRESA' ? 'recruiter' : 
                              response.data.rol === 'ADMINISTRADOR' ? 'admin' : 'user';
          
          setUserType(frontendRole);
          // Actualizar el userType en localStorage por si acaso
          localStorage.setItem('userType', frontendRole);
        } else {
          // Si no se puede determinar el rol, usar el valor almacenado en localStorage
          const storedUserType = localStorage.getItem('userType');
          if (storedUserType) {
            setUserType(storedUserType);
          } else {
            setError('No se pudo determinar el tipo de usuario');
            setCurrentView('login');
          }
        }
      } catch (error) {
        console.error('Error al verificar el tipo de usuario:', error);
        let errorMessage = 'Error al verificar el tipo de usuario';
        
        if (error.response) {
          // El servidor respondió con un código de estado diferente de 2xx
          errorMessage = error.response.data?.error || 
                        `Error ${error.response.status}: ${error.response.statusText}`;
        } else if (error.request) {
          // La solicitud se realizó pero no se recibió respuesta
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
        
        // En caso de error, intentar usar el valor almacenado en localStorage
        const storedUserType = localStorage.getItem('userType');
        if (storedUserType) {
          setUserType(storedUserType);
          console.log('Usando tipo de usuario almacenado en localStorage:', storedUserType);
        } else {
          setError(errorMessage);
          setCurrentView('login');
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUserType();
  }, [setCurrentView]);

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => setCurrentView('login')}>Volver al inicio de sesión</button>
      </div>
    );
  }

  return (
    <div>
      {userType === 'user' ? (
        <ProfileCandidate userId={userId} setCurrentView={setCurrentView} />
      ) : userType === 'recruiter' ? (
        <ProfileCompany userId={userId} setCurrentView={setCurrentView} />
      ) : (
        <div className="error-container">
          <p>Tipo de usuario no reconocido: {userType}</p>
          <button onClick={() => setCurrentView('login')}>Volver al inicio de sesión</button>
        </div>
      )}
    </div>
  );
};

export default ProfileRouter;