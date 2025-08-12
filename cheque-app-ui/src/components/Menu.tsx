import { NavLink, useNavigate,useLocation  } from 'react-router-dom';
import { FiUsers, FiCreditCard, FiLogOut, FiChevronDown, FiList, FiCheckSquare, FiDatabase, FiEye, FiBook } from 'react-icons/fi';
import  { useEffect, useRef, useState } from 'react';
import Logo from './Logo';

export default function Menu() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const { pathname } = useLocation();
  const [openCheques, setOpenCheques] = useState(false);
  const chequesGroupRef = useRef<HTMLDivElement>(null);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center p-2 rounded ${isActive ? 'bg-blue-200' : 'hover:bg-gray-100'}`;

  
const baseItem =
  'flex items-center gap-2 w-full text-left px-2 py-2 rounded hover:bg-gray-100 transition';
const active =
  'bg-blue-100 text-blue-800 font-medium';

  useEffect(() => {
    if (pathname.startsWith('/cheques')) setOpenCheques(true);
  }, [pathname]);
  
  const handleBlurGroup = (e: React.FocusEvent<HTMLDivElement>) => {
    // Si el nuevo foco (relatedTarget) NO está dentro del grupo -> cerrar
    const next = e.relatedTarget as Node | null;
    if (!next || !e.currentTarget.contains(next)) {
      setOpenCheques(false);
    }
  };

  const handleKeyDownGroup = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') setOpenCheques(false);
  };

  return (
    <nav className="w-64 bg-white shadow p-4 print:hidden">
      <NavLink to="/inicio" >
          <Logo className="mb-6" />
      </NavLink>

      <ul className="space-y-2" >
 {/* ---- Padre: Cheques ---- */}
      <div
        ref={chequesGroupRef}
        onBlur={handleBlurGroup}
        onKeyDown={handleKeyDownGroup}
        // para que el contenedor pueda recibir blur via bubbling (los hijos son focusables)
        role="group"
        aria-label="Menú Cheques"
      >

      <button
        type="button"
       onClick={() => setOpenCheques(v => !v)}
          aria-expanded={openCheques}
          aria-controls="submenu-cheques"
          className={`flex items-center gap-2 w-full text-left px-2 py-2 rounded hover:bg-gray-100 transition ${
            pathname.startsWith('/cheques') ? 'bg-blue-100 text-blue-800' : ''
          }`}
      >
        <FiCreditCard />
        <span className="flex-1 text-left">Cheques</span>
        <FiChevronDown
          className={`transition-transform ${openCheques ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Hijos de Cheques */}
      {openCheques && (
        <div className="ml-6 mt-1 flex flex-col">
          <NavLink
            to="/cheques/solicitudes"
            className={({ isActive }) =>
              `pl-2 ${baseItem} ${isActive ? active : ''}`
            }
          >
            <FiList /> <span>Solicitudes</span>
          </NavLink>

          <NavLink
            to="/cheques/generar"
            className={({ isActive }) =>
              `pl-2 ${baseItem} ${isActive ? active : ''}`
            }
          >
            <FiCheckSquare /> <span>Generar</span>
          </NavLink>
              <NavLink to="/cheques/emitidos" className={({ isActive }) =>
              `pl-2 ${baseItem} ${isActive ? active : ''}`}>
  <FiEye /> <span>Emitidos</span>
</NavLink>
          <NavLink to="/cheques/contabilizar" className={({ isActive }) =>
              `pl-2 ${baseItem} ${isActive ? active : ''}`}>
      <FiDatabase /> <span>Contabilizar</span>
    </NavLink>
    <NavLink to="/cheques/asientos" className={({ isActive }) =>
              `pl-2 ${baseItem} ${isActive ? active : ''}`}>
  <FiBook /> <span>Asientos</span>
</NavLink>
        </div>
      )}

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
        </div>
      </ul>
    </nav>
  );
}