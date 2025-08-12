import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosConfig';
import { money } from '../utils/money';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';
import { FiUsers, FiBookOpen, FiList, FiCheckSquare, FiEye, FiBook } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

type Overview = {
  proveedoresActivos: number;
  proveedoresInactivos: number;
  balanceTotalProveedores: number;
  solicitudesPendientes: number;
  montoPendiente: number;
  chequesGeneradosMes: number;
  montoChequesMes: number;
  conceptos: number;
};

type Trend = { anio:number; mes:number; monto:number; cantidad:number; };
type TopProv = { proveedorId:number; nombre:string; montoTotal:number; cheques:number; };

export default function Inicio() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [trend, setTrend] = useState<Trend[]>([]);
  const [top, setTop] = useState<TopProv[]>([]);

  const load = async () => {
    const [{ data: o }, { data: t }, { data: tp }] = await Promise.all([
      api.get<Overview>('/dashboard/overview'),
      api.get<Trend[]>('/dashboard/cheques-trend', { params: { months: 6 } }),
      api.get<TopProv[]>('/dashboard/top-proveedores', { params: { months: 6, take: 5 } })
    ]);
    setOv(o); setTrend(t); setTop(tp);
  };
  useEffect(() => { load().catch(()=>{}); }, []);

  const labels = useMemo(() =>
    trend.map(x => new Date(x.anio, x.mes - 1, 1).toLocaleDateString('es-DO', { month:'short', year:'2-digit' })),
    [trend]
  );

  const lineData = useMemo(() => ({
    labels,
    datasets: [{
      label: 'Monto generado',
      data: trend.map(x => x.monto),
      borderWidth: 2,
      tension: 0.2
    }]
  }), [labels, trend]);

  const barData = useMemo(() => ({
    labels: top.map(t => t.nombre),
    datasets: [{
      label: 'Monto',
      data: top.map(t => t.montoTotal),
      borderWidth: 1
    }]
  }), [top]);

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* KPIs */}
      {ov && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Kpi title="Proveedores activos" value={ov.proveedoresActivos} sub={`${ov.proveedoresInactivos} inactivos`} icon={<FiUsers/>} />
          <Kpi title="Balance total" value={money(ov.balanceTotalProveedores)} sub="Proveedores" />
          <Kpi title="Pendientes" value={ov.solicitudesPendientes} sub={money(ov.montoPendiente)} icon={<FiList/>} />
          <Kpi title="Cheques del mes" value={ov.chequesGeneradosMes} sub={money(ov.montoChequesMes)} icon={<FiCheckSquare/>} />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <div className="font-semibold mb-2">Evolución cheques generados</div>
          <Line data={lineData} options={{ plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true } } }} />
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold mb-2">Top proveedores (6 meses)</div>
          <Bar data={barData} options={{ plugins:{ legend:{ display:false }}, indexAxis:'y', scales:{ x:{ beginAtZero:true } } }} />
        </div>
      </div>

      {/* Accesos al flujo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink to="/proveedores" title="Proveedores" desc="Altas, edición y estado" icon={<FiUsers/>} />
        <QuickLink to="/conceptos" title="Conceptos de pago" desc="Catálogo de conceptos" icon={<FiBookOpen/>} />
        <QuickLink to="/cheques/solicitudes" title="Solicitudes" desc="Crear y gestionar solicitudes" icon={<FiList/>} />
        <QuickLink to="/cheques/generar" title="Generar cheques" desc="Selecciona pendientes y emite" icon={<FiCheckSquare/>} />
        <QuickLink to="/cheques/emitidos" title="Cheques emitidos" desc="Consulta y imprime" icon={<FiEye/>} />
        <QuickLink to="/cheques/asientos" title="Asientos contables" desc="Agrupación por mes y Deb/Cre" icon={<FiBook/>} />
      </div>
    </div>
  );
}

function Kpi({ title, value, sub, icon }:{ title:string; value:React.ReactNode; sub?:string; icon?:React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
      <div className="p-2 rounded bg-indigo-50 text-indigo-700">{icon}</div>
      <div>
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-xl font-semibold leading-tight">{value}</div>
        {sub && <div className="text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

function QuickLink({ to, title, desc, icon }:{ to:string; title:string; desc:string; icon:React.ReactNode }) {
  return (
    <Link to={to} className="bg-white rounded-xl shadow p-4 hover:shadow-md transition flex gap-3">
      <div className="p-2 rounded bg-slate-50 text-slate-700">{icon}</div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
    </Link>
  );
}
