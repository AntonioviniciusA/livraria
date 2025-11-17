const db = require("../config/db");
const { addLog } = require("../services/logService");

const possibleDateColumns = [
  "data_criacao",
  "created_at",
  "data_cadastro",
  "criado_em",
  "timestamp",
  "createdAt",
  "data_criado",
];
let foundDateColumn = null;

// Função para descobrir a coluna de data uma vez
async function discoverDateColumn() {
  if (foundDateColumn) return foundDateColumn;

  for (const col of possibleDateColumns) {
    try {
      const testQuery = `SELECT ${col} FROM categorias LIMIT 1`;
      await db.getPool().query(testQuery);
      foundDateColumn = col;
      console.log(`Coluna de data encontrada: ${col}`);
      return col;
    } catch (err) {
      continue;
    }
  }

  console.log("Nenhuma coluna de data encontrada, usando NULL como fallback");
  foundDateColumn = null;
  return null;
}

// Função auxiliar para construir a query com a coluna de data correta
function buildDateColumn(columnName, alias, format = "%d/%m/%Y") {
  if (!columnName) {
    return `NULL as ${alias}`;
  }
  return `DATE_FORMAT(c.${columnName}, '${format}') as ${alias}`;
}

async function list(req, res) {
  try {
    const dateColumnName = await discoverDateColumn();
    const dateColumn = buildDateColumn(dateColumnName, "data_criacao");

    const [rows] = await db.getPool().query(`
      SELECT 
        c.id,
        c.nome,
        c.descricao,
        ${dateColumn},
        COUNT(l.id) as total_livros
      FROM categorias c
      LEFT JOIN livros l ON c.id = l.categoria_id
      GROUP BY c.id
      ORDER BY c.nome
    `);

    const categorias = rows.map((categoria) => ({
      id: categoria.id,
      nome: categoria.nome,
      descricao: categoria.descricao,
      data_criacao: categoria.data_criacao,
      total_livros: parseInt(categoria.total_livros),
    }));

    console.log(categorias);
    res.json(categorias);
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
}

async function getById(req, res) {
  const { id } = req.params;

  try {
    const dateColumnName = await discoverDateColumn();
    const dateColumn = buildDateColumn(
      dateColumnName,
      "data_criacao_formatada",
      "%d/%m/%Y %H:%i"
    );

    const [rows] = await db.getPool().query(
      `
      SELECT 
        c.*,
        ${dateColumn},
        COUNT(l.id) as total_livros
      FROM categorias c
      LEFT JOIN livros l ON c.id = l.categoria_id
      WHERE c.id = ?
      GROUP BY c.id
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    const categoria = {
      ...rows[0],
      total_livros: parseInt(rows[0].total_livros),
    };

    res.json(categoria);
  } catch (err) {
    console.error("Erro ao buscar categoria:", err);
    res.status(500).json({ error: "Erro ao buscar categoria" });
  }
}

async function create(req, res) {
  const { nome, descricao } = req.body;
  const username = req.user.username;
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
    console.log("antes do add log");
    await addLog({
      type: "Registro de categoria: " + nome,
      message: "Categoria registrado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    console.log("dps do add log");

    // Buscar a categoria recém-criada para retornar o objeto completo
    const [categoria] = await db
      .getPool()
      .query("SELECT * FROM categorias WHERE id = ?", [result.insertId]);

    res.status(201).json(categoria[0]);
  } catch (err) {
    console.error("Erro ao criar categoria:", err);

    if (err.code === "ER_DUP_ENTRY") {
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

    await addLog({
      type: "Edição de categoria: " + nome,
      message: "Categoria Editada",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    res.json({ message: "Categoria atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar categoria:", err);

    if (err.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Já existe uma categoria com este nome" });
    } else {
      res.status(500).json({ error: "Erro ao atualizar categoria" });
    }
  }
}

async function remove(req, res) {
  const { id } = req.params;

  try {
    const [exists] = await db
      .getPool()
      .query("SELECT id FROM categorias WHERE id = ?", [id]);

    if (exists.length === 0) {
      return res.status(404).json({ error: "Categoria não encontrada" });
    }

    // Verificar se existem livros vinculados a esta categoria
    const [livros] = await db
      .getPool()
      .query("SELECT id FROM livros WHERE categoria_id = ?", [id]);

    if (livros.length > 0) {
      return res.status(400).json({
        error:
          "Não é possível excluir esta categoria pois existem livros vinculados a ela",
      });
    }

    await db.getPool().query("DELETE FROM categorias WHERE id = ?", [id]);
    await addLog({
      type: "Apagando de categoria, id: " + id,
      message: "Categoria Apagada",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
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
