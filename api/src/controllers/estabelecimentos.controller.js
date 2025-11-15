// api/src/controllers/estabelecimentos.controller.js
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

    // checar duplicados por email e por nomeUsuario
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

        // mover/renomear o arquivo salvo pelo multer
        await fsp.rename(req.file.path, newPath).catch(async (err) => {
          // se rename falhar (ex: cross-device), tentamos copiar e remover
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
        // não quebramos a criação por causa do logo
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
    // tratar códigos de erro comuns do Prisma
    if (err && (err.code === 'P2002' || err.code === 'ER_DUP_ENTRY')) {
      return res.status(409).json({ error: 'Dado duplicado (email ou nomeUsuario já cadastrado)' });
    }
    return res.status(500).json({ error: 'Erro interno ao criar estabelecimento' });
  }
}

module.exports = { criarEstabelecimento };
