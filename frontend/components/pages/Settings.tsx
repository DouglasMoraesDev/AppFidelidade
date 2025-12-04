import React, { useEffect, useState } from 'react';
import { LockClosedIcon, DocumentDownloadIcon, DocumentTextIcon, LogoutIcon, PhotoIcon, ClipboardDocumentIcon, QrCodeIcon } from '../icons/Icons';
import SuccessModal from '../SuccessModal';

import { Theme } from '../../types';

interface SettingsProps {
  logoUrl: string;
  voucherMessage: string;
  publicLink: string;
  slug?: string;
  currentTheme?: Theme;
  autoNotificarVoucher?: boolean;
  lembretePontosProximos?: boolean;
  onLogoUpload: (file: File) => void;
  onConfigSave: (payload: { 
    mensagem_voucher?: string; 
    link_consulta?: string;
    tema_config?: string;
    auto_notificar_voucher?: boolean;
    lembrete_pontos_proximos?: boolean;
  }) => Promise<boolean | void>;
  onPasswordChange: (currentPassword: string, newPassword: string) => void;
  onDownloadBackup: () => void;
  lastPaymentDate?: string;
  onLogout: () => void;
}

const fonts = [
  { name: 'Montserrat (Títulos)', value: "'Montserrat', sans-serif" },
  { name: 'Oxanium (Texto)', value: "'Oxanium', sans-serif" },
  { name: 'Inter', value: "'Inter', sans-serif" },
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
];

