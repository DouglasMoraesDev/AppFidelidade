// api/src/config/db.js
// Inicializa um pool mysql2 opcional a partir de DATABASE_URL (útil se precisar de operações diretas com mysql2).
// Também emite mensagens claras se a variável de ambiente estiver ausente/mal formada.

require('dotenv').config();
const { URL } = require('url');

let pool = null;

function parseDatabaseUrl(urlString) {
  try {
    const url = new URL(urlString);
    const auth = (url.username || '') + (url.password ? `:${url.password}` : '');
    return {
      host: url.hostname,
      port: url.port ? Number(url.port) : 3306,
      user: url.username,
      password: url.password,
      database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
    };
  } catch (err) {
    throw new Error(`DATABASE_URL inválida: ${err.message}`);
  }
}

async function init() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.warn('[DB] Variável DATABASE_URL não encontrada. Prisma usará a configuração se estiver setada em outro lugar, mas sem DATABASE_URL a API não conectará ao MySQL.');
    return;
  }

  // somente inicializa pool se o protocolo for mysql(s)
  if (!DATABASE_URL.startsWith('mysql')) {
    console.info('[DB] DATABASE_URL não aponta para MySQL — pulando criação de pool mysql2.');
    return;
  }

  try {
    const mysql = require('mysql2/promise');
    const cfg = parseDatabaseUrl(DATABASE_URL);
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Testa a conexão imediatamente
    const conn = await pool.getConnection();
    conn.release();
    console.log('[DB] Pool mysql2 criado e conexão testada com sucesso.');
  } catch (err) {
    console.error('[DB] Erro ao criar pool mysql2:', err && err.stack ? err.stack : err);
    // não finalizamos o processo aqui — deixamos o servidor decidir, mas emitimos log claro.
  }
}

// inicia automaticamente
init().catch(err => {
  console.error('[DB] init() erro inesperado:', err && err.stack ? err.stack : err);
});

module.exports = {
  getPool: () => pool,
};
