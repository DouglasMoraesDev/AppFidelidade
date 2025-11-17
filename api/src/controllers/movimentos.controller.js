const prisma = require('../config/prismaClient');
const { assertMensalidadeAtiva } = require('../services/assinatura.service');

async function criarMovimento(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId;
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não identificado' });

    const { cartaoId, pontos, descricao } = req.body;
    if (!cartaoId || typeof pontos === 'undefined') return res.status(400).json({ error: 'cartaoId e pontos são obrigatórios' });

    if (Number(pontos) <= 0) return res.status(400).json({ error: 'Informe pontos maiores que zero' });

    await assertMensalidadeAtiva(estabelecimentoId);

    const cartao = await prisma.cartaoFidelidade.findUnique({
      where: { id: Number(cartaoId) },
      include: { cliente: true }
    });

    if (!cartao) return res.status(404).json({ error: 'Cartão não encontrado' });
    if (cartao.estabelecimentoId !== Number(estabelecimentoId)) {
      return res.status(403).json({ error: 'Cartão não pertence ao seu estabelecimento' });
    }

    const pts = Number(pontos);

    const resultado = await prisma.$transaction(async (tx) => {
      const movimento = await tx.movimento.create({
        data: {
          cartaoId: cartao.id,
          tipo: 'credito',
          pontos: pts,
          descricao: descricao || 'Pontos adicionados'
        }
      });

      const cartaoAtualizado = await tx.cartaoFidelidade.update({
        where: { id: cartao.id },
        data: { pontos: { increment: pts } },
        include: {
          cliente: true,
          movimentos: { orderBy: { criadoEm: 'desc' }, take: 1 }
        }
      });

      return { movimento, cartao: cartaoAtualizado };
    });

    return res.status(201).json(resultado);
  } catch (err) {
    console.error('[Mov] erro criarMovimento:', err && err.stack ? err.stack : err);
    if (err.code === 'MENSALIDADE_VENCIDA') {
      return res.status(402).json({ error: 'Mensalidade vencida. Regularize para continuar' });
    }
    return res.status(500).json({ error: 'Erro ao criar movimento' });
  }
}

module.exports = { criarMovimento };
