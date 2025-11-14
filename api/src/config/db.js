const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Voyageturbo13',
  database: 'appfidelidade',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// teste básico de conexão
pool.getConnection()
  .then(conn => {
    console.log("✅ Conexão MySQL estabelecida com sucesso!");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Erro ao conectar ao MySQL:", err);
  });

module.exports = pool;
