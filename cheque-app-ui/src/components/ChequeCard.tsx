import { numeroALetras } from '../utils/numeroALetras';
import { money } from '../utils/money';

type Props = {
  banco?: string;
  ciudad?: string;
  fecha: string;                 // ISO o "YYYY-MM-DD"
  numeroCheque: string;          // No. cheque
  beneficiario: string;          // Proveedor
  monto: number;
  memo?: string;
  cuentaCorriente?: string;      // Para MICR simulado
};

export default function ChequeCard({
  banco = 'BANCO EJEMPLO, S.A.',
  ciudad = 'SANTO DOMINGO, R.D.',
  fecha,
  numeroCheque,
  beneficiario,
  monto,
  memo = 'Pago de proveedor',
  cuentaCorriente = '000-000000-0',
}: Props) {
  const fechaObj = new Date(fecha);
  const fechaStr = fechaObj.toLocaleDateString('es-DO', { year:'numeric', month:'long', day:'2-digit' }).toUpperCase();
  const letras = numeroALetras(monto, 'PESOS DOMINICANOS');

  return (
    <div className="relative w-[1050px] max-w-full aspect-[3/1] bg-white border rounded-xl shadow print:shadow-none overflow-hidden">
      {/* Marca de agua leve */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] [background:repeating-linear-gradient(45deg,#000_0_2px,transparent_2px_10px)]" />

      {/* Contenido */}
      <div className="relative h-full p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xl font-semibold">{banco}</div>
            <div className="text-xs text-gray-500">{ciudad}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">CHEQUE N°</div>
            <div className="text-lg font-semibold tracking-wider">{numeroCheque}</div>
            <div className="text-xs text-gray-500 mt-2">FECHA</div>
            <div className="text-sm">{fechaStr}</div>
          </div>
        </div>

        {/* Pay to the order */}
        <div className="mt-6">
          <div className="text-xs text-gray-600">PÁGUESE A LA ORDEN DE</div>
          <div className="border-b border-gray-400 mt-1 pb-1 font-medium tracking-wide">
            {beneficiario}
          </div>
        </div>

        {/* Amount box */}
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="text-xs text-gray-600">LA SUMA DE</div>
            <div className="border-b border-gray-400 mt-1 pb-1 text-sm">
              {/* Rellena con asteriscos para “blindar” */}
              {letras} {Array(120 - letras.length).fill('*').join('')}
            </div>
          </div>
          <div className="w-64 border border-gray-400 rounded p-2 text-right text-xl font-semibold">
            {money(monto)}
          </div>
        </div>

        {/* Memo + firmas */}
        <div className="mt-auto grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <div className="text-xs text-gray-600">CONCEPTO / MEMO</div>
            <div className="border-b border-gray-400 mt-1 pb-1">{memo}</div>
          </div>
          <div className="col-span-1">
                        <div className="border-b border-gray-400 mt-5 pb-1">Chayanne</div>
            <div className="text-xs text-gray-600 mt-1">FIRMA AUTORIZADA</div>
          </div>
          <div className="col-span-1">
            <div className="border-b border-gray-400 mt-5 pb-1">Chayanne</div>
            <div className="text-xs text-gray-600 mt-1">FIRMA AUTORIZADA</div>
          </div>
        </div>

        {/* MICR simulado */}
        <div className="mt-4 text-center font-mono tracking-widest text-lg">
          {/* Puedes cargar una fuente MICR si quieres, aquí lo simulamos */}
          {`C${cuentaCorriente.replace(/[^0-9]/g,'')}C  A${numeroCheque}A`}
        </div>
      </div>
    </div>
  );
}
