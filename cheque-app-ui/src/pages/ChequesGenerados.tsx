import { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import { money } from '../utils/money';
import { FiSearch, FiEye } from 'react-icons/fi';
import type { Proveedor } from '../models/Proveedor';
import ChequePreviewModal from '../components/ChequePreviewModal';

type Row = {
  numeroSolicitud: number;
  numeroCheque: string;
  proveedorId: number;
  proveedorNombre: string;
  monto: number;
  fechaRegistro: string;
};

export default function ChequesGenerados() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [filters, setFilters] = useState({
    proveedorId: '',
    desde: '',
    hasta: '',
    numeroCheque: '',
    numeroSolicitud: '',
  });

  const [show, setShow] = useState(false);
  const [detalleId, setDetalleId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Proveedor[]>('/proveedores');
        setProveedores(data.filter(p=> p.estado));
      } catch {
        toast.error('Error cargando proveedores');
      }
    })();
  }, []);

  const buscar = async () => {
    try {
      const params: any = {};
      if (filters.proveedorId) params.ProveedorId = Number(filters.proveedorId);
      if (filters.desde) params.Desde = filters.desde;
      if (filters.hasta) params.Hasta = filters.hasta;
      if (filters.numeroCheque) params.NumeroCheque = filters.numeroCheque;
      if (filters.numeroSolicitud) params.NumeroSolicitud = Number(filters.numeroSolicitud);

      const { data } = await api.get<Row[]>('/solicitudes/generados/buscar', { params });
      setRows(data);
    } catch (e: any) {
      toast.error(e.message ?? 'Error en la búsqueda');
    }
  };

  useEffect(() => { buscar(); }, []); // carga inicial

  const total = useMemo(() => rows.reduce((a, b) => a + b.monto, 0), [rows]);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Cheques generados</h1>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-white p-4 rounded-lg shadow mb-4">
        <select
          value={filters.proveedorId}
          onChange={(e) => setFilters(f => ({ ...f, proveedorId: e.target.value }))}
          className="border rounded px-3 py-2 focus:outline-none focus:ring"
        >
          <option value="">Todos los proveedores</option>
          {proveedores.map(p => (
            <option key={p.identificador} value={p.identificador}>{p.nombre}</option>
          ))}
        </select>

        <input
          type="date"
          value={filters.desde}
          onChange={(e) => setFilters(f => ({ ...f, desde: e.target.value }))}
          className="border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Desde"
        />

        <input
          type="date"
          value={filters.hasta}
          onChange={(e) => setFilters(f => ({ ...f, hasta: e.target.value }))}
          className="border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Hasta"
        />

        <input
          type="text"
          value={filters.numeroCheque}
          onChange={(e) => setFilters(f => ({ ...f, numeroCheque: e.target.value }))}
          className="border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Núm. cheque"
        />

        <div className="flex gap-2">
          <input
            type="text"
            value={filters.numeroSolicitud}
            onChange={(e) => setFilters(f => ({ ...f, numeroSolicitud: e.target.value }))}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring"
            placeholder="Núm. solicitud"
          />
          <button
            onClick={buscar}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 active:bg-indigo-700 transition flex items-center gap-2"
          >
            <FiSearch /> Buscar
          </button>
        </div>
      </div>

      {/* Resumen */}
      <div className="text-sm text-slate-600 mb-2">
        {rows.length} resultado(s) • Total: <strong>{money(total)}</strong>
      </div>

      {/* Tabla */}
      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Solicitud</th>
            <th className="px-4 py-2 text-left">Núm. Cheque</th>
            <th className="px-4 py-2 text-left">Proveedor</th>
            <th className="px-4 py-2 text-right">Monto</th>
            <th className="px-4 py-2 text-left">Fecha</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.numeroSolicitud} className="border-b">
              <td className="px-4 py-2">{r.numeroSolicitud}</td>
              <td className="px-4 py-2">{r.numeroCheque}</td>
              <td className="px-4 py-2">{r.proveedorNombre}</td>
              <td className="px-4 py-2 text-right tabular-nums">{money(r.monto)}</td>
              <td className="px-4 py-2">{new Date(r.fechaRegistro).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => { setDetalleId(r.numeroSolicitud); setShow(true); }}
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition"
                  title="Ver cheque"
                >
                  <FiEye />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Sin resultados</td></tr>
          )}
        </tbody>
      </table>

      {show && detalleId != null && (
        <ChequePreviewModal
          id={detalleId}
          onClose={() => setShow(false)}
        />
      )}
    </>
  );
}
