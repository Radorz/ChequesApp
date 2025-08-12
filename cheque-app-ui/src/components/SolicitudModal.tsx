import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'react-toastify';
import type { SolicitudCheque } from '../models/SolicitudCheque';

interface Props {
  show: boolean;
  item?: SolicitudCheque;
  proveedores: { identificador: number; nombre: string, cuentaContable:string }[];
  onSave: (data: SolicitudCheque) => void;
  onClose: () => void;
}


export default function SolicitudModal({
  show, item, proveedores, onSave, onClose
}: Props) {

const toDateInput = (v?: string | Date) => {
  if (!v) return '';
  if (typeof v === 'string') return v.split('T')[0]; // "2025-01-20T..." -> "2025-01-20"
  // Date -> YYYY-MM-DD en local, sin desfase de zona
  const d = new Date(v.getTime() - v.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 10);
};

const [form, setForm] = useState<Partial<SolicitudCheque>>({
  proveedorId: proveedores[0]?.identificador || 0,
  monto: 0,
  fechaRegistro: toDateInput(new Date()), // <-- hoy en YYYY-MM-DD
  estado: 'Pendiente',
  cuentaContableProveedor: '',
  cuentaContableBanco: '',
});

  // Si estamos editando
useEffect(() => {
  if (item) {
    setForm({
      ...item,
      fechaRegistro: toDateInput(item.fechaRegistro), // <-- clave
    });
  }
}, [item]);

  useEffect(() => {
 const prov = proveedores.find(
   p => p.identificador === Number(form.proveedorId)
 );
  if (prov) {
    setForm(f => ({
      ...f,
      cuentaContableProveedor: prov.cuentaContable,
    }));
  }
  }, [form.proveedorId, proveedores]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev,
      [name]:
        name === 'monto'
          ? parseFloat(value)
        : value
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // validaciones mínimas
    if (!form.proveedorId) {
      toast.error('Selecciona un proveedor');
      return;
    }
    if (!form.monto || form.monto <= 0) {
      toast.error('El monto debe ser > 0');
      return;
    }
    onSave(form as SolicitudCheque);
  };

  if (!show) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-96"
      >
        <h2 className="text-xl font-semibold mb-4">
          {item ? 'Editar Solicitud' : 'Nueva Solicitud'}
        </h2>

        {/* Proveedor */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Proveedor</label>
          <select
            name="proveedorId"
            value={form.proveedorId}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          >
            {proveedores.map(p => (
              <option key={p.identificador} value={p.identificador}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Monto */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Monto</label>
          <input
            type="number"
            name="monto"
            value={form.monto}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            min="0" step="0.01"
          />
        </div>

        {/* Fecha Registro */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Fecha Registro</label>
          <input
            type="date"
            name="fechaRegistro"
            value={form.fechaRegistro}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Estado */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Estado</label>
          <select
            name="estado"
            value={form.estado}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Anulada">Anulada</option>
          </select>
        </div>

        {/* Cuentas contables */}
        <div className="mb-3">
          <label className="block text-sm mb-1">Cuenta  Proveedor</label>
          <input
            type="text"
            name="cuentaContableProveedor"
            value={form.cuentaContableProveedor}
            readOnly
            className="w-full bg-gray-100 border rounded px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-1">Cuenta Banco</label>
          <input
            type="text"
            name="cuentaContableBanco"
            value={form.cuentaContableBanco}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
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
