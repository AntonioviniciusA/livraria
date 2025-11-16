const db = require("../config/db");
const mongoDb = require("../config/mongodb");

async function list(req, res) {
  try {
    // Buscar no MySQL (dados principais)
    const [rows] = await db.getPool().query(`
      SELECT 
        c.id,
        c.nome,
        c.descricao,
        DATE_FORMAT(c.data_criacao, '%d/%m/%Y') as data_criacao,
        COUNT(l.id) as total_livros
      FROM categorias c
      LEFT JOIN livros l ON c.id = l.categoria_id
      GROUP BY c.id
      ORDER BY c.nome
    `);
    
    // Buscar metadados no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const categoriasCollection = dbMongo.collection('categorias_metadados');
    
    const categoriasComMetadados = await Promise.all(
      rows.map(async (categoria) => {
        const metadados = await categoriasCollection.findOne({ 
          categoria_id: categoria.id 
        });
        
        return {
          id: categoria.id,
          nome: categoria.nome,
          descricao: categoria.descricao,
          data_criacao: categoria.data_criacao,
          total_livros: parseInt(categoria.total_livros),
          metadados: metadados || {}
        };
      })
    );
    
    res.json(categoriasComMetadados);
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  try {
    // Buscar no MySQL
    const [rows] = await db.getPool().query(`
      SELECT 
        c.*,
        DATE_FORMAT(c.data_criacao, '%d/%m/%Y %H:%i') as data_criacao_formatada,
        COUNT(l.id) as total_livros
      FROM categorias c
      LEFT JOIN livros l ON c.id = l.categoria_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    // Buscar metadados no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const categoriasCollection = dbMongo.collection('categorias_metadados');
    
    const metadados = await categoriasCollection.findOne({ 
      categoria_id: parseInt(id) 
    });

    const categoria = {
      ...rows[0],
      total_livros: parseInt(rows[0].total_livros),
      metadados: metadados || {}
    };

    res.json(categoria);
  } catch (err) {
    console.error("Erro ao buscar categoria:", err);
    res.status(500).json({ error: "Erro ao buscar categoria" });
  }
}

async function create(req, res) {
  const { nome, descricao, metadados = {} } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "O campo 'nome' é obrigatório" });
  }

  const connection = await db.getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    // Inserir no MySQL
    const [result] = await connection.query(
      "INSERT INTO categorias (nome, descricao) VALUES (?, ?)", 
      [nome, descricao || null]
    );

    const categoriaId = result.insertId;

    // Inserir metadados no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const categoriasCollection = dbMongo.collection('categorias_metadados');
    
    if (Object.keys(metadados).length > 0) {
      await categoriasCollection.insertOne({
        categoria_id: categoriaId,
        ...metadados,
        data_criacao: new Date()
      });
    }

    await connection.commit();

    res.status(201).json({
      message: "Categoria criada com sucesso",
      categoriaId: categoriaId,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Erro ao criar categoria:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Já existe uma categoria com este nome" });
    } else {
      res.status(500).json({ error: "Erro ao criar categoria" });
    }
  } finally {
    connection.release();
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { nome, descricao, metadados } = req.body;

  const connection = await db.getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar existência no MySQL
    const [exists] = await connection.query(
      "SELECT id FROM categorias WHERE id = ?", 
      [id]
    );
    
    if (exists.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    // Atualizar no MySQL
    await connection.query(
      "UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?", 
      [nome, descricao || null, id]
    );

    // Atualizar metadados no MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const categoriasCollection = dbMongo.collection('categorias_metadados');
    
    if (metadados) {
      await categoriasCollection.updateOne(
        { categoria_id: parseInt(id) },
        { 
          $set: {
            ...metadados,
            data_atualizacao: new Date()
          }
        },
        { upsert: true }
      );
    }

    await connection.commit();

    res.json({ message: "Categoria atualizada com sucesso" });
  } catch (err) {
    await connection.rollback();
    console.error("Erro ao atualizar categoria:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Já existe uma categoria com este nome" });
    } else {
      res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
  } finally {
    connection.release();
  }
}

async function remove(req, res) {
  const { id } = req.params;

  const connection = await db.getPool().getConnection();
  
  try {
    await connection.beginTransaction();

    // Verificar existência no MySQL
    const [exists] = await connection.query(
      "SELECT id FROM categorias WHERE id = ?", 
      [id]
    );
    
    if (exists.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    // Verificar se existem livros vinculados
    const [livros] = await connection.query(
      "SELECT id FROM livros WHERE categoria_id = ?", 
      [id]
    );
    
    if (livros.length > 0) {
      await connection.rollback();
      return res.status(400).json({ 
        error: "Não é possível excluir esta categoria pois existem livros vinculados a ela" 
      });
    }

    // Excluir do MySQL
    await connection.query("DELETE FROM categorias WHERE id = ?", [id]);

    // Excluir metadados do MongoDB
    const mongoClient = mongoDb.getMongoClient();
    const dbMongo = mongoClient.db('livraria');
    const categoriasCollection = dbMongo.collection('categorias_metadados');
    
    await categoriasCollection.deleteOne({ categoria_id: parseInt(id) });

    await connection.commit();

    res.json({ message: "Categoria removida com sucesso" });
  } catch (err) {
    await connection.rollback();
    console.error("Erro ao remover categoria:", err);
    res.status(500).json({ error: "Erro ao remover categoria" });
  } finally {
    connection.release();
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};