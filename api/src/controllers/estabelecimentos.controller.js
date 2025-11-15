// api/src/controllers/estabelecimentos.controller.js
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function criarEstabelecimento(req, res) {
  try {
    console.log('[Estab] POST /api/estabelecimentos - inicio');
    console.log('[Estab] body keys:', Object.keys(req.body || {}));
    if (req.file) console.log('[Estab] arquivo recebido:', req.file.originalname, 'path:', req.file.path);

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

    // checar duplicados
    if (email) {
      const existente = await prisma.estabelecimento.findUnique({ where: { email } }).catch(() => null);
      if (existente) return res.status(409).json({ error: 'Email já cadastrado em outro estabelecimento' });
    }

    const usuarioExistente = await prisma.usuario.findFirst({ where: { nomeUsuario } }).catch(() => null);
    if (usuarioExistente) return res.status(409).json({ error: 'nomeUsuario já existe' });

    // Criar estabelecimento
    const estab = await prisma.estabelecimento.create({
      data: {
        nome,
        endereco: endereco || null,
        cpf_cnpj: cpf_cnpj || null,
        telefone: telefone || null,
        email: email || null,
        mensagem_voucher: mensagem_voucher || null,
      }
    });

    // tratar logo (se houver)
    let logoPath = null;
    if (req.file) {
      try {
        const original = req.file.originalname || '';
        const ext = path.extname(original) || path.extname(req.file.path) || '';
        const destDir = req.file.destination || path.dirname(req.file.path);
        const newName = `logo_estab_${estab.id}${ext || '.png'}`;
        const newPath = path.join(destDir, newName);

        await fsp.rename(req.file.path, newPath).catch(async (err) => {
          console.warn('[Estab] rename falhou, tentando copy:', err && err.message);
          await fsp.copyFile(req.file.path, newPath);
          await fsp.unlink(req.file.path).catch(() => {});
        });

        logoPath = `/img/${newName}`;

        await prisma.estabelecimento.update({
          where: { id: estab.id },
          data: { logo_path: logoPath }
        });

      } catch (errFile) {
        console.error('[Estab] erro ao processar logo:', errFile && errFile.stack ? errFile.stack : errFile);
      }
    }

    // criar usuário administrador
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        estabelecimentoId: estab.id,
        nomeUsuario,
        senhaHash,
        papel: 'administrador'
      }
    });

    const result = {
      estabelecimento: { ...estab, logo_path: logoPath },
      usuario: { id: usuario.id, nomeUsuario: usuario.nomeUsuario }
    };

    console.log(`[Estab] criado id=${estab.id} usuarioId=${usuario.id}`);
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
          select: { id: true } // devolver só contagem mínima (evita payload grande)
        }
      }
    });

    if (!estab) return res.status(404).json({ error: 'Estabelecimento não encontrado' });

    // opcional: contar cartoes / clientes / vouchers
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

module.exports = { criarEstabelecimento, me };
