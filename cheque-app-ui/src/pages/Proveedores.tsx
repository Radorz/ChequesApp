import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { FiPlus, FiEdit, FiTrash2,FiSlash, FiCheck} from 'react-icons/fi';
import ProveedorModal from '../components/ProveedorModal';
import { toast } from 'react-toastify';

interface Proveedor {
  identificador: number;
  nombre: string;
  tipoPersona: 'Física' | 'Jurídica';
  cedulaRnc: string;
  balance: number;
  cuentaContable: string;
  estado: boolean;
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState<Partial<Proveedor> | undefined>({});
  const [searchTerm, setSearchTerm] = useState<string>('');  // ← estado búsqueda

  const fetch = async () => {
    const res = await api.get<Proveedor[]>('/proveedores');
    setProveedores(res.data);
  };

  useEffect(() => { fetch(); }, []);

  const openModal = (prov?: Proveedor) => {
    setCurrent(prov || {});
    setShowModal(true);
  };

    const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cedulaRnc.includes(searchTerm)
  );

  const save = async (data: Partial<Proveedor>) => {
     try {
    if (data.identificador) {
      await api.put(`/proveedores/${data.identificador}`, data);
    toast.success('Proveedor actualizado satisfactoriamente');

    } else {
      await api.post('/proveedores', data);
      toast.success('Proveedor creado satisfactoriamente');

    }
    fetch();
    setShowModal(false);
}catch (err) {
      toast.error('Error al guardar el proveedor');
    }
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar proveedor?')) {
      await api.delete(`/proveedores/${id}`);
    toast.success('Proveedor eliminado satisfactoriamente');
      fetch();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Proveedores</h1>
                {/* Barra de búsqueda */}
        <input
          type="text"
          placeholder="Buscar nombre o cédula..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/3 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>
      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr className='items-center'>
            <th className="p-2">ID</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Cédula/RNC</th>
            <th className="p-2">Balance</th>
            <th className="p-2">Cuenta</th>
            <th className="p-2">Estado</th>
            <th className="p-2">        
                <button onClick={() => openModal()} className="flex items-center bg-green-500 text-white p-2 rounded transition duration-150 ease-in-out hover:bg-green-600 active:bg-green-700 cursor-pointer">
                <FiPlus className="mr-1" /> Nuevo
                </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredProveedores.map(p => (
            <tr key={p.identificador} className="border-t text-center">
              <td className="p-2">{p.identificador}</td>
              <td className="p-2">{p.nombre}</td>
                <td className="p-2">
                <span className="inline-block px-2 py-1 text-sm font-medium text-indigo-800 bg-indigo-100 rounded-full">
                  {p.tipoPersona}
                </span>
              </td>              
              <td className="p-2">{p.cedulaRnc}</td>
              <td className="p-2">{p.balance}</td>
              <td className="p-2">{p.cuentaContable}</td>
                <td className="p-2">
                <span className={`inline-block px-2 py-1 text-sm font-medium rounded-full ${p.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {p.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>              
              <td className="p-2 space-x-2">
                 <button onClick={() => openModal(p)} className="p-1 rounded transition duration-150 ease-in-out hover:bg-gray-200 active:bg-gray-300 cursor-pointer">
                  <FiEdit />
                </button>
<button
                  onClick={() => save({...p, estado: !p.estado})}
                  className="p-1 rounded transition duration-150 ease-in-out hover:bg-yellow-200 active:bg-yellow-300 cursor-pointer"
                  title={p.estado ? 'Inactivar' : 'Activar'}
                >
                  {p.estado ? <FiSlash className="text-gray-600" /> : <FiCheck className="text-gray-600" />}
                </button>
                <button onClick={() => remove(p.identificador)} className="p-1 rounded transition duration-150 ease-in-out hover:bg-gray-200 active:bg-gray-300 cursor-pointer">
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && <ProveedorModal item={current} show={showModal} onClose={() => setShowModal(false)} onSave={save} />}
    </>
  );
}