const Settings: React.FC<SettingsProps> = ({
  logoUrl,
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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [aceitarNotificacoes, setAceitarNotificacoes] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    setLocalMessage(voucherMessage);
  }, [voucherMessage]);

  useEffect(() => {
    // Sempre garantir que o link use URL de produção
    if (publicLink) {
      const productionUrl = 'https://appfidelidade-production.up.railway.app';
      if (publicLink.includes('localhost') || publicLink.includes(':3000') || publicLink.includes(':5173') || publicLink.includes(':5174')) {
        // Se tem slug, reconstruir o link
        if (slug) {
          setCustomLink(`${productionUrl}/consultar?slug=${slug}`);
        } else {
          // Tentar extrair slug do link atual
          const slugMatch = publicLink.match(/slug=([^&]+)/);
          if (slugMatch) {
            setCustomLink(`${productionUrl}/consultar?slug=${slugMatch[1]}`);
          } else {
            setCustomLink(publicLink);
          }
        }
      } else if (!publicLink.includes('appfidelidade-production.up.railway.app') && slug) {
        // Se não contém a URL de produção mas tem slug, corrigir
        setCustomLink(`${productionUrl}/consultar?slug=${slug}`);
      } else {
        setCustomLink(publicLink);
      }
    } else if (slug) {
      // Se não tem link mas tem slug, gerar
      setCustomLink(`https://appfidelidade-production.up.railway.app/consultar?slug=${slug}`);
    }
  }, [publicLink, slug]);

  useEffect(() => {
    if (currentTheme) setLocalTheme(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    setAutoNotify(autoNotificarVoucher);
  }, [autoNotificarVoucher]);

  useEffect(() => {
    setLembretePontos(lembretePontosProximos);
  }, [lembretePontosProximos]);

  useEffect(() => {
    // Verificar permissão de notificação ao carregar
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setAceitarNotificacoes(Notification.permission === 'granted');
    }
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onLogoUpload(e.target.files[0]);
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && notificationPermission !== 'granted') {
      try {
        // Solicitar permissão
        const { subscribeToPush } = await import('../../src/utils/pushNotifications');
        const token = localStorage.getItem('token');
        if (token) {
          const API_BASE = (window as any).API_BASE || 'https://appfidelidade-production.up.railway.app';
          await subscribeToPush(API_BASE + '/api', token);
          setNotificationPermission('granted');
          setAceitarNotificacoes(true);
        }
      } catch (error) {
        console.error('Erro ao configurar notificações:', error);
        alert('Não foi possível ativar as notificações. Verifique as permissões do navegador.');
        setAceitarNotificacoes(false);
      }
    } else if (!enabled) {
      // Desabilitar notificações
      try {
        const { unsubscribeFromPush } = await import('../../src/utils/pushNotifications');
        const token = localStorage.getItem('token');
        if (token) {
          const API_BASE = (window as any).API_BASE || 'https://appfidelidade-production.up.railway.app';
          await unsubscribeFromPush(API_BASE + '/api', token);
          setAceitarNotificacoes(false);
        }
      } catch (error) {
        console.error('Erro ao desativar notificações:', error);
      }
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError(null);
    try {
      // Gerar link correto com URL de produção se tiver slug
      let linkToSave = customLink;
      if (slug) {
        const productionUrl = 'https://appfidelidade-production.up.railway.app';
        linkToSave = `${productionUrl}/consultar?slug=${slug}`;
      }
      
      // Não salvar tema_config pois está travado (premium)
      await onConfigSave({ 
        mensagem_voucher: localMessage, 
        link_consulta: linkToSave,
        // tema_config: JSON.stringify(localTheme), // REMOVIDO - funcionalidade premium
        auto_notificar_voucher: autoNotify,
        lembrete_pontos_proximos: lembretePontos
      });
      setSaveSuccess(true);
      // Atualizar o link local para mostrar o correto
      if (linkToSave !== customLink) {
        setCustomLink(linkToSave);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err?.message || 'Erro ao salvar configurações');
      setTimeout(() => setSaveError(null), 5000);
    }
  };

  const handleThemeChange = (field: keyof Theme, value: string) => {
    setLocalTheme(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    try {
      await onPasswordChange(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setShowPasswordSuccess(true);
    } catch (err) {
      // Erro já tratado no App.tsx
    }
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
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-4 pb-4 overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mb-2">Configurações</h1>
        <p className="text-sm sm:text-base text-on-surface-secondary">Gerencie o AppFidelidade do seu estabelecimento.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="bg-surface p-4 sm:p-6 rounded-lg shadow-lg space-y-4 sm:space-y-6 max-w-full overflow-hidden">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-on-surface mb-3 sm:mb-4">Identidade do Estabelecimento</h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <img src={logoUrl} alt="Logo" className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-background object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <label htmlFor="logo-upload" className="cursor-pointer bg-primary text-white font-bold py-2 px-3 sm:px-4 rounded-md hover:bg-primary-focus transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start">
                  <PhotoIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Trocar Logo</span>
                </label>
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                <p className="text-xs text-on-surface-secondary mt-2">Recomendamos imagens quadradas para melhor encaixe no carimbo.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleConfigSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Mensagem Automática do Voucher</label>
              <textarea className="w-full bg-background text-on-surface p-2.5 sm:p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none text-sm sm:text-base resize-none" rows={3} value={localMessage} onChange={(e) => setLocalMessage(e.target.value)} />
              <p className="text-xs text-on-surface-secondary mt-1">Use {'{cliente}'} para inserir automaticamente o nome do cliente.</p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Link público de consulta</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input 
                  className="flex-1 bg-background text-on-surface p-2.5 sm:p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none text-xs sm:text-sm font-mono" 
                  value={customLink} 
                  readOnly
                  title="Link gerado automaticamente com URL de produção"
                />
                <button type="button" onClick={handleCopyLink} className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-md font-semibold text-xs sm:text-sm whitespace-nowrap ${copyState === 'copied' ? 'bg-green-600 text-white' : 'bg-secondary text-white hover:bg-cyan-700'}`}>
                  {copyState === 'copied' ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
              {slug && (
                <div className="mt-2">
                  <p className="text-xs text-on-surface-secondary mb-1">Slug público: <span className="font-mono text-primary">{slug}</span></p>
                  <p className="text-xs text-on-surface-secondary italic">O link é gerado automaticamente usando a URL de produção.</p>
                </div>
              )}
            </div>

            {/* Configurações de Notificações Push */}
            <div className="border-t border-background pt-6 mt-6">
              <h2 className="text-lg font-semibold text-on-surface mb-4">Notificações</h2>
              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aceitarNotificacoes}
                    onChange={(e) => handleNotificationToggle(e.target.checked)}
                    className="w-5 h-5 mt-0.5 rounded border-slate-600 bg-background text-primary focus:ring-2 focus:ring-primary"
                  />
                  <div>
                    <p className="text-on-surface font-medium">Aceitar notificações push do sistema</p>
                    <p className="text-xs text-on-surface-secondary">
                      Ao ativar, você receberá notificações do sistema sobre atualizações, novidades e mensagens importantes do administrador, mesmo quando o app estiver fechado ou minimizado.
                    </p>
                    {notificationPermission === 'denied' && (
                      <div className="mt-2 bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-2 rounded text-xs">
                        ⚠️ As notificações estão bloqueadas no navegador. Ative nas configurações do navegador para receber notificações.
                      </div>
                    )}
                    {notificationPermission === 'granted' && aceitarNotificacoes && (
                      <div className="mt-2 bg-green-500/20 border border-green-500/40 text-green-400 px-3 py-2 rounded text-xs flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Notificações ativadas com sucesso!
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

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

          {/* Editor de Tema - TRAVADO */}
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
              <div className="bg-yellow-500/20 border-2 border-yellow-500/50 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-yellow-400 mb-1">Funcionalidade Premium</h3>
                    <p className="text-sm text-on-surface mb-2">
                      Para ter acesso à personalização completa de tema, é necessário fazer o pagamento de <strong className="text-yellow-300">R$ 50,00</strong>.
                    </p>
                    <p className="text-xs text-on-surface-secondary">
                      Entre em contato com o desenvolvedor para liberar esta funcionalidade.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {showThemeEditor && (
              <div className="space-y-3 sm:space-y-4 bg-background/60 p-3 sm:p-4 rounded-md overflow-x-auto opacity-50 pointer-events-none relative">
                <div className="absolute inset-0 z-10"></div>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-on-surface mb-3">Cores Principais</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Cor Primária</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={localTheme.primary}
                            onChange={(e) => handleThemeChange('primary', e.target.value)}
                            className="w-12 h-10 rounded border border-slate-600 cursor-not-allowed flex-shrink-0"
                            disabled
                          />
                          <input
                            type="text"
                            value={localTheme.primary}
                            onChange={(e) => handleThemeChange('primary', e.target.value)}
                            className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-xs sm:text-sm cursor-not-allowed"
                            placeholder="#0D9488"
                            disabled
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Cor Primária (Hover)</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={localTheme.primaryFocus}
                            onChange={(e) => handleThemeChange('primaryFocus', e.target.value)}
                            className="w-12 h-10 rounded border border-slate-600 cursor-not-allowed flex-shrink-0"
                            disabled
                          />
                          <input
                            type="text"
                            value={localTheme.primaryFocus}
                            onChange={(e) => handleThemeChange('primaryFocus', e.target.value)}
                            className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-xs sm:text-sm cursor-not-allowed"
                            placeholder="#0F766E"
                            disabled
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Cor Secundária</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={localTheme.secondary}
                            onChange={(e) => handleThemeChange('secondary', e.target.value)}
                            className="w-12 h-10 rounded border border-slate-600 cursor-not-allowed flex-shrink-0"
                            disabled
                          />
                          <input
                            type="text"
                            value={localTheme.secondary}
                            onChange={(e) => handleThemeChange('secondary', e.target.value)}
                            className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-xs sm:text-sm cursor-not-allowed"
                            placeholder="#0891B2"
                            disabled
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Fonte</label>
                        <select
                          value={localTheme.fontFamily}
                          onChange={(e) => handleThemeChange('fontFamily', e.target.value)}
                          className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 text-xs sm:text-sm cursor-not-allowed"
                          disabled
                        >
                          {fonts.map(font => (
                            <option key={font.value} value={font.value}>{font.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-background/50 pt-4">
                    <h3 className="text-sm font-semibold text-on-surface mb-3">Cores de Fundo</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Fundo Principal</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={localTheme.background}
                            onChange={(e) => handleThemeChange('background', e.target.value)}
                            className="w-12 h-10 rounded border border-slate-600 cursor-not-allowed flex-shrink-0"
                            disabled
                          />
                          <input
                            type="text"
                            value={localTheme.background}
                            onChange={(e) => handleThemeChange('background', e.target.value)}
                            className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-xs sm:text-sm cursor-not-allowed"
                            placeholder="#1E293B"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-on-surface-secondary mt-1">Cor de fundo da aplicação</p>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-on-surface-secondary mb-1">Fundo de Superfície</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={localTheme.surface}
                            onChange={(e) => handleThemeChange('surface', e.target.value)}
                            className="w-12 h-10 rounded border border-slate-600 cursor-not-allowed flex-shrink-0"
                            disabled
                          />
                          <input
                            type="text"
                            value={localTheme.surface}
                            onChange={(e) => handleThemeChange('surface', e.target.value)}
                            className="flex-1 bg-background text-on-surface p-2 rounded-md border border-slate-600 text-xs sm:text-sm cursor-not-allowed"
                            placeholder="#334155"
                            disabled
                          />
                        </div>
                        <p className="text-xs text-on-surface-secondary mt-1">Cor de fundo dos cards</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-background/50 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setLocalTheme({
                          primary: '#0D9488',
                          primaryFocus: '#0F766E',
                          secondary: '#0891B2',
                          background: '#1E293B',
                          surface: '#334155',
                          fontFamily: "'Inter', sans-serif",
                        });
                      }}
                      className="text-xs sm:text-sm text-primary hover:text-primary-focus underline cursor-not-allowed"
                      disabled
                    >
                      🔄 Restaurar tema padrão
                    </button>
                  </div>
                </div>
                <div className="text-xs text-on-surface-secondary bg-background/40 p-2 rounded">
                  <p>💡 As mudanças serão aplicadas ao salvar as configurações. Use o seletor de cor ou digite o código hexadecimal.</p>
                </div>
              </div>
            )}
          </div>

          {/* Botão de Salvar Alterações - Movido para o final */}
          <div className="border-t border-background pt-6 mt-6">
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 sm:py-4 rounded-md hover:bg-primary-focus transition-colors text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg">
              {saveSuccess ? (
                <>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Salvo com sucesso!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Salvar Todas as Alterações</span>
                </>
              )}
            </button>
            {saveSuccess && (
              <div className="bg-green-500/20 border border-green-500/40 text-green-400 px-4 py-3 rounded-md text-sm flex items-center gap-2 mt-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Todas as configurações foram salvas com sucesso!
              </div>
            )}
            {saveError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-400 px-4 py-3 rounded-md text-sm flex items-center gap-2 mt-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {saveError}
              </div>
            )}
            <p className="text-xs text-on-surface-secondary mt-3 text-center">
              💡 Todas as alterações acima (nome, mensagem, notificações e automações) serão salvas ao clicar neste botão.
            </p>
          </div>
        </form>
        </div>

        <div className="bg-surface p-4 sm:p-6 rounded-lg shadow-lg space-y-4 sm:space-y-6 max-w-full overflow-hidden">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-on-surface mb-3 sm:mb-4 flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
              <span>Link para clientes</span>
            </h2>
            <div className="bg-background/60 p-3 sm:p-4 rounded-md space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <p>Compartilhe este link ou gere um QR Code a partir dele para que seus clientes acompanhem os pontos.</p>
              <a href={customLink} target="_blank" rel="noreferrer" className="block bg-secondary/20 border border-secondary/40 rounded-md px-2 sm:px-3 py-2 text-secondary hover:bg-secondary/30 break-all text-xs sm:text-sm">
                {customLink}
              </a>
            </div>
          </div>

          <div className="border-t border-background pt-3 sm:pt-4">
            <h2 className="text-base sm:text-lg font-semibold text-on-surface mb-2 sm:mb-3">Segurança</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-2 sm:space-y-3">
              <div>
                <label className="text-xs sm:text-sm text-on-surface-secondary mb-1 block">Senha atual</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none text-sm sm:text-base" />
              </div>
              <div>
                <label className="text-xs sm:text-sm text-on-surface-secondary mb-1 block">Nova senha</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none text-sm sm:text-base" />
              </div>
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2 sm:py-2.5 rounded-md hover:bg-primary-focus text-sm sm:text-base">
                <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Trocar Senha
              </button>
            </form>
          </div>

          <div className="border-t border-background pt-3 sm:pt-4 space-y-2 sm:space-y-3">
            <button onClick={onDownloadBackup} className="w-full flex items-center justify-center gap-2 bg-secondary text-white py-2 sm:py-2.5 rounded-md hover:bg-cyan-700 text-sm sm:text-base">
              <DocumentDownloadIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Fazer Backup
            </button>
            {lastPaymentDate && (
              <div className="bg-background/60 p-3 sm:p-4 rounded-md space-y-2">
                <p className="text-xs sm:text-sm text-on-surface-secondary">📅 <strong>Último Pagamento Confirmado:</strong></p>
                <p className="text-base sm:text-lg font-semibold text-primary">{new Date(lastPaymentDate).toLocaleDateString('pt-BR')}</p>
              </div>
            )}
            <button onClick={() => setTermsOpen(true)} className="w-full flex items-center justify-center gap-2 bg-background hover:bg-background/70 text-on-surface py-2 sm:py-2.5 rounded-md text-sm sm:text-base">
              <DocumentTextIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              Termos de Uso
            </button>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-md border border-red-400 text-red-400 hover:bg-red-500/10 text-sm sm:text-base">
              <LogoutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
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

      {showPasswordSuccess && (
        <SuccessModal
          title="Senha Alterada!"
          message="Sua senha foi alterada com sucesso. Use a nova senha no próximo login."
          onClose={() => setShowPasswordSuccess(false)}
        />
      )}
    </div>
  );
};

export default Settings;
