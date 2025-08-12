// src/components/AsientoDetalleModal.tsx
import  { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { money } from '../utils/money';
import { toast } from 'react-toastify';
import ChequeCard from './ChequeCard';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import type { AsientoDetalle } from '../models/Asientos';

export default function AsientoDetalleModal({
  args, onClose
}: { args: { anio:number; mes:number; debId:number; creId:number }; onClose: () => void; }) {
  const [data, setData] = useState<AsientoDetalle | null>(null);
  const [open, setOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<AsientoDetalle>('/asientos/detalle', { params: args });
        setData(data);
      } catch (e:any) {
        toast.error(e.message ?? 'Error cargando detalle');
        onClose();
      }
    })();
  }, [args, onClose]);

  if (!data) return null;

  const periodo = new Date(data.anio, data.mes-1, 1).toLocaleDateString('es-DO', { year:'numeric', month:'long' });

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
      <div className="bg-white w-[900px] max-w-[95vw] rounded-xl shadow-lg p-6 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Asiento contable</h3>
          <button onClick={onClose} className="px-3 py-1.5 rounded hover:bg-gray-200 active:bg-gray-300 transition">Cerrar</button>
        </div>

        {/* Resumen en forma de formulario */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div><div className="text-xs text-slate-500">Periodo</div><div className="font-medium">{periodo}</div></div>
          <div><div className="text-xs text-slate-500">Deb#</div><div>{data.debId}</div></div>
          <div><div className="text-xs text-slate-500">Cre#</div><div>{data.creId}</div></div>
          <div><div className="text-xs text-slate-500">Monto total</div><div className="font-semibold">{money(data.montoTotal)}</div></div>
          <div><div className="text-xs text-slate-500"># Cheques</div><div>{data.cantidadCheques}</div></div>
          <div><div className="text-xs text-slate-500"># Proveedores</div><div>{data.proveedoresUnicos}</div></div>
        </div>

        {/* Lista de cheques con ChequeCard por item (expandible) */}
        <div className="border rounded-lg">
          {data.cheques.map(ch => {
            const isOpen = !!open[ch.numeroSolicitud];
            return (
              <div key={ch.numeroSolicitud} className="border-b last:border-none">
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                  onClick={() => setOpen(o => ({ ...o, [ch.numeroSolicitud]: !isOpen }))}
                >
                  <div className="flex items-center gap-3">
                    {isOpen ? <FiChevronDown/> : <FiChevronRight/>}
                    <div className="font-medium">Cheque #{ch.numeroCheque}</div>
                    <div className="text-sm text-slate-500">Proveedor: {ch.proveedorNombre}</div>
                  </div>
                  <div className="text-sm font-semibold">{money(ch.monto)}</div>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">

                    <ChequeCard
                              banco="BANCO EJEMPLO, S.A."
                              ciudad="SANTO DOMINGO, R.D."
                              fecha={ch.fechaRegistro}
                              numeroCheque={ch.numeroCheque ?? '—'}
                              beneficiario={ch.proveedorNombre ?? '—'}
                              monto={ch.monto}
                              memo={ch.conceptoPago ?? `Pago solicitud #${ch.numeroSolicitud}`}
                              cuentaCorriente="123-456789-0"
                            />
                  </div>
                )}
              </div>
            );
          })}
          {data.cheques.length === 0 && (
            <div className="px-4 py-8 text-center text-slate-400">No hay cheques en este asiento.</div>
          )}
        </div>
      </div>
    </div>
  );
}
