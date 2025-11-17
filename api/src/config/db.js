require('dotenv').config();
const { URL } = require('url');

let pool = null;

function parseDatabaseUrl(urlString) {
  try {
    const url = new URL(urlString);
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
    console.warn('[DB] Variável DATABASE_URL não encontrada. Prisma usará a configuração se estiver setada em outro lugar.');
    return;
  }

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

    const conn = await pool.getConnection();
    conn.release();
    console.log('[DB] Pool mysql2 criado e conexão testada com sucesso.');
  } catch (err) {
    console.error('[DB] Erro ao criar pool mysql2:', err && err.stack ? err.stack : err);
  }
}

init().catch(err => {
  console.error('[DB] init() erro inesperado:', err && err.stack ? err.stack : err);
});

module.exports = {
  getPool: () => pool,
};
