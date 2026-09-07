import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/style.css';
import Header from './components/Header';
import Login from './components/login/Login';
import Administracion from './components/data/Administracion';
import Register from './components/login/Register';
import EditUser from './components/login/EditUser';
import Inicio from './components/data/Inicio';
import DetalleEstudio from './components/data/DetalleEstudio';
import Footer from './components/Footer';

function App() {
  return (
    <Router>
      <Header />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/detalle-estudio" element={<DetalleEstudio />} />
          <Route path="/inicio" element={<Inicio />} />
          <Route path="/Administracion" element={<Administracion />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editUser" element={<EditUser />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
