import React from 'react';
import { Establishment } from '../../types';
import { UsersIcon, GiftIcon, BuildingOfficeIcon } from '../icons/Icons';

interface SuperAdminDashboardProps {
  establishments: Establishment[];
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

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ establishments }) => {
    const totalClients = establishments.reduce((acc, curr) => acc + curr.clients.length, 0);
    const totalVouchers = establishments.reduce((acc, curr) => acc + curr.totalVouchersSent, 0);
    const recentEstablishments = [...establishments].sort((a, b) => b.id - a.id).slice(0, 5);


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Dashboard Super Admin</h1>
        <p className="text-on-surface-secondary">Visão geral da sua plataforma.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={<BuildingOfficeIcon className="h-6 w-6 text-white"/>} title="Total de Estabelecimentos" value={establishments.length} color="bg-blue-500" />
        <StatCard icon={<UsersIcon className="h-6 w-6 text-white"/>} title="Total de Clientes Finais" value={totalClients} color="bg-green-500" />
        <StatCard icon={<GiftIcon className="h-6 w-6 text-white"/>} title="Total de Vouchers Enviados" value={totalVouchers} color="bg-yellow-500" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-on-surface mb-4">Estabelecimentos Recém-Cadastrados</h2>
        <div className="bg-surface rounded-lg shadow-lg overflow-hidden">
          {recentEstablishments.length > 0 ? (
            <ul className="divide-y divide-background">
              {recentEstablishments.map(est => (
                <li key={est.id} className="p-4 flex justify-between items-center hover:bg-background/50">
                  <div>
                    <p className="font-semibold text-on-surface">{est.name}</p>
                    <p className="text-sm text-on-surface-secondary">{est.email}</p>
                  </div>
                  <span className="text-sm text-on-surface-secondary">
                    {new Date(est.id).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-6 text-center text-on-surface-secondary">Nenhum estabelecimento cadastrado ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;