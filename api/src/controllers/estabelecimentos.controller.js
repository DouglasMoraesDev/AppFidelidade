// api/src/controllers/estabelecimentos.controller.js
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

async function criarEstabelecimento(req, res) {
  try {
    // Debug logs para inspecionar request
    console.log('=== criarEstabelecimento - req.body ===');
    console.log(req.body);
    console.log('=== criarEstabelecimento - req.file ===');
    console.log(req.file);

    const { nome, endereco, cpf_cnpj, telefone, email, mensagem_voucher, nomeUsuario, senha } = req.body;
    if (!nome || !nomeUsuario || !senha) {
      return res.status(400).json({ error: 'nome, nomeUsuario e senha são obrigatórios' });
    }

    // Cria estabelecimento
    const estab = await prisma.estabelecimento.create({
      data: {
        nome,
        endereco,
        cpf_cnpj,
        telefone,
        email,
        mensagem_voucher
      }
    });

    // Processa upload do logo (se houver)
    let logoPath = null;
    if (req.file) {
      try {
        const ext = path.extname(req.file.originalname) || '.png';
        const newName = `logo_estab_${estab.id}${ext}`;
        const dest = path.join(__dirname, '..', '..', 'img', newName);

        // mover arquivo temporário para pasta de imagens
        await fsp.rename(req.file.path, dest);

        logoPath = `/img/${newName}`;
        await prisma.estabelecimento.update({ where: { id: estab.id }, data: { logo_path: logoPath }});
      } catch (errMove) {
        console.error('Erro ao mover arquivo de logo:', errMove);
        // tenta remover arquivo temporário se existir
        try { if (req.file && req.file.path) await fsp.unlink(req.file.path); } catch(e){/*ignore*/}

        // Mas não falha a criação do estabelecimento por causa do upload
        logoPath = null;
      }
    }

    // Cria usuário (hash da senha)
    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await prisma.usuario.create({
      data: {
        estabelecimentoId: estab.id,
        nomeUsuario,
        senhaHash
      }
    });

    // Retorna dados (omitindo senhaHash)
    const result = {
      estabelecimento: { ...estab, logo_path: logoPath },
      usuario: { id: usuario.id, nomeUsuario: usuario.nomeUsuario }
    };

    console.log('Estabelecimento criado com sucesso id=', estab.id);
    return res.status(201).json(result);
  } catch (err) {
    console.error('Erro criarEstabelecimento:', err);
    return res.status(500).json({ error: 'Erro interno ao criar estabelecimento' });
  }
}

module.exports = { criarEstabelecimento };
