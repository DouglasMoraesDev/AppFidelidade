import React, { useMemo, useState } from 'react';
import { buscarClientesPublico } from '../utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

interface Cartao {
  id: number;
  codigo: string;
  pontos: number;
  estabelecimento: {
    nome: string;
    logo_path?: string;
    id: number;
  };
}

const TelaPontosPublica: React.FC = () => {
  const defaultSlug = useMemo(() => {
    if (typeof window === 'undefined') return '';
    // Tenta pegar o slug da query string primeiro
    const params = new URLSearchParams(window.location.search);
    const slugFromQuery = params.get('slug');
    if (slugFromQuery) return slugFromQuery;
    
    // Se não tiver na query, tenta pegar do path (formato /consulta/{slug})
    const path = window.location.pathname;
    const match = path.match(/\/consulta\/([^\/]+)/);
    if (match && match[1]) return match[1];
    
    return '';
  }, []);

  const [slug, setSlug] = useState(defaultSlug);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [resultado, setResultado] = useState<any | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) {
      setErro('Link do estabelecimento inválido. Solicite o QR Code novamente.');
      return;
    }
    setErro('');
    setResultado(null);
    setLoading(true);
    try {
      const res = await buscarClientesPublico({
        nome: nome.trim(),
        telefone: telefone.trim(),
        slug
      });
      setResultado(res);
    } catch (err: any) {
      setErro(err?.message || 'Cliente não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const Stamp: React.FC<{ filled: boolean; logo?: string }> = ({ filled, logo }) => (
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed flex items-center justify-center ${filled ? 'border-primary bg-primary/10' : 'border-slate-500'}`}>
      {filled && logo && <img src={logo} alt="Carimbo" className="w-8 h-8 object-cover rounded-full" />}
    </div>
  );

  const ShareHeader = () => (
    <div className="mb-6 text-center">
      <h1 className="text-3xl font-bold text-on-surface">Consulta de Pontos</h1>
      <p className="mt-2 text-on-surface-secondary">Informe seus dados para ver seu cartão fidelidade e acompanhar seus carimbos.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-surface px-4 py-10 flex items-start justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <ShareHeader />

        <form onSubmit={handleBuscar} className="bg-surface p-6 rounded-lg shadow-lg space-y-4">
          {!defaultSlug && (
            <div>
              <label className="block text-sm font-medium text-on-surface-secondary mb-1">Slug do estabelecimento</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-700 focus:ring-2 focus:ring-primary" required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-on-surface-secondary mb-1">Seu nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-700 focus:ring-2 focus:ring-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-secondary mb-1">Telefone</label>
            <input value={telefone} onChange={(e) => setTelefone(e.target.value)} className="w-full bg-background text-on-surface p-3 rounded-md border border-slate-700 focus:ring-2 focus:ring-primary" required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-primary text-white font-semibold py-3 rounded-md hover:bg-primary-focus transition disabled:opacity-60">
            {loading ? 'Buscando...' : 'Consultar pontos'}
          </button>
          {erro && <p className="text-center text-red-400 text-sm">{erro}</p>}
        </form>

        {resultado && (
          <div className="bg-surface p-6 rounded-lg shadow-lg space-y-4">
            <div>
              <p className="text-sm text-on-surface-secondary">Cliente</p>
              <h2 className="text-2xl font-bold">{resultado.nome}</h2>
            </div>
            <div className="grid gap-6">
              {(resultado.cartoes || []).map((cartao: Cartao) => {
                const rawLogo = cartao.estabelecimento?.logo_path || resultado.estabelecimento?.logo;
                const logo = rawLogo ? (rawLogo.startsWith('http') ? rawLogo : `${API_BASE}${rawLogo}`) : undefined;
                const pontosParaVoucher = resultado.estabelecimento?.pontos_para_voucher || 10;
                const totalStamps = Math.max(pontosParaVoucher, cartao.pontos, 10);
                return (
                  <div key={cartao.id} className="border border-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-on-surface-secondary">Estabelecimento</p>
                        <p className="text-lg font-semibold">{resultado.estabelecimento?.nome || cartao.estabelecimento?.nome}</p>
                      </div>
                      {logo && <img src={logo} alt="Logo" className="w-12 h-12 rounded-full object-cover border border-slate-600" />}
                    </div>
                    <p className="text-on-surface-secondary">Você possui <span className="font-bold text-primary">{cartao.pontos}</span> pontos.</p>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 justify-items-center">
                      {Array.from({ length: totalStamps }).map((_, idx) => (
                        <Stamp key={idx} filled={idx < cartao.pontos} logo={logo} />
                      ))}
                    </div>
                    <p className="text-xs text-on-surface-secondary">Ao atingir {pontosParaVoucher} pontos você desbloqueia um voucher.</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TelaPontosPublica;
