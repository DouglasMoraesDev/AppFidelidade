// api/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// INICIAR A CONEXÃO COM O BANCO (mysql2 pool) — agora este arquivo exporta getPool().
// (não é obrigatório para o Prisma, mas útil para acesso direto se preciso)
const db = require('./config/db');

const app = express();

// Permitir CORS livremente durante o desenvolvimento.
// Se quiser restringir, troque origin por sua url (ex: http://localhost:5173)
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// import das rotas (não inicializa antes de ter carregado dotenv)
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/estabelecimentos', require('./routes/estabelecimentos.routes'));
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/cartoes', require('./routes/cartoes.routes'));
app.use('/api/movimentos', require('./routes/movimentos.routes'));
app.use('/api/vouchers', require('./routes/vouchers.routes'));
app.use('/api/diag', require('./routes/diagnostics.routes'));

// uma checagem robusta de conexão do Prisma na inicialização:
const prisma = require('./config/prismaClient');

async function start() {
  try {
    // tenta conectar o Prisma explicitamente (vai falhar rápido se DATABASE_URL estiver errada)
    await prisma.$connect();
    console.log('[Prisma] Conectado com sucesso ao banco de dados.');
  } catch (err) {
    console.error('[Prisma] Erro ao conectar no banco de dados com Prisma:', err && err.stack ? err.stack : err);
    console.error('Verifique sua variável de ambiente DATABASE_URL no arquivo api/.env e se o banco está acessível.');
    // Opcional: sair com erro para evitar servidor rodando sem BD
    // process.exit(1);
  }

  // handler de erro genérico (loga stack)
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`API rodando na porta ${PORT}`);
  });
}

// inicia tudo
start().catch(err => {
  console.error('Erro ao iniciar servidor:', err && err.stack ? err.stack : err);
  process.exit(1);
});
