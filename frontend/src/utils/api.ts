// frontend/src/utils/api.ts
// Utilitários simples de API usados pelo frontend.
// Ajuste BASE_URL se seu backend estiver em outro host/porta.

const BASE = import.meta.env.VITE_API_BASE || '';

async function request(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      // adicione cabeçalhos comuns aqui, por ex Authorization se salvar token
      ...(opts.headers || {})
    },
    ...opts
  });
  if (!res.ok) {
    const txt = await res.text();
    let json;
    try { json = JSON.parse(txt); } catch { json = { message: txt }; }
    throw json;
  }
  // tenta json, fallback para text
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return txt; }
}

/** Autenticação */
export async function login(username: string, password: string) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nomeUsuario: username, senha: password })
  });
}

/** Post estabelecimento (FormData) */
export async function postEstabelecimento(formData: FormData) {
  const res = await fetch(`${BASE}/api/estabelecimentos`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const txt = await res.text();
    try { throw JSON.parse(txt); } catch { throw { message: txt }; }
  }
  return res.json();
}

/** Clientes: criar e buscar */
export async function createCliente(data: { nome: string; telefone: string; email?: string }) {
  return request('/api/clientes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
export async function buscarClientes(qs: { nome?: string; telefone?: string }) {
  const params = new URLSearchParams();
  if (qs.nome) params.set('nome', qs.nome);
  if (qs.telefone) params.set('telefone', qs.telefone);
  return request(`/api/clientes/buscar?${params.toString()}`);
}

/** Cartões / Movimentos / Vouchers (simples) */
export async function criarCartao(body: { clienteId: number; estabelecimentoId: number }) {
  return request('/api/cartoes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
export async function criarMovimento(body: { cartaoId: number; tipo: string; pontos: number; descricao?: string }) {
  return request('/api/movimentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
export async function registrarVoucher(body: any) {
  return request('/api/vouchers/registrar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}
export async function confirmarVoucher(body: any) {
  return request('/api/vouchers/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

/** Export default (opcional) */
export default {
  login,
  postEstabelecimento,
  createCliente,
  buscarClientes,
  criarCartao,
  criarMovimento,
  registrarVoucher,
  confirmarVoucher
};
