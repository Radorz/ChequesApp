import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig'; // tu instancia de Axios
import ConceptoPagoModal from '../components/ConceptoPagoModal';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiCheck, FiSlash } from 'react-icons/fi';


export interface ConceptoPago {
  identificador: number;        // idem
  descripcion: string;           // texto descriptivo
  estado: boolean;               // activo/inactivo
}

export default function ConceptosPago() {
  const [lista, setLista] = useState<ConceptoPago[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState<ConceptoPago | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');  // <-- estado para la búsqueda

  const fetchConceptos = async () => {
    try {
      const { data } = await api.get<ConceptoPago[]>('/conceptospago');
      setLista(data);
    } catch {
      toast.error('Error cargando conceptos de pago');
    }
  };

  useEffect(() => {
    fetchConceptos();
  }, []);

  // Filtramos la lista según el término de búsqueda (case-insensitive)
  const filteredLista = lista.filter(c =>
    c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = async (item: ConceptoPago) => {
    try {
      if (item.identificador) {
        await api.put(`/conceptospago/${item.identificador}`, item);
        toast.success('Concepto de pago actualizado satisfactoriamente');
      } else {
        await api.post('/conceptospago', item);
        toast.success('Concepto de pago creado satisfactoriamente');
      }
      setShowModal(false);
      fetchConceptos();
    } catch {
      toast.error('Error al guardar el concepto de pago');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este concepto?')) return;
    try {
      await api.delete(`/conceptospago/${id}`);
      toast.success('Concepto de pago eliminado satisfactoriamente');
      fetchConceptos();
    } catch {
      toast.error('Error al eliminar el concepto de pago');
    }
  };

  const handleToggle = async (item: ConceptoPago) => {
    try {
      await api.put(`/conceptospago/${item.identificador}`, {
        ...item,
        estado: !item.estado,
      });
      toast.success(
        item.estado ? 'Concepto de pago inactivado' : 'Concepto de pago activado'
      );
      fetchConceptos();
    } catch {
      toast.error('Error al cambiar el estado');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 space-y-2 sm:space-y-0">
        <h1 className="text-2xl font-semibold">Conceptos de Pago</h1>

        {/* Barra de búsqueda */}
        <input
          type="text"
          placeholder="Buscar descripción..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full sm:w-1/3 border rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
        />
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Descripción</th>
            <th className="px-4 py-2 text-center">Estado</th>
            <th className="px-4 py-2 text-center">        <button
          onClick={() => {
            setCurrent(undefined);
            setShowModal(true);
          }}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 active:bg-green-700 transition cursor-pointer"
        >
          Nuevo
        </button></th>
          </tr>
        </thead>
        <tbody>
          {filteredLista.map(c => (
            <tr key={c.identificador} className="border-b">
              <td className="px-4 py-2">{c.identificador}</td>
              <td className="px-4 py-2">{c.descripcion}</td>
              <td className="px-4 py-2 text-center">
                <span
                  className={`inline-block px-2 py-1 text-sm rounded-full ${
                    c.estado
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {c.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-2 text-center space-x-2 flex justify-center">
                <button
                  onClick={() => {
                    setCurrent(c);
                    setShowModal(true);
                  }}
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition cursor-pointer"
                  title="Editar"
                >
                  <FiEdit size={16} />
                </button>
                <button
                  onClick={() => handleToggle(c)}
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition cursor-pointer"
                  title={c.estado ? 'Inactivar' : 'Activar'}
                >
                  {c.estado ? <FiSlash size={16} /> : <FiCheck size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(c.identificador!)}
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition cursor-pointer"
                  title="Eliminar"
                >
                  <FiTrash2 size={16} />
                </button>
                </td>
              </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <ConceptoPagoModal
          show={showModal}
          item={current}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}