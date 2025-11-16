import { initDatabases, getMySQL, getMongoDB } from './databases.js';

let databases = null;

async function init() {
  try {
    databases = await initDatabases();
    return databases;
  } catch (error) {
    console.error('❌ Erro ao inicializar bancos:', error);
    throw error;
  }
}

function getPool() {
  return getMySQL();
}

function getMongo() {
  return getMongoDB();
}

// Função para testar as conexões
async function testConnections() {
  try {
    // Testar MySQL
    const mysqlConn = await getMySQL().getConnection();
    const [mysqlRows] = await mysqlConn.query('SELECT 1 + 1 as result');
    console.log('✅ Teste MySQL bem-sucedido:', mysqlRows);
    mysqlConn.release();

    // Testar MongoDB
    const mongoStatus = getMongo().connection.readyState;
    console.log('✅ Teste MongoDB bem-sucedido. Status:', mongoStatus === 1 ? 'Conectado' : 'Desconectado');

    return true;
  } catch (error) {
    console.error('❌ Teste de conexões falhou:', error);
    return false;
  }
}

export {
  init,
  getPool,
  getMongo,
  testConnections,
};