import { useState, useEffect } from 'react';

function EmpresaForm() {
  const [formData, setFormData] = useState({
    idUsuario: '',
    nombre: '',
    rfc: '',
    direccion: '',
    telefono: '',
    descripcion: ''
  });
  const [usuarios, setUsuarios] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Obtener usuarios al cargar el componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/usuarios');
        const data = await res.json();
        if (res.ok) {
          setUsuarios(data);
        } else {
          setErrorMessage(data.error || 'Error al cargar los usuarios');
        }
      } catch (err) {
        setErrorMessage('Error de red o del servidor');
        console.error(err);
      }
    };
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!formData.idUsuario) {
      setErrorMessage('Debe seleccionar un usuario.');
      return;
    }

    const regexNumeros = /^[0-9]+$/;
    if (!regexNumeros.test(formData.telefono) || formData.telefono.length !== 10) {
      setErrorMessage('El campo Teléfono debe contener exactamente 10 dígitos numéricos.');
      return;
    }
    if (formData.rfc.length !== 13) {
      setErrorMessage('El RFC debe tener exactamente 13 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idUsuario: formData.idUsuario,
          nombre: formData.nombre,
          rfc: formData.rfc,
          direccion: formData.direccion,
          telefono: formData.telefono,
          descripcion: formData.descripcion
        })
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'telefono') {
      if (/^[0-9]*$/.test(value) && value.length <= 10) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'rfc') {
      if (value.length <= 13) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'nombre' || name === 'direccion') {
      if (value.length <= 150) {
        setFormData({ ...formData, [name]: value });
      }
    } else if (name === 'descripcion') {
      if (value.length <= 150) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Nueva Empresa</h2>
      {errorMessage && <div className="form-error-message">{errorMessage}</div>}
      {successMessage && <div className="form-success-message">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="idUsuario" className="form-label">Usuario</label>
          <select
            id="idUsuario"
            name="idUsuario"
            value={formData.idUsuario}
            onChange={handleChange}
            required
            className="form-input"
            disabled={usuarios.length === 0}
          >
            <option value="">Seleccione un usuario</option>
            {usuarios.map((usuario) => (
              <option key={usuario.ID} value={usuario.ID}>
                ID {usuario.ID} --- {usuario.NombreUsuario}
              </option>
            ))}
          </select>
          {usuarios.length === 0 && (
            <p className="form-hint">No hay usuarios disponibles. Registre un usuario primero.</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="nombre" className="form-label">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            maxLength={150}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="rfc" className="form-label">RFC</label>
          <input
            type="text"
            id="rfc"
            name="rfc"
            value={formData.rfc}
            onChange={handleChange}
            required
            maxLength={13}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="direccion" className="form-label">Dirección</label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            maxLength={150}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="telefono" className="form-label">Teléfono</label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            required
            maxLength={10}
            className="form-input"
          />
        </div>

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
            maxLength={150}
          />
          <small style={{ color: '#555' }}>Máximo 150 caracteres</small>
        </div>

        <button type="submit" className="form-button" disabled={isSubmitting || usuarios.length === 0}>
          {isSubmitting ? 'Registrando...' : 'Registrar Empresa'}
        </button>
      </form>
    </div>
  );
}

export default EmpresaForm;