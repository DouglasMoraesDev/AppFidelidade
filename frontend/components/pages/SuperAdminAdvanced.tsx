// frontend/components/pages/SuperAdminAdvanced.tsx
import React, { useState } from 'react';
import { Establishment } from '../../types';
import { 
  WrenchScrewdriverIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon,
  CalendarIcon,
  CreditCardIcon,
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ClockIcon
} from '../icons/Icons';

interface SuperAdminAdvancedProps {
  establishments: Establishment[];
  onResetPassword: (establishmentId: number, newPassword: string) => Promise<void>;
  onForcePayment: (establishmentId: number, months: number) => Promise<void>;
  onToggleActive: (establishmentId: number, active: boolean) => Promise<void>;
  onSendNotification: (establishmentId: number, message: string) => Promise<void>;
}

const SuperAdminAdvanced: React.FC<SuperAdminAdvancedProps> = ({ 
  establishments, 
  onResetPassword,
  onForcePayment,
  onToggleActive,
  onSendNotification 
}) => {
  const [selectedEstablishment, setSelectedEstablishment] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'password' | 'payment' | 'status' | 'notification'>('password');
  const [newPassword, setNewPassword] = useState('');
  const [paymentMonths, setPaymentMonths] = useState(1);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const selectedEst = establishments.find(e => e.id === selectedEstablishment);

  const handleResetPassword = async () => {
    if (!selectedEstablishment || !newPassword || newPassword.length < 4) {
      alert('Selecione um estabelecimento e insira uma senha válida (mínimo 4 caracteres)');
      return;
    }
    setProcessing(true);
    try {
      await onResetPassword(selectedEstablishment, newPassword);
      setSuccessMessage('Senha resetada com sucesso!');
      setNewPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err?.message || 'Erro ao resetar senha');
    } finally {
      setProcessing(false);
    }
  };

  const handleForcePayment = async () => {
    if (!selectedEstablishment || paymentMonths < 1) {
      alert('Selecione um estabelecimento e número de meses válido');
      return;
    }
    if (!confirm(`Confirmar extensão de ${paymentMonths} mês(es) para ${selectedEst?.name}?`)) return;
    setProcessing(true);
    try {
      await onForcePayment(selectedEstablishment, paymentMonths);
      setSuccessMessage(`Assinatura estendida por ${paymentMonths} mês(es)!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err?.message || 'Erro ao estender assinatura');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleActive = async (active: boolean) => {
    if (!selectedEstablishment) return;
    const action = active ? 'ativar' : 'desativar';
    if (!confirm(`Confirmar ${action} estabelecimento ${selectedEst?.name}?`)) return;
    setProcessing(true);
    try {
      await onToggleActive(selectedEstablishment, active);
      setSuccessMessage(`Estabelecimento ${active ? 'ativado' : 'desativado'} com sucesso!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err?.message || `Erro ao ${action} estabelecimento`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSendNotification = async () => {
    if (!selectedEstablishment || !notificationMessage.trim()) {
      alert('Selecione um estabelecimento e insira uma mensagem');
      return;
    }
    setProcessing(true);
    try {
      await onSendNotification(selectedEstablishment, notificationMessage);
      setSuccessMessage('Notificação enviada com sucesso!');
      setNotificationMessage('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err?.message || 'Erro ao enviar notificação');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-3">
          <WrenchScrewdriverIcon className="w-8 h-8 text-secondary" />
          Ferramentas Avançadas
        </h1>
        <p className="text-on-surface-secondary">Gerenciamento técnico e administrativo de estabelecimentos.</p>
      </div>

      {successMessage && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6" />
          {successMessage}
        </div>
      )}

      {/* Seletor de Estabelecimento */}
      <div className="bg-surface p-6 rounded-lg shadow-lg">
        <label className="block text-sm font-semibold text-on-surface mb-2">Selecionar Estabelecimento</label>
        <select
          value={selectedEstablishment || ''}
          onChange={(e) => setSelectedEstablishment(Number(e.target.value))}
          className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none"
        >
          <option value="">-- Escolha um estabelecimento --</option>
          {establishments.map(est => (
            <option key={est.id} value={est.id}>
              {est.name} ({est.username}) - {est.clients.length} clientes
            </option>
          ))}
        </select>

        {selectedEst && (
          <div className="mt-4 p-4 bg-background/50 rounded-md space-y-2 text-sm">
            <p><strong>Nome:</strong> {selectedEst.name}</p>
            <p><strong>Email:</strong> {selectedEst.email || 'Não informado'}</p>
            <p><strong>Usuário:</strong> {selectedEst.username}</p>
            <p><strong>Clientes:</strong> {selectedEst.clients.length}</p>
            <p><strong>Pontos para Voucher:</strong> {selectedEst.pointsForVoucher}</p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={selectedEst.paymentHistory && selectedEst.paymentHistory.length > 0 ? 'text-green-400' : 'text-red-400'}>
                {selectedEst.paymentHistory && selectedEst.paymentHistory.length > 0 ? 'Ativa' : 'Expirada'}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Tabs de Ações */}
      {selectedEstablishment && (
        <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-background">
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'password' 
                  ? 'bg-secondary text-white border-b-2 border-secondary' 
                  : 'text-on-surface-secondary hover:bg-background/30'
              }`}
            >
              <ShieldCheckIcon className="w-5 h-5 inline-block mr-2" />
              Resetar Senha
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'payment' 
                  ? 'bg-secondary text-white border-b-2 border-secondary' 
                  : 'text-on-surface-secondary hover:bg-background/30'
              }`}
            >
              <CreditCardIcon className="w-5 h-5 inline-block mr-2" />
              Estender Assinatura
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'status' 
                  ? 'bg-secondary text-white border-b-2 border-secondary' 
                  : 'text-on-surface-secondary hover:bg-background/30'
              }`}
            >
              <ClockIcon className="w-5 h-5 inline-block mr-2" />
              Ativar/Desativar
            </button>
            <button
              onClick={() => setActiveTab('notification')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'notification' 
                  ? 'bg-secondary text-white border-b-2 border-secondary' 
                  : 'text-on-surface-secondary hover:bg-background/30'
              }`}
            >
              <EnvelopeIcon className="w-5 h-5 inline-block mr-2" />
              Notificação
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'password' && (
              <div className="space-y-4">
                <p className="text-on-surface-secondary mb-4">
                  Resetar a senha de acesso do estabelecimento. O usuário poderá fazer login com a nova senha imediatamente.
                </p>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Nova Senha</label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha (mín. 4 caracteres)"
                    className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={processing || !newPassword}
                  className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {processing ? 'Processando...' : 'Resetar Senha'}
                </button>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-4">
                <p className="text-on-surface-secondary mb-4">
                  Estender a assinatura do estabelecimento sem necessidade de pagamento (útil para promoções, compensações, etc).
                </p>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Número de Meses</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={paymentMonths}
                    onChange={(e) => setPaymentMonths(Number(e.target.value))}
                    className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                  />
                  <p className="text-xs text-on-surface-secondary mt-2">
                    Adicionar {paymentMonths} mês(es) de acesso a partir de hoje.
                  </p>
                </div>
                <button
                  onClick={handleForcePayment}
                  disabled={processing}
                  className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {processing ? 'Processando...' : `Estender por ${paymentMonths} Mês(es)`}
                </button>
              </div>
            )}

            {activeTab === 'status' && (
              <div className="space-y-4">
                <p className="text-on-surface-secondary mb-4">
                  Ativar ou desativar temporariamente o acesso do estabelecimento ao sistema.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleToggleActive(true)}
                    disabled={processing}
                    className="flex-1 bg-green-500 text-white font-bold py-3 px-4 rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {processing ? 'Processando...' : 'Ativar'}
                  </button>
                  <button
                    onClick={() => handleToggleActive(false)}
                    disabled={processing}
                    className="flex-1 bg-red-500 text-white font-bold py-3 px-4 rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {processing ? 'Processando...' : 'Desativar'}
                  </button>
                </div>
                <p className="text-xs text-on-surface-secondary mt-2">
                  ⚠️ Estabelecimentos desativados não poderão fazer login no sistema.
                </p>
              </div>
            )}

            {activeTab === 'notification' && (
              <div className="space-y-4">
                <p className="text-on-surface-secondary mb-4">
                  Enviar uma notificação/mensagem importante para o estabelecimento (será exibida no dashboard deles).
                </p>
                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Mensagem</label>
                  <textarea
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                    placeholder="Digite a mensagem que deseja enviar..."
                    rows={4}
                    className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-secondary focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSendNotification}
                  disabled={processing || !notificationMessage.trim()}
                  className="w-full bg-secondary text-white font-bold py-3 px-4 rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {processing ? 'Enviando...' : 'Enviar Notificação'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {!selectedEstablishment && (
        <div className="bg-surface p-8 rounded-lg shadow-lg text-center">
          <DocumentTextIcon className="w-16 h-16 text-on-surface-secondary mx-auto mb-4 opacity-50" />
          <p className="text-on-surface-secondary">Selecione um estabelecimento acima para acessar as ferramentas avançadas.</p>
        </div>
      )}
    </div>
  );
};

export default SuperAdminAdvanced;
