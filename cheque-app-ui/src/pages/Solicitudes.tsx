import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiCheck, FiSlash, FiPlus } from 'react-icons/fi';
import { money } from '../utils/money';
import type { Proveedor } from '../models/Proveedor';
import type { SolicitudCheque } from '../models/SolicitudCheque';
import SolicitudModal from '../components/SolicitudModal';
import { Link } from 'react-router-dom';
import { FiPrinter } from 'react-icons/fi';

export default function Solicitudes() {
  const [lista, setLista] = useState<SolicitudCheque[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState<SolicitudCheque>();
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAll = async () => {
    try {
      const [{ data: s }, { data: p }] = await Promise.all([
        api.get<SolicitudCheque[]>('/solicitudes'),
        api.get<Proveedor[]>('/proveedores')
      ]);
      setLista(s.filter(p=> p.estado != 'Generado'));
      setProveedores(p.filter(prov => prov.estado));
    } catch {
      toast.error('Error cargando datos');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // filtrar por número o proveedor
  const filtered = lista.filter(x =>
    x.numeroSolicitud?.toString().includes(searchTerm) ||
    x.proveedor?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  


  const handleSave = async (item: SolicitudCheque) => {
    try {
      if (item.numeroSolicitud) {
        await api.put(`/solicitudes/${item.numeroSolicitud}`, item);
        toast.success('Solicitud actualizada');
      } else {
        await api.post('/solicitudes', item);
        toast.success('Solicitud creada');
      }
      setShowModal(false);
      fetchAll();
    } catch (e:any) {
  toast.error(e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
      await api.delete(`/solicitudes/${id}`);
      toast.success('Solicitud eliminada');
      fetchAll();
    } catch (e:any) {
  toast.error(e.message);
    }
  };

  const handleToggle = async (x: SolicitudCheque) => {
    try {
      await api.put(`/solicitudes/${x.numeroSolicitud}`, {
        ...x,
        estado: x.estado === 'Pendiente' ? 'Anulada' : 'Pendiente'
      });
      toast.success('Estado cambiado');
      fetchAll();
    } catch (e:any) {
  toast.error(e.message);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-semibold">Solicitudes de Cheque</h1>
        <input
          type="text"
          placeholder="Buscar # o proveedor..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/3 border rounded px-3 py-2 focus:outline-none focus:ring"
        />        
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Proveedor</th>
            <th className="px-4 py-2 text-center">Monto</th>
            <th className="px-4 py-2 text-center">Fecha</th>
            <th className="px-4 py-2 text-center">Estado</th>
            <th className="px-4 py-2 text-center items-center center"><button
          onClick={() => { setCurrent(undefined); setShowModal(true); }}
          className="flex items-center  bg-green-500 text-white p-2 rounded transition duration-150 ease-in-out hover:bg-green-600 active:bg-green-700 cursor-pointer"
        >
            <FiPlus className="mr-1" /> Nuevo
        </button></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(x => (
            <tr key={x.numeroSolicitud} className="border-b">
              <td className="px-4 py-2 text-center">{x.numeroSolicitud}</td>
              <td className="px-4 py-2 text-center">  {x.proveedor?.nombre /* <-- usa la relación */}</td>
              <td className="px-4 py-2 text-center">{money(x.monto.toFixed(2))}</td>
              <td className="px-4 py-2 text-center">{new Date(x.fechaRegistro).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-center">
                <span className={`inline-block px-2 py-1 text-sm rounded-full ${
                  x.estado === 'Pendiente'
                    ? 'bg-yellow-100 text-yellow-800'
                  : x.estado === 'Anulada'
                    ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
                }`}>
                  {x.estado}
                </span>
              </td>
              <td className="px-4 py-2 flex  space-x-2">
                <button
                  onClick={() => { setCurrent(x); setShowModal(true); }}
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition cursor-pointer"
                  title="Editar"
                ><FiEdit size={16}/></button>
                <button
                  onClick={() => handleToggle(x)}
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition cursor-pointer"
                  title="Toggle Estado"
                >
                  {x.estado === 'Anulada' ? <FiCheck size={16}/> : <FiSlash size={16}/>}
                </button>
                <button
                  onClick={() => handleDelete(x.numeroSolicitud!)}
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition cursor-pointer"
                  title="Eliminar"
                ><FiTrash2 size={16}/></button>
                <Link
    to={`/cheques/detalle/${x.numeroSolicitud}`}
    className={`p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition
      ${x.estado === 'Generado' ? '' : 'opacity-40 pointer-events-none'}`}
    title="Detalle / Imprimir cheque"
  >
    <FiPrinter size={16} />
  </Link>
                </td>
              </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <SolicitudModal
          show={showModal}
          item={current}
          proveedores={proveedores}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
