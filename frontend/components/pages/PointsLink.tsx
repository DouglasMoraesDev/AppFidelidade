
import React, { useState } from 'react';
import { Client } from '../../types';
import { SearchIcon } from '../icons/Icons';

interface PointsLinkProps {
  clients: Client[];
  logoUrl: string;
  voucherThreshold: number;
}

const PointsLink: React.FC<PointsLinkProps> = ({ clients, logoUrl, voucherThreshold }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [searchedClient, setSearchedClient] = useState<Client | null | undefined>(undefined); // undefined: not searched, null: not found

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const foundClient = clients.find(c => 
      c.name.trim().toLowerCase() === name.trim().toLowerCase() && 
      c.phone.trim() === phone.trim()
    );
    setSearchedClient(foundClient || null);
  };

  const Stamp = ({ filled }: { filled: boolean }) => (
    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-300 ${filled ? 'bg-primary/20 border-primary' : 'border-slate-500'}`}>
      {filled && <img src={logoUrl} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 opacity-80" />}
    </div>
  );
  
  const totalStamps = Math.max(voucherThreshold, searchedClient?.points || 0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Consulte Seus Pontos</h1>
        <p className="text-on-surface-secondary">Informe seu nome e número para ver seu cartão fidelidade.</p>
      </div>

      <div className="max-w-md mx-auto bg-surface p-8 rounded-lg shadow-lg">
        {searchedClient === undefined && (
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-on-surface-secondary mb-1">Seu Nome</label>
              <input
                id="customer-name"
                type="text"
                className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-on-surface-secondary mb-1">Seu Número (Telefone)</label>
              <input
                id="customer-phone"
                type="tel"
                className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300"
            >
              <SearchIcon className="w-5 h-5" />
              Buscar
            </button>
          </form>
        )}

        {searchedClient && (
          <div className="text-center animate-fade-in">
            <h2 className="text-2xl font-bold text-on-surface mb-2">{searchedClient.name}</h2>
            <p className="text-on-surface-secondary mb-6">Você tem <span className="font-bold text-primary text-xl">{searchedClient.points}</span> pontos!</p>
            
            <div className="bg-background/50 p-4 sm:p-6 rounded-lg">
              <h3 className="font-semibold mb-4">Seu Cartão Fidelidade</h3>
              <div className="grid grid-cols-5 gap-2 sm:gap-4 justify-items-center">
                {Array.from({ length: totalStamps }).map((_, i) => (
                  <Stamp key={i} filled={i < searchedClient.points} />
                ))}
              </div>
              <p className="text-xs text-on-surface-secondary mt-4">Junte {voucherThreshold} pontos para ganhar um brinde!</p>
            </div>

            <button
              onClick={() => setSearchedClient(undefined)}
              className="mt-6 w-full text-sm text-on-surface-secondary hover:text-on-surface"
            >
              Buscar outro cliente
            </button>
          </div>
        )}

        {searchedClient === null && (
          <div className="text-center animate-fade-in">
            <p className="text-red-400 font-semibold">Cliente não encontrado.</p>
            <p className="text-on-surface-secondary mt-2">Por favor, verifique os dados e tente novamente.</p>
            <button
              onClick={() => setSearchedClient(undefined)}
              className="mt-6 w-full text-sm text-primary hover:underline"
            >
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsLink;