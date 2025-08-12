import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import GenerarChequesModal from '../components/GenerarChequesModal';
import { FiCheckSquare, FiSquare, FiSlash } from 'react-icons/fi';
import ConfirmModal from '../components/ConfirmModal';
import { money } from '../utils/money';


interface Proveedor {
  identificador: number;
  nombre: string;
  tipoPersona: 'Física' | 'Jurídica';
  cedulaRnc: string;
  balance: number;
  cuentaContable: string;
  estado: boolean;
}
export interface SolicitudCheque {
  numeroSolicitud?: number;
  proveedorId: number;
  proveedor?: Proveedor;
  monto: number;
  fechaRegistro: string;
  estado: 'Pendiente' | 'Anulada' | 'Generado';
  cuentaContableProveedor: string;
  cuentaContableBanco: string;
  numeroCheque?: string; // <— nuevo
}



export default function GenerarCheques() {
  const [lista, setLista] = useState<SolicitudCheque[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);


  const fetchPendientes = async () => {
    try {
      const { data } = await api.get<SolicitudCheque[]>('/solicitudes/pendientes');
      setLista(data);
    } catch {
      toast.error('Error cargando solicitudes pendientes');
    }
  };

  useEffect(() => { fetchPendientes(); }, []);

  const filtered = useMemo(
    () =>
      lista.filter(x =>
        x.numeroSolicitud?.toString().includes(search) ||
        x.proveedor?.nombre?.toLowerCase().includes(search.toLowerCase() || '')
      ),
    [lista, search]
  );

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggleAll = () =>
    setSelected(prev => prev.length === filtered.length ? [] : filtered.map(x => x.numeroSolicitud!));

  const doAnular = async () => {
    try {
      await api.post('/solicitudes/anular', { ids: selected });
      toast.success('Solicitudes anuladas');
      setSelected([]);
      fetchPendientes();
    } catch {
      toast.error('Error al anular');
    } finally {
      setShowConfirm(false);   // cerrar modal
    }
  };

  const handleGenerar = async (startNumber: string | null, manual?: Record<number, string>) => {
    try {
      // construimos Items: o autosecuencia desde startNumber, o manual por id
      let items: { id: number; numeroCheque: string }[] = [];

      if (manual && Object.keys(manual).length > 0) {
        items = selected.map(id => ({ id, numeroCheque: manual[id] }));
      } else {
        if (!startNumber || !/^\d+$/.test(startNumber)) {
          toast.error('Número inicial inválido');
          return;
        }
        const base = Number(startNumber);
        items = selected
          .sort((a, b) => a - b)
          .map((id, idx) => ({ id, numeroCheque: String(base + idx) }));
      }

      await api.post('/solicitudes/generar-cheques', { items });
      toast.success('Cheques generados');
      setSelected([]);
      setShowModal(false);
      fetchPendientes();
    } catch {
      toast.error('Error al generar cheques');
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-2">
        <h1 className="text-2xl font-semibold">Generar Cheques</h1>
        <input
          className="w-full sm:w-1/3 border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Buscar # o proveedor…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 hover:bg-indigo-500 active:bg-indigo-700 transition"
          >
            Generar cheque
          </button>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={selected.length === 0}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 active:bg-gray-400 transition disabled:opacity-50"
                title="Anular seleccionadas"
            >
                <FiSlash />
            </button>
        </div>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 w-10 text-center">
              <button onClick={toggleAll} className="p-1 rounded hover:bg-gray-200 active:bg-gray-300">
                {selected.length === filtered.length && filtered.length > 0 ? <FiCheckSquare /> : <FiSquare />}
              </button>
            </th>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Proveedor</th>
            <th className="px-4 py-2 text-center">Monto</th>
            <th className="px-4 py-2 text-center">Fecha</th>
            <th className="px-4 py-2 text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.numeroSolicitud} className="border-b">
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(s.numeroSolicitud!)}
                  onChange={() => toggle(s.numeroSolicitud!)}
                />
              </td>
              <td className="px-4 py-2 text-center">{s.numeroSolicitud}</td>
              <td className="px-4 py-2 text-center">{s.proveedor?.nombre}</td>
              <td className="px-4 py-2 text-center">{money(s.monto.toFixed(2))}</td>
              <td className="px-4 py-2 text-center">{new Date(s.fechaRegistro).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-center">
                <span className="inline-block px-2 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800">
                  Pendiente
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <GenerarChequesModal
          show={showModal}
          cantidad={selected.length}
          onCancel={() => setShowModal(false)}
          onConfirm={(start, manual) => handleGenerar(start, manual)}
        />
      )}
       {showConfirm && (
    <ConfirmModal
      show={showConfirm}
      title="Anular solicitudes"
      message={`¿Deseas anular ${selected.length} solicitud(es) seleccionada(s)? Esta acción no genera cheque.`}
      confirmText="Anular"
      cancelText="Cancelar"
      onConfirm={doAnular}
      onCancel={() => setShowConfirm(false)}
    />
  )}
    </>
  );
}
