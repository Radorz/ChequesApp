import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import { validateCedula } from '../utils/validation';  // <-- importa la función aquí
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Proveedor {
  identificador?: number;
  nombre: string;
  tipoPersona: 'Física' | 'Jurídica';
  cedulaRnc: string;
  balance: number;
  cuentaContable: string;
  estado: boolean ;
}

interface ProveedorModalProps {
  item: Partial<Proveedor> | undefined;
  show: boolean;
  onClose: () => void;
  onSave: (prov: Proveedor) => void;
}

export default function ProveedorModal({ item, show, onClose, onSave }: ProveedorModalProps) {
  const [form, setForm] = useState<Partial<Proveedor>>({
  ...item,
  estado: item?.estado ?? true,  // Por defecto activo
  tipoPersona: item?.tipoPersona ?? 'Física'  
})

  // Sincronizar cuando cambie `item`
  useEffect(() => setForm({
    ...item,
    estado: item?.estado ?? true,
    tipoPersona: item?.tipoPersona ?? 'Física'
}), [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (target as HTMLInputElement).checked : (type === 'number' ? parseFloat(value) : value)
    }));

  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validación de cédula/RNC
    if (!validateCedula(form.cedulaRnc || '')) {
      toast.error('Cédula/RNC inválida. Debe tener 11 dígitos.');
      return;
    }

   if (!form.balance || form.balance <= 0) {
      toast.error('El balance debe ser mayor que 0.');
      return;
    }
    // Cast seguro: todos los campos obligatorios
    onSave(form as Proveedor);
  };

  return (
    <Transition.Root show={show} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">

            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-semibold">
                {form.identificador ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </Dialog.Title>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="nombre" name="nombre" type="text"
                  value={form.nombre || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="tipoPersona" className="block text-sm font-medium text-gray-700">Tipo de Persona</label>
                <select
                  id="tipoPersona" name="tipoPersona"
                  value={form.tipoPersona || 'Física'}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="Física">Física</option>
                  <option value="Jurídica">Jurídica</option>
                </select>
              </div>

              <div>
                <label htmlFor="cedulaRnc" className="block text-sm font-medium text-gray-700">Cédula / RNC</label>
                <input
                  id="cedulaRnc" name="cedulaRnc" type="text"
                  value={form.cedulaRnc || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="balance" className="block text-sm font-medium text-gray-700">Balance</label>
                <input
                  id="balance" name="balance" type="number" step="0.01"
                  value={form.balance != null ? form.balance : ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="cuentaContable" className="block text-sm font-medium text-gray-700">Cuenta Contable</label>
                <input
                  id="cuentaContable" name="cuentaContable" type="text"
                  value={form.cuentaContable || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded transition duration-150 ease-in-out hover:bg-gray-300 active:bg-gray-400 cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded transition duration-150 ease-in-out hover:bg-indigo-500 active:bg-indigo-700 cursor-pointer">Guardar</button>
              </div>
            </form>

          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition.Root>)}