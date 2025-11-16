// frontend/src/components/TelaPontosPublica.tsx
import React, { useState } from 'react';
import { buscarClientes } from '../utils/api';

export default function TelaPontosPublica() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [estabId, setEstabId] = useState(''); // se quiser usar, verá nota abaixo
  const [resultado, setResultado] = useState<any | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    setErro('');
    setResultado(null);
    setLoading(true);
    try {
      // buscarClientes aceita um objeto { nome?, telefone? }
      const res = await buscarClientes({ nome: nome.trim(), telefone: telefone.trim() });

      // Caso você precise filtrar por estabId (se o backend suportar),
      // e a função buscarClientes não aceite estabId, você poderia filtrar
      // localmente aqui. Por enquanto assumimos que o endpoint já filtra.
      if (!res) {
        setErro('Resposta vazia do servidor');
      } else if ((res as any).error) {
        setErro((res as any).error);
      } else {
        setResultado(res);
      }
    } catch (err: any) {
      setErro(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Consultar Pontos</h2>

      <div className="mb-3">
        <input
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          className="w-full p-2 rounded border mb-2"
        />
        <input
          placeholder="Telefone"
          value={telefone}
          onChange={e => setTelefone(e.target.value)}
          className="w-full p-2 rounded border mb-2"
        />
        <input
          placeholder="Estabelecimento ID (opcional)"
          value={estabId}
          onChange={e => setEstabId(e.target.value)}
          className="w-full p-2 rounded border mb-2"
        />
        <button
          onClick={buscar}
          className="px-4 py-2 bg-primary text-white rounded"
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {erro && <div style={{ color: 'red' }} className="mb-4">{erro}</div>}

      {resultado && (
        <div className="mt-4">
          {/* Estrutura esperada: { nome, cartoes: [ {id, codigo, pontos, estabelecimento} ] } */}
          <h3 className="text-lg font-semibold">Cliente: {resultado.nome ?? '—'}</h3>

          <div className="mt-3 space-y-3">
            {Array.isArray(resultado.cartoes) && resultado.cartoes.length > 0 ? (
              resultado.cartoes.map((c: any) => (
                <div key={c.id ?? c.codigo} className="p-3 border rounded">
                  <div><strong>Cartão:</strong> {c.codigo}</div>
                  <div><strong>Pontos:</strong> {c.pontos}</div>
                  <div>
                    <strong>Estabelecimento:</strong>{' '}
                    {c.estabelecimento ? c.estabelecimento.nome : (resultado.cartoes.length ? c.estabelecimento?.nome ?? '—' : '—')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-on-surface-secondary">Nenhum cartão encontrado para esses dados.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
