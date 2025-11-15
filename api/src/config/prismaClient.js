// api/src/config/prismaClient.js
// Exporta uma instância do PrismaClient.
// NÃO fazemos prisma.$connect() automaticamente aqui para evitar async top-level surprises;
// o servidor chamará prisma.$connect() na inicialização para observar/registrar erros.

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.warn('[Prisma] DATABASE_URL não encontrada nas variáveis de ambiente. Verifique o arquivo .env em api/ e se a variável está correta.');
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'] // opcional: ajuda a debugar queries durante dev
});

module.exports = prisma;
