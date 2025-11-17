const prisma = require('../config/prismaClient');
const { v4: uuidv4 } = require('uuid');
const { assertMensalidadeAtiva } = require('../services/assinatura.service');

function limparTelefone(telefone) {
  return String(telefone || '').replace(/\D/g, '');
}

function mapCartaoToCliente(card) {
  return {
    id: card.id,
    clienteId: card.clienteId,
    name: card.cliente.nome,
    phone: card.cliente.telefone,
    points: card.pontos,
    lastPointAddition: card.movimentos[0]?.criadoEm || null
  };
}

async function criarCliente(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId;
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não identificado' });

    const { nome, telefone, pontosIniciais = 0 } = req.body;
    if (!nome || !telefone) return res.status(400).json({ error: 'nome e telefone são obrigatórios' });

    await assertMensalidadeAtiva(estabelecimentoId);

    const telefoneLimpo = limparTelefone(telefone);

    const cartaoExistente = await prisma.cartaoFidelidade.findFirst({
      where: {
        estabelecimentoId: Number(estabelecimentoId),
        cliente: { telefone: telefoneLimpo }
      },
      include: {
        cliente: true,
        movimentos: { orderBy: { criadoEm: 'desc' }, take: 1 }
      }
    });

    if (cartaoExistente) {
      return res.status(200).json({
        cliente: mapCartaoToCliente(cartaoExistente),
        message: 'Cliente já cadastrado para este estabelecimento'
      });
    }

    const cliente = await prisma.cliente.create({
      data: { nome, telefone: telefoneLimpo }
    });

    const result = await prisma.$transaction(async (tx) => {
      const cartao = await tx.cartaoFidelidade.create({
        data: {
          codigo: `CART_${uuidv4()}`,
          clienteId: cliente.id,
          estabelecimentoId: Number(estabelecimentoId),
          pontos: 0
        },
        include: {
          cliente: true,
          movimentos: { orderBy: { criadoEm: 'desc' }, take: 1 }
        }
      });

      if (Number(pontosIniciais) > 0) {
        const pts = Number(pontosIniciais);
        await tx.movimento.create({
          data: {
            cartaoId: cartao.id,
            tipo: 'credito',
            pontos: pts,
            descricao: 'Pontos iniciais'
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

        return cartaoAtualizado;
      }

      return cartao;
    });

    return res.status(201).json({ cliente: mapCartaoToCliente(result) });
  } catch (err) {
    console.error('[Clientes] erro criarCliente:', err && err.stack ? err.stack : err);
    if (err.code === 'MENSALIDADE_VENCIDA') {
      return res.status(402).json({ error: 'Mensalidade vencida. Regularize o pagamento para continuar.' });
    }
    return res.status(500).json({ error: 'Erro interno ao criar cliente' });
  }
}

async function listarPorEstabelecimento(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId;
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não identificado' });

    const cartoes = await prisma.cartaoFidelidade.findMany({
      where: { estabelecimentoId: Number(estabelecimentoId) },
      orderBy: { criadoEm: 'desc' },
      include: {
        cliente: true,
        movimentos: { orderBy: { criadoEm: 'desc' }, take: 1 }
      }
    });

    return res.json({
      clientes: cartoes.map(mapCartaoToCliente)
    });
  } catch (err) {
    console.error('[Clientes] erro listarPorEstabelecimento:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
}

async function buscar(req, res) {
  try {
    const { nome = '', telefone = '', slug } = req.query;
    if (!slug) return res.status(400).json({ error: 'slug do estabelecimento é obrigatório' });

    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { slug_publico: String(slug) },
      select: { id: true, nome: true, logo_path: true, pontos_para_voucher: true }
    });

    if (!estabelecimento) return res.status(404).json({ error: 'Estabelecimento não encontrado' });

    // Limpa e normaliza os parâmetros de busca
    const nomeBusca = String(nome || '').trim();
    const telefoneBusca = limparTelefone(telefone || '');

    if (!nomeBusca && !telefoneBusca) {
      return res.status(400).json({ error: 'É necessário informar nome ou telefone' });
    }

    // Busca clientes que tenham cartão no estabelecimento
    const cartoes = await prisma.cartaoFidelidade.findMany({
      where: { estabelecimentoId: estabelecimento.id },
      include: {
        cliente: true,
        estabelecimento: true
      }
    });

    // Filtra os clientes que correspondem aos critérios de busca
    let clienteEncontrado = null;
    let cartoesDoCliente = [];

    for (const cartao of cartoes) {
      const cliente = cartao.cliente;
      let nomeMatch = true;
      let telefoneMatch = true;

      // Verifica correspondência do nome (case-insensitive, parcial)
      if (nomeBusca) {
        const nomeCliente = String(cliente.nome || '').toLowerCase();
        const nomeBuscaLower = nomeBusca.toLowerCase();
        nomeMatch = nomeCliente.includes(nomeBuscaLower);
      }

      // Verifica correspondência do telefone
      if (telefoneBusca) {
        const telefoneCliente = limparTelefone(cliente.telefone || '');
        telefoneMatch = telefoneCliente.includes(telefoneBusca) || telefoneBusca.includes(telefoneCliente);
      }

      if (nomeMatch && telefoneMatch) {
        if (!clienteEncontrado) {
          clienteEncontrado = cliente;
        }
        cartoesDoCliente.push(cartao);
      }
    }

    if (!clienteEncontrado || cartoesDoCliente.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado para este estabelecimento' });
    }

    return res.json({
      nome: clienteEncontrado.nome,
      telefone: clienteEncontrado.telefone,
      estabelecimento: {
        nome: estabelecimento.nome,
        logo: estabelecimento.logo_path,
        pontos_para_voucher: estabelecimento.pontos_para_voucher
      },
      cartoes: cartoesDoCliente.map(c => ({
        id: c.id,
        codigo: c.codigo,
        pontos: c.pontos,
        estabelecimento: {
          id: c.estabelecimentoId,
          nome: c.estabelecimento.nome,
          logo_path: c.estabelecimento.logo_path
        }
      }))
    });
  } catch (err) {
    console.error('[Clientes] erro buscar:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao buscar clientes: ' + (err.message || 'Erro desconhecido') });
  }
}

async function deletarCliente(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId;
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não identificado' });

    const cartaoId = Number(req.params.id);
    if (!cartaoId) return res.status(400).json({ error: 'ID do cartão é obrigatório' });

    const cartao = await prisma.cartaoFidelidade.findUnique({
      where: { id: cartaoId },
      include: { cliente: true }
    });

    if (!cartao) return res.status(404).json({ error: 'Cartão não encontrado' });
    if (cartao.estabelecimentoId !== Number(estabelecimentoId)) {
      return res.status(403).json({ error: 'Cartão não pertence ao seu estabelecimento' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.movimento.deleteMany({ where: { cartaoId } });
      await tx.voucher.deleteMany({ where: { cartaoId } });
      await tx.cartaoFidelidade.delete({ where: { id: cartaoId } });
      
      const outrosCartoes = await tx.cartaoFidelidade.findMany({
        where: { clienteId: cartao.clienteId }
      });
      
      if (outrosCartoes.length === 0) {
        await tx.cliente.delete({ where: { id: cartao.clienteId } });
      }
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('[Clientes] erro deletarCliente:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
}

module.exports = { criarCliente, buscar, listarPorEstabelecimento, deletarCliente };
