import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import Modal from '../components/Modal';

interface Usuario {
  id: number;
  username: string;
  email: string;
  role: string;
  estado: boolean;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [current, setCurrent] = useState<Partial<Usuario>>({});

  const fetch = async () => {
    const res = await api.get<Usuario[]>('/usuarios');
    setUsuarios(res.data);
  };

  useEffect(() => { fetch(); }, []);

  const openModal = (u?: Usuario) => {
    setCurrent(u || {});
    setShowModal(true);
  };

  const save = async (data: Partial<Usuario>) => {
    if (data.id) {
      await api.put(`/usuarios/${data.id}`, data);
    } else {
      await api.post('/usuarios', data);
    }
    fetch();
    setShowModal(false);
  };

  const remove = async (id: number) => {
    if (confirm('¿Eliminar usuario?')) {
      await api.delete(`/usuarios/${id}`);
      fetch();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Usuarios</h1>
        <button onClick={() => openModal()} className="flex items-center bg-green-500 text-white p-2 rounded">
          <FiPlus className="mr-1" /> Nuevo
        </button>
      </div>
      <table className="min-w-full bg-white shadow rounded overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">ID</th>
            <th className="p-2">Username</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Estado</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.id}</td>
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.estado ? 'Activo' : 'Inactivo'}</td>
              <td className="p-2 space-x-2">
                <button onClick={() => openModal(u)} className="p-1 hover:bg-gray-200 rounded">
                  <FiEdit />
                </button>
                <button onClick={() => remove(u.id)} className="p-1 hover:bg-gray-200 rounded">
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && <Modal item={current} onClose={() => setShowModal(false)} onSave={save} />}
    </> )}