const prisma = require('../config/prismaClient');
const { v4: uuidv4 } = require('uuid');

async function criarCartao(req, res) {
  const { clienteId, estabelecimentoId } = req.body;
  if (!clienteId || !estabelecimentoId) return res.status(400).json({ error: 'clienteId e estabelecimentoId são obrigatórios' });
  const codigo = uuidv4().split('-')[0];
  const cartao = await prisma.cartaoFidelidade.create({
    data: { clienteId: Number(clienteId), estabelecimentoId: Number(estabelecimentoId), codigo }
  });
  res.status(201).json(cartao);
}

async function obterPorCodigo(req, res) {
  const codigo = req.params.codigo;
  const cartao = await prisma.cartaoFidelidade.findUnique({ where: { codigo }, include: { cliente: true, estabelecimento: true, movimentos: true }});
  if (!cartao) return res.status(404).json({ error: 'Cartão não encontrado' });
  res.json(cartao);
}

module.exports = { criarCartao, obterPorCodigo };
