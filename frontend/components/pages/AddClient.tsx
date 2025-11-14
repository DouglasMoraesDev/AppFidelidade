import React, { useState } from 'react';
import { Client } from '../../types';

interface AddClientProps {
  onAddClient: (client: Omit<Client, 'id'>) => void;
}

const AddClient: React.FC<AddClientProps> = ({ onAddClient }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [points, setPoints] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Nome e telefone são obrigatórios.');
      return;
    }
    setError('');
    onAddClient({ name, phone, points });
    setName('');
    setPhone('');
    setPoints(0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-2">Cadastrar Novo Cliente</h1>
        <p className="text-on-surface-secondary">Preencha os dados para adicionar um cliente.</p>
      </div>
      <div className="max-w-lg mx-auto bg-surface p-8 rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-on-surface-secondary mb-1">Nome *</label>
            <input
              id="name"
              type="text"
              className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-on-surface-secondary mb-1">Número (Telefone) *</label>
            <input
              id="phone"
              type="tel"
              className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="points" className="block text-sm font-medium text-on-surface-secondary mb-1">Pontos Iniciais</label>
            <input
              id="points"
              type="number"
              className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-primary focus:outline-none transition"
              value={points}
              onChange={e => setPoints(parseInt(e.target.value, 10) || 0)}
              min="0"
            />
          </div>
           {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all duration-300"
          >
            Cadastrar Cliente
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddClient;