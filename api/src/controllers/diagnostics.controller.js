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

async function overview(req, res) {
  try {
    const agora = new Date();

    const [estabelecimentos, clientes, vouchers, inadimplentes] = await Promise.all([
      prisma.estabelecimento.count(),
      prisma.cliente.count(),
      prisma.voucher.count(),
      prisma.estabelecimento.count({
        where: {
          OR: [
            { assinaturaValidaAte: null },
            { assinaturaValidaAte: { lt: agora } }
          ]
        }
      })
    ]);

    return res.json({
      estabelecimentos,
      clientes,
      vouchers,
      inadimplentes
    });
  } catch (err) {
    console.error('diagnostics.overview erro:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
}

module.exports = { testDB, overview };
