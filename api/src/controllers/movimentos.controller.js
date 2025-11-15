// api/src/controllers/movimentos.controller.js
const prisma = require('../config/prismaClient');

/**
 * POST /api/movimentos
 * Body: { cartaoId, tipo, pontos, descricao }
 * Faz operação transacional: insere movimento e atualiza pontos do cartão
 */
async function criarMovimento(req, res) {
  try {
    console.log('[Mov] POST /api/movimentos - body:', req.body);
    const { cartaoId, tipo, pontos, descricao } = req.body;
    if (!cartaoId || !tipo || typeof pontos === 'undefined') return res.status(400).json({ error: 'cartaoId, tipo e pontos são obrigatórios' });

    const cid = Number(cartaoId);
    const pts = Number(pontos);

    // transação: cria movimento e atualiza pontos do cartão
    const [movimento, cartaoAtualizado] = await prisma.$transaction([
      prisma.movimento.create({
        data: {
          cartaoId: cid,
          tipo,
          pontos: pts,
          descricao: descricao || null
        }
      }),
      prisma.cartaoFidelidade.update({
        where: { id: cid },
        data: { pontos: { increment: pts } } // incrementa (pts pode ser negativo para débito)
      })
    ]);

    console.log('[Mov] criado id=', movimento.id, 'cartao pontos atualizados');
    return res.status(201).json({ movimento, cartao: cartaoAtualizado });
  } catch (err) {
    console.error('[Mov] erro criarMovimento:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao criar movimento' });
  }
}

module.exports = { criarMovimento };
