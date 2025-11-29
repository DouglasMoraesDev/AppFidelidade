import React, { useState, useMemo } from 'react';
import { Client } from '../../types';
import { TrashIcon, PencilIcon } from '../icons/Icons';
import SuccessModal from '../SuccessModal';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

interface ClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => Promise<void>;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState<'all' | 'name' | 'phone' | 'points'>('all');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modalError, setModalError] = useState('');
  const [showEditSuccess, setShowEditSuccess] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [editedClientName, setEditedClientName] = useState('');

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;
    
    const term = searchTerm.toLowerCase().trim();
    
    return clients.filter(client => {
      if (searchBy === 'name') {
        return client.name.toLowerCase().includes(term);
      } else if (searchBy === 'phone') {
        return client.phone.replace(/\D/g, '').includes(term.replace(/\D/g, ''));
      } else if (searchBy === 'points') {
        const points = parseInt(term);
        if (isNaN(points)) return false;
        return client.points === points || client.points >= points;
      } else {
        // Busca em todos os campos
        return (
          client.name.toLowerCase().includes(term) ||
          client.phone.replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
          client.points.toString().includes(term)
        );
      }
    });
  }, [clients, searchTerm, searchBy]);

  const handleSave = () => {
    if (editingClient) {
       if (!editingClient.name.trim() || !editingClient.phone.trim()) {
        setModalError('Nome e telefone não podem ficar vazios.');
        return;
      }
      setEditedClientName(editingClient.name);
      onEdit(editingClient);
      setEditingClient(null);
      setModalError('');
      setShowEditSuccess(true);
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
      <div className="bg-surface p-4 rounded-lg shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Pesquisar cliente..."
              className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={searchBy}
            onChange={e => setSearchBy(e.target.value as 'all' | 'name' | 'phone' | 'points')}
            className="bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="all">Todos os campos</option>
            <option value="name">Nome</option>
            <option value="phone">Telefone</option>
            <option value="points">Pontos (≥)</option>
          </select>
        </div>
        {searchTerm && (
          <p className="text-sm text-on-surface-secondary">
            {filteredClients.length} {filteredClients.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          </p>
        )}
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
                    <button onClick={() => setClientToDelete({ id: client.id, name: client.name })} className="p-2 text-red-400 hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5"/></button>
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
                    <button onClick={() => setClientToDelete({ id: client.id, name: client.name })} className="p-2 text-red-400 hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5"/></button>
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

      {clientToDelete && (
        <DeleteConfirmationModal
          itemName={clientToDelete.name}
          onConfirm={async () => {
            try {
              await onDelete(clientToDelete.id);
              setShowDeleteSuccess(true);
              setClientToDelete(null);
            } catch (err) {
              // Erro já tratado no App.tsx
              setClientToDelete(null);
            }
          }}
          onCancel={() => setClientToDelete(null)}
        />
      )}

      {showEditSuccess && (
        <SuccessModal
          title="Cliente Editado!"
          message={`O cliente ${editedClientName} foi editado com sucesso.`}
          onClose={() => setShowEditSuccess(false)}
        />
      )}

      {showDeleteSuccess && (
        <SuccessModal
          title="Cliente Excluído!"
          message="O cliente foi excluído com sucesso."
          onClose={() => setShowDeleteSuccess(false)}
        />
      )}
    </div>
  );
};

export default ClientList;