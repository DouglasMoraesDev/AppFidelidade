import React, { useEffect, useState } from 'react';
import { LockClosedIcon, DocumentDownloadIcon, DocumentTextIcon, LogoutIcon, PhotoIcon, ClipboardDocumentIcon, QrCodeIcon } from '../icons/Icons';

import { Theme } from '../../types';

interface SettingsProps {
  logoUrl: string;
  appName: string;
  voucherMessage: string;
  publicLink: string;
  slug?: string;
  currentTheme?: Theme;
  autoNotificarVoucher?: boolean;
  lembretePontosProximos?: boolean;
  onLogoUpload: (file: File) => void;
  onConfigSave: (payload: { 
    mensagem_voucher?: string; 
    nome_app?: string; 
    link_consulta?: string;
    tema_config?: string;
    auto_notificar_voucher?: boolean;
    lembrete_pontos_proximos?: boolean;
  }) => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => void;
  onDownloadBackup: () => void;
  lastPaymentDate?: string;
  onLogout: () => void;
}

const fonts = [
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
];

const Settings: React.FC<SettingsProps> = ({
  logoUrl,
  appName,
  voucherMessage,
  publicLink,
  slug,
  currentTheme,
  autoNotificarVoucher = false,
  lembretePontosProximos = false,
  onLogoUpload,
  onConfigSave,
  onPasswordChange,
  onDownloadBackup,
  lastPaymentDate,
  onLogout
}) => {
  const [localAppName, setLocalAppName] = useState(appName);
  const [localMessage, setLocalMessage] = useState(voucherMessage);
  const [customLink, setCustomLink] = useState(publicLink);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [termsOpen, setTermsOpen] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const [localTheme, setLocalTheme] = useState<Theme>(currentTheme || {
    primary: '#0D9488',
    primaryFocus: '#0F766E',
    secondary: '#0891B2',
    background: '#1E293B',
    surface: '#334155',
    fontFamily: "'Inter', sans-serif",
  });
  const [autoNotify, setAutoNotify] = useState(autoNotificarVoucher);
  const [lembretePontos, setLembretePontos] = useState(lembretePontosProximos);
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  useEffect(() => {
    setLocalAppName(appName);
  }, [appName]);

  useEffect(() => {
    setLocalMessage(voucherMessage);
  }, [voucherMessage]);

  useEffect(() => {
    setCustomLink(publicLink);
  }, [publicLink]);

  useEffect(() => {
    if (currentTheme) setLocalTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    setAutoNotify(autoNotificarVoucher);
  }, [autoNotificarVoucher]);

  useEffect(() => {
    setLembretePontos(lembretePontosProximos);
  }, [lembretePontosProximos]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onLogoUpload(e.target.files[0]);
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigSave({ 
      nome_app: localAppName, 
      mensagem_voucher: localMessage, 
      link_consulta: customLink,
      tema_config: JSON.stringify(localTheme),
      auto_notificar_voucher: autoNotify,
      lembrete_pontos_proximos: lembretePontos
    });
  };

  const handleThemeChange = (field: keyof Theme, value: string) => {
    setLocalTheme(prev => ({ ...prev, [field]: value }));
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

          {/* Configurações de Automação */}
          <div className="border-t border-background pt-6 mt-6">
            <h2 className="text-lg font-semibold text-on-surface mb-4">Automações</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoNotify}
                  onChange={(e) => setAutoNotify(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-background text-primary focus:ring-2 focus:ring-primary"
                />
                <div>
                  <p className="text-on-surface font-medium">Notificar automaticamente quando cliente ganha voucher</p>
                  <p className="text-xs text-on-surface-secondary">O voucher será enviado automaticamente via WhatsApp quando o cliente atingir os pontos necessários</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lembretePontos}
                  onChange={(e) => setLembretePontos(e.target.checked)}
                  className="w-5 h-5 rounded border-slate-600 bg-background text-primary focus:ring-2 focus:ring-primary"
                />
                <div>
                  <p className="text-on-surface font-medium">Lembrar clientes próximos do voucher</p>
                  <p className="text-xs text-on-surface-secondary">Receba notificações quando clientes estiverem próximos de ganhar voucher</p>
                </div>
              </label>
            </div>
          </div>

          {/* Editor de Tema */}
          <div className="border-t border-background pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-on-surface">Personalização de Tema</h2>
              <button
                type="button"
                onClick={() => setShowThemeEditor(!showThemeEditor)}
                className="text-primary hover:text-primary-focus text-sm font-medium"
              >
                {showThemeEditor ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {showThemeEditor && (
              <div className="space-y-4 bg-background/60 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface-secondary mb-1">Cor Primária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localTheme.primary}
                        onChange={(e) => handleThemeChange('primary', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localTheme.primary}
                        onChange={(e) => handleThemeChange('primary', e.target.value)}
                        className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-sm"
                        placeholder="#0D9488"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-secondary mb-1">Cor Primária (Hover)</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localTheme.primaryFocus}
                        onChange={(e) => handleThemeChange('primaryFocus', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localTheme.primaryFocus}
                        onChange={(e) => handleThemeChange('primaryFocus', e.target.value)}
                        className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-sm"
                        placeholder="#0F766E"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-secondary mb-1">Cor Secundária</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={localTheme.secondary}
                        onChange={(e) => handleThemeChange('secondary', e.target.value)}
                        className="w-12 h-10 rounded border border-slate-600 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={localTheme.secondary}
                        onChange={(e) => handleThemeChange('secondary', e.target.value)}
                        className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-sm"
                        placeholder="#0891B2"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface-secondary mb-1">Fonte</label>
                    <select
                      value={localTheme.fontFamily}
                      onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                      className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 text-sm"
                    >
                      {fonts.map(font => (
                        <option key={font.value} value={font.value}>{font.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="text-xs text-on-surface-secondary">
                  <p>💡 As mudanças serão aplicadas ao salvar as configurações</p>
                </div>
              </div>
            )}
          </div>
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
            {lastPaymentDate && (
              <div className="bg-background/60 p-4 rounded-md space-y-2">
                <p className="text-sm text-on-surface-secondary">📅 <strong>Último Pagamento Confirmado:</strong></p>
                <p className="text-lg font-semibold text-primary">{new Date(lastPaymentDate).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            <button onClick={() => setTermsOpen(true)} className="w-full flex items-center justify-center gap-2 bg-background hover:bg-background/70 text-on-surface py-2 rounded-md">
              <DocumentTextIcon className="w-5 h-5" />
              Termos de Uso
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
            <h2 className="text-2xl font-bold text-on-surface">Termos de Uso - AppFidelidade</h2>
            
            <div className="space-y-4 text-sm text-on-surface-secondary">
              <section>
                <h3 className="font-semibold text-on-surface mb-2">1. Objetivo da Plataforma</h3>
                <p>AppFidelidade é uma plataforma de gerenciamento de programas de fidelidade digital, permitindo que estabelecimentos gerenciem clientes, pontos e vouchers de forma simples e eficiente.</p>
              </section>

              <section>
                <h3 className="font-semibold text-on-surface mb-2">2. Responsabilidades do Estabelecimento</h3>
                <p className="mb-2">Como usuário da plataforma, você se compromete a:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Manter a confidencialidade de suas credenciais de acesso</li>
                  <li>Proteger os dados pessoais dos clientes em conformidade com a LGPD (Lei Geral de Proteção de Dados)</li>
                  <li>Utilizar a plataforma exclusivamente para fins legítimos</li>
                  <li>Obter consentimento explícito dos clientes antes de cadastrá-los no programa</li>
                  <li>Ser responsável por todas as atividades realizadas em sua conta</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-on-surface mb-2">3. Pontos e Vouchers</h3>
                <p className="mb-2">Sobre o funcionamento de pontos e vouchers:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Pontos são atribuídos conforme as regras configuradas pelo estabelecimento</li>
                  <li>Vouchers são gerados automaticamente quando pontos atingem o limite configurado</li>
                  <li>O estabelecimento é responsável por entregar o voucher ao cliente</li>
                  <li>AppFidelidade não interfere no valor ou validade dos vouchers - esses são definidos pelo estabelecimento</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-on-surface mb-2">4. Proteção de Dados</h3>
                <p className="mb-2">AppFidelidade se compromete a:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Manter os dados dos clientes com segurança</li>
                  <li>Cumprir as regulamentações de proteção de dados (LGPD)</li>
                  <li>Não compartilhar dados com terceiros sem consentimento</li>
                  <li>Fornecer backup dos dados do estabelecimento</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-on-surface mb-2">5. Comunicação com Clientes</h3>
                <p className="mb-2">Comunicações via WhatsApp:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Mensagens são enviadas apenas com consentimento do cliente</li>
                  <li>O estabelecimento é responsável pelo conteúdo das mensagens</li>
                  <li>AppFidelidade não envia mensagens sem solicitação explícita</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-on-surface mb-2">6. Limite de Responsabilidade</h3>
                <p>AppFidelidade não é responsável por: perdas de dados (mantenha backups), interrupções de serviço, ou problemas causados pelo uso inadequado da plataforma.</p>
              </section>

              <section>
                <h3 className="font-semibold text-on-surface mb-2">7. Modificações dos Termos</h3>
                <p>AppFidelidade se reserva o direito de modificar estes termos a qualquer momento. Mudanças serão comunicadas aos usuários.</p>
              </section>

              <section>
                <h3 className="font-semibold text-on-surface mb-2">8. Suporte e Dúvidas</h3>
                <p>Para dúvidas ou problemas, entre em contato com o suporte AppFidelidade através do app.</p>
              </section>
            </div>

            <div className="text-right border-t border-background pt-4">
              <button onClick={() => setTermsOpen(false)} className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-focus">
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
