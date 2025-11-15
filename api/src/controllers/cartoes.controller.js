// api/src/controllers/cartoes.controller.js
const prisma = require('../config/prismaClient');
const { v4: uuidv4 } = require('uuid');

/**
 * POST /api/cartoes
 * Body: { clienteId, estabelecimentoId }
 * Se clienteId não existir, retorna erro (frontend deve criar cliente antes)
 */
async function criarCartao(req, res) {
  try {
    const { clienteId, estabelecimentoId } = req.body;
    if (!clienteId || !estabelecimentoId) return res.status(400).json({ error: 'clienteId e estabelecimentoId são obrigatórios' });

    // cria codigo único (prefixo + uuid)
    const codigo = `CART_${uuidv4()}`;

    const cartao = await prisma.cartaoFidelidade.create({
      data: {
        codigo,
        clienteId: Number(clienteId),
        estabelecimentoId: Number(estabelecimentoId),
        pontos: 0
      }
    });

    console.log('[Cartao] criado id=', cartao.id, 'codigo=', cartao.codigo);
    return res.status(201).json({ cartao });
  } catch (err) {
    console.error('[Cartao] erro criarCartao:', err && err.stack ? err.stack : err);
    if (err && err.code === 'P2002') return res.status(409).json({ error: 'Código duplicado' });
    return res.status(500).json({ error: 'Erro ao criar cartão' });
  }
}

module.exports = { criarCartao };
