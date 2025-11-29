import React, { useState, useMemo } from 'react';
import { Client } from '../../types';
import { TrashIcon, PencilIcon } from '../icons/Icons';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalError, setModalError] = useState('');

  const filteredClients = useMemo(() =>
    clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [clients, searchTerm]);

  const handleSave = () => {
    if (editingClient) {
       if (!editingClient.name.trim() || !editingClient.phone.trim()) {
        setModalError('Nome e telefone não podem ficar vazios.');
        return;
      }
      onEdit(editingClient);
      setEditingClient(null);
      setModalError('');
    }
  };
  
  const handleCancel = () => {
      setEditingClient(null);
      setModalError('');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingClient) {
      setEditingClient({ ...editingClient, [e.target.name]: e.target.value });
    }
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Lista de Clientes</h1>
        <p className="text-on-surface-secondary">Gerencie seus clientes cadastrados.</p>
      </div>
      <div className="bg-surface p-4 rounded-lg shadow-lg">
        <input
          type="text"
          placeholder="Pesquisar cliente por nome..."
          className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-surface rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-background/50">
            <tr>
              <th className="p-4 font-semibold">Nome</th>
              <th className="p-4 font-semibold">Telefone</th>
              <th className="p-4 font-semibold text-center">Pontos</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map(client => (
              <tr key={client.id} className="border-t border-background hover:bg-background/30">
                <td className="p-4">{client.name}</td>
                <td className="p-4 text-on-surface-secondary">{client.phone}</td>
                <td className="p-4 text-center font-mono">{client.points}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingClient(client)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(client.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
             {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-8 text-on-surface-secondary">Nenhum cliente encontrado.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredClients.map(client => (
            <div key={client.id} className="bg-surface p-4 rounded-lg shadow-lg">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <p className="font-bold text-on-surface">{client.name}</p>
                        <p className="text-sm text-on-surface-secondary">{client.phone}</p>
                    </div>
                    <div className="flex-shrink-0 text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {client.points} pts
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-background flex justify-end gap-2">
                    <button onClick={() => setEditingClient(client)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(client.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                </div>
            </div>
        ))}
        {filteredClients.length === 0 && <p className="text-center py-8 text-on-surface-secondary">Nenhum cliente encontrado.</p>}
      </div>

      {/* Edit Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-8 rounded-lg shadow-2xl w-full max-w-md space-y-4">
            <h2 className="text-2xl font-bold">Editar Cliente</h2>
            <input name="name" value={editingClient.name} onChange={handleEditChange} className="w-full bg-background p-2 rounded-md" placeholder="Nome do Cliente" />
            <input name="phone" value={editingClient.phone} onChange={handleEditChange} className="w-full bg-background p-2 rounded-md" placeholder="Telefone do Cliente"/>
            <input type="number" name="points" value={editingClient.points} onChange={e => setEditingClient({...editingClient, points: Math.max(0, parseInt(e.target.value) || 0)})} className="w-full bg-background p-2 rounded-md" placeholder="Pontos" />
            {modalError && <p className="text-red-400 text-sm text-center">{modalError}</p>}
            <div className="flex justify-end gap-4 pt-4">
              <button onClick={handleCancel} className="px-4 py-2 rounded-md bg-slate-500 hover:bg-slate-600 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-md bg-primary hover:bg-primary-focus transition-colors text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;