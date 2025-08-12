import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import ConfirmModal from '../components/ConfirmModal';
import { money } from '../utils/money';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';
import type { SolicitudCheque } from '../models/SolicitudCheque';

export default function ContabilizarCheques() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<SolicitudCheque[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const total = useMemo(
    () => selected
      .map(id => data.find(x => x.numeroSolicitud === id)?.monto || 0)
      .reduce((a, b) => a + b, 0),
    [selected, data]
  );

  const fetchData = async () => {
    try {
      const { data: res } = await api.get<SolicitudCheque[]>(
        `/solicitudes/generadas-no-contabilizadas?year=${year}&month=${month}`
      );
      setData(res);
      setSelected([]);
    } catch {
      toast.error('Error cargando cheques del período');
    }
  };

  useEffect(() => { fetchData(); }, [year, month]);

  const toggle = (id: number) =>
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(prev => prev.length === data.length ? [] : data.map(x => x.numeroSolicitud!));

  const contabilizar = async () => {
    try {
      const fechaAsiento = new Date(year, month - 1, 1).toISOString();
      const descripcion = `Asiento de Cheques correspondiente al período ${year}-${String(month).padStart(2,'0')}`;
      const { data: res } = await api.post('/solicitudes/contabilizar-lote', {
        ids: selected,
        descripcion,
        fechaAsiento
      });
      toast.success(`Contabilizado: ${selected.length} cheques. Débito #${res.idDeb}, Crédito #${res.idCre}`);
      setConfirmOpen(false);
      fetchData();
    } catch (e) {
      toast.error('No se pudo contabilizar');
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-semibold">Contabilizar Cheques</h1>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
                  className="border rounded px-2 py-2">
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m =>
              <option key={m} value={m}>{m.toString().padStart(2,'0')}</option>
            )}
          </select>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                 className="border rounded px-2 py-2 w-24" />
          <button onClick={fetchData}
                  className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 active:bg-gray-400">
            Buscar
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{money(total)}</span>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={selected.length === 0}
            className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50 hover:bg-indigo-500 active:bg-indigo-700 transition"
          >
            Contabilizar ({selected.length})
          </button>
        </div>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 w-10 text-center">
              <button onClick={toggleAll} className="p-1 rounded hover:bg-gray-200 active:bg-gray-300">
                {selected.length === data.length && data.length > 0 ? <FiCheckSquare/> : <FiSquare/>}
              </button>
            </th>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Proveedor</th>
            <th className="px-4 py-2">Número Cheque</th>
            <th className="px-4 py-2 text-right">Monto</th>
            <th className="px-4 py-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {data.map(x => (
            <tr key={x.numeroSolicitud} className="border-b">
              <td className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(x.numeroSolicitud!)}
                  onChange={() => toggle(x.numeroSolicitud!)}
                />
              </td>
              <td className="px-4 py-2 text-center">{x.numeroSolicitud}</td>
              <td className="px-4 py-2 text-center">{x.proveedor?.nombre}</td>
              <td className="px-4 py-2 text-center">{x.numeroCheque}</td>
              <td className="px-4 py-2 text-right tabular-nums">{money(x.monto)}</td>
              <td className="px-4 py-2 text-center">{new Date(x.fechaRegistro).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ConfirmModal
        show={confirmOpen}
        title="Confirmar contabilización"
        message={`Se contabilizarán ${selected.length} cheque(s) por un total de ${money(total)}.\nSe creará una nota de débito a la cuenta 82 y una de crédito a la 83.`}
        confirmText="Contabilizar"
        cancelText="Cancelar"
        onConfirm={contabilizar}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
