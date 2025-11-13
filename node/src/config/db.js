const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

let pool = null;

async function init() {
  try {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true,
      decimalNumbers: true,
    });

    const connection = await pool.getConnection();
    console.log("✅ Conectado ao MySQL com sucesso!");

    // Inicializar o banco de dados
    await initializeDatabase(connection);

    connection.release();
    return pool;
  } catch (error) {
    console.error("❌ Erro ao conectar com MySQL:", error);
    throw error;
  }
}

async function initializeDatabase(connection) {
  try {
    console.log("🔄 Inicializando banco de dados...");

    const files = [
      "schema-tabelas.sql",
      "funcoes-procedures.sql",
      "triggers-views.sql",
      "dados-iniciais.sql",
    ];

    // Usar caminho base do projeto
    const basePath = process.cwd(); // Pasta raiz do projeto
    const sqlPath = path.join(basePath, "src", "sql");

    console.log(`📁 Procurando arquivos em: ${sqlPath}`);

    for (const file of files) {
      console.log(`\n📁 Executando: ${file}`);

      const filePath = path.join(sqlPath, file);

      console.log(`   Caminho completo: ${filePath}`);

      if (!fs.existsSync(filePath)) {
        console.error(`   ❌ Arquivo não encontrado: ${filePath}`);
        // Listar arquivos que existem na pasta
        const existingFiles = fs.readdirSync(sqlPath);
        console.log(`   📂 Arquivos encontrados em ${sqlPath}:`, existingFiles);
        throw new Error(`Arquivo ${file} não encontrado`);
      }

      const sql = fs.readFileSync(filePath, "utf8");
      // Dividir por statements
      const statements = sql
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => {
          return (
            stmt.length > 0 &&
            !stmt.startsWith("--") &&
            !stmt.startsWith("/*") &&
            stmt !== "\n" &&
            stmt !== "\r\n"
          );
        });

      console.log(`   Encontrados ${statements.length} statements`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            // Pular comandos DELIMITER se existirem
            if (statement.startsWith("DELIMITER")) {
              console.log(`   ⏭️  Pulando DELIMITER`);
              continue;
            }

            await connection.query(statement);
            console.log(`   ✅ Statement ${i + 1} executado`);
          } catch (stmtError) {
            console.error(
              `   ❌ Erro no statement ${i + 1}:`,
              stmtError.message
            );
            console.log(`   Statement: ${statement.substring(0, 100)}...`);
            throw stmtError;
          }
        }
      }

      console.log(`✅ ${file} executado com sucesso!`);
    }

    console.log("\n🎉 Banco de dados inicializado com sucesso!");
    return true;
  } catch (error) {
    console.error("❌ Erro crítico ao inicializar banco:", error);
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
  initializeDatabase,
  testConnection,
};
