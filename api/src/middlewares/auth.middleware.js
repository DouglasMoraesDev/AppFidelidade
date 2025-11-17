require('dotenv').config();
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

const JWT_SECRET = process.env.JWT_SECRET || 'troque_esta_senha';

async function authMiddleware(req, res, next) {
  try {
    const auth = req.headers.authorization || req.headers.Authorization || '';
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token ausente' });
    }
    const token = auth.split(' ')[1];

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.userId = payload.userId;
    req.estabelecimentoId = payload.estabelecimentoId;

    try {
      const user = await prisma.usuario.findUnique({ where: { id: Number(req.userId) } });
      if (!user) return res.status(401).json({ error: 'Usuário do token não existe' });
      req.user = user;
    } catch (err) {
      console.warn('auth.middleware: erro ao buscar usuario', err);
    }

    return next();
  } catch (err) {
    console.error('auth.middleware error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro interno de autenticação' });
  }
}

module.exports = authMiddleware;
