
import React, { useState, useMemo } from 'react';
import { Client } from '../../types';
import { PlusIcon, UserCircleIcon } from '../icons/Icons';


interface AddPointsProps {
  clients: Client[];
  onAddPoints: (clientId: string, points: number) => void;
  voucherThreshold?: number;
}

const AddPoints: React.FC<AddPointsProps> = ({ clients, onAddPoints, voucherThreshold = 10 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [pointsToAdd, setPointsToAdd] = useState(1);

  const filteredClients = useMemo(() => {
    if (!searchTerm) return [];
    return clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    ).slice(0, 5); // Limit results to 5
  }, [clients, searchTerm]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setSearchTerm('');
  };

  const handleAddPoints = () => {
    if (!selectedClient) return;
    if (pointsToAdd <= 0) {
      alert('Pontos deve ser maior que zero');
      return;
    }
    onAddPoints(selectedClient.id, pointsToAdd);
    setSelectedClient(null);
    setPointsToAdd(1);
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Adicionar Pontos</h1>
        <p className="text-on-surface-secondary">Pesquise por um cliente para creditar pontos.</p>
      </div>

      <div className="w-full px-4 sm:max-w-lg mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Pesquisar por nome ou telefone..."
            className="w-full bg-surface text-on-surface p-3 pr-10 rounded-lg shadow-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && filteredClients.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-surface rounded-md shadow-lg border border-slate-600">
              {filteredClients.map(client => (
                <li key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-white">
                  {client.name} - {client.phone}
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedClient && (
          <div className="mt-8 bg-surface p-4 sm:p-6 rounded-lg shadow-lg text-center animate-fade-in mx-0 sm:mx-auto">
            <UserCircleIcon className="w-20 h-20 mx-auto text-on-surface-secondary mb-4" />
            <h2 className="text-2xl font-bold">{selectedClient.name}</h2>
            <p className="text-on-surface-secondary">Pontos atuais: {selectedClient.points} / {voucherThreshold}</p>
            
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <label htmlFor="points" className="font-medium">Pontos a adicionar:</label>
              <input
                id="points"
                type="number"
                min="1"
                max={voucherThreshold - selectedClient.points}
                className="w-full sm:w-24 max-w-xs bg-background text-on-surface p-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none text-center"
                value={pointsToAdd}
                onChange={e => {
                  const val = Math.max(1, parseInt(e.target.value) || 1);
                  const maxAddable = voucherThreshold - selectedClient.points;
                  setPointsToAdd(Math.min(val, maxAddable));
                }}
              />
            </div>

            <button
              onClick={handleAddPoints}
              disabled={selectedClient.points >= voucherThreshold}
              className={`mt-6 w-full flex items-center justify-center gap-2 ${selectedClient.points >= voucherThreshold ? 'bg-slate-700 text-on-surface-secondary cursor-not-allowed' : 'bg-primary text-white hover:bg-primary-focus'} font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors`}
            >
              <PlusIcon className="w-5 h-5"/>
              {selectedClient.points >= voucherThreshold ? 'Limite atingido' : `Adicionar ${pointsToAdd} Ponto(s)`}
            </button>
            {selectedClient.points >= voucherThreshold && (
              <p className="text-sm text-red-400 mt-2">Cliente já atingiu o limite de pontos para voucher ({voucherThreshold}). Envie o voucher antes de adicionar mais pontos.</p>
            )}
             <button
              onClick={() => setSelectedClient(null)}
              className="mt-2 w-full text-sm text-on-surface-secondary hover:text-on-surface"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPoints;
