// frontend/src/utils/api.ts
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

async function parseResponse(res: Response) {
  const txt = await res.text();
  try { return JSON.parse(txt); } catch { return txt; }
}

function buildHeaders(original?: HeadersInit, body?: BodyInit | null, skipAuth?: boolean) {
  const headers: Record<string, string> = {};

  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  return {
    ...headers,
    ...(original || {})
  };
}

async function request(path: string, opts: RequestInit = {}, { skipAuth = false }: { skipAuth?: boolean } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: buildHeaders(opts.headers, opts.body || null, skipAuth)
  });

  if (!res.ok) {
    const body = await parseResponse(res);
    const err = (body && (body.error || body.message)) ? (body.error || body.message) : body;
    throw err || `HTTP ${res.status}`;
  }

  return parseResponse(res);
}

/** Autenticação */
export async function login(username: string, password: string) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ nomeUsuario: username, senha: password })
  }, { skipAuth: true });
}

export async function changePassword(payload: { senhaAtual: string; novaSenha: string }) {
  return request('/api/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

/** Criar estabelecimento (FormData) */
export async function postEstabelecimento(formData: FormData) {
  const res = await fetch(`${BASE}/api/estabelecimentos`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const txt = await res.text();
    try { throw JSON.parse(txt); } catch { throw { message: txt || `HTTP ${res.status}` }; }
  }

  return res.json();
}

/** Estabelecimento snapshot */
export async function fetchSnapshot() {
  return request('/api/estabelecimentos/me/snapshot');
}

export async function downloadBackup() {
  return request('/api/estabelecimentos/me/backup');
}

export async function updateEstabelecimentoConfig(body: { mensagem_voucher?: string; nome_app?: string; pontos_para_voucher?: number; link_consulta?: string }) {
  return request('/api/estabelecimentos/me/config', {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
}

export async function uploadLogo(file: File) {
  const fd = new FormData();
  fd.append('logo', file);
  return request('/api/estabelecimentos/me/logo', {
    method: 'PATCH',
    body: fd
  });
}

/** Mensalidade */
export async function confirmarMensalidade(dataPagamento?: string) {
  return request('/api/mensalidade/confirmar', {
    method: 'POST',
    body: JSON.stringify({ dataPagamento })
  });
}

/** Clientes */
export async function createCliente(data: { nome: string; telefone: string; pontosIniciais?: number }) {
  return request('/api/clientes', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function listarClientes() {
  return request('/api/clientes');
}

export async function buscarClientesPublico(qs: { nome?: string; telefone?: string; slug: string }) {
  const params = new URLSearchParams();
  if (qs.nome) params.set('nome', qs.nome);
  if (qs.telefone) params.set('telefone', qs.telefone);
  params.set('slug', qs.slug);
  return request(`/api/clientes/buscar?${params.toString()}`, {}, { skipAuth: true });
}

/** Pontos e vouchers */
export async function adicionarPontos(body: { cartaoId: number; pontos: number; descricao?: string }) {
  return request('/api/movimentos', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function enviarVoucher(body: { cartaoId: number; mensagemPersonalizada?: string }) {
  return request('/api/vouchers/enviar', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function deletarCliente(cartaoId: number) {
  return request(`/api/clientes/${cartaoId}`, {
    method: 'DELETE'
  });
}

/** Super admin diagnostics */
export async function fetchOverview() {
  return request('/api/diag/overview', {}, { skipAuth: true });
}

/** Super admin (requires secret via header) */
function superAdminOptions(secret: string) {
  return {
    headers: {
      'x-super-admin-secret': secret
    }
  };
}

export async function superAdminListEstablishments(secret: string) {
  return request('/api/superadmin/estabelecimentos', superAdminOptions(secret), { skipAuth: true });
}

export async function superAdminUpdateEstablishment(secret: string, id: number, body: any) {
  return request(`/api/superadmin/estabelecimentos/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: superAdminOptions(secret).headers
  }, { skipAuth: true });
}

export async function superAdminDeleteEstablishment(secret: string, id: number) {
  return request(`/api/superadmin/estabelecimentos/${id}`, {
    method: 'DELETE',
    headers: superAdminOptions(secret).headers
  }, { skipAuth: true });
}

export async function superAdminAddPayment(secret: string, id: number, dataPagamento?: string) {
  return request(`/api/superadmin/estabelecimentos/${id}/pagamentos`, {
    method: 'POST',
    body: JSON.stringify({ dataPagamento }),
    headers: superAdminOptions(secret).headers
  }, { skipAuth: true });
}

export default {
  login,
  changePassword,
  postEstabelecimento,
  fetchSnapshot,
  downloadBackup,
  updateEstabelecimentoConfig,
  uploadLogo,
  confirmarMensalidade,
  createCliente,
  listarClientes,
  buscarClientesPublico,
  adicionarPontos,
  enviarVoucher,
  fetchOverview,
  superAdminListEstablishments,
  superAdminUpdateEstablishment,
  superAdminDeleteEstablishment,
  superAdminAddPayment
};
