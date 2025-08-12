// src/pages/Asientos.tsx
import  { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { money } from '../utils/money';
import { toast } from 'react-toastify';
import { FiSearch, FiEye } from 'react-icons/fi';
import AsientoDetalleModal from '../components/AsientoDetalleModal';
import type { AsientoResumen } from '../models/Asientos';

export default function Asientos() {
  const [rows, setRows] = useState<AsientoResumen[]>([]);
  const [filters, setFilters] = useState({ desde: '', hasta: '', debId: '', creId: '' });
  const [detail, setDetail] = useState<{anio:number;mes:number;debId:number;creId:number}|null>(null);

  const buscar = async () => {
    try {
      const params:any = {};
      if (filters.desde) params.desde = filters.desde;
      if (filters.hasta) params.hasta = filters.hasta;
      if (filters.debId) params.debId = Number(filters.debId);
      if (filters.creId) params.creId = Number(filters.creId);
      const { data } = await api.get<AsientoResumen[]>('/asientos/resumen', { params });
      setRows(data);
    } catch (e:any) {
      toast.error(e.message);
    }
  };

  useEffect(() => { buscar(); }, []);

  const total = useMemo(() => rows.reduce((a,b)=>a+b.montoTotal,0), [rows]);

  const formatPeriodo = (a:number, m:number) => {
    const str = new Date(a, m-1, 1).toLocaleDateString('es-DO', { year:'numeric', month:'long' });
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Asientos contables</h1>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 bg-white p-4 rounded-lg shadow mb-4">
        <input type="date" value={filters.desde} onChange={e=>setFilters(f=>({...f, desde:e.target.value}))}
               className="border rounded px-3 py-2 focus:outline-none focus:ring" />
        <input type="date" value={filters.hasta} onChange={e=>setFilters(f=>({...f, hasta:e.target.value}))}
               className="border rounded px-3 py-2 focus:outline-none focus:ring" />
        <input type="number" placeholder="DB #" value={filters.debId} onChange={e=>setFilters(f=>({...f, debId:e.target.value}))}
               className="border rounded px-3 py-2 focus:outline-none focus:ring" />
        <input type="number" placeholder="CR #" value={filters.creId} onChange={e=>setFilters(f=>({...f, creId:e.target.value}))}
               className="border rounded px-3 py-2 focus:outline-none focus:ring" />
        <button onClick={buscar} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 active:bg-indigo-700 transition flex items-center gap-2">
          <FiSearch/> Buscar
        </button>
      </div>

      <div className="text-sm text-slate-600 mb-2">
        {rows.length} asiento(s) • Total: <strong>{money(total)}</strong>
      </div>

      <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Periodo</th>
            <th className="px-4 py-2 text-left">DB #</th>
            <th className="px-4 py-2 text-left">CR #</th>
            <th className="px-4 py-2 text-right">Monto Asiento</th>
            <th className="px-4 py-2 text-center"># Cheques</th>
            <th className="px-4 py-2 text-center"># Proveedores</th>
            <th className="px-4 py-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={`${r.anio}-${r.mes}-${r.debId}-${r.creId}`} className="border-b">
              <td className="px-4 py-2">{formatPeriodo(r.anio, r.mes)}</td>
              <td className="px-4 py-2">{r.debId}</td>
              <td className="px-4 py-2">{r.creId}</td>
              <td className="px-4 py-2 text-right tabular-nums">{money(r.montoTotal)}</td>
              <td className="px-4 py-2 text-center">{r.cantidadCheques}</td>
              <td className="px-4 py-2 text-center">{r.proveedoresUnicos}</td>
              <td className="px-4 py-2 text-center">
                <button
                  className="p-1 rounded hover:bg-gray-200 active:bg-gray-300 transition"
                  onClick={() => setDetail({ anio:r.anio, mes:r.mes, debId:r.debId, creId:r.creId })}
                  title="Ver detalle"
                >
                  <FiEye/>
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">Sin resultados</td></tr>
          )}
        </tbody>
      </table>

      {detail && (
        <AsientoDetalleModal
          args={detail}
          onClose={() => setDetail(null)}
        />
      )}
    </>
  );
}
