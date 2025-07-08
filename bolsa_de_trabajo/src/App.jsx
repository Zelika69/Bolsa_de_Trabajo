import { useState } from 'react'
import './App.css'
import VacantesForm from './components/VacantesForm'
import EmpresaForm from './components/EmpresaForm'


function App() {
  const [activeTab, setActiveTab] = useState('vacantes');

  return (
    <>
      <h1>Bolsa de Trabajo</h1>
      
      <div className="tabs">
        <button 
          onClick={() => setActiveTab('vacantes')}
          className={activeTab === 'vacantes' ? 'active' : ''}
        >
          Vacantes
        </button>
        <button 
          onClick={() => setActiveTab('empresas')}
          className={activeTab === 'empresas' ? 'active' : ''}
        >
          Empresas
        </button>
      </div>
      
      {activeTab === 'vacantes' ? <VacantesForm /> : <EmpresaForm />}
    </>
  )
}

export default App
