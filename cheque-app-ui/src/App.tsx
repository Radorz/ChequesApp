import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Proveedores from './pages/Proveedores';
import ConceptosPago from './pages/ConceptosPago';
import  Usuarios  from './pages/Usuarios';
import PrivateRoute from './components/PrivateRoute';
import {  ToastContainer } from 'react-toastify';
import Solicitudes from './pages/Solicitudes';
import GenerarCheques from './pages/GenerarCheques';
import ContabilizarCheques from './pages/ContabilizarCheques';
import ChequeDetalle from './pages/ChequeDetalle';
import ChequesGenerados from './pages/ChequesGenerados';
import Asientos from './pages/Asientos';

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
        <Route path="usuarios" element={<Usuarios />} />
      <Route path="/cheques/solicitudes" element={<Solicitudes />} />
      <Route path="/cheques/generar" element={<GenerarCheques />} />
      <Route path="/solicitudes" element={<Navigate to="/cheques/solicitudes" replace />} />
      <Route path="/generar-cheques" element={<Navigate to="/cheques/generar" replace />} />
      <Route path="/cheques/contabilizar" element={<ContabilizarCheques />} />
      <Route path="/cheques/detalle/:id" element={<ChequeDetalle />} />
      <Route path="/cheques/emitidos" element={<ChequesGenerados />} />
      <Route path="/cheques/asientos" element={<Asientos />} />

\      </Route>
    </Routes>    
    </>
  );
}