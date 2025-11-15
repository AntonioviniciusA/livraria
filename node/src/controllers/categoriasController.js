const db = require("../config/db");

async function list(req, res) {
  try {
    const [rows] = await db
      .getPool()
      .query("SELECT * FROM categorias ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao listar categorias:", err);
    res.status(500).json({ error: "Erro ao listar categorias" });
  }
}

// BUSCAR CATEGORIA POR ID
async function getById(req, res) {
  const { id } = req.params;

  try {
    const [rows] = await db
      .getPool()
      .query("SELECT * FROM categorias WHERE id = ?", [id]);

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
