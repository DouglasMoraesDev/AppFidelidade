const prisma = require('../config/prismaClient');

async function criarMovimento(req, res) {
  const { cartaoId, tipo, pontos, descricao } = req.body;
  if (!cartaoId || !tipo || typeof pontos === 'undefined') return res.status(400).json({ error: 'cartaoId, tipo e pontos são obrigatórios' });

  const movimento = await prisma.movimento.create({
    data: { cartaoId: Number(cartaoId), tipo, pontos: Number(pontos), descricao }
  });

  // atualizar pontos no cartao
  await prisma.cartaoFidelidade.update({
    where: { id: Number(cartaoId) },
    data: { pontos: { increment: Number(pontos) } }
  });

  res.status(201).json(movimento);
}

module.exports = { criarMovimento };
