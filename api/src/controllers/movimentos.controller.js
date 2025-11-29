const prisma = require('../config/prismaClient');
const { assertMensalidadeAtiva } = require('../services/assinatura.service');

async function criarMovimento(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId;
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não identificado' });

    const { cartaoId, pontos, descricao } = req.body;
    const cartaoIdNum = Number(cartaoId);
    const pontosNum = Number(pontos);
    
    if (!Number.isFinite(cartaoIdNum) || cartaoIdNum <= 0) return res.status(400).json({ error: 'cartaoId inválido' });
    if (!Number.isFinite(pontosNum) || pontosNum <= 0) return res.status(400).json({ error: 'pontos deve ser um número maior que zero' });

    await assertMensalidadeAtiva(estabelecimentoId);

    const cartao = await prisma.cartaoFidelidade.findUnique({
      where: { id: cartaoIdNum },
      include: {
        cliente: true,
        estabelecimento: { select: { pontos_para_voucher: true } }
      }
    });

    if (!cartao) return res.status(404).json({ error: 'Cartão não encontrado' });
    if (cartao.estabelecimentoId !== Number(estabelecimentoId)) {
      return res.status(403).json({ error: 'Cartão não pertence ao seu estabelecimento' });
    }

    const pts = pontosNum;

    // Limite definido pelo estabelecimento (pontos necessários para voucher)
    const pontosNecessarios = (cartao.estabelecimento && cartao.estabelecimento.pontos_para_voucher) ? Number(cartao.estabelecimento.pontos_para_voucher) : 10;

    // Se já alcançou ou excedeu, não permite adicionar mais até voucher ser enviado
    if (cartao.pontos >= pontosNecessarios) {
      return res.status(400).json({ error: 'Cliente já atingiu o limite de pontos para voucher. Envie o voucher antes de adicionar mais pontos.' });
    }

    // Se a adição excede o limite, faz adição parcial até atingir o limite
    const maxAddable = pontosNecessarios - cartao.pontos;
    const toAdd = pts > maxAddable ? maxAddable : pts;

    const resultado = await prisma.$transaction(async (tx) => {
      const movimento = await tx.movimento.create({
        data: {
          cartaoId: cartao.id,
          tipo: 'credito',
          pontos: toAdd,
          descricao: descricao || (toAdd < pts ? `Pontos adicionados (parcial, máximo ${pontosNecessarios})` : 'Pontos adicionados')
        }
      });

      const cartaoAtualizado = await tx.cartaoFidelidade.update({
        where: { id: cartao.id },
        data: { pontos: { increment: toAdd } },
        include: {
          cliente: true,
          movimentos: { orderBy: { criadoEm: 'desc' }, take: 1 }
        }
      });

      return { movimento, cartao: cartaoAtualizado };
    });

    const note = toAdd < pts ? `Apenas ${toAdd} pontos foram adicionados para não exceder o limite de ${pontosNecessarios} pontos.` : undefined;
    return res.status(201).json({ ...resultado, note });
  } catch (err) {
    console.error('[Mov] erro criarMovimento:', err && err.stack ? err.stack : err);
    if (err.code === 'MENSALIDADE_VENCIDA') {
      return res.status(402).json({ error: 'Mensalidade vencida. Regularize para continuar' });
    }
    return res.status(500).json({ error: 'Erro ao criar movimento' });
  }
}

module.exports = { criarMovimento };
