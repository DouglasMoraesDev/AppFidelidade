export type Json = any;
export function postEstabelecimento(formData: FormData): Promise<Json>;
export function login(nomeUsuario: string, senha: string): Promise<Json>;
export function buscarClientes(qs: { nome?: string; telefone?: string }): Promise<Json>;
export function createCliente(data: any, token?: string): Promise<Json>;
export function criarCartao(body: any, token?: string): Promise<Json>;
export function criarMovimento(body: any, token?: string): Promise<Json>;
export function registrarVoucher(body: any, token?: string): Promise<Json>;
export function confirmarVoucher(body: any, token?: string): Promise<Json>;
