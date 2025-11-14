const prisma = require('../config/prismaClient');

async function registrarVoucher(req, res) {
  const { cartaoId, clienteId, estabelecimentoId, mensagem, numero_cliente, enviado_por_id } = req.body;
  if (!cartaoId || !clienteId || !estabelecimentoId) return res.status(400).json({ error: 'campos obrigatórios' });

  const voucher = await prisma.voucher.create({
    data: {
      cartaoId: Number(cartaoId),
      clienteId: Number(clienteId),
      estabelecimentoId: Number(estabelecimentoId),
      mensagem_enviada: mensagem || '',
      numero_cliente: numero_cliente || '',
      enviado_por_id: enviado_por_id ? Number(enviado_por_id) : null,
      status: 'pendente'
    }
  });
  res.status(201).json(voucher);
}

async function confirmarVoucher(req, res) {
  const { cartaoId, usuarioId, mensagem, numeroCliente } = req.body;
  if (!cartaoId || !usuarioId) return res.status(400).json({ error: 'campos obrigatórios' });

  // transaction: create voucher and zero points
  const result = await prisma.$transaction(async (tx) => {
    const cartao = await tx.cartaoFidelidade.findUnique({ where: { id: Number(cartaoId) }});
    if (!cartao) throw new Error('Cartão não encontrado');

    const voucher = await tx.voucher.create({
      data: {
        cartaoId: Number(cartaoId),
        clienteId: cartao.clienteId,
        estabelecimentoId: cartao.estabelecimentoId,
        mensagem_enviada: mensagem || '',
        numero_cliente: numeroCliente || '',
        enviado_por_id: Number(usuarioId),
        status: 'enviado'
      }
    });

    const cartaoAtualizado = await tx.cartaoFidelidade.update({
      where: { id: Number(cartaoId) },
      data: { pontos: 0 }
    });

    return { voucher, cartaoAtualizado };
  });

  res.json(result);
}

module.exports = { registrarVoucher, confirmarVoucher };
