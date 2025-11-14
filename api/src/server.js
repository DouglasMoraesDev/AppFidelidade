// api/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// INICIAR A CONEXÃO COM O BANCO
require('./config/db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// LOG TEMPORÁRIO - listar todas as requisições para debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// serve images (logos) - arquivos salvos em api/img
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

// routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/estabelecimentos', require('./routes/estabelecimentos.routes'));
const authMiddleware = require('./middlewares/auth.middleware');
app.use('/api/clientes', authMiddleware, require('./routes/clientes.routes'));
app.use('/api/cartoes', authMiddleware, require('./routes/cartoes.routes'));
app.use('/api/movimentos', authMiddleware, require('./routes/movimentos.routes'));
app.use('/api/vouchers', authMiddleware, require('./routes/vouchers.routes'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});
