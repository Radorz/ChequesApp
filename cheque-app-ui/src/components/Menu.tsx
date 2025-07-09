import { NavLink, useNavigate } from 'react-router-dom';
import { FiUsers, FiCreditCard, FiFileText, FiLogOut } from 'react-icons/fi';

export default function Menu() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-2 rounded ${isActive ? 'bg-blue-200' : 'hover:bg-gray-100'}`;

  return (
    <nav className="w-64 bg-white shadow p-4">
      <h2 className="text-xl font-bold mb-6">ChequeApp</h2>
      <ul className="space-y-2">
        <li>
          <NavLink to="/conceptos" className={linkClass}>
            <FiCreditCard className="mr-2" /> Conceptos
          </NavLink>
        </li>
        <li>
          <NavLink to="/proveedores" className={linkClass}>
            <FiUsers className="mr-2" /> Proveedores
          </NavLink>
        </li>
        <li>
            <NavLink to="/solicitudes" className={linkClass}>
            <FiFileText className="mr-2" /> Solicitudes
            </NavLink>
        </li>
        {/* <li>
          <NavLink to="/usuarios" className={linkClass}>
            <FiFileText className="mr-2" /> Usuarios
          </NavLink>
        </li> */}
        <li>
          <button onClick={logout} className="flex items-center text-red-500 p-2 rounded hover:bg-gray-100">
            <FiLogOut className="mr-2" /> Salir
          </button>
        </li>
      </ul>
    </nav>
  );
}