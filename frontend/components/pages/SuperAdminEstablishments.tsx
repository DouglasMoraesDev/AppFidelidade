// frontend/components/pages/SuperAdminEstablishments.tsx
import React, { useState, useMemo } from 'react';
import { Establishment, Payment } from '../../types';
import { TrashIcon, PencilIcon, ClipboardListIcon, DocumentTextIcon, PlusIcon } from '../icons/Icons';

interface SuperAdminEstablishmentsProps {
  establishments: Establishment[];
  onUpdate: (establishment: Establishment) => void;
  onDelete: (establishmentId: number) => void;
}

const SuperAdminEstablishments: React.FC<SuperAdminEstablishmentsProps> = ({ establishments, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);
  const [modalError, setModalError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [newPaymentDate, setNewPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredEstablishments = useMemo(() =>
    establishments.filter(est =>
      est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (est.email && est.email.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [establishments, searchTerm]);

  // Função local para obter o último pagamento (evita dependências externas)
  const getLatestPayment = (paymentHistory: Payment[] | undefined): Payment | null => {
    if (!paymentHistory || paymentHistory.length === 0) return null;
    const sorted = [...paymentHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0] ?? null;
  };

  const isSubscriptionActive = (paymentHistory: Payment[] | undefined) => {
    const lastPayment = getLatestPayment(paymentHistory || []);
    if (!lastPayment) return false;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - new Date(lastPayment.date).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 31;
  };

  const openEditModal = (establishment: Establishment) => {
    setEditingEstablishment(establishment);
    setActiveTab('details');
    setModalError('');
  };

  const handleSave = () => {
    if (editingEstablishment) {
      if (!editingEstablishment.name || !editingEstablishment.username) {
        setModalError('Nome e Usuário são obrigatórios.');
        return;
      }
      if (editingEstablishment.pointsForVoucher <= 0) {
        setModalError('Pontos para voucher deve ser maior que zero.');
        return;
      }
      onUpdate(editingEstablishment);
      setEditingEstablishment(null);
      setModalError('');
    }
  };

  const handleCancel = () => {
    setEditingEstablishment(null);
    setModalError('');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingEstablishment) {
      setEditingEstablishment({ ...editingEstablishment, [e.target.name]: e.target.value });
    }
  };

  const handleAddPayment = () => {
    if (editingEstablishment) {
      const newPayment: Payment = {
        id: Date.now().toString(),
        date: new Date(newPaymentDate).toISOString(),
      };
      const updatedHistory = [...editingEstablishment.paymentHistory, newPayment];
      setEditingEstablishment({ ...editingEstablishment, paymentHistory: updatedHistory });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Gerenciar Estabelecimentos</h1>
        <p className="text-on-surface-secondary">Edite e gerencie as contas dos seus clientes.</p>
      </div>

      <div className="bg-surface p-4 rounded-lg shadow-lg">
        <input
          type="text"
          placeholder="Pesquisar por nome ou e-mail..."
          className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none"
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
              <th className="p-4 font-semibold">E-mail</th>
              <th className="p-4 font-semibold text-center">Clientes</th>
              <th className="p-4 font-semibold text-center">Status</th>
              <th className="p-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredEstablishments.map(est => (
              <tr key={est.id} className="border-t border-background hover:bg-background/30">
                <td className="p-4">{est.name}</td>
                <td className="p-4 text-on-surface-secondary">{est.email}</td>
                <td className="p-4 text-center font-mono">{est.clients.length}</td>
                <td className="p-4 text-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isSubscriptionActive(est.paymentHistory) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {isSubscriptionActive(est.paymentHistory) ? 'Ativa' : 'Expirada'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => openEditModal(est)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors"><PencilIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDelete(est.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredEstablishments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-on-surface-secondary">Nenhum estabelecimento encontrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredEstablishments.map(est => (
          <div key={est.id} className="bg-surface p-4 rounded-lg shadow-lg space-y-3">
            <div className="flex justify-between items-start gap-4">
              <div>
                <p className="font-bold text-on-surface">{est.name}</p>
                <p className="text-sm text-on-surface-secondary">{est.email}</p>
              </div>
              <span className={`flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full ${isSubscriptionActive(est.paymentHistory) ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {isSubscriptionActive(est.paymentHistory) ? 'Ativa' : 'Expirada'}
              </span>
            </div>
            <div className="text-sm text-on-surface-secondary">
              Clientes: <span className="font-semibold text-on-surface">{est.clients.length}</span>
            </div>
            <div className="mt-4 pt-3 border-t border-background flex justify-end gap-2">
              <button onClick={() => openEditModal(est)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors"><PencilIcon className="w-5 h-5"/></button>
              <button onClick={() => onDelete(est.id)} className="p-2 text-red-400 hover:text-red-300 transition-colors"><TrashIcon className="w-5 h-5"/></button>
            </div>
          </div>
        ))}
        {filteredEstablishments.length === 0 && <p className="text-center py-8 text-on-surface-secondary">Nenhum estabelecimento encontrado.</p>}
      </div>

      {/* Edit Modal */}
      {editingEstablishment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-6 rounded-lg shadow-2xl w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-4">Editar Estabelecimento</h2>

            {/* TABS */}
            <div className="border-b border-background flex mb-4">
              <button onClick={() => setActiveTab('details')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'details' ? 'border-b-2 border-secondary text-on-surface' : 'text-on-surface-secondary hover:text-on-surface'}`}>
                <DocumentTextIcon className="w-5 h-5 inline-block mr-2" />
                Detalhes
              </button>
              <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-b-2 border-secondary text-on-surface' : 'text-on-surface-secondary hover:text-on-surface'}`}>
                <ClipboardListIcon className="w-5 h-5 inline-block mr-2" />
                Histórico de Pagamentos
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2">
              {activeTab === 'details' && (
                <div className="space-y-4 animate-fade-in">
                  <input name="name" value={editingEstablishment.name} onChange={handleEditChange} className="w-full bg-background p-2 rounded-md" placeholder="Nome do Estabelecimento *"/>
                  <input name="email" value={editingEstablishment.email} onChange={handleEditChange} className="w-full bg-background p-2 rounded-md" placeholder="E-mail"/>
                  <textarea name="voucherMessage" value={editingEstablishment.voucherMessage} onChange={handleEditChange} className="w-full bg-background p-2 rounded-md" placeholder="Mensagem do Voucher" rows={2}/>
                  <input name="username" value={editingEstablishment.username} onChange={handleEditChange} className="w-full bg-background p-2 rounded-md" placeholder="Usuário de Acesso *"/>
                  <div>
                    <label className="text-xs text-on-surface-secondary">Pontos p/ Voucher *</label>
                    <input type="number" name="pointsForVoucher" value={editingEstablishment.pointsForVoucher} onChange={e => setEditingEstablishment({...editingEstablishment, pointsForVoucher: parseInt(e.target.value) || 0})} className="w-full bg-background p-2 rounded-md" />
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="animate-fade-in">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-on-surface mb-2">Adicionar Pagamento Manual</h3>
                    <div className="flex items-center gap-2 p-2 bg-background/50 rounded-md">
                      <input type="date" value={newPaymentDate} onChange={e => setNewPaymentDate(e.target.value)} className="w-full bg-background p-2 rounded-md" />
                      <button onClick={handleAddPayment} className="p-2 bg-secondary rounded-md text-white hover:bg-cyan-700">
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-background pt-4">
                    <h3 className="font-semibold text-on-surface mb-2">Histórico</h3>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {editingEstablishment.paymentHistory.length > 0 ? (
                        [...editingEstablishment.paymentHistory]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(p => (
                            <li key={p.id} className="text-sm bg-background/50 p-2 rounded-md flex justify-between">
                              <span>Pagamento registrado em:</span>
                              <span className="font-semibold">{new Date(p.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            </li>
                          ))
                      ) : (
                        <li className="text-sm text-on-surface-secondary text-center p-4">Nenhum pagamento registrado.</li>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {modalError && <p className="text-red-400 text-sm text-center pt-4">{modalError}</p>}
            <div className="flex justify-end gap-4 pt-6 border-t border-background mt-4">
              <button onClick={handleCancel} className="px-4 py-2 rounded-md bg-slate-500 hover:bg-slate-600 transition-colors">Cancelar</button>
              <button onClick={handleSave} className="px-4 py-2 rounded-md bg-secondary hover:bg-cyan-700 transition-colors text-white">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminEstablishments;
