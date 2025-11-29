const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { registrarPagamento } = require('../services/assinatura.service');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_esta_senha';
// Usar URL de produção se estiver em produção, senão usar variável de ambiente ou localhost
const FRONTEND_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.FRONTEND_URL || 'https://appfidelidade-production.up.railway.app')
  : (process.env.FRONTEND_URL || 'http://localhost:3000');
const FRONTEND_URL_CLEAN = FRONTEND_URL.replace(/\/$/, '');

async function gerarSlugUnico() {
  for (let tentativas = 0; tentativas < 5; tentativas += 1) {
    const slug = `estab-${crypto.randomBytes(4).toString('hex')}`;
    const existente = await prisma.estabelecimento.findUnique({ where: { slug_publico: slug } }).catch(() => null);
    if (!existente) return slug;
  }
  throw new Error('Não foi possível gerar slug único para o estabelecimento');
}

async function criarEstabelecimento(req, res) {
  try {
    const {
      nome,
      endereco,
      cpf_cnpj,
      telefone,
      email,
      mensagem_voucher,
      nomeUsuario,
      senha
    } = req.body;

    if (!nome) return res.status(400).json({ error: 'nome é obrigatório' });
    if (!nomeUsuario) return res.status(400).json({ error: 'nomeUsuario é obrigatório' });
    if (!senha) return res.status(400).json({ error: 'senha é obrigatória' });

    if (email) {
      const existente = await prisma.estabelecimento.findUnique({ where: { email } }).catch(() => null);
      if (existente) return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const usuarioExistente = await prisma.usuario.findFirst({ where: { nomeUsuario } }).catch(() => null);
    if (usuarioExistente) return res.status(409).json({ error: 'nomeUsuario já existe' });

    if (!req.file) {
      return res.status(400).json({ error: 'O logo do estabelecimento é obrigatório' });
    }

    const pontosParaVoucher = Number(req.body.pontos_para_voucher || req.body.pontosParaVoucher || 10) || 10;
    const mensagemVoucher = mensagem_voucher || 'Parabéns, {cliente}! Você desbloqueou um benefício.';
    const slug = await gerarSlugUnico();
    // Sempre usar URL de produção para links de consulta
    const productionUrl = 'https://appfidelidade-production.up.railway.app';
    const linkConsulta = `${productionUrl}/consultar?slug=${slug}`;

    const estab = await prisma.estabelecimento.create({
      data: {
        nome,
        endereco: endereco || null,
        cpf_cnpj: cpf_cnpj || null,
        telefone: telefone || null,
        email: email || null,
        mensagem_voucher: mensagemVoucher,
        pontos_para_voucher: pontosParaVoucher,
        slug_publico: slug,
        link_consulta: linkConsulta
      }
    });

    let logoPath = null;
    try {
      const original = req.file.originalname || '';
      const ext = path.extname(original) || path.extname(req.file.path) || '.png';
      const destDir = path.join(__dirname, '..', '..', 'img');
      await fsp.mkdir(destDir, { recursive: true });
      const newName = `logo_estab_${estab.id}${ext}`;
      const newPath = path.join(destDir, newName);

      await fsp.rename(req.file.path, newPath).catch(async (err) => {
        console.warn('[Estab] rename falhou, tentando copy:', err && err.message);
        await fsp.copyFile(req.file.path, newPath);
        await fsp.unlink(req.file.path).catch(() => {});
      });

      logoPath = `/img/${newName}`;
    } catch (errFile) {
      console.error('[Estab] erro ao processar logo:', errFile && errFile.stack ? errFile.stack : errFile);
      return res.status(500).json({ error: 'Falha ao salvar o logo do estabelecimento' });
    }

    await prisma.estabelecimento.update({
      where: { id: estab.id },
      data: { logo_path: logoPath }
    });

    await registrarPagamento(estab.id);

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        estabelecimentoId: estab.id,
        nomeUsuario,
        senhaHash,
        papel: 'administrador'
      }
    });

    // opcional: já gerar token para retorno
    const token = jwt.sign({ userId: usuario.id, estabelecimentoId: estab.id }, JWT_SECRET, { expiresIn: '8h' });

    const estabComAssinatura = await prisma.estabelecimento.findUnique({
      where: { id: estab.id },
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        email: true,
        logo_path: true,
        mensagem_voucher: true,
        pontos_para_voucher: true,
        assinaturaValidaAte: true,
        slug_publico: true,
        link_consulta: true,
        nome_app: true
      }
    });

    const result = {
      estabelecimento: estabComAssinatura,
      usuario: { id: usuario.id, nomeUsuario: usuario.nomeUsuario },
      token
    };

    return res.status(201).json(result);
  } catch (err) {
    console.error('[Estab] erro criarEstabelecimento:', err && err.stack ? err.stack : err);
    if (err && (err.code === 'P2002' || err.code === 'ER_DUP_ENTRY')) {
      return res.status(409).json({ error: 'Dado duplicado (email ou nomeUsuario já cadastrado)' });
    }
    return res.status(500).json({ error: 'Erro interno ao criar estabelecimento' });
  }
}

