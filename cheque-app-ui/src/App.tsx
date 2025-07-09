import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Proveedores from './pages/Proveedores';
import ConceptosPago from './pages/ConceptosPago';
import  Usuarios  from './pages/Usuarios';
import PrivateRoute from './components/PrivateRoute';
import { toast, ToastContainer } from 'react-toastify';
import Solicitudes from './pages/Solicitudes';

export default function App() {
  
  return (
     <>
      <ToastContainer position="top-right"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        style={{ zIndex: 9999 }}
        />
      <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="proveedores" replace />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="conceptos" element={<ConceptosPago />} />
        <Route path="/solicitudes" element={<Solicitudes />} />
        <Route path="usuarios" element={<Usuarios />} />
      </Route>
    </Routes>    
    </>
  );
}