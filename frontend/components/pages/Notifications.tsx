import React from 'react';
import { Client } from '../../types';
import { GiftIcon, CheckCircleIcon } from '../icons/Icons';

interface NotificationsProps {
  clients: Client[];
  onSendVoucher: (clientId: string) => void;
  voucherThreshold: number;
}

const Notifications: React.FC<NotificationsProps> = ({ clients, onSendVoucher, voucherThreshold }) => {
  const eligibleClients = clients.filter(client => client.points >= voucherThreshold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Notificações</h1>
        <p className="text-on-surface-secondary">Clientes elegíveis para resgatar brindes (&gt;= {voucherThreshold} pontos).</p>
      </div>

      <div className="bg-surface rounded-lg shadow-lg">
        {eligibleClients.length > 0 ? (
          <ul className="divide-y divide-background">
            {eligibleClients.map(client => (
              <li key={client.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-background/30">
                <div className="flex items-center gap-4">
                  <div className="bg-secondary p-2 rounded-full">
                    <GiftIcon className="h-6 w-6 text-white"/>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{client.name}</p>
                    <p className="text-sm text-on-surface-secondary">Pontos: <span className="font-bold">{client.points}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => onSendVoucher(client.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-white font-bold py-2 px-4 rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-secondary transition-colors"
                >
                  Enviar Voucher
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-10 flex flex-col items-center justify-center text-center">
             <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4"/>
            <p className="text-lg text-on-surface-secondary">Nenhum cliente elegível no momento.</p>
             <p className="text-sm text-on-surface-secondary">Tudo em dia!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
