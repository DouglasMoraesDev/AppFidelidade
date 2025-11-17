import React, { useEffect, useState } from 'react';
import { LockClosedIcon, DocumentDownloadIcon, DocumentTextIcon, LogoutIcon, PhotoIcon, ClipboardDocumentIcon, QrCodeIcon } from '../icons/Icons';

interface SettingsProps {
  logoUrl: string;
  appName: string;
  voucherMessage: string;
  publicLink: string;
  slug?: string;
  onLogoUpload: (file: File) => void;
  onConfigSave: (payload: { mensagem_voucher?: string; nome_app?: string; link_consulta?: string }) => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => void;
  onDownloadBackup: () => void;
  onMensalidadeCheck: () => void;
  mensalidadeExpirada: boolean;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  logoUrl,
  appName,
  voucherMessage,
  publicLink,
  slug,
  onLogoUpload,
  onConfigSave,
  onPasswordChange,
  onDownloadBackup,
  onMensalidadeCheck,
  mensalidadeExpirada,
  onLogout
}) => {
  const [localAppName, setLocalAppName] = useState(appName);
  const [localMessage, setLocalMessage] = useState(voucherMessage);
  const [customLink, setCustomLink] = useState(publicLink);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  useEffect(() => {
    setLocalAppName(appName);
  }, [appName]);

  useEffect(() => {
    setLocalMessage(voucherMessage);
  }, [voucherMessage]);

  useEffect(() => {
    setCustomLink(publicLink);
  }, [publicLink]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onLogoUpload(e.target.files[0]);
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigSave({ nome_app: localAppName, mensagem_voucher: localMessage, link_consulta: customLink });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    onPasswordChange(currentPassword, newPassword);
    setCurrentPassword('');
    setNewPassword('');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(customLink);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch {
      setCopyState('idle');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Configurações</h1>
        <p className="text-on-surface-secondary">Gerencie o AppFidelidade do seu estabelecimento.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-surface p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-on-surface mb-4">Identidade do Estabelecimento</h2>
            <div className="flex items-center gap-4">
              <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-full bg-background object-cover" />
              <label htmlFor="logo-upload" className="cursor-pointer bg-primary text-white font-bold py-2 px-4 rounded-md hover:bg-primary-focus transition-colors flex items-center gap-2">
                <PhotoIcon className="h-5 w-5" />
                Trocar Logo
              </label>
              <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
            <p className="text-xs text-on-surface-secondary mt-2">Recomendamos imagens quadradas para melhor encaixe no carimbo.</p>
          </div>

          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface-secondary mb-1">Nome do App</label>
              <input className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none" value={localAppName} onChange={(e) => setLocalAppName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-secondary mb-1">Mensagem Automática do Voucher</label>
              <textarea className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none" rows={3} value={localMessage} onChange={(e) => setLocalMessage(e.target.value)} />
              <p className="text-xs text-on-surface-secondary mt-1">Use {'{cliente}'} para inserir automaticamente o nome do cliente.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface-secondary mb-1">Link público de consulta</label>
              <div className="flex gap-2">
                <input className="flex-1 bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none" value={customLink} onChange={(e) => setCustomLink(e.target.value)} />
                <button type="button" onClick={handleCopyLink} className={`px-4 rounded-md font-semibold ${copyState === 'copied' ? 'bg-green-600 text-white' : 'bg-secondary text-white hover:bg-cyan-700'}`}>
                  {copyState === 'copied' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              {slug && <p className="text-xs text-on-surface-secondary mt-1">Slug público: <span className="font-mono">{slug}</span></p>}
            </div>
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-primary-focus transition-colors">Salvar Alterações</button>
          </form>
        </div>

        <div className="bg-surface p-6 rounded-lg shadow-lg space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
              <QrCodeIcon className="h-6 w-6 text-primary" />
              Link para clientes
            </h2>
            <div className="bg-background/60 p-4 rounded-md space-y-3 text-sm">
              <p>Compartilhe este link ou gere um QR Code a partir dele para que seus clientes acompanhem os pontos.</p>
              <a href={customLink} target="_blank" rel="noreferrer" className="block bg-secondary/20 border border-secondary/40 rounded-md px-3 py-2 text-secondary hover:bg-secondary/30 truncate">
                {customLink}
              </a>
            </div>
          </div>

          <div className="border-t border-background pt-4">
            <h2 className="text-lg font-semibold text-on-surface mb-3">Segurança</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label className="text-sm text-on-surface-secondary mb-1 block">Senha atual</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-on-surface-secondary mb-1 block">Nova senha</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none" />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 rounded-md hover:bg-primary-focus">
                <LockClosedIcon className="w-5 h-5" />
                Trocar Senha
              </button>
            </form>
          </div>

          <div className="border-t border-background pt-4 space-y-3">
            <button onClick={onDownloadBackup} className="w-full flex items-center justify-center gap-2 bg-secondary text-white py-2 rounded-md hover:bg-cyan-700">
              <DocumentDownloadIcon className="w-5 h-5" />
              Fazer Backup
            </button>
            <button onClick={() => setTermsOpen(true)} className="w-full flex items-center justify-center gap-2 bg-background hover:bg-background/70 text-on-surface py-2 rounded-md">
              <DocumentTextIcon className="w-5 h-5" />
              Termos de Uso
            </button>
            <button onClick={onMensalidadeCheck} className={`w-full py-2 rounded-md font-semibold ${mensalidadeExpirada ? 'bg-red-500 text-white' : 'bg-green-600 text-white'}`}>
              {mensalidadeExpirada ? 'Pagamento pendente - Informar' : 'Mensalidade em dia'}
            </button>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-red-400 text-red-400 hover:bg-red-500/10">
              <LogoutIcon className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {termsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-6 rounded-lg shadow-2xl max-w-2xl max-h-[80vh] overflow-y-auto space-y-4">
            <h2 className="text-2xl font-bold">Termos de Uso</h2>
            <p className="text-sm text-on-surface-secondary">
              Este aplicativo foi projetado para gerenciar programas de fidelidade. Ao utilizá-lo, você concorda em manter os dados dos clientes seguros, respeitar a LGPD
              e utilizar o envio de vouchers apenas com consentimento do cliente. Qualquer dúvida entre em contato com o suporte AppFidelidade.
            </p>
            <div className="text-right">
              <button onClick={() => setTermsOpen(false)} className="px-4 py-2 bg-primary text-white rounded-md">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
