import { useState, useEffect } from 'react';

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
    Fecha_Cierre: '',
    Estado: 'Abierta',
    CantidadPostulaciones: 0
  });

  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Obtener empresas al cargar el componente
  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/empresas');
        const data = await res.json();
        if (res.ok) {
          setEmpresas(data);
        } else {
          setErrorMessage(data.error || 'Error al cargar las empresas');
        }
      } catch (err) {
        setErrorMessage('Error de red o del servidor');
        console.error(err);
      }
    };
    fetchEmpresas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validaciones específicas para cada campo
    if (name === 'Salario') {
      if (/^[0-9]*\.?[0-9]*$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else if (name === 'CantidadPostulaciones') {
      if (/^[0-9]*$/.test(value)) {
        setForm({ ...form, [name]: value });
      }
    } else if (name === 'Titulo_puesto' || name === 'Tipo_Contrato' || name === 'Ubicacion') {
      if (value.length <= 150) {
        setForm({ ...form, [name]: value });
      }
    } else if (name === 'Descripcion' || name === 'Requisitos') {
      if (value.length <= 500) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones adicionales
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

    if (!form.Titulo_puesto || form.Titulo_puesto.length > 150) {
      setErrorMessage('El título del puesto es requerido y debe tener máximo 150 caracteres.');
      return;
    }

    if (!form.Descripcion || form.Descripcion.length > 500) {
      setErrorMessage('La descripción es requerida y debe tener máximo 500 caracteres.');
      return;
    }

    if (!form.Requisitos || form.Requisitos.length > 500) {
      setErrorMessage('Los requisitos son requeridos y deben tener máximo 500 caracteres.');
      return;
    }

    if (!form.Tipo_Contrato || form.Tipo_Contrato.length > 150) {
      setErrorMessage('El tipo de contrato es requerido y debe tener máximo 150 caracteres.');
      return;
    }

    if (!form.Ubicacion || form.Ubicacion.length > 150) {
      setErrorMessage('La ubicación es requerida y debe tener máximo 150 caracteres.');
      return;
    }

    if (!form.Estado) {
      setErrorMessage('El estado es requerido.');
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
          ...form,
          Titulo_puesto: '',
          Descripcion: '',
          Requisitos: '',
          Salario: '',
          Tipo_Contrato: '',
          Ubicacion: '',
          Fecha_Publicacion: '',
          Fecha_Cierre: '',
          Estado : '',
          CantidadPostulaciones: 0
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
        <div className="form-group">
          <label htmlFor="ID_Empresa" className="form-label">Empresa</label>
          <select
            id="ID_Empresa"
            name="ID_Empresa"
            value={form.ID_Empresa}
            onChange={handleChange}
            required
            className="form-input"
            disabled={empresas.length === 0}
          >
            <option value="">Seleccione una empresa</option>
            {empresas.map((empresa) => (
              <option key={empresa.ID} value={empresa.ID}>
                ID {empresa.ID} --- {empresa.Nombre}
              </option>
            ))}
          </select>
          {empresas.length === 0 && (
            <p className="form-hint">No hay empresas disponibles. Registre una empresa primero.</p>
          )}
        </div>

        {[
          { label: 'Título del Puesto', name: 'Titulo_puesto', type: 'text', maxLength: 150 },
          { label: 'Salario', name: 'Salario', type: 'text' },
          { label: 'Tipo de Contrato', name: 'Tipo_Contrato', type: 'text', maxLength: 150 },
          { label: 'Ubicación', name: 'Ubicacion', type: 'text', maxLength: 150 },
          { label: 'Fecha de Publicación', name: 'Fecha_Publicacion', type: 'date' },
          { label: 'Fecha de Cierre', name: 'Fecha_Cierre', type: 'date' }
        ].map(({ label, name, type, maxLength }) => (
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
              maxLength={maxLength}
            />
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="Estado" className="form-label">Estado</label>
          <input
            type="text"
            id="Estado"
            name="Estado"
            value={form.Estado}
            onChange={handleChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="CantidadPostulaciones" className="form-label">Cantidad de Postulaciones</label>
          <input
            type="text"
            id="CantidadPostulaciones"
            name="CantidadPostulaciones"
            value={form.CantidadPostulaciones}
            onChange={handleChange}
            required
            className="form-input"
            min={0}
          />
        </div>

        {[
          { label: 'Descripción', name: 'Descripcion', maxLength: 500 },
          { label: 'Requisitos', name: 'Requisitos', maxLength: 500 }
        ].map(({ label, name, maxLength }) => (
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
              maxLength={maxLength}
            />
            <small style={{ color: '#555' }}>Máximo {maxLength} caracteres</small>
          </div>
        ))}

        <button type="submit" disabled={loading || empresas.length === 0} className="form-button">
          {loading ? 'Guardando...' : 'Publicar Vacante'}
        </button>
      </form>
    </div>
  );
}

export default Vacantes;