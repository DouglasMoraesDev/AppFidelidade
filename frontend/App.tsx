// frontend/App.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Client, Page, Establishment, SuperAdminPage, Theme, Payment } from './types';
import Layout from './components/layout/Layout';
import Dashboard from './components/pages/Dashboard';
import ClientList from './components/pages/ClientList';
import AddClient from './components/pages/AddClient';
import AddPoints from './components/pages/AddPoints';
import Notifications from './components/pages/Notifications';
import Settings from './components/pages/Settings';
import PointsLink from './components/pages/PointsLink';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import PaymentPage from './components/pages/PaymentPage';
import ChooserPage from './components/pages/ChooserPage';
import SuperAdminLoginPage from './components/pages/SuperAdminLoginPage';
import SuperAdminLayout from './components/layout/SuperAdminLayout';
import SuperAdminDashboard from './components/pages/SuperAdminDashboard';
import SuperAdminEstablishments from './components/pages/SuperAdminEstablishments';
import SuperAdminThemeSettings from './components/pages/SuperAdminThemeSettings';
import TelaPontosPublica from './src/components/TelaPontosPublica';

import {
  login as apiLogin,
  fetchSnapshot,
  deletarCliente,
  createCliente,
  adicionarPontos,
  enviarVoucher,
  changePassword,
  downloadBackup,
  updateEstabelecimentoConfig,
  uploadLogo,
  confirmarMensalidade,
  fetchOverview,
  superAdminListEstablishments,
  superAdminUpdateEstablishment,
  superAdminDeleteEstablishment,
  superAdminAddPayment
} from './utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
const DEFAULT_LOGO = 'https://tailwindui.com/img/logos/mark.svg?color=teal&shade=500';
const SUPER_ADMIN_SECRET = 'Dooug#525210';

