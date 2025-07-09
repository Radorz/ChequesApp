// src/components/ConceptoPagoModal.tsx
import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';


export interface ConceptoPago {
  identificador: number;        // idem
  descripcion: string;           // texto descriptivo
  estado: boolean;               // activo/inactivo
}

interface ConceptoPagoModalProps {
  show: boolean;
  item?: ConceptoPago;
  onSave: (data: ConceptoPago) => void;
  onClose: () => void;
}

export default function ConceptoPagoModal({
  show,
  item,
  onSave,
  onClose,
}: ConceptoPagoModalProps) {
  const [form, setForm] = useState<Partial<ConceptoPago>>({
    descripcion: '',
    estado: true,
  });

  useEffect(() => {
    if (item) {
      setForm(item);
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm((prev: any) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'monto'
          ? parseFloat(value)
          : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!form.descripcion || form.descripcion.trim() === '') {
      toast.error('La descripción es obligatoria.');
      return;
    }
    // Construir objeto final (incluye identificador si existe)
    const payload: ConceptoPago = {
      identificador: item && item.identificador !== undefined ? item.identificador : 0,
      descripcion: form.descripcion!.trim(),
      estado: form.estado!,
    };

    onSave(payload);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-xl font-semibold mb-4">
          {item ? 'Editar Concepto' : 'Nuevo Concepto'}
        </h2>

        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Descripción
          </label>
          <input
            type="text"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-indigo-300"
            placeholder="Ingrese descripción"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded hover:bg-gray-300 active:bg-gray-400 transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 active:bg-indigo-700 transition cursor-pointer"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
}
