import { useState } from 'react';

function Vacantes() {
  const [form, setForm] = useState({
    ID_Empresa: '',
    Titulo_puesto: '',
    Descripcion: '',
    Requisitos: '',
    Salario: '',
    Tipo_Contrato: '',
    Ubicacion: '',
    Fecha_Publicacion: '',
    Fecha_Cierre: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (parseFloat(form.Salario) < 0) {
      setErrorMessage('El salario no puede ser negativo.');
      setSuccessMessage('');
      return;
    }

    if (form.Fecha_Cierre <= form.Fecha_Publicacion) {
      setErrorMessage('La fecha de cierre debe ser posterior a la de publicación.');
      setSuccessMessage('');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('http://localhost:5000/insertar_vacante', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMessage(data.message || 'Vacante insertada correctamente.');
        setForm({
          ID_Empresa: '',
          Titulo_puesto: '',
          Descripcion: '',
          Requisitos: '',
          Salario: '',
          Tipo_Contrato: '',
          Ubicacion: '',
          Fecha_Publicacion: '',
          Fecha_Cierre: ''
        });
      } else {
        setErrorMessage(data.error || 'Error al insertar la vacante.');
      }
    } catch (err) {
      setErrorMessage('Error de red o del servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Publicar Nueva Vacante</h2>

      {errorMessage && <div className="form-error-message">{errorMessage}</div>}
      {successMessage && <div className="form-success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="form">
        {[
          { label: 'ID Empresa', name: 'ID_Empresa', type: 'number' },
          { label: 'Título del Puesto', name: 'Titulo_puesto', type: 'text' },
          { label: 'Salario', name: 'Salario', type: 'number' },
          { label: 'Tipo de Contrato', name: 'Tipo_Contrato', type: 'text' },
          { label: 'Ubicación', name: 'Ubicacion', type: 'text' },
          { label: 'Fecha de Publicación', name: 'Fecha_Publicacion', type: 'date' },
          { label: 'Fecha de Cierre', name: 'Fecha_Cierre', type: 'date' }
        ].map(({ label, name, type }) => (
          <div key={name} className="form-group">
            <label htmlFor={name} className="form-label">{label}</label>
            <input
              type={type}
              id={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
        ))}

        {[
          { label: 'Descripción', name: 'Descripcion' },
          { label: 'Requisitos', name: 'Requisitos' }
        ].map(({ label, name }) => (
          <div key={name} className="form-group">
            <label htmlFor={name} className="form-label">{label}</label>
            <textarea
              id={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              required
              rows={4}
              className="form-textarea"
            />
          </div>
        ))}

        <button type="submit" disabled={loading} className="form-button">
          {loading ? 'Guardando...' : 'Publicar Vacante'}
        </button>
      </form>
    </div>
  );
}

export default Vacantes;