const App: React.FC = () => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentSuperAdminPage, setCurrentSuperAdminPage] = useState<SuperAdminPage>('superDashboard');
  const [theme, setTheme] = useState<Theme>({
    primary: '#0D9488',
    primaryFocus: '#0F766E',
    secondary: '#0891B2',
    background: '#1E293B',
    surface: '#334155',
    fontFamily: "'Inter', sans-serif",
  });

  const [currentView, setCurrentView] = useState<'chooser' | 'establishmentAuth' | 'superAdminAuth' | 'establishmentApp' | 'superAdminApp'>('chooser');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [loggedInEstablishment, setLoggedInEstablishment] = useState<Establishment | null>(null);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [mensalidadeExpirada, setMensalidadeExpirada] = useState(false);
  const [publicSlug, setPublicSlug] = useState('');
  const [publicLink, setPublicLink] = useState('');
  const [superAdminMetrics, setSuperAdminMetrics] = useState<{ estabelecimentos: number; clientes: number; vouchers: number; inadimplentes: number } | null>(null);
  const [superAdminSecret, setSuperAdminSecret] = useState<string | null>(null);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);

  const isPublicConsultaPage = useMemo(
    () => {
      if (typeof window === 'undefined') return false;
      const path = window.location.pathname.toLowerCase();
      return path.startsWith('/consulta/') || path.startsWith('/consultar');
    },
    []
  );

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-focus', theme.primaryFocus);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--font-family', theme.fontFamily);
  }, [theme]);

  const mapApiClientToLocal = (apiClient: any): Client => ({
    id: String(apiClient.id),
    cartaoId: Number(apiClient.id),
    clienteId: Number(apiClient.clienteId),
    name: apiClient.name || apiClient.cliente?.nome || '',
    phone: apiClient.phone || apiClient.cliente?.telefone || '',
    points: apiClient.points ?? apiClient.pontos ?? 0,
    lastPointAddition: apiClient.lastPointAddition || apiClient.movimentos?.[0]?.criadoEm || null
  });

  const mapSnapshotToEstablishment = (snapshot: any): Establishment => {
    const paymentHistory: Payment[] = (snapshot.pagamentos || []).map((p: any) => ({
      id: String(p.id),
      date: p.pagoEm
    }));

    // Normaliza o link: converte formato antigo /consulta/{slug} para /consultar?slug={slug}
    let shareLink = snapshot.estabelecimento?.link_consulta
      || (typeof window !== 'undefined' ? `${window.location.origin}/consultar?slug=${snapshot.estabelecimento?.slug_publico}` : '');
    
    if (shareLink && typeof window !== 'undefined') {
      // Se o link está no formato antigo /consulta/{slug}, converte para o novo formato
      const oldFormatMatch = shareLink.match(/\/consulta\/([^\/\?]+)/);
      if (oldFormatMatch && oldFormatMatch[1]) {
        const slug = oldFormatMatch[1];
        const origin = window.location.origin;
        shareLink = `${origin}/consultar?slug=${slug}`;
      }
      // Garante que está usando a porta correta (3000)
      shareLink = shareLink.replace(/localhost:5173/g, 'localhost:3000');
      shareLink = shareLink.replace(/localhost:5174/g, 'localhost:3000');
    }

    return {
      id: snapshot.estabelecimento.id,
      name: snapshot.estabelecimento.nome,
      address: snapshot.estabelecimento.endereco || '',
      cpfCnpj: snapshot.estabelecimento.cpf_cnpj || '',
      phone: snapshot.estabelecimento.telefone || '',
      email: snapshot.estabelecimento.email || '',
      voucherMessage: snapshot.estabelecimento.mensagem_voucher || '',
      pointsForVoucher: snapshot.estabelecimento.pontos_para_voucher || 10,
      paymentHistory,
      logoUrl: snapshot.estabelecimento.logo_path ? `${API_BASE}${snapshot.estabelecimento.logo_path}` : DEFAULT_LOGO,
      clients: (snapshot.clientes || []).map(mapApiClientToLocal),
      totalVouchersSent: snapshot.stats?.totalVouchers || 0,
      username: '',
      passwordHash: '',
      slug: snapshot.estabelecimento.slug_publico,
      publicLink: shareLink,
      appDisplayName: snapshot.estabelecimento.nome_app || 'AppFidelidade'
    };
  };

  const refreshSnapshot = useCallback(async () => {
    try {
      setLoadingSnapshot(true);
      const data = await fetchSnapshot();
      const mapped = mapSnapshotToEstablishment(data);
      setLoggedInEstablishment(mapped);
      setEstablishments([mapped]);
      setPublicSlug(mapped.slug || '');
      setPublicLink(mapped.publicLink || '');

      const validade = data.stats?.assinaturaValidaAte ? new Date(data.stats.assinaturaValidaAte) : null;
      setMensalidadeExpirada(!validade || validade < new Date());
    } catch (err) {
      console.error('Erro ao atualizar snapshot', err);
    } finally {
      setLoadingSnapshot(false);
    }
  }, []);

  const handleRegister = useCallback(() => {
    setAuthPage('login');
    setCurrentView('establishmentAuth');
  }, []);

  const handleLogin = useCallback(async (username: string, password: string) => {
    try {
      const resp = await apiLogin(username, password);
      if (!resp?.token) throw new Error('Resposta inválida do servidor');
      localStorage.setItem('token', resp.token);
      setMensalidadeExpirada(!!resp.requiresPayment);
      setShowPaymentPage(!!resp.requiresPayment);
      await refreshSnapshot();
      setCurrentView('establishmentApp');
    } catch (err: any) {
      alert(err?.message || 'Não foi possível autenticar');
    }
  }, [refreshSnapshot]);

  const handleLogout = useCallback(() => {
    setLoggedInEstablishment(null);
    setCurrentView('chooser');
    setCurrentPage('dashboard');
    localStorage.removeItem('token');
  }, []);

  const handlePaymentSuccess = useCallback(async () => {
    try {
      await confirmarMensalidade();
      setMensalidadeExpirada(false);
      setShowPaymentPage(false);
      await refreshSnapshot();
      setCurrentView('establishmentApp');
    } catch (err: any) {
      alert(err?.message || 'Erro ao registrar pagamento');
    }
  }, [refreshSnapshot]);

  const addClient = useCallback(async (client: { name: string; phone: string; points: number }) => {
    try {
      const resp = await createCliente({
        nome: client.name,
        telefone: client.phone,
        pontosIniciais: client.points
      });

      if (!resp?.cliente) return;
      const novoCliente = mapApiClientToLocal(resp.cliente);
      setLoggedInEstablishment(prev => prev ? { ...prev, clients: [novoCliente, ...prev.clients] } : prev);
      setCurrentPage('clients');
    } catch (err: any) {
      alert(err?.message || 'Erro ao cadastrar cliente');
    }
  }, []);

  const updateClient = useCallback((updatedClient: Client) => {
    setLoggedInEstablishment(prev => prev ? {
      ...prev,
      clients: prev.clients.map(c => c.id === updatedClient.id ? updatedClient : c)
    } : prev);
  }, []);

  const deleteClient = useCallback(async (clientId: string) => {
    const client = loggedInEstablishment?.clients.find(c => c.id === clientId);
    if (!client || !client.cartaoId) return;
    
    try {
      await deletarCliente(client.cartaoId);
      setLoggedInEstablishment(prev => prev ? {
        ...prev,
        clients: prev.clients.filter(c => c.id !== clientId)
      } : prev);
    } catch (err: any) {
      alert(err?.message || 'Erro ao deletar cliente');
    }
  }, [loggedInEstablishment]);

  const addPointsToClient = useCallback(async (clientId: string, pointsToAdd: number) => {
    const client = loggedInEstablishment?.clients.find(c => c.id === clientId);
    if (!client) return;
    try {
      const resp = await adicionarPontos({ cartaoId: client.cartaoId, pontos: pointsToAdd, descricao: 'Pontos adicionados' });
      if (resp?.cartao) {
        const atualizado = mapApiClientToLocal({
          id: resp.cartao.id,
          clienteId: resp.cartao.clienteId,
          name: resp.cartao.cliente.nome,
          phone: resp.cartao.cliente.telefone,
          points: resp.cartao.pontos,
          lastPointAddition: resp.cartao.movimentos?.[0]?.criadoEm
        });
        setLoggedInEstablishment(prev => prev ? {
          ...prev,
          clients: prev.clients.map(c => c.id === atualizado.id ? atualizado : c)
        } : prev);
      }
      setCurrentPage('clients');
    } catch (err: any) {
      alert(err?.message || 'Erro ao adicionar pontos');
    }
  }, [loggedInEstablishment]);

  const sendVoucher = useCallback(async (clientId: string) => {
    const client = loggedInEstablishment?.clients.find(c => c.id === clientId);
    if (!client || !client.cartaoId) {
      alert('Cliente não encontrado ou sem cartão cadastrado');
      return;
    }
    try {
      const resp = await enviarVoucher({ cartaoId: Number(client.cartaoId) });
      if (resp?.cartao) {
        const atualizado = mapApiClientToLocal({
          id: resp.cartao.id,
          clienteId: resp.cartao.clienteId,
          name: resp.cartao.cliente.nome,
          phone: resp.cartao.cliente.telefone,
          points: resp.cartao.pontos,
          lastPointAddition: resp.cartao.movimentos?.[0]?.criadoEm
        });
        setLoggedInEstablishment(prev => prev ? {
          ...prev,
          clients: prev.clients.map(c => c.id === atualizado.id ? atualizado : c),
          totalVouchersSent: prev.totalVouchersSent + 1
        } : prev);
      }

      if (resp?.whatsapp) {
        const numeroLimpo = String(resp.whatsapp.numero || '').replace(/\D/g, '');
        const numero = numeroLimpo.startsWith('55') ? numeroLimpo : `55${numeroLimpo}`;
        const url = `https://wa.me/${numero}?text=${encodeURIComponent(resp.whatsapp.mensagem)}`;
        window.open(url, '_blank');
      }
    } catch (err: any) {
      alert(err?.message || 'Erro ao enviar voucher');
    }
  }, [loggedInEstablishment]);

  const handleLogoUpload = useCallback(async (file: File) => {
    try {
      const resp = await uploadLogo(file);
      const logo = resp?.estabelecimento?.logo_path ? `${API_BASE}${resp.estabelecimento.logo_path}` : DEFAULT_LOGO;
      setLoggedInEstablishment(prev => prev ? { ...prev, logoUrl: logo } : prev);
    } catch (err: any) {
      alert(err?.message || 'Não foi possível atualizar o logo');
    }
  }, []);

  const handleConfigUpdate = useCallback(async (data: { mensagem_voucher?: string; nome_app?: string; link_consulta?: string; pontos_para_voucher?: number }) => {
    try {
      const resp = await updateEstabelecimentoConfig(data);
      if (resp?.estabelecimento) {
        setLoggedInEstablishment(prev => prev ? {
          ...prev,
          voucherMessage: resp.estabelecimento.mensagem_voucher ?? prev.voucherMessage,
          pointsForVoucher: resp.estabelecimento.pontos_para_voucher ?? prev.pointsForVoucher,
          appDisplayName: resp.estabelecimento.nome_app ?? prev.appDisplayName,
          publicLink: resp.estabelecimento.link_consulta || prev.publicLink
        } : prev);
        if (resp.estabelecimento.link_consulta) {
          setPublicLink(resp.estabelecimento.link_consulta);
        }
      }
    } catch (err: any) {
      alert(err?.message || 'Erro ao salvar configurações');
    }
  }, []);

  const handleChangePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await changePassword({ senhaAtual: currentPassword, novaSenha: newPassword });
      alert('Senha alterada com sucesso!');
    } catch (err: any) {
      alert(err?.message || 'Erro ao trocar senha');
    }
  }, []);

  const handleBackupDownload = useCallback(async () => {
    try {
      const data = await downloadBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-estab-${loggedInEstablishment?.id || 'dados'}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message || 'Erro ao gerar backup');
    }
  }, [loggedInEstablishment]);

  const handleMensalidadeCheck = useCallback(async () => {
    await handlePaymentSuccess();
  }, [handlePaymentSuccess]);

  const handleSuperAdminLogin = useCallback(async (user: string, pass: string) => {
    if (user !== 'Dooug' || pass !== '525210') {
      alert('Credenciais de Super Admin inválidas!');
      return;
    }
    try {
      const [metrics, list] = await Promise.all([
        fetchOverview(),
        superAdminListEstablishments(SUPER_ADMIN_SECRET)
      ]);

      const mappedEstabs: Establishment[] = (list.estabelecimentos || []).map((est: any) => ({
        id: est.id,
        name: est.name,
        address: '',
        cpfCnpj: '',
        phone: est.phone || '',
        email: est.email || '',
        voucherMessage: est.voucherMessage || '',
        pointsForVoucher: est.pointsForVoucher || 10,
        paymentHistory: (est.paymentHistory || []).map((p: any) => ({ id: String(p.id), date: p.date })),
        logoUrl: est.logo_path ? `${API_BASE}${est.logo_path}` : DEFAULT_LOGO,
        clients: Array.from({ length: est.clientsCount || 0 }).map((_, idx) => ({
          id: `${est.id}-client-${idx}`,
          cartaoId: idx,
          clienteId: idx,
          name: '',
          phone: '',
          points: 0
        })),
        totalVouchersSent: est.vouchersEnviados || 0,
        username: '',
        passwordHash: '',
        slug: '',
        publicLink: '',
        appDisplayName: 'AppFidelidade'
      }));

      setSuperAdminMetrics(metrics);
      setEstablishments(mappedEstabs);
      setSuperAdminSecret(SUPER_ADMIN_SECRET);
      setCurrentView('superAdminApp');
    } catch (err: any) {
      alert(err?.message || 'Erro ao carregar dados do super admin');
    }
  }, []);

  const handleSuperAdminUpdate = useCallback(async (est: Establishment) => {
    if (!superAdminSecret) return;
    try {
      const resp = await superAdminUpdateEstablishment(superAdminSecret, est.id, {
        name: est.name,
        email: est.email,
        phone: est.phone,
        voucherMessage: est.voucherMessage,
        pointsForVoucher: est.pointsForVoucher
      });
      if (resp?.estabelecimento) {
        const updated = resp.estabelecimento;
        setEstablishments(prev => prev.map(item => item.id === updated.id ? {
          ...item,
          name: updated.name,
          email: updated.email,
          phone: updated.phone,
          voucherMessage: updated.voucherMessage,
          pointsForVoucher: updated.pointsForVoucher,
          paymentHistory: (updated.paymentHistory || []).map((p: any) => ({ id: String(p.id), date: p.date })),
        } : item));
      }
    } catch (err: any) {
      alert(err?.message || 'Erro ao atualizar estabelecimento');
    }
  }, [superAdminSecret]);

  const handleSuperAdminDelete = useCallback(async (id: number) => {
    if (!superAdminSecret) return;
    if (!window.confirm('Deseja realmente remover este estabelecimento?')) return;
    try {
      await superAdminDeleteEstablishment(superAdminSecret, id);
      setEstablishments(prev => prev.filter(est => est.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Erro ao remover estabelecimento');
    }
  }, [superAdminSecret]);

  const handleSuperAdminAddPayment = useCallback(async (id: number, date?: string) => {
    if (!superAdminSecret) return;
    try {
      const resp = await superAdminAddPayment(superAdminSecret, id, date);
      if (resp?.estabelecimento) {
        const updated = resp.estabelecimento;
        setEstablishments(prev => prev.map(item => item.id === updated.id ? {
          ...item,
          paymentHistory: (updated.paymentHistory || []).map((p: any) => ({ id: String(p.id), date: p.date })),
        } : item));
      }
    } catch (err: any) {
      alert(err?.message || 'Erro ao registrar pagamento');
    }
  }, [superAdminSecret]);

  const handleSuperAdminLogout = useCallback(() => {
    setCurrentView('chooser');
    setSuperAdminSecret(null);
    setSuperAdminMetrics(null);
    setEstablishments([]);
  }, []);

  const renderEstablishmentPage = () => {
    if (!loggedInEstablishment) return null;
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clients={loggedInEstablishment.clients} totalVouchersSent={loggedInEstablishment.totalVouchersSent} voucherThreshold={loggedInEstablishment.pointsForVoucher} />;
      case 'clients':
        return <ClientList clients={loggedInEstablishment.clients} onEdit={updateClient} onDelete={deleteClient} />;
      case 'addClient':
        return <AddClient onAddClient={addClient} />;
      case 'addPoints':
        return <AddPoints clients={loggedInEstablishment.clients} onAddPoints={addPointsToClient} />;
      case 'notifications':
        return <Notifications clients={loggedInEstablishment.clients} onSendVoucher={sendVoucher} voucherThreshold={loggedInEstablishment.pointsForVoucher} />;
      case 'settings':
        return (
          <Settings
            logoUrl={loggedInEstablishment.logoUrl}
            appName={loggedInEstablishment.appDisplayName || 'AppFidelidade'}
            voucherMessage={loggedInEstablishment.voucherMessage || ''}
            publicLink={publicLink}
            slug={publicSlug}
            onLogoUpload={handleLogoUpload}
            onConfigSave={handleConfigUpdate}
            onPasswordChange={handleChangePassword}
            onDownloadBackup={handleBackupDownload}
            onMensalidadeCheck={handleMensalidadeCheck}
            mensalidadeExpirada={mensalidadeExpirada}
            onLogout={handleLogout}
          />
        );
      case 'pointsLink':
        return (
          <PointsLink
            shareLink={publicLink}
            slug={publicSlug}
            logoUrl={loggedInEstablishment.logoUrl}
          />
        );
      default:
        return <Dashboard clients={loggedInEstablishment.clients} totalVouchersSent={loggedInEstablishment.totalVouchersSent} />;
    }
  };

  const renderSuperAdminPage = () => {
    switch (currentSuperAdminPage) {
      case 'superDashboard':
        return <SuperAdminDashboard establishments={establishments} metrics={superAdminMetrics} />;
      case 'manageEstablishments':
        return (
          <SuperAdminEstablishments
            establishments={establishments}
            onUpdate={handleSuperAdminUpdate}
            onDelete={handleSuperAdminDelete}
            onAddPayment={handleSuperAdminAddPayment}
          />
        );
      case 'themeSettings':
        return <SuperAdminThemeSettings currentTheme={theme} onThemeChange={setTheme} />;
      default:
        return <SuperAdminDashboard establishments={establishments} metrics={superAdminMetrics} />;
    }
  };

  if (isPublicConsultaPage) {
    return <TelaPontosPublica />;
  }

  if (showPaymentPage) {
    return <PaymentPage onPaymentSuccess={handlePaymentSuccess} loading={loadingSnapshot} />;
  }

  switch (currentView) {
    case 'chooser':
      return <ChooserPage onSelectRole={(role) => setCurrentView(role === 'establishment' ? 'establishmentAuth' : 'superAdminAuth')} />;
    case 'establishmentAuth':
      if (authPage === 'register') {
        return <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setAuthPage('login')} />;
      }
      return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setAuthPage('register')} onNavigateToChooser={() => setCurrentView('chooser')} loading={loadingSnapshot} />;
    case 'superAdminAuth':
      return <SuperAdminLoginPage onLogin={handleSuperAdminLogin} onNavigateToChooser={() => setCurrentView('chooser')} />;
    case 'establishmentApp':
      if (!loggedInEstablishment) {
        return <PaymentPage onPaymentSuccess={handlePaymentSuccess} loading={loadingSnapshot} />;
      }
      return (
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout}>
          {renderEstablishmentPage()}
        </Layout>
      );
    case 'superAdminApp':
      return (
        <SuperAdminLayout currentPage={currentSuperAdminPage} setCurrentPage={setCurrentSuperAdminPage} onLogout={handleSuperAdminLogout}>
          {renderSuperAdminPage()}
        </SuperAdminLayout>
      );
    default:
      return <ChooserPage onSelectRole={(role) => setCurrentView(role === 'establishment' ? 'establishmentAuth' : 'superAdminAuth')} />;
  }
};

export default App;
