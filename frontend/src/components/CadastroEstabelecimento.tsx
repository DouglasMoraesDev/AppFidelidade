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
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setLogoFile(e.target.files[0]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v as string));
      if (logoFile) fd.append('logo', logoFile);

      const res = await postEstabelecimento(fd);
      setStatus('Estabelecimento criado com sucesso! Usuário: ' + (res.usuario?.nomeUsuario ?? '—'));
      setForm({
        nome: '',
        endereco: '',
        cpf_cnpj: '',
        telefone: '',
        email: '',
        mensagem_voucher: '',
        nomeUsuario: '',
        senha: ''
      });
      setLogoFile(null);
    } catch (err: any) {
      console.error(err);
      const message = err?.error || err?.message || 'Erro ao criar estabelecimento';
      setStatus('Erro: ' + message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Cadastro de Estabelecimento</h2>
      <form onSubmit={submit} className="space-y-3">
        <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required className="input" />
        <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} className="input" />
        <input name="cpf_cnpj" placeholder="CPF / CNPJ" value={form.cpf_cnpj} onChange={handleChange} className="input" />
        <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} className="input" />
        <input name="email" placeholder="E-mail" value={form.email} onChange={handleChange} className="input" />
        <textarea name="mensagem_voucher" placeholder="Mensagem do voucher" value={form.mensagem_voucher} onChange={handleChange} className="textarea" />
        <input name="nomeUsuario" placeholder="Usuário do app" value={form.nomeUsuario} onChange={handleChange} required className="input" />
        <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required className="input" />
        <input type="file" accept="image/*" onChange={handleFile} />
        <div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Enviando...' : 'Criar estabelecimento'}
          </button>
        </div>
      </form>
      {status && <div className="mt-4">{status}</div>}
    </div>
  );
}
