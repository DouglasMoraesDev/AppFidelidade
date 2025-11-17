// api/src/controllers/auth.controller.js
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_esta_senha';

async function login(req, res) {
  try {
    const { nomeUsuario, senha } = req.body;
    if (!nomeUsuario || !senha) return res.status(400).json({ error: 'nomeUsuario e senha são obrigatórios' });

    const user = await prisma.usuario.findFirst({ where: { nomeUsuario } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const match = await bcrypt.compare(senha, user.senhaHash);
    if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: user.estabelecimentoId },
      select: {
        id: true,
        nome: true,
        logo_path: true,
        mensagem_voucher: true,
        pontos_para_voucher: true,
        assinaturaValidaAte: true,
        nome_app: true,
        slug_publico: true,
        link_consulta: true
      }
    });

    if (!estabelecimento) {
      return res.status(404).json({ error: 'Estabelecimento vinculado não encontrado' });
    }

    const assinaturaValida = estabelecimento.assinaturaValidaAte
      ? new Date(estabelecimento.assinaturaValidaAte) > new Date()
      : false;

    const token = jwt.sign({ userId: user.id, estabelecimentoId: user.estabelecimentoId }, JWT_SECRET, { expiresIn: '8h' });

    return res.json({
      token,
      usuario: { id: user.id, nomeUsuario: user.nomeUsuario },
      estabelecimento,
      requiresPayment: !assinaturaValida
    });
  } catch (err) {
    console.error('[Auth] Erro no login:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro interno no login' });
  }
}

async function alterarSenha(req, res) {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Usuário não autenticado' });

    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) return res.status(400).json({ error: 'senhaAtual e novaSenha são obrigatórios' });

    const usuario = await prisma.usuario.findUnique({ where: { id: Number(userId) } });
    if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

    const confere = await bcrypt.compare(senhaAtual, usuario.senhaHash);
    if (!confere) return res.status(401).json({ error: 'Senha atual inválida' });

    const hash = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { senhaHash: hash }
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('[Auth] erro alterarSenha:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro ao alterar senha' });
  }
}

module.exports = { login, alterarSenha };
