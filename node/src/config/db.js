const mysql = require('mysql2/promise');

let pool = null;

async function init() {
  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    decimalNumbers: true
  });
  const conn = await pool.getConnection();
  await conn.query('SELECT 1');
  conn.release();
  console.log('MySQL pool created');
}

function getPool() {
  if (!pool) throw new Error('Pool not initialized');
  return pool;
}

module.exports = { init, getPool };
