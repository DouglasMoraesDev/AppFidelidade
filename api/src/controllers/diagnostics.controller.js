// api/src/controllers/diagnostics.controller.js
const prisma = require('../config/prismaClient');

async function testDB(req, res) {
  try {
    // cria um registro mínimo para testar se o Prisma consegue escrever
    const estab = await prisma.estabelecimento.create({
      data: {
        nome: `TESTE_DB_${Date.now()}`,
        endereco: 'RUA TESTE',
      }
    });
    return res.json({ ok: true, created: estab });
  } catch (err) {
    console.error('diagnostics.testDB erro:', err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
}

module.exports = { testDB };
