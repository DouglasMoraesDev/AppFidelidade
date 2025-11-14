// frontend/src/App.tsx
import React, { useState, useCallback, useEffect } from 'react';
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

import { login as apiLogin } from './utils/api';

const getLatestPaymentDate = (paymentHistory: Payment[]): Date | null => {
  if (!paymentHistory || paymentHistory.length === 0) return null;
  const sortedHistory = [...paymentHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return new Date(sortedHistory[0].date);
};

const STORAGE_KEY = 'establishments_v1';

const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [establishments, setEstablishments] = useState<Establishment[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Establishment[];
      return [];
    } catch (err) {
      console.warn('Erro ao ler establishments do localStorage', err);
      return [];
    }
  });

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

  // Authentication & View State
  const [currentView, setCurrentView] = useState<'chooser' | 'establishmentAuth' | 'superAdminAuth' | 'establishmentApp' | 'superAdminApp'>('chooser');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [loggedInEstablishment, setLoggedInEstablishment] = useState<Establishment | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPaymentPage, setShowPaymentPage] = useState(false);

  // Apply theme changes to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-primary-focus', theme.primaryFocus);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-surface', theme.surface);
    root.style.setProperty('--font-family', theme.fontFamily);
  }, [theme]);

  // persist establishments to localStorage whenever mudarem
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(establishments));
    } catch (err) {
      console.warn('Erro ao salvar establishments no localStorage', err);
    }
  }, [establishments]);

  // --- SUPER ADMIN LOGIC ---
  const handleSuperAdminLogin = (user: string, pass: string) => {
    if (user === 'Dooug' && pass === '525210') {
      setIsSuperAdmin(true);
      setCurrentView('superAdminApp');
    } else {
      alert('Credenciais de Super Admin inválidas!');
    }
  };

  const updateEstablishmentFromAdmin = (updatedEstablishment: Establishment) => {
    setEstablishments(prev => prev.map(e => e.id === updatedEstablishment.id ? updatedEstablishment : e));
  };

  const deleteEstablishmentFromAdmin = (establishmentId: number) => {
    setEstablishments(prev => prev.filter(e => e.id !== establishmentId));
  };

  const handleSuperAdminLogout = () => {
    setIsSuperAdmin(false);
    setCurrentView('chooser');
  };

  // --- ESTABLISHMENT AUTH LOGIC ---
  const handleRegister = useCallback((newEstablishmentData: Omit<Establishment, 'id' | 'clients' | 'totalVouchersSent' | 'logoUrl' | 'paymentHistory'> & { lastPaymentDate: string }) => {
    const { lastPaymentDate, ...rest } = newEstablishmentData;
    const newEstablishment: Establishment = {
      ...rest,
      id: Date.now(),
      clients: [],
      totalVouchersSent: 0,
      logoUrl: (rest as any).logoUrl || 'https://tailwindui.com/img/logos/mark.svg?color=teal&shade=500',
      paymentHistory: [{ id: Date.now().toString(), date: new Date(lastPaymentDate).toISOString() }],
    };
    setEstablishments(prev => [...prev, newEstablishment]);

    const token = localStorage.getItem('token');
    if (token) {
      setLoggedInEstablishment(newEstablishment);
      setCurrentView('establishmentApp');
    } else {
      setAuthPage('login');
      setCurrentView('establishmentAuth');
    }
  }, []);

  const handleLogin = useCallback(async (username: string, passwordHash: string) => {
    // tenta logar via backend primeiro
    try {
      const resp = await apiLogin(username, passwordHash);
      if (resp && resp.token) {
        localStorage.setItem('token', resp.token);

        const found = establishments.find(e => e.username === username);
        if (found) {
          setLoggedInEstablishment(found);
          setCurrentView('establishmentApp');
          return;
        }

        const placeholder: Establishment = {
          id: Date.now(),
          name: username,
          address: '',
          cpfCnpj: '',
          phone: '',
          email: '',
          voucherMessage: '',
          pointsForVoucher: 10,
          paymentHistory: [],
          logoUrl: 'https://tailwindui.com/img/logos/mark.svg?color=teal&shade=500',
          clients: [],
          totalVouchersSent: 0,
          username,
          passwordHash
        };
        setEstablishments(prev => [...prev, placeholder]);
        setLoggedInEstablishment(placeholder);
        setCurrentView('establishmentApp');
        return;
      }
    } catch (err) {
      console.warn('Falha no login via API, tentando fallback local:', err);
    }

    const foundLocal = establishments.find(e => e.username === username && e.passwordHash === passwordHash);
    if (foundLocal) {
      setLoggedInEstablishment(foundLocal);
      setCurrentView('establishmentApp');
    } else {
      alert('Usuário ou senha inválidos!');
    }
  }, [establishments]);

  const handlePaymentSuccess = useCallback(() => {
    if (loggedInEstablishment) {
      const newPayment: Payment = { id: Date.now().toString(), date: new Date().toISOString() };
      const updatedEstablishment = {
        ...loggedInEstablishment,
        paymentHistory: [...loggedInEstablishment.paymentHistory, newPayment]
      };
      setEstablishments(prev => prev.map(e => e.id === updatedEstablishment.id ? updatedEstablishment : e));
      setLoggedInEstablishment(updatedEstablishment);
      setShowPaymentPage(false);
      setCurrentView('establishmentApp');
    }
  }, [loggedInEstablishment]);

  const handleLogout = useCallback(() => {
    setLoggedInEstablishment(null);
    setCurrentView('chooser');
    setCurrentPage('dashboard');
    localStorage.removeItem('token');
  }, []);

  // --- CLIENT & BUSINESS LOGIC (scoped to logged-in establishment) ---
  const updateLoggedInEstablishment = (updater: (e: Establishment) => Establishment) => {
    if (!loggedInEstablishment) return;
    const updated = updater(loggedInEstablishment);
    setLoggedInEstablishment(updated);
    setEstablishments(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const addClient = useCallback((client: Omit<Client, 'id'>) => {
    updateLoggedInEstablishment(e => ({ ...e, clients: [...e.clients, { ...client, id: Date.now().toString() }] }));
    setCurrentPage('clients');
  }, [loggedInEstablishment]);

  const updateClient = useCallback((updatedClient: Client) => {
    updateLoggedInEstablishment(e => ({ ...e, clients: e.clients.map(c => c.id === updatedClient.id ? updatedClient : c) }));
    setCurrentPage('clients');
  }, [loggedInEstablishment]);

  const deleteClient = useCallback((clientId: string) => {
    updateLoggedInEstablishment(e => ({ ...e, clients: e.clients.filter(c => c.id !== clientId) }));
  }, [loggedInEstablishment]);

  const addPointsToClient = useCallback((clientId: string, pointsToAdd: number) => {
    updateLoggedInEstablishment(e => ({ ...e, clients: e.clients.map(c =>
      c.id === clientId
        ? { ...c, points: c.points + pointsToAdd, lastPointAddition: new Date() }
        : c
    ) }));
    setCurrentPage('clients');
  }, [loggedInEstablishment]);

  const sendVoucher = useCallback((clientId: string) => {
    if (!loggedInEstablishment) return;
    const client = loggedInEstablishment.clients.find(c => c.id === clientId);
    if (!client) return;

    updateLoggedInEstablishment(e => ({
      ...e,
      clients: e.clients.map(c =>
        c.id === clientId
          ? { ...c, points: c.points - e.pointsForVoucher }
          : c
      ),
      totalVouchersSent: e.totalVouchersSent + 1
    }));

    const messageTemplate = loggedInEstablishment.voucherMessage || "Parabéns, {cliente}! Você resgatou um voucher!";
    const message = messageTemplate.replace('{cliente}', client.name);

    alert(`Voucher enviado para ${client.name}!\n\nMensagem: "${message}"`);
  }, [loggedInEstablishment]);

  const handleLogoUrlChange = useCallback((newUrl: string) => {
    updateLoggedInEstablishment(e => ({ ...e, logoUrl: newUrl }));
  }, [loggedInEstablishment]);

  // --- PAGE RENDERING ---
  const renderEstablishmentPage = () => {
    if (!loggedInEstablishment) return null;
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard clients={loggedInEstablishment.clients} totalVouchersSent={loggedInEstablishment.totalVouchersSent} />;
      case 'clients':
        return <ClientList clients={loggedInEstablishment.clients} onEdit={updateClient} onDelete={deleteClient} />;
      case 'addClient':
        return <AddClient onAddClient={addClient} />;
      case 'addPoints':
        return <AddPoints clients={loggedInEstablishment.clients} onAddPoints={addPointsToClient} />;
      case 'notifications':
        return <Notifications clients={loggedInEstablishment.clients} onSendVoucher={sendVoucher} voucherThreshold={loggedInEstablishment.pointsForVoucher} />;
      case 'settings':
        return <Settings logoUrl={loggedInEstablishment.logoUrl} onLogoUrlChange={handleLogoUrlChange} onLogout={handleLogout} />;
      case 'pointsLink':
        return <PointsLink clients={loggedInEstablishment.clients} logoUrl={loggedInEstablishment.logoUrl} voucherThreshold={loggedInEstablishment.pointsForVoucher} />;
      default:
        return <Dashboard clients={loggedInEstablishment.clients} totalVouchersSent={loggedInEstablishment.totalVouchersSent} />;
    }
  };

  const renderSuperAdminPage = () => {
    switch (currentSuperAdminPage) {
      case 'superDashboard':
        return <SuperAdminDashboard establishments={establishments} />;
      case 'manageEstablishments':
        return <SuperAdminEstablishments establishments={establishments} onUpdate={updateEstablishmentFromAdmin} onDelete={deleteEstablishmentFromAdmin} />;
      case 'themeSettings':
        return <SuperAdminThemeSettings currentTheme={theme} onThemeChange={setTheme} />;
      default:
        return <SuperAdminDashboard establishments={establishments} />;
    }
  };

  // --- MAIN RENDER ---
  if (showPaymentPage) return <PaymentPage onPaymentSuccess={handlePaymentSuccess} />;

  switch (currentView) {
    case 'chooser':
      return <ChooserPage onSelectRole={(role) => setCurrentView(role === 'establishment' ? 'establishmentAuth' : 'superAdminAuth')} />;
    case 'establishmentAuth':
      if (authPage === 'register') {
        return <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setAuthPage('login')} />;
      }
      return <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setAuthPage('register')} onNavigateToChooser={() => setCurrentView('chooser')} />;
    case 'superAdminAuth':
      return <SuperAdminLoginPage onLogin={handleSuperAdminLogin} onNavigateToChooser={() => setCurrentView('chooser')} />;
    case 'establishmentApp':
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
