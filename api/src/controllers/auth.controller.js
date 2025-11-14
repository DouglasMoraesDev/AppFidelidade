const prisma = require('../config/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_esta_senha';

async function login(req, res) {
  const { nomeUsuario, senha } = req.body;
  if (!nomeUsuario || !senha) return res.status(400).json({ error: 'nomeUsuario e senha são obrigatórios' });

  const user = await prisma.usuario.findFirst({ where: { nomeUsuario } });
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

  const match = await bcrypt.compare(senha, user.senhaHash);
  if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = jwt.sign({ userId: user.id, estabelecimentoId: user.estabelecimentoId }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, usuario: { id: user.id, nomeUsuario: user.nomeUsuario } });
}

module.exports = { login };
