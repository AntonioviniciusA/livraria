const db = require("../config/db");

async function list(req, res) {
  try {
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
    
    const categorias = rows.map(categoria => ({
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      data_criacao: categoria.data_criacao,
      total_livros: parseInt(categoria.total_livros)
    }));
    
    res.json(categorias);
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  try {
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

    const categoria = {
      ...rows[0],
      total_livros: parseInt(rows[0].total_livros)
    };

    res.json(categoria);
  } catch (err) {
    console.error("Erro ao buscar categoria:", err);
    res.status(500).json({ error: "Erro ao buscar categoria" });
  }
}

async function create(req, res) {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "O campo 'nome' é obrigatório" });
  }

  try {
    const [result] = await db.getPool().query(
      "INSERT INTO categorias (nome, descricao) VALUES (?, ?)", 
      [nome, descricao || null]
    );

    res.status(201).json({
      message: "Categoria criada com sucesso",
      categoriaId: result.insertId,
    });
  } catch (err) {
    console.error("Erro ao criar categoria:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Já existe uma categoria com este nome" });
    } else {
      res.status(500).json({ error: "Erro ao criar categoria" });
    }
  }
}

async function update(req, res) {
  const { id } = req.params;
  const { nome, descricao } = req.body;

  try {
    const [exists] = await db.getPool().query(
      "SELECT id FROM categorias WHERE id = ?", 
      [id]
    );
    
    if (exists.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    await db.getPool().query(
      "UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?", 
      [nome, descricao || null, id]
    );

    res.json({ message: "Categoria atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err);
    
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: "Já existe uma categoria com este nome" });
    } else {
      res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    const [exists] = await db.getPool().query(
      "SELECT id FROM categorias WHERE id = ?", 
      [id]
    );
    
    if (exists.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    // Verificar se existem livros vinculados a esta categoria
    const [livros] = await db.getPool().query(
      "SELECT id FROM livros WHERE categoria_id = ?", 
      [id]
    );
    
    if (livros.length > 0) {
      return res.status(400).json({ 
        error: "Não é possível excluir esta categoria pois existem livros vinculados a ela" 
      });
    }

    await db.getPool().query("DELETE FROM categorias WHERE id = ?", [id]);

    res.json({ message: "Categoria removida com sucesso" });
  } catch (err) {
    console.error("Erro ao remover categoria:", err);
    res.status(500).json({ error: "Erro ao remover categoria" });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};




/* const db = require("../config/db");

async function list(req, res) {
  try {
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

    const categorias = rows.map(categoria => ({
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      data_criacao: categoria.data_criacao,
      total_livros: parseInt(categoria.total_livros)
    }));

    res.json(categorias);
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
}

// BUSCAR CATEGORIA POR ID
async function getById(req, res) {
  const { id } = req.params;

  /*try {
    const [rows] = await db
      .getPool()
      .query("SELECT * FROM categorias WHERE id = ?", [id]);

try {
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

    res.json(rows[0]);
  } catch (err) {
    console.error("Erro ao buscar categoria:", err);
    res.status(500).json({ error: "Erro ao buscar categoria" });
  }
}

// CRIAR NOVA CATEGORIA
async function create(req, res) {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ error: "O campo 'nome' é obrigatório" });
  }

  try {
    const [result] = await db
      .getPool()
      .query("INSERT INTO categorias (nome, descricao) VALUES (?, ?)", [
        nome,
        descricao || null,
      ]);

    res.status(201).json({
      message: "Categoria criada com sucesso",
      categoriaId: result.insertId,
    });
  } catch (err) {
    console.error("Erro ao criar categoria:", err);
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
}

// ATUALIZAR CATEGORIA
async function update(req, res) {
  const { id } = req.params;
  const { nome, descricao } = req.body;

  try {
    const [exists] = await db
      .getPool()
      .query("SELECT id FROM categorias WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    await db
      .getPool()
      .query("UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?", [
        nome,
        descricao || null,
        id,
      ]);

    res.json({ message: "Categoria atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err);
    res.status(500).json({ error: "Erro ao atualizar categoria" });
  }
}

// EXCLUIR CATEGORIA
async function remove(req, res) {
  const { id } = req.params;

  try {
    const [exists] = await db
      .getPool()
      .query("SELECT id FROM categorias WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    await db.getPool().query("DELETE FROM categorias WHERE id = ?", [id]);

    res.json({ message: "Categoria removida com sucesso" });
  } catch (err) {
    console.error("Erro ao remover categoria:", err);
    res.status(500).json({ error: "Erro ao remover categoria" });
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
*/