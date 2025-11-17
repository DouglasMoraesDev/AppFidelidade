
import React from 'react';
import { Client } from '../../types';
import { UsersIcon, GiftIcon, ClockIcon } from '../icons/Icons';

interface DashboardProps {
  clients: Client[];
  totalVouchersSent: number;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-surface p-6 rounded-lg shadow-lg flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-on-surface-secondary">{title}</p>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
    </div>
  </div>
);

interface DashboardProps {
  clients: Client[];
  totalVouchersSent: number;
  voucherThreshold: number;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, totalVouchersSent, voucherThreshold }) => {
  const recentPointAdditions = clients
    .filter(c => c.lastPointAddition && (new Date().getTime() - new Date(c.lastPointAddition).getTime()) < 24 * 60 * 60 * 1000)
    .sort((a, b) => new Date(b.lastPointAddition!).getTime() - new Date(a.lastPointAddition!).getTime());

  const clientesComVoucher = clients.filter(c => c.points >= voucherThreshold);
  const clienteTopVoucher = clientesComVoucher.length > 0 
    ? clientesComVoucher.reduce((max, c) => c.points > max.points ? c : max, clientesComVoucher[0])
    : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Resumo</h1>
        <p className="text-on-surface-secondary">Bem-vindo ao seu painel de controle.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<UsersIcon className="h-6 w-6 text-white"/>} title="Total de Clientes" value={clients.length} color="bg-blue-500" />
        <StatCard icon={<GiftIcon className="h-6 w-6 text-white"/>} title="Vouchers Enviados" value={totalVouchersSent} color="bg-green-500" />
        <StatCard icon={<ClockIcon className="h-6 w-6 text-white"/>} title="Atividade (24h)" value={recentPointAdditions.length} color="bg-yellow-500" />
      </div>

      {clienteTopVoucher && (
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 border-2 border-primary rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-on-surface mb-2">🏆 Cliente Destaque</h2>
              <p className="text-lg font-semibold text-on-surface">{clienteTopVoucher.name}</p>
              <p className="text-sm text-on-surface-secondary">{clienteTopVoucher.phone}</p>
              <p className="text-2xl font-bold text-primary mt-2">{clienteTopVoucher.points} pontos</p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold">
                Voucher Disponível! 🎁
              </span>
            </div>
            <GiftIcon className="h-16 w-16 text-primary opacity-50" />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-on-surface mb-4">Pontos Adicionados Recentemente</h2>
        <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
          {recentPointAdditions.length > 0 ? (
            <ul className="divide-y divide-background">
              {recentPointAdditions.map(client => (
                <li key={client.id} className="p-4 flex justify-between items-center hover:bg-background/50">
                  <div>
                    <p className="font-semibold text-on-surface">{client.name}</p>
                    <p className="text-sm text-on-surface-secondary">{client.phone}</p>
                  </div>
                  <span className="text-sm text-on-surface-secondary">
                    {new Date(client.lastPointAddition!).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-center text-on-surface-secondary">Nenhuma atividade nas últimas 24 horas.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
