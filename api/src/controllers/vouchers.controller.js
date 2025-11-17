const prisma = require('../config/prismaClient');
const { assertMensalidadeAtiva } = require('../services/assinatura.service');

async function enviarVoucher(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId;
    const usuarioId = req.userId;
    if (!estabelecimentoId || !usuarioId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { cartaoId, mensagemPersonalizada } = req.body;
    if (!cartaoId) return res.status(400).json({ error: 'cartaoId é obrigatório' });

    await assertMensalidadeAtiva(estabelecimentoId);

    const cartao = await prisma.cartaoFidelidade.findUnique({
      where: { id: Number(cartaoId) },
      include: {
        cliente: true,
        estabelecimento: {
          select: {
            id: true,
            pontos_para_voucher: true,
            mensagem_voucher: true
          }
        }
      }
    });

    if (!cartao) return res.status(404).json({ error: 'Cartão não encontrado' });
    if (cartao.estabelecimentoId !== Number(estabelecimentoId)) {
      return res.status(403).json({ error: 'Cartão não pertence ao seu estabelecimento' });
    }

    const pontosNecessarios = cartao.estabelecimento.pontos_para_voucher || 10;
    if (cartao.pontos < pontosNecessarios) {
      return res.status(400).json({ error: 'Cliente ainda não possui pontos suficientes para voucher' });
    }

    const template = mensagemPersonalizada || cartao.estabelecimento.mensagem_voucher || 'Parabéns {cliente}, você recebeu um voucher!';
    const mensagem = template.replace('{cliente}', cartao.cliente.nome);

    const resultado = await prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.create({
        data: {
          cartaoId: cartao.id,
          clienteId: cartao.clienteId,
          estabelecimentoId: cartao.estabelecimentoId,
          mensagem_enviada: mensagem,
          numero_cliente: cartao.cliente.telefone,
          enviado_por_id: Number(usuarioId),
          status: 'enviado'
        }
      });

      await tx.movimento.create({
        data: {
          cartaoId: cartao.id,
          tipo: 'debito',
          pontos: -pontosNecessarios,
          descricao: 'Voucher resgatado'
        }
      });

      const cartaoAtualizado = await tx.cartaoFidelidade.update({
        where: { id: cartao.id },
        data: { pontos: { decrement: pontosNecessarios } },
        include: {
          cliente: true,
          movimentos: { orderBy: { criadoEm: 'desc' }, take: 1 }
        }
      });

      return { voucher, cartaoAtualizado };
    });

    return res.json({
      voucher: resultado.voucher,
      cartao: resultado.cartaoAtualizado,
      whatsapp: {
        numero: cartao.cliente.telefone,
        mensagem
      }
    });
  } catch (err) {
    console.error('[Vouchers] erro enviarVoucher:', err && err.stack ? err.stack : err);
    if (err.code === 'MENSALIDADE_VENCIDA') {
      return res.status(402).json({ error: 'Mensalidade vencida. Regularize para continuar.' });
    }
    return res.status(500).json({ error: err.message || 'Erro ao enviar voucher' });
  }
}

module.exports = { enviarVoucher };