async function me(req, res) {
  try {
    const estabId = req.estabelecimentoId || (req.user && req.user.estabelecimentoId);
    if (!estabId) return res.status(401).json({ error: 'Estabelecimento não encontrado no token' });

    const estab = await prisma.estabelecimento.findUnique({
      where: { id: Number(estabId) },
      include: {
        usuarios: {
          select: {
            id: true,
            nomeUsuario: true,
            papel: true,
            criadoEm: true
          }
        },
        cartoes: {
          select: { id: true }
        }
      }
    });

    if (!estab) return res.status(404).json({ error: 'Estabelecimento não encontrado' });

    const cartoesCount = await prisma.cartaoFidelidade.count({ where: { estabelecimentoId: Number(estabId) } });

    return res.json({
      estabelecimento: {
        id: estab.id,
        nome: estab.nome,
        endereco: estab.endereco,
        cpf_cnpj: estab.cpf_cnpj,
        telefone: estab.telefone,
        email: estab.email,
        mensagem_voucher: estab.mensagem_voucher,
        logo_path: estab.logo_path,
        createdAt: estab.createdAt,
        usuarios: estab.usuarios,
        cartoesCount
      }
    });
  } catch (err) {
    console.error('[Estab] erro me():', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao buscar estabelecimento' });
  }
}

async function snapshot(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId || (req.user && req.user.estabelecimentoId);
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não encontrado no token' });

    let estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: Number(estabelecimentoId) },
      select: {
        id: true,
        nome: true,
        endereco: true,
        telefone: true,
        email: true,
        mensagem_voucher: true,
        pontos_para_voucher: true,
        assinaturaValidaAte: true,
        logo_path: true,
        slug_publico: true,
        link_consulta: true,
        nome_app: true,
        tema_config: true,
        auto_notificar_voucher: true,
        lembrete_pontos_proximos: true
      }
    });

    if (!estabelecimento) return res.status(404).json({ error: 'Estabelecimento não encontrado' });

    // Sempre garantir que o link use a URL de produção
    const slug = estabelecimento.slug_publico;
    if (slug) {
      // Sempre usar URL de produção para links de consulta
      const productionUrl = 'https://appfidelidade-production.up.railway.app';
      const correctLink = `${productionUrl}/consultar?slug=${slug}`;
      
      // Se não tem link ou o link está errado, corrigir
      if (!estabelecimento.link_consulta || 
          estabelecimento.link_consulta.includes('localhost') || 
          estabelecimento.link_consulta.includes(':3000') || 
          estabelecimento.link_consulta.includes(':5173') || 
          estabelecimento.link_consulta.includes(':5174') ||
          !estabelecimento.link_consulta.includes('appfidelidade-production.up.railway.app')) {
        await prisma.estabelecimento.update({
          where: { id: estabelecimento.id },
          data: { link_consulta: correctLink }
        });
        estabelecimento.link_consulta = correctLink;
      }
    }

    const cartoes = await prisma.cartaoFidelidade.findMany({
      where: { estabelecimentoId: Number(estabelecimentoId) },
      include: {
        cliente: true,
        movimentos: { orderBy: { criadoEm: 'desc' }, take: 1 }
      },
      orderBy: { criadoEm: 'desc' }
    });

    const pagamentos = await prisma.mensalidadePagamento.findMany({
      where: { estabelecimentoId: Number(estabelecimentoId) },
      orderBy: { pagoEm: 'desc' },
      take: 12
    });

    const totalVouchers = await prisma.voucher.count({ where: { estabelecimentoId: Number(estabelecimentoId) } });

    return res.json({
      estabelecimento,
      clientes: cartoes.map(card => ({
        id: card.id,
        clienteId: card.clienteId,
        name: card.cliente.nome,
        phone: card.cliente.telefone,
        points: card.pontos,
        lastPointAddition: card.movimentos[0]?.criadoEm || null
      })),
      stats: {
        totalClientes: cartoes.length,
        totalVouchers,
        assinaturaValidaAte: estabelecimento.assinaturaValidaAte
      },
      pagamentos
    });
  } catch (err) {
    console.error('[Estab] erro snapshot:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao montar snapshot' });
  }
}

