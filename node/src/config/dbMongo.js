const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

let conn = null;

async function init() {
  try {
    if (conn) return conn;

    conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DATABASE,
    });

    console.log("✅ Conectado ao MongoDB com sucesso!");

    // Carregar models automaticamente
    loadModels();

    return conn;
  } catch (error) {
    console.error("❌ Erro ao conectar ao MongoDB:", error);
    throw error;
  }
}

function getConn() {
  if (!conn)
    throw new Error("Conexão não inicializada. Chame init() primeiro.");
  return conn;
}

// Testar conexão
async function testConnection() {
  try {
    await mongoose.connection.db.admin().ping();
    console.log("✅ Teste de conexão MongoDB bem-sucedido!");
    return true;
  } catch (error) {
    console.error("❌ Teste de conexão MongoDB falhou:", error);
    return false;
  }
}

/*
  🔥 Carrega automaticamente todos os arquivos da pasta /models
  Cada arquivo deve exportar um mongoose.model(...)
*/
function loadModels() {
  const modelsDir = path.join(__dirname, "..", "models");

  const files = fs.readdirSync(modelsDir);

  files.forEach((file) => {
    if (!file.endsWith(".js")) return;

    const modelPath = path.join(modelsDir, file);
    require(modelPath); // Isso registra o model dentro do mongoose
  });

  console.log("📦 Models carregados automaticamente:", mongoose.modelNames());
}

module.exports = {
  init,
  getConn,
  testConnection,
};
