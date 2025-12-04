require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const db = require('./config/db');
const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

// Log simples de cada requisição para ajudar debug em produção
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

// Health endpoint simples para que o load balancer/edge possa verificar disponibilidade
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// servir imagens (logos) estáticas da pasta img/
app.use('/img', express.static(path.join(__dirname, '..', 'img')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/estabelecimentos', require('./routes/estabelecimentos.routes'));
app.use('/api/clientes', require('./routes/clientes.routes'));
app.use('/api/cartoes', require('./routes/cartoes.routes'));
app.use('/api/movimentos', require('./routes/movimentos.routes'));
app.use('/api/vouchers', require('./routes/vouchers.routes'));
app.use('/api/mensalidade', require('./routes/mensalidade.routes'));
app.use('/api/diag', require('./routes/diagnostics.routes'));
app.use('/api/superadmin', require('./routes/superadmin.routes'));
app.use('/api/notificacoes', require('./routes/notificacoes.routes'));

// Tentar localizar o build do frontend em vários caminhos possíveis e servir
// os arquivos estáticos apenas se o `dist` existir. Isso evita erros no runtime
// quando `SERVE_FRONTEND=true` mas o `dist` não foi copiado para o local esperado.
const candidatePaths = [
  path.join(__dirname, '..', '..', 'frontend', 'dist'), // /app/frontend/dist (esperado pelo Dockerfile)
  path.join(__dirname, '..', 'frontend', 'dist'),      // /app/api/frontend/dist (anterior)
  path.join(process.cwd(), 'frontend', 'dist'),         // fallback
];

let servedFrontendPath = null;
for (const p of candidatePaths) {
  if (fs.existsSync(p)) {
    servedFrontendPath = p;
    break;
  }
}

if (servedFrontendPath) {
  console.log('[Server] Servindo frontend estático de:', servedFrontendPath);
  app.use(express.static(servedFrontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(servedFrontendPath, 'index.html'));
  });
} else if (process.env.SERVE_FRONTEND === 'true') {
  console.warn('[Server] SERVE_FRONTEND=true, mas nenhum `frontend/dist` foi encontrado. Não registrando rota estática.');
}

const prisma = require('./config/prismaClient');

async function start() {
  try {
    await prisma.$connect();
    console.log('[Prisma] Conectado com sucesso ao banco de dados.');
  } catch (err) {
    console.error('[Prisma] Erro ao conectar no banco de dados com Prisma:', err && err.stack ? err.stack : err);
  }

  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  });

  const PORT = process.env.PORT || 4000;
  const HOST = process.env.HOST || '0.0.0.0';
  app.listen(PORT, HOST, () => {
    console.log(`API rodando na porta ${PORT} (host ${HOST})`);
  });
}

start().catch(err => {
  console.error('Erro ao iniciar servidor:', err && err.stack ? err.stack : err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err && err.stack ? err.stack : err);
  // Em produção, poderíamos sair do processo para reiniciar: process.exit(1)
});