async function backup(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId || (req.user && req.user.estabelecimentoId);
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não encontrado no token' });

    const data = await prisma.estabelecimento.findUnique({
      where: { id: Number(estabelecimentoId) },
      include: {
        usuarios: { select: { id: true, nomeUsuario: true, papel: true } },
        cartoes: {
          include: {
            cliente: true,
            movimentos: true,
            vouchers: true
          }
        },
        vouchers: true
      }
    });

    if (!data) return res.status(404).json({ error: 'Estabelecimento não encontrado' });

    res.setHeader('Content-Disposition', `attachment; filename="backup-estab-${estabelecimentoId}.json"`);
    return res.json({
      exportadoEm: new Date().toISOString(),
      data
    });
  } catch (err) {
    console.error('[Estab] erro backup:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao gerar backup' });
  }
}

async function atualizarConfiguracoes(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId || (req.user && req.user.estabelecimentoId);
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não encontrado no token' });

    const { mensagem_voucher, nome_app, pontos_para_voucher, link_consulta, tema_config, auto_notificar_voucher, lembrete_pontos_proximos } = req.body;

    const dataUpdate = {};
    if (typeof mensagem_voucher === 'string') dataUpdate.mensagem_voucher = mensagem_voucher;
    if (typeof nome_app === 'string') dataUpdate.nome_app = nome_app;
    if (typeof link_consulta === 'string') {
      // Sempre garantir que o link use URL de produção
      const productionUrl = 'https://appfidelidade-production.up.railway.app';
      // Se o link contém localhost ou está errado, corrigir
      if (link_consulta.includes('localhost') || link_consulta.includes(':3000') || link_consulta.includes(':5173') || link_consulta.includes(':5174')) {
        // Extrair slug do link ou buscar do estabelecimento
        const slugMatch = link_consulta.match(/slug=([^&]+)/);
        const slug = slugMatch ? slugMatch[1] : null;
        if (slug) {
          dataUpdate.link_consulta = `${productionUrl}/consultar?slug=${slug}`;
        } else {
          // Se não tem slug no link, buscar do estabelecimento
          const estab = await prisma.estabelecimento.findUnique({ where: { id: Number(estabelecimentoId) }, select: { slug_publico: true } });
          if (estab?.slug_publico) {
            dataUpdate.link_consulta = `${productionUrl}/consultar?slug=${estab.slug_publico}`;
          } else {
            dataUpdate.link_consulta = link_consulta; // Manter como está se não conseguir corrigir
          }
        }
      } else if (!link_consulta.includes('appfidelidade-production.up.railway.app')) {
        // Se não contém a URL de produção, corrigir
        const slugMatch = link_consulta.match(/slug=([^&]+)/);
        const slug = slugMatch ? slugMatch[1] : null;
        if (slug) {
          dataUpdate.link_consulta = `${productionUrl}/consultar?slug=${slug}`;
        } else {
          const estab = await prisma.estabelecimento.findUnique({ where: { id: Number(estabelecimentoId) }, select: { slug_publico: true } });
          if (estab?.slug_publico) {
            dataUpdate.link_consulta = `${productionUrl}/consultar?slug=${estab.slug_publico}`;
          } else {
            dataUpdate.link_consulta = link_consulta;
          }
        }
      } else {
        dataUpdate.link_consulta = link_consulta; // Já está correto
      }
    }
    if (typeof pontos_para_voucher !== 'undefined') {
      const pontos = Number(pontos_para_voucher);
      if (!Number.isFinite(pontos) || pontos <= 0) {
        return res.status(400).json({ error: 'pontos_para_voucher deve ser maior que zero' });
      }
      dataUpdate.pontos_para_voucher = pontos;
    }
    if (typeof tema_config === 'string') {
      try {
        // Validar que é JSON válido
        JSON.parse(tema_config);
        dataUpdate.tema_config = tema_config;
      } catch (e) {
        return res.status(400).json({ error: 'tema_config deve ser um JSON válido' });
      }
    }
    if (typeof auto_notificar_voucher === 'boolean') dataUpdate.auto_notificar_voucher = auto_notificar_voucher;
    if (typeof lembrete_pontos_proximos === 'boolean') dataUpdate.lembrete_pontos_proximos = lembrete_pontos_proximos;

    const estabelecimento = await prisma.estabelecimento.update({
      where: { id: Number(estabelecimentoId) },
      data: dataUpdate,
      select: {
        id: true,
        nome: true,
        mensagem_voucher: true,
        pontos_para_voucher: true,
        nome_app: true,
        link_consulta: true,
        slug_publico: true,
        tema_config: true,
        auto_notificar_voucher: true,
        lembrete_pontos_proximos: true
      }
    });

    return res.json({ estabelecimento });
  } catch (err) {
    console.error('[Estab] erro atualizarConfiguracoes:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao atualizar configurações' });
  }
}

