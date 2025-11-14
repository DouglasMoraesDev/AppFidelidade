// api/src/controllers/estabelecimentos.controller.js
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function criarEstabelecimento(req, res) {
  try {
    // debug
    console.log('=== criarEstabelecimento - req.body ===');
    console.log(req.body);
    console.log('=== criarEstabelecimento - req.file ===');
    console.log(req.file);

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

    // validações básicas
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
        mensagem_voucher: mensagem_voucher || null
        // logo_path será atualizado depois, se houver arquivo
      }
    });

    // Se vier arquivo de logo via multer, renomear para incluir extensão e id
    let logoPath = null;
    if (req.file) {
      try {
        const original = req.file.originalname || '';
        const ext = path.extname(original) || path.extname(req.file.path) || '';
        // pasta onde multer salvou o arquivo
        const destDir = req.file.destination || path.dirname(req.file.path);
        const newName = `logo_estab_${estab.id}${ext}`;
        const newPath = path.join(destDir, newName);

        // mover/renomear arquivo
        await fsp.rename(req.file.path, newPath);
        // guarda caminho relativo para servir arquivos estáticos (ajuste conforme sua rota estática)
        logoPath = `/img/${newName}`;

        // atualiza registro do estabelecimento com logo_path
        await prisma.estabelecimento.update({
          where: { id: estab.id },
          data: { logo_path: logoPath }
        });
      } catch (errFile) {
        console.error('Erro ao processar logo:', errFile);
        // não interrompe a criação do estabelecimento; apenas informa que logo não foi salva
      }
    }

    // Criar usuário administrador vinculado ao estabelecimento
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        estabelecimentoId: estab.id,
        nomeUsuario,
        senhaHash,
        papel: 'administrador' // papel padrão para o primeiro usuário
      }
    });

    // monta retorno (omitindo senhaHash)
    const result = {
      estabelecimento: { ...estab, logo_path: logoPath },
      usuario: { id: usuario.id, nomeUsuario: usuario.nomeUsuario }
    };

    console.log('Estabelecimento criado com sucesso id=', estab.id);
    return res.status(201).json(result);
  } catch (err) {
    console.error('Erro criarEstabelecimento:', err);

    // tratar erros de banco como duplicidade de unique
    if (err && err.code && (err.code === 'P2002' || err.code === 'ER_DUP_ENTRY')) {
      return res.status(409).json({ error: 'Dado duplicado (email ou nomeUsuario já cadastrado)' });
    }

    return res.status(500).json({ error: 'Erro interno ao criar estabelecimento' });
  }
}

module.exports = { criarEstabelecimento };
