// api/src/middlewares/auth.middleware.js
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

    // payload deve ter userId e estabelecimentoId (conforme login controller)
    req.userId = payload.userId;
    req.estabelecimentoId = payload.estabelecimentoId;

    // opcional: carregar usuário do DB para req.user
    try {
      const user = await prisma.usuario.findUnique({ where: { id: Number(req.userId) } });
      if (!user) {
        return res.status(401).json({ error: 'Usuário do token não existe' });
      }
      req.user = user;
    } catch (err) {
      console.warn('auth.middleware: erro ao buscar usuario', err);
      // não bloqueia caso de erro de leitura, mas em geral não deve ocorrer
    }

    return next();
  } catch (err) {
    console.error('auth.middleware error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Erro interno de autenticação' });
  }
}

module.exports = authMiddleware;
