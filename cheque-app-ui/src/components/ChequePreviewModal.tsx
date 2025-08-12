import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';
import ChequeCard from './ChequeCard';
import type { SolicitudCheque } from '../models/SolicitudCheque';

type Props = { id: number; onClose: () => void; };

export default function ChequePreviewModal({ id, onClose }: Props) {
  const [data, setData] = useState<SolicitudCheque | null>(null);

  const fetchData = async () => {
    try {
      const { data } = await api.get<SolicitudCheque>(`/solicitudes/${id}`);
      if (data.estado !== 'Generado') {
        toast.warn('Esta solicitud no tiene cheque generado.');
      }
      setData(data);
    } catch {
      toast.error('No se pudo cargar el cheque');
    }
  };

  useEffect(() => { fetchData(); }, [id, onClose]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center ">
      <div className="bg-white  rounded-lg shadow-lg p-8 print:w-full print:h-full  print:p-0">
        <div className="flex justify-between items-start mb-4 print:hidden">
          <h3 className="text-lg font-semibold">Cheque #{data.numeroCheque}</h3>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition"
            >
              Imprimir
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded hover:bg-gray-200 active:bg-gray-300 transition"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Diseño simple del cheque */}
      <div className="flex items-center justify-center ">
        <ChequeCard
          banco="BANCO EJEMPLO, S.A."
          ciudad="SANTO DOMINGO, R.D."
          fecha={data.fechaRegistro}
          numeroCheque={data.numeroCheque ?? '—'}
          beneficiario={data.proveedor?.nombre ?? '—'}
          monto={data.monto}
          memo={data.conceptoPago?.descripcion ??`Pago solicitud #${data.numeroSolicitud}`}
          cuentaCorriente="123-456789-0"
        />
      </div>

        <div className="mt-6 text-xs text-slate-400">
          * Representación para impresión. Los datos originales residen en el sistema.
        </div>
      </div>
    </div>
  );
}
