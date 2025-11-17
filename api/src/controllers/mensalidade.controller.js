const { registrarPagamento } = require('../services/assinatura.service');

async function confirmarMensalidade(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId;
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não identificado' });

    const { dataPagamento } = req.body;
    const referencia = dataPagamento ? new Date(dataPagamento) : new Date();

    if (Number.isNaN(referencia.getTime())) {
      return res.status(400).json({ error: 'Data de pagamento inválida' });
    }

    const validade = await registrarPagamento(estabelecimentoId, 31, referencia);

    return res.json({
      assinaturaValidaAte: validade
    });
  } catch (err) {
    console.error('[Mensalidade] erro confirmar:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao confirmar pagamento' });
  }
}

module.exports = { confirmarMensalidade };

