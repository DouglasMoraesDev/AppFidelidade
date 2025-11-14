// frontend/src/components/CadastroEstabelecimento.tsx
import React, { useState } from 'react';
import { postEstabelecimento } from '../utils/api';

export default function CadastroEstabelecimento() {
  const [form, setForm] = useState({
    nome: '',
    endereco: '',
    cpf_cnpj: '',
    telefone: '',
    email: '',
    mensagem_voucher: '',
    nomeUsuario: '',
    senha: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length) {
      setLogoFile(e.target.files[0]);
    } else {
      setLogoFile(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      if (logoFile) fd.append('logo', logoFile);

      // postEstabelecimento retorna json ou lança erro (conforme utils/api.ts)
      const res = await postEstabelecimento(fd);
      console.log('Resposta do backend:', res);
      setStatus('Estabelecimento criado com sucesso (veja console para detalhes).');
    } catch (err: any) {
      console.error('Erro ao submeter estabelecimento:', err);
      // err pode ser objeto com .error, ou string
      const message = err && err.error ? (err.error.message || err.error) : (err.message || String(err));
      setStatus(`Erro: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{maxWidth:600, margin:'0 auto', padding:16}}>
      <h2>Cadastrar Estabelecimento</h2>
      <form onSubmit={handleSubmit}>
        <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required/>
        <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange}/>
        <input name="cpf_cnpj" placeholder="CPF/CNPJ" value={form.cpf_cnpj} onChange={handleChange}/>
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange}/>
        <input name="email" placeholder="E-mail" value={form.email} onChange={handleChange}/>
        <textarea name="mensagem_voucher" placeholder="Mensagem voucher" value={form.mensagem_voucher} onChange={handleChange}/>
        <input name="nomeUsuario" placeholder="Usuário do app" value={form.nomeUsuario} onChange={handleChange} required/>
        <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required/>
        <input type="file" accept="image/*" onChange={handleFile}/>
        <div style={{marginTop:12}}>
          <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Criar estabelecimento'}</button>
        </div>
      </form>

      {status && <div style={{marginTop:12}}><strong>{status}</strong></div>}
      <div style={{marginTop:12, fontSize:12, color:'#666'}}>
        Dica: abra DevTools → Network e Console. Se a requisição falhar, você verá o status HTTP e a resposta JSON.
      </div>
    </div>
  );
}
