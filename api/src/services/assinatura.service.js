const prisma = require('../config/prismaClient');

function getValidadeLimite(dias = 31) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(now.getTime() + dias * 24 * 60 * 60 * 1000);
}

async function assertMensalidadeAtiva(estabelecimentoId) {
  const estab = await prisma.estabelecimento.findUnique({
    where: { id: Number(estabelecimentoId) },
    select: { assinaturaValidaAte: true }
  });

  if (!estab) {
    const err = new Error('Estabelecimento não localizado');
    err.code = 'ESTAB_NAO_ENCONTRADO';
    throw err;
  }

  if (!estab.assinaturaValidaAte || new Date(estab.assinaturaValidaAte) < new Date()) {
    const err = new Error('Mensalidade vencida');
    err.code = 'MENSALIDADE_VENCIDA';
    throw err;
  }
}

async function registrarPagamento(estabelecimentoId, dias = 31, dataBase = new Date()) {
  const validade = new Date(dataBase.getTime());
  validade.setDate(validade.getDate() + dias);

  await prisma.$transaction([
    prisma.mensalidadePagamento.create({
      data: {
        estabelecimentoId: Number(estabelecimentoId),
        pagoEm: dataBase
      }
    }),
    prisma.estabelecimento.update({
      where: { id: Number(estabelecimentoId) },
      data: { assinaturaValidaAte: validade }
    })
  ]);

  return validade;
}

module.exports = {
  assertMensalidadeAtiva,
  registrarPagamento,
  getValidadeLimite
};

