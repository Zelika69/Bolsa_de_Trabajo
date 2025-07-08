import { useState } from 'react';

function EmpresaForm() {
  const [formData, setFormData] = useState({
    idUsuario: '',
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    descripcion: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'rfc' && value.length > 13) return;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage(data.message || 'Empresa registrada correctamente');
        setFormData({
          idUsuario: '',
          nombre: '',
          rfc: '',
          direccion: '',
          telefono: '',
          descripcion: ''
        });
      } else {
        setErrorMessage(data.error || 'Error al registrar la empresa');
      }
    } catch (error) {
      setErrorMessage('Error de red o del servidor');
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Nueva Empresa</h2>
      {errorMessage && <div className="form-error-message">{errorMessage}</div>}
      {successMessage && <div className="form-success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="form">
        {[
          { label: 'ID Usuario', name: 'idUsuario', type: 'number' },
          { label: 'Nombre', name: 'nombre', type: 'text' },
          { label: 'RFC', name: 'rfc', type: 'text', maxLength: 13 },
          { label: 'Dirección', name: 'direccion', type: 'text' },
          { label: 'Teléfono', name: 'telefono', type: 'text' }
        ].map(({ label, name, type, maxLength }) => (
          <div key={name} className="form-group">
            <label htmlFor={name} className="form-label">{label}</label>
            <input
              type={type}
              id={name}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              required
              maxLength={maxLength}
              className="form-input"
            />
          </div>
        ))}
        <div className="form-group">
          <label htmlFor="descripcion" className="form-label">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            className="form-textarea"
            rows={4}
          />
        </div>
        <button type="submit" className="form-button" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Empresa'}
        </button>
      </form>
    </div>
  );
}

export default EmpresaForm;