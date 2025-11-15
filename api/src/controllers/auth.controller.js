// api/src/controllers/auth.controller.js
const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_esta_senha';

async function login(req, res) {
  try {
    const { nomeUsuario, senha } = req.body;
    if (!nomeUsuario || !senha) return res.status(400).json({ error: 'nomeUsuario e senha são obrigatórios' });

    console.log(`[Auth] login request for usuario="${nomeUsuario}"`);

    const user = await prisma.usuario.findFirst({ where: { nomeUsuario } });
    if (!user) {
      console.warn(`[Auth] usuário não encontrado: ${nomeUsuario}`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const match = await bcrypt.compare(senha, user.senhaHash);
    if (!match) {
      console.warn(`[Auth] senha inválida para usuário: ${nomeUsuario}`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ userId: user.id, estabelecimentoId: user.estabelecimentoId }, JWT_SECRET, { expiresIn: '8h' });
    console.log(`[Auth] usuário autenticado id=${user.id} estab=${user.estabelecimentoId}`);

    return res.json({ token, usuario: { id: user.id, nomeUsuario: user.nomeUsuario } });
  } catch (err) {
    console.error('[Auth] Erro no login:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro interno no login' });
  }
}

module.exports = { login };
