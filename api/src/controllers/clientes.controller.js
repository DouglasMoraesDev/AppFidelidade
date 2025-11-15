// api/src/controllers/clientes.controller.js
const prisma = require('../config/prismaClient');

/**
 * POST /api/clientes
 * Body: { nome, telefone, email }
 * Requires Authorization header (token) — middleware deve ter setado req.user (opcional)
 */
async function criarCliente(req, res) {
  try {
    console.log('[Clientes] POST /api/clientes - body:', req.body);
    const { nome, telefone, email } = req.body;
    if (!nome || !telefone) return res.status(400).json({ error: 'nome e telefone são obrigatórios' });

    // evita duplicatas exatas por telefone
    const existente = await prisma.cliente.findFirst({ where: { telefone } }).catch(() => null);
    if (existente) {
      console.log('[Clientes] cliente já existe, retornando existente id=', existente.id);
      return res.status(200).json({ cliente: existente, message: 'Cliente já existente' });
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome,
        telefone,
        email: email || null
      }
    });

    console.log('[Clientes] criado cliente id=', cliente.id);
    return res.status(201).json({ cliente });
  } catch (err) {
    console.error('[Clientes] erro criarCliente:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro interno ao criar cliente' });
  }
}

/**
 * GET /api/clientes/buscar?nome=..&telefone=..&estabId=..
 * Busca clientes por nome/telefone
 */
async function buscar(req, res) {
  try {
    const { nome = '', telefone = '' } = req.query;
    console.log('[Clientes] buscar - nome:', nome, 'telefone:', telefone);

    const where = {};
    if (nome) where.nome = { contains: String(nome), mode: 'insensitive' };
    if (telefone) where.telefone = { contains: String(telefone) };

    const clientes = await prisma.cliente.findMany({ where, take: 50 });
    return res.json({ clientes });
  } catch (err) {
    console.error('[Clientes] erro buscar:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
}

module.exports = { criarCliente, buscar };
