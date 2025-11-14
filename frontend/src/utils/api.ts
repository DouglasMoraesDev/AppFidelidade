// frontend/src/utils/api.ts
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export type Json = any;

export async function postEstabelecimento(formData: FormData): Promise<Json> {
  try {
    const res = await fetch(`${API_URL}/api/estabelecimentos`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw err;
    }
    return await res.json();
  } catch (err) {
    console.error('postEstabelecimento error', err);
    throw err;
  }
}

export async function login(nomeUsuario: string, senha: string): Promise<Json> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeUsuario, senha })
  });
  return res.json();
}

export async function buscarPontosPublico(nome: string, telefone: string, estabId?: string): Promise<Json> {
  const q = new URLSearchParams({ nome, telefone, estabId: estabId || '' });
  const res = await fetch(`${API_URL}/api/clientes/buscar?${q.toString()}`);
  return res.json();
}

export async function criarCliente(data: any, token: string): Promise<Json> {
  const res = await fetch(`${API_URL}/api/clientes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function criarCartao(payload: any, token: string): Promise<Json> {
  const res = await fetch(`${API_URL}/api/cartoes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function criarMovimento(payload: any, token: string): Promise<Json> {
  const res = await fetch(`${API_URL}/api/movimentos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function confirmarVoucher(payload: any, token: string): Promise<Json> {
  const res = await fetch(`${API_URL}/api/vouchers/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return res.json();
}
