export interface Client {
  id: string; // cartaoId em string para compatibilidade
  cartaoId: number;
  clienteId: number;
  name: string;
  phone: string;
  points: number;
  lastPointAddition?: string | Date | null;
  lastVoucherSent?: string | Date | null;
}

export type Page = 'dashboard' | 'addClient' | 'addPoints' | 'clients' | 'notifications' | 'settings' | 'pointsLink';
export type SuperAdminPage = 'superDashboard' | 'manageEstablishments' | 'themeSettings';

export interface Theme {
  primary: string;
  primaryFocus: string;
  secondary: string;
  background: string;
  surface: string;
  fontFamily: string;
}

export interface Payment {
  id: string;
  date: string; // ISO date string
}

export interface Establishment {
  id: number;
  name: string;
  address?: string;
  cpfCnpj?: string;
  phone?: string;
  email?: string;
  voucherMessage?: string;
  pointsForVoucher: number;
  paymentHistory: Payment[];
  logoUrl: string;
  clients: Client[];
  totalVouchersSent: number;
  // Auth fields
  username: string;
  passwordHash: string;
  slug?: string;
  publicLink?: string;
  appDisplayName?: string;
  lastPaymentDate?: string | null;
  temaConfig?: Theme | null;
  autoNotificarVoucher?: boolean;
  lembretePontosProximos?: boolean;
}
