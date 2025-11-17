require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  console.warn('[Prisma] DATABASE_URL não encontrada nas variáveis de ambiente. Verifique api/.env');
}

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

module.exports = prisma;
