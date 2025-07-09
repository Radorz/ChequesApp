import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX } from 'react-icons/fi';

export default function Modal({ item, onClose, onSave }: any) {
  const [form, setForm] = useState(item);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  };

  return (
    <Transition.Root show as={Fragment}>
      <Dialog as="div" className="fixed inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Panel className="bg-white rounded shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-lg font-medium">{item.identificador ? 'Editar' : 'Nuevo'}</Dialog.Title>
              <button onClick={onClose}><FiX /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); onSave(form); }}>
              {/* Campos dinámicos según item */}
              <input
                name="nombre"
                value={form.nombre || ''}
                onChange={handleChange}
                className="w-full mb-4 p-2 border rounded"
                placeholder="Nombre"
              />
              <div className="mt-4 flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="px-4 py-2">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white">Guardar</button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition.Root>
    )}