import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import ChequeCard from '../components/ChequeCard';
import { toast } from 'react-toastify';
import type { SolicitudCheque } from '../models/SolicitudCheque';

export default function ChequeDetalle() {
  const { id } = useParams();
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

  useEffect(() => { fetchData(); }, [id]);

  if (!data) return null;
  return (
    <div className="p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <div className="text-xl font-semibold">Detalle del Cheque</div>
        <div className="flex gap-2">
          <Link to="/cheques/solicitudes" className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Volver
          </Link>
          <button onClick={() => window.print()} className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500">
            Imprimir
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <ChequeCard
          banco="BANCO EJEMPLO, S.A."
          ciudad="SANTO DOMINGO, R.D."
          fecha={data.fechaRegistro}
          numeroCheque={data.numeroCheque ?? '—'}
          beneficiario={data.proveedor?.nombre ?? '—'}
          monto={data.monto}
          memo={`Pago solicitud #${data.numeroSolicitud}`}
          cuentaCorriente="123-456789-0"
        />
      </div>
    </div>
  );
}
