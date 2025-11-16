const db = require('../config/db');
const mongoDb = require('../config/mongodb');

async function list(req, res) {
  try {
    // Buscar no MySQL (dados principais)
    const [rows] = await db.getPool().query(`
      SELECT 
        c.id,
        c.nome,
        c.email,
        c.telefone,
        c.endereco,
        DATE_FORMAT(c.data_cadastro, '%d/%m/%Y') as data_cadastro,
        COUNT(p.id) as total_pedidos,
        COALESCE(SUM(p.total), 0) as valor_total_pedidos
      FROM clientes c
      LEFT JOIN pedidos p ON c.id = p.cliente_id
      GROUP BY c.id
      ORDER BY c.nome
    `);
    
    // Buscar dados complementares no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const clientesCollection = dbMongo.collection('clientes_complemento');
    
    const clientesComComplemento = await Promise.all(
      rows.map(async (cliente) => {
        const complemento = await clientesCollection.findOne({ 
          cliente_id: cliente.id 
        });
        
        return {
          id: cliente.id,
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone,
          endereco: cliente.endereco,
          data_cadastro: cliente.data_cadastro,
          total_pedidos: parseInt(cliente.total_pedidos),
          valor_total_pedidos: parseFloat(cliente.valor_total_pedidos),
          complemento: complemento || {}
        };
      })
    );
    
    res.json(clientesComComplemento);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function create(req, res) {
  const connection = await db.getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    const { nome, email, telefone, endereco, complemento = {} } = req.body;
    
    // Inserir no MySQL
    const [result] = await connection.query(
      'INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)', 
      [nome, email, telefone, endereco]
    );
    
    const clienteId = result.insertId;

    // Inserir dados complementares no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const clientesCollection = dbMongo.collection('clientes_complemento');
    
    if (Object.keys(complemento).length > 0) {
      await clientesCollection.insertOne({
        cliente_id: clienteId,
        ...complemento,
        data_criacao: new Date()
      });
    }

    await connection.commit();
    
    res.status(201).json({ 
      id: clienteId,
      message: 'Cliente criado com sucesso'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar cliente:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  } finally {
    connection.release();
  }
}

module.exports = { list, create };