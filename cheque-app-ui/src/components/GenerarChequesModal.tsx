import { useState } from 'react';

interface Props {
  show: boolean;
  cantidad: number;
  onCancel: () => void;
  // startNumber (autosecuencia) o manual mapping {id: numeroCheque}  — aquí usamos sólo startNumber
  onConfirm: (startNumber: string | null, manual?: Record<number, string>) => void;
}

export default function GenerarChequesModal({ show, cantidad, onCancel, onConfirm }: Props) {
  const [start, setStart] = useState('');

  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Generar cheques</h3>
        <p className="text-sm text-gray-600 mb-4">
          Seleccionadas: <strong>{cantidad}</strong>
        </p>

        <label className="block text-sm mb-1">Número inicial</label>
        <input
          type="text"
          value={start}
          onChange={e => setStart(e.target.value)}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          placeholder="Ej. 1001"
        />

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded hover:bg-gray-300 active:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(start || null)}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 active:bg-indigo-700 transition"
          >
            Generar
          </button>
        </div>
      </div>
    </div>
  );
}
