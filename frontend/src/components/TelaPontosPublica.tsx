import React, { useState } from 'react';
import { buscarPontosPublico } from '../utils/api';

export default function TelaPontosPublica() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [estabId, setEstabId] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  const buscar = async () => {
    setErro('');
    const res = await buscarPontosPublico(nome, telefone, estabId);
    if (res.error) setErro(res.error);
    else setResultado(res);
  };

  return (
    <div>
      <h2>Consultar Pontos</h2>
      <input placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
      <input placeholder="Telefone" value={telefone} onChange={e=>setTelefone(e.target.value)} />
      <input placeholder="Estabelecimento ID (opcional)" value={estabId} onChange={e=>setEstabId(e.target.value)} />
      <button onClick={buscar}>Buscar</button>

      {erro && <div style={{color:'red'}}>{erro}</div>}
      {resultado && (
        <div>
          <h3>Cliente: {resultado.nome}</h3>
          <div>
            {resultado.cartoes && resultado.cartoes.map(c => (
              <div key={c.id} style={{border:'1px solid #ccc', padding:8, margin:8}}>
                <div>Cartão: {c.codigo}</div>
                <div>Pontos: {c.pontos}</div>
                <div>Estabelecimento: {c.estabelecimento && resultado.cartoes.length && c.estabelecimento.nome}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