async function atualizarLogo(req, res) {
  try {
    const estabelecimentoId = req.estabelecimentoId || (req.user && req.user.estabelecimentoId);
    if (!estabelecimentoId) return res.status(401).json({ error: 'Estabelecimento não encontrado no token' });

    if (!req.file) return res.status(400).json({ error: 'Arquivo obrigatório' });

    let logoPath = null;
    try {
      const original = req.file.originalname || '';
      const ext = path.extname(original) || path.extname(req.file.path) || '.png';
      const destDir = path.join(__dirname, '..', '..', 'img');
      await fsp.mkdir(destDir, { recursive: true });
      const newName = `logo_estab_${estabelecimentoId}${ext}`;
      const newPath = path.join(destDir, newName);

      await fsp.rename(req.file.path, newPath).catch(async (err) => {
        console.warn('[Estab] rename falhou ao atualizar logo, tentando copy:', err && err.message);
        await fsp.copyFile(req.file.path, newPath);
        await fsp.unlink(req.file.path).catch(() => {});
      });

      logoPath = `/img/${newName}`;
    } catch (errFile) {
      console.error('[Estab] erro ao atualizar logo:', errFile && errFile.stack ? errFile.stack : errFile);
      return res.status(500).json({ error: 'Falha ao salvar o novo logo' });
    }

    const estabelecimento = await prisma.estabelecimento.update({
      where: { id: Number(estabelecimentoId) },
      data: { logo_path: logoPath },
      select: {
        id: true,
        logo_path: true
      }
    });

    return res.json({ estabelecimento });
  } catch (err) {
    console.error('[Estab] erro atualizarLogo:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao atualizar logo' });
  }
}

module.exports = { criarEstabelecimento, me, snapshot, backup, atualizarConfiguracoes, atualizarLogo };
