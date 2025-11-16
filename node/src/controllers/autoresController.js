const db = require('../config/db');
const mongoDb = require('../config/mongodb');

async function list(req, res) {
  try {
    // Buscar no MySQL (dados principais)
    const [rows] = await db.getPool().query(`
      SELECT 
        a.id,
        a.nome,
        a.bio,
        DATE_FORMAT(a.data_cadastro, '%d/%m/%Y') as data_cadastro,
        COUNT(l.id) as total_livros
      FROM autores a
      LEFT JOIN livros l ON a.id = l.autor_id
      GROUP BY a.id
      ORDER BY a.nome
    `);
    
    // Buscar informações detalhadas no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const autoresCollection = dbMongo.collection('autores_detalhes');
    
    const autoresComDetalhes = await Promise.all(
      rows.map(async (autor) => {
        const detalhes = await autoresCollection.findOne({ 
          autor_id: autor.id 
        });
        
        return {
          id: autor.id,
          nome: autor.nome,
          bio: autor.bio,
          data_cadastro: autor.data_cadastro,
          total_livros: parseInt(autor.total_livros),
          detalhes: detalhes || {}
        };
      })
    );
    
    res.json(autoresComDetalhes);
  } catch (error) {
    console.error('Erro ao buscar autores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function create(req, res) {
  const connection = await db.getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    const { nome, bio, detalhes = {} } = req.body;
    
    // Inserir no MySQL
    const [result] = await connection.query(
      'INSERT INTO autores (nome, bio) VALUES (?, ?)', 
      [nome, bio]
    );
    
    const autorId = result.insertId;

    // Inserir detalhes no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const autoresCollection = dbMongo.collection('autores_detalhes');
    
    if (Object.keys(detalhes).length > 0) {
      await autoresCollection.insertOne({
        autor_id: autorId,
        ...detalhes,
        data_criacao: new Date()
      });
    }

    await connection.commit();
    
    res.status(201).json({ 
      id: autorId,
      message: 'Autor criado com sucesso'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar autor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  } finally {
    connection.release();
  }
}

module.exports = { list, create };