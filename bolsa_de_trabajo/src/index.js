import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './components/App.css';

// Importar todos los estilos de componentes
import './components/Navbar.css';
import './components/Home.css';
import './components/JobListings.css';
import './components/Login.css';
import './components/Register.css';
import './components/AdminPanel.css';
import './components/JobForm.css';

// Configuración de la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Reportar métricas de rendimiento (opcional)
// Si quieres medir el rendimiento de tu app, puedes pasar una función
// para registrar los resultados (por ejemplo: reportWebVitals(console.log))
// o enviar a un endpoint de analytics. Aprende más: https://bit.ly/CRA-vitals
if (typeof window !== 'undefined' && 'performance' in window) {
  // Función simple para reportar métricas
  const reportWebVitals = (onPerfEntry) => {
    if (onPerfEntry && onPerfEntry instanceof Function) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      });
    }
  };
  
  // Opcional: reportar métricas a la consola en desarrollo
  if (process.env.NODE_ENV === 'development') {
    reportWebVitals(console.log);
  }
}

// Manejo de errores globales
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
  // Aquí podrías enviar el error a un servicio de monitoreo
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada no manejada:', event.reason);
  // Aquí podrías enviar el error a un servicio de monitoreo
});

// Configuración de desarrollo
if (process.env.NODE_ENV === 'development') {
  // Habilitar React DevTools
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'object') {
    console.log('React DevTools detectado');
  }
  
  // Información de la aplicación
  console.log('%c🚀 Bolsa de Trabajo App', 'color: #3498db; font-size: 16px; font-weight: bold;');
  console.log('%cDesarrollado con React', 'color: #61dafb; font-size: 12px;');
  console.log('%cVersión:', process.env.REACT_APP_VERSION || '1.0.0', 'color: #95a5a6; font-size: 12px;');
}