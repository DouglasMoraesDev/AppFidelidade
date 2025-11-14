// api/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// INICIAR A CONEXÃO COM O BANCO (mysql2 pool)
require('./config/db');

const app = express();

// Permitir CORS livremente durante o desenvolvimento.
// Se quiser restringir, troque origin por sua url (ex: http://localhost:5173)
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// Servir imagens estáticas (onde multer salva por padrão no projeto: /img)
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

// Log simples para debug de todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// rotas principais
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/estabelecimentos', require('./routes/estabelecimentos.routes'));
const authMiddleware = require('./middlewares/auth.middleware');
app.use('/api/clientes', authMiddleware, require('./routes/clientes.routes'));
app.use('/api/cartoes', authMiddleware, require('./routes/cartoes.routes'));
app.use('/api/movimentos', authMiddleware, require('./routes/movimentos.routes'));
app.use('/api/vouchers', authMiddleware, require('./routes/vouchers.routes'));

// rota de diagnóstico simples (criar um registro de teste usando Prisma)
app.use('/api/diag', require('./routes/diagnostics.routes'));

// handler de erro genérico (loga stack)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && err.stack ? err.stack : err);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
