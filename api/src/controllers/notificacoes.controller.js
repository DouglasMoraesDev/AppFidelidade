const prisma = require('../config/prismaClient');

/**
 * Lista notificações de um estabelecimento
 * GET /api/notificacoes
 */
async function listar(req, res) {
  try {
    const estabelecimentoId = req.user?.estabelecimentoId;
    if (!estabelecimentoId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const notificacoes = await prisma.notificacao.findMany({
      where: { estabelecimentoId },
      orderBy: { criadaEm: 'desc' },
      take: 50 // Limita a 50 notificações mais recentes
    });

    return res.json({ notificacoes });
  } catch (err) {
    console.error('[Notificacoes] erro listar:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao buscar notificações' });
  }
}

/**
 * Marca uma notificação como lida
 * PATCH /api/notificacoes/:id/marcar-lida
 */
async function marcarLida(req, res) {
  try {
    const notificacaoId = Number(req.params.id);
    const estabelecimentoId = req.user?.estabelecimentoId;

    if (!notificacaoId || !estabelecimentoId) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    // Verifica se a notificação pertence ao estabelecimento do usuário
    const notificacao = await prisma.notificacao.findFirst({
      where: {
        id: notificacaoId,
        estabelecimentoId
      }
    });

    if (!notificacao) {
      return res.status(404).json({ error: 'Notificação não encontrada' });
    }

    // Marca como lida
    const atualizada = await prisma.notificacao.update({
      where: { id: notificacaoId },
      data: { lida: true }
    });

    return res.json({ ok: true, notificacao: atualizada });
  } catch (err) {
    console.error('[Notificacoes] erro marcarLida:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
  }
}

/**
 * Marca todas as notificações como lidas
 * PATCH /api/notificacoes/marcar-todas-lidas
 */
async function marcarTodasLidas(req, res) {
  try {
    const estabelecimentoId = req.user?.estabelecimentoId;
    if (!estabelecimentoId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const resultado = await prisma.notificacao.updateMany({
      where: {
        estabelecimentoId,
        lida: false
      },
      data: { lida: true }
    });

    return res.json({ ok: true, atualizadas: resultado.count });
  } catch (err) {
    console.error('[Notificacoes] erro marcarTodasLidas:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao marcar notificações como lidas' });
  }
}

/**
 * Conta notificações não lidas
 * GET /api/notificacoes/nao-lidas/count
 */
async function contarNaoLidas(req, res) {
  try {
    const estabelecimentoId = req.user?.estabelecimentoId;
    if (!estabelecimentoId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const count = await prisma.notificacao.count({
      where: {
        estabelecimentoId,
        lida: false
      }
    });

    return res.json({ count });
  } catch (err) {
    console.error('[Notificacoes] erro contarNaoLidas:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao contar notificações' });
  }
}

module.exports = {
  listar,
  marcarLida,
  marcarTodasLidas,
  contarNaoLidas
};
