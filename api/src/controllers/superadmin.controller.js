const prisma = require('../config/prismaClient');
const { registrarPagamento } = require('../services/assinatura.service');

function mapEstabelecimento(estab) {
  return {
    id: estab.id,
    name: estab.nome,
    email: estab.email,
    phone: estab.telefone,
    pointsForVoucher: estab.pontos_para_voucher,
    voucherMessage: estab.mensagem_voucher,
    logo_path: estab.logo_path,
    assinaturaValidaAte: estab.assinaturaValidaAte,
    paymentHistory: estab.pagamentos.map((p) => ({
      id: p.id,
      date: p.pagoEm
    })),
    clientsCount: estab.cartoes.length
  };
}

async function listar(req, res) {
  try {
    const estabelecimentos = await prisma.estabelecimento.findMany({
      include: {
        pagamentos: { orderBy: { pagoEm: 'desc' }, take: 12 },
        cartoes: { select: { id: true } }
      },
      orderBy: { id: 'desc' }
    });

    return res.json({
      estabelecimentos: estabelecimentos.map(mapEstabelecimento)
    });
  } catch (err) {
    console.error('[SuperAdmin] erro listar:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao listar estabelecimentos' });
  }
}

async function atualizar(req, res) {
  try {
    const estabId = Number(req.params.id);
    if (!estabId) return res.status(400).json({ error: 'ID inválido' });

    const { name, email, phone, voucherMessage, pointsForVoucher } = req.body;

    const data = {};
    if (typeof name === 'string') data.nome = name;
    if (typeof email === 'string') data.email = email;
    if (typeof phone === 'string') data.telefone = phone;
    if (typeof voucherMessage === 'string') data.mensagem_voucher = voucherMessage;
    if (typeof pointsForVoucher !== 'undefined') {
      const pts = Number(pointsForVoucher);
      if (!Number.isFinite(pts) || pts <= 0) return res.status(400).json({ error: 'pointsForVoucher inválido' });
      data.pontos_para_voucher = pts;
    }

    const estab = await prisma.estabelecimento.update({
      where: { id: estabId },
      data,
      include: {
        pagamentos: { orderBy: { pagoEm: 'desc' }, take: 12 },
        cartoes: { select: { id: true } }
      }
    });

    return res.json({ estabelecimento: mapEstabelecimento(estab) });
  } catch (err) {
    console.error('[SuperAdmin] erro atualizar:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao atualizar estabelecimento' });
  }
}

async function remover(req, res) {
  try {
    const estabId = Number(req.params.id);
    if (!estabId) return res.status(400).json({ error: 'ID inválido' });

    // Verifica se o estabelecimento existe
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: estabId }
    });

    if (!estabelecimento) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    // Deleta em cascata: primeiro os registros dependentes, depois o estabelecimento
    // Usa transação para garantir que tudo seja deletado ou nada seja deletado
    await prisma.$transaction(async (tx) => {
      // 1. Deleta movimentos relacionados aos cartões do estabelecimento
      const cartoes = await tx.cartaoFidelidade.findMany({
        where: { estabelecimentoId: estabId },
        select: { id: true }
      });
      const cartaoIds = cartoes.map(c => c.id);
      
      if (cartaoIds.length > 0) {
        await tx.movimento.deleteMany({
          where: { cartaoId: { in: cartaoIds } }
        });
      }

      // 2. Deleta vouchers do estabelecimento
      await tx.voucher.deleteMany({
        where: { estabelecimentoId: estabId }
      });

      // 3. Deleta cartões do estabelecimento
      await tx.cartaoFidelidade.deleteMany({
        where: { estabelecimentoId: estabId }
      });

      // 4. Deleta pagamentos do estabelecimento
      await tx.mensalidadePagamento.deleteMany({
        where: { estabelecimentoId: estabId }
      });

      // 5. Deleta usuários do estabelecimento
      await tx.usuario.deleteMany({
        where: { estabelecimentoId: estabId }
      });

      // 6. Deleta o logo do sistema de arquivos se existir
      if (estabelecimento.logo_path) {
        const fs = require('fs');
        const path = require('path');
        // logo_path é salvo como /img/logo_estab_X.png, então precisamos remover a barra inicial
        const logoFileName = estabelecimento.logo_path.replace(/^\//, '');
        const logoPath = path.join(__dirname, '..', '..', logoFileName);
        try {
          if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
          }
        } catch (fsErr) {
          console.warn('[SuperAdmin] Erro ao deletar logo:', fsErr);
          // Não falha a exclusão se não conseguir deletar o arquivo
        }
      }

      // 7. Por fim, deleta o estabelecimento
      await tx.estabelecimento.delete({
        where: { id: estabId }
      });
    });

    return res.json({ ok: true, message: 'Estabelecimento removido com sucesso' });
  } catch (err) {
    console.error('[SuperAdmin] erro remover:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao remover estabelecimento: ' + (err.message || 'Erro desconhecido') });
  }
}

async function registrarPagamentoManual(req, res) {
  try {
    const estabId = Number(req.params.id);
    if (!estabId) return res.status(400).json({ error: 'ID inválido' });

    const { dataPagamento } = req.body;
    const referencia = dataPagamento ? new Date(dataPagamento) : new Date();
    if (Number.isNaN(referencia.getTime())) return res.status(400).json({ error: 'dataPagamento inválida' });

    await registrarPagamento(estabId, 31, referencia);

    const estab = await prisma.estabelecimento.findUnique({
      where: { id: estabId },
      include: {
        pagamentos: { orderBy: { pagoEm: 'desc' }, take: 12 },
        cartoes: { select: { id: true } }
      }
    });

    return res.json({ estabelecimento: mapEstabelecimento(estab) });
  } catch (err) {
    console.error('[SuperAdmin] erro registrarPagamentoManual:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
}

module.exports = { listar, atualizar, remover, registrarPagamentoManual };

