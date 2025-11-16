const db = require("../config/db");
const mongoDb = require("../config/mongodb");

async function list(req, res) {
  try {
    // Buscar no MySQL (dados principais)
    const [rows] = await db.getPool().query(`
      SELECT 
        e.id,
        e.nome,
        e.pais,
        e.contato,
        DATE_FORMAT(e.data_cadastro, '%d/%m/%Y') as data_cadastro,
        COUNT(l.id) as total_livros
      FROM editoras e
      LEFT JOIN livros l ON e.id = l.editora_id
      GROUP BY e.id
      ORDER BY e.nome
    `);
    
    // Buscar informações adicionais no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const editorasCollection = dbMongo.collection('editoras_informacoes');
    
    const editorasComInformacoes = await Promise.all(
      rows.map(async (editora) => {
        const informacoes = await editorasCollection.findOne({ 
          editora_id: editora.id 
        });
        
        return {
          id: editora.id,
          nome: editora.nome,
          pais: editora.pais,
          contato: editora.contato,
          data_cadastro: editora.data_cadastro,
          total_livros: parseInt(editora.total_livros),
          informacoes: informacoes || {}
        };
      })
    );
    
    res.json(editorasComInformacoes);
  } catch (error) {
    console.error('Erro ao buscar editoras:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function create(req, res) {
  const connection = await db.getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    const { nome, pais, contato, informacoes = {} } = req.body;
    
    if (!nome || !pais) {
      await connection.rollback();
      return res.status(400).json({ error: "nome and pais are required" });
    }

    // Inserir no MySQL
    const [result] = await connection.query(
      "INSERT INTO editoras (nome, pais, contato) VALUES (?,?,?)", 
      [nome, pais, contato]
    );

    const editoraId = result.insertId;

    // Inserir informações adicionais no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const editorasCollection = dbMongo.collection('editoras_informacoes');
    
    if (Object.keys(informacoes).length > 0) {
      await editorasCollection.insertOne({
        editora_id: editoraId,
        ...informacoes,
        data_criacao: new Date()
      });
    }

    await connection.commit();

    res.status(201).json({ 
      id: editoraId,
      message: "Editora criada com sucesso"
    });
  } catch (error) {
    await connection.rollback();
    console.error("Erro ao criar editora:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  } finally {
    connection.release();
  }
}

module.exports = { list, create };