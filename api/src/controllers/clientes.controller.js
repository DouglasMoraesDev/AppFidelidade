const prisma = require('../config/prismaClient');

async function listarClientes(req, res) {
  const estabId = req.query.estabId ? Number(req.query.estabId) : undefined;
  const where = estabId ? { cartoes: { some: { estabelecimentoId: estabId }}} : {};
  const clientes = await prisma.cliente.findMany({ where, include: { cartoes: true }});
  res.json(clientes);
}

async function criarCliente(req, res) {
  const { nome, telefone, email } = req.body;
  if (!nome || !telefone) return res.status(400).json({ error: 'nome e telefone são obrigatórios' });
  const cliente = await prisma.cliente.create({ data: { nome, telefone, email }});
  res.status(201).json(cliente);
}

async function buscarPorNomeTelefone(req, res) {
  const { nome, telefone, estabId } = req.query;
  if (!nome || !telefone) return res.status(400).json({ error: 'nome e telefone são obrigatórios' });
  // find cliente
  const cliente = await prisma.cliente.findFirst({
    where: { nome, telefone },
    include: { cartoes: { include: { estabelecimento: true } } }
  });
  if (!cliente) return res.status(404).json({ error: 'Cliente não encontrado' });
  // optionally filter cartoes by estabId
  if (estabId) {
    cliente.cartoes = cliente.cartoes.filter(c => c.estabelecimentoId === Number(estabId));
  }
  res.json(cliente);
}

module.exports = { listarClientes, criarCliente, buscarPorNomeTelefone };
