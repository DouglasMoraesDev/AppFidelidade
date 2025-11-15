// frontend/src/utils/api.d.ts

export type Json = any;
export function postEstabelecimento(formData: FormData): Promise<Json>;
export function login(nomeUsuario: string, senha: string): Promise<Json>;
export function buscarPontosPublico(nome: string, telefone: string, estabId?: string): Promise<Json>;
export function criarCliente(data: any, token: string): Promise<Json>;
export function criarCartao(payload: any, token: string): Promise<Json>;
export function criarMovimento(payload: any, token: string): Promise<Json>;
export function confirmarVoucher(payload: any, token: string): Promise<Json>;
