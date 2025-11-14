const mysql = require("mysql2/promise");

let pool = null;

async function init() {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
      decimalNumbers: true,
    });

    const connection = await pool.getConnection();
    console.log("✅ Conectado ao MySQL com sucesso!");

    connection.release();
    return pool;
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error);
    throw error;
  }
}
function getPool() {
  if (!pool) throw new Error("Pool não inicializado. Chame init() primeiro.");
  return pool;
}

// Função para testar a conexão
async function testConnection() {
  try {
    const connection = await getPool().getConnection();
    const [rows] = await connection.query("SELECT 1 + 1 as result");
    console.log("✅ Teste de conexão bem-sucedido:", rows);
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Teste de conexão falhou:", error);
    return false;
  }
}

module.exports = {
  init,
  getPool,
  testConnection,
};
