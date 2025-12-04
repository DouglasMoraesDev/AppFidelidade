const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
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

      // 3. Pega IDs dos clientes antes de deletar os cartões
      const clientesIds = await tx.cartaoFidelidade.findMany({
        where: { estabelecimentoId: estabId },
        select: { clienteId: true },
        distinct: ['clienteId']
      });
      
      // 4. Deleta cartões do estabelecimento
      await tx.cartaoFidelidade.deleteMany({
        where: { estabelecimentoId: estabId }
      });

      // 5. Deleta clientes que não têm mais nenhum cartão em qualquer estabelecimento
      for (const { clienteId } of clientesIds) {
        const temOutrosCartoes = await tx.cartaoFidelidade.count({
          where: { clienteId }
        });
        
        if (temOutrosCartoes === 0) {
          // Cliente não tem mais cartões em nenhum estabelecimento, pode deletar
          await tx.cliente.delete({
            where: { id: clienteId }
          });
        }
      }

      // 6. Deleta pagamentos do estabelecimento
      await tx.mensalidadePagamento.deleteMany({
        where: { estabelecimentoId: estabId }
      });

      // 7. Deleta usuários do estabelecimento
      await tx.usuario.deleteMany({
        where: { estabelecimentoId: estabId }
      });

      // 8. Deleta o logo do sistema de arquivos se existir
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

      // 9. Por fim, deleta o estabelecimento
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

async function resetarSenha(req, res) {
  try {
    const estabId = Number(req.params.id);
    if (!estabId) return res.status(400).json({ error: 'ID inválido' });

    const { novaSenha } = req.body;
    if (!novaSenha || novaSenha.length < 4) {
      return res.status(400).json({ error: 'Nova senha deve ter no mínimo 4 caracteres' });
    }

    // Busca o usuário principal do estabelecimento (operador ou admin)
    const usuario = await prisma.usuario.findFirst({
      where: { estabelecimentoId: estabId },
      orderBy: { id: 'asc' } // Pega o primeiro usuário criado
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário do estabelecimento não encontrado' });
    }

    // Hash da nova senha usando bcrypt
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualiza a senha com hash
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senhaHash }
    });

    return res.json({ 
      ok: true, 
      message: 'Senha resetada com sucesso',
      username: usuario.nomeUsuario 
    });
  } catch (err) {
    console.error('[SuperAdmin] erro resetarSenha:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao resetar senha' });
  }
}

async function alterarStatus(req, res) {
  try {
    const estabId = Number(req.params.id);
    if (!estabId) return res.status(400).json({ error: 'ID inválido' });

    const { ativo } = req.body;
    if (typeof ativo !== 'boolean') {
      return res.status(400).json({ error: 'Campo "ativo" deve ser boolean' });
    }

    // Atualiza o status alterando a validade da assinatura
    // Se ativo = false, seta assinatura para data passada
    // Se ativo = true, seta assinatura para 31 dias à frente
    const novaDataValidade = ativo 
      ? new Date(Date.now() + 31 * 24 * 60 * 60 * 1000) // 31 dias no futuro
      : new Date('2020-01-01'); // Data no passado = inativo

    await prisma.estabelecimento.update({
      where: { id: estabId },
      data: { assinaturaValidaAte: novaDataValidade }
    });

    return res.json({ 
      ok: true, 
      message: `Estabelecimento ${ativo ? 'ativado' : 'desativado'} com sucesso`,
      ativo 
    });
  } catch (err) {
    console.error('[SuperAdmin] erro alterarStatus:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao alterar status' });
  }
}

async function enviarNotificacao(req, res) {
  try {
    const estabId = Number(req.params.id);
    if (!estabId) return res.status(400).json({ error: 'ID inválido' });

    const { mensagem } = req.body;
    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({ error: 'Mensagem não pode estar vazia' });
    }

    // Verifica se estabelecimento existe
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: estabId }
    });

    if (!estabelecimento) {
      return res.status(404).json({ error: 'Estabelecimento não encontrado' });
    }

    // Cria a notificação no banco de dados
    const notificacao = await prisma.notificacao.create({
      data: {
        estabelecimentoId: estabId,
        titulo: 'Mensagem do Administrador',
        mensagem: mensagem.trim(),
        tipo: 'info',
        lida: false
      }
    });

    console.log(`[SuperAdmin] Notificação criada para estabelecimento ${estabId} (${estabelecimento.nome})`);

    return res.json({ 
      ok: true, 
      message: 'Notificação enviada com sucesso',
      notificacao: {
        id: notificacao.id,
        estabelecimento: estabelecimento.nome,
        mensagem: notificacao.mensagem,
        enviadoEm: notificacao.criadaEm
      }
    });
  } catch (err) {
    console.error('[SuperAdmin] erro enviarNotificacao:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao enviar notificação' });
  }
}

module.exports = { 
  listar, 
  atualizar, 
  remover, 
  registrarPagamentoManual,
  resetarSenha,
  alterarStatus,
  enviarNotificacao
};


