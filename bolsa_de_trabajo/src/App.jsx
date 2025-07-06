import './App.css';
import Header from './components/Header/Header';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        {/* El resto de tu contenido de la aplicación aquí */}
        <p>Contenido principal de la aplicación</p>
      </main>
    </div>
  );
}

export default App;