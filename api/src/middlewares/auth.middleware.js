// api/src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_esta_senha';

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const usuario = await prisma.usuario.findUnique({ where: { id: payload.userId }});
    if (!usuario) return res.status(401).json({ error: 'Usuário inválido' });
    req.user = { id: usuario.id, nomeUsuario: usuario.nomeUsuario, estabelecimentoId: usuario.estabelecimentoId };
    next();
  } catch (err) {
    console.error('auth error', err);
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = authMiddleware;
