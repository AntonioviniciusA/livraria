import mysql from 'mysql2/promise';
import mongoose from 'mongoose';

// Configuração MySQL
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'h9t70p55',
  database: process.env.MYSQL_DATABASE || 'livraria',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  decimalNumbers: true,
};

// Configuração MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/livraria';

// Pool MySQL
let mysqlPool = null;

// Conexão MongoDB
let mongoConnection = null;

export async function initDatabases() {
  try {
    // Inicializar MySQL
    mysqlPool = mysql.createPool(mysqlConfig);
    const mysqlConn = await mysqlPool.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso!');
    mysqlConn.release();

    // Inicializar MongoDB
    mongoConnection = await mongoose.connect(mongoURI);
    console.log('✅ Conectado ao MongoDB com sucesso!');

    return { mysqlPool, mongoConnection };
  } catch (error) {
    console.error('❌ Erro ao conectar com os bancos:', error);
    throw error;
  }
}

export function getMySQL() {
  if (!mysqlPool) throw new Error('MySQL Pool não inicializado');
  return mysqlPool;
}

export function getMongoDB() {
  if (!mongoConnection) throw new Error('MongoDB não inicializado');
  return mongoose;
}