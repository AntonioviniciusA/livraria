const db = require("../config/db");

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query(`
  SELECT 
    l.*,
    e.nome as editora_nome,
    e.pais as editora_pais,
    e.contato as editora_contato,
    c.nome as categoria_nome,
    c.descricao as categoria_descricao
  FROM livros l
  LEFT JOIN editoras e ON l.editora_id = e.id
  LEFT JOIN categorias c ON l.categoria_id = c.id
`);

    const livros = rows.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      isbn: row.isbn,
      preco: row.preco,
      publicado_em: row.publicado_em,
      editora: {
        id: row.editora_id,
        nome: row.editora_nome,
        pais: row.editora_pais,
        contato: row.editora_contato,
      },
      categoria: {
        id: row.categoria_id,
        nome: row.categoria_nome,
        descricao: row.categoria_descricao,
      },
    }));
    console.log(livros);
    res.json(livros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function getById(req, res) {
  try {
    const [rows] = await db
      .getPool()
      .query("SELECT * FROM livros WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function create(req, res) {
  const {
    isbn,
    titulo,
    descricao,
    preco,
    publicado_em,
    editora_id,
    categoria_id,
  } = req.body;
  try {
    const [result] = await db
      .getPool()
      .query(
        "INSERT INTO livros (isbn,titulo,descricao,preco,publicado_em,editora_id,categoria_id) VALUES (?,?,?,?,?,?,?)",
        [isbn, titulo, descricao, preco, publicado_em, editora_id, categoria_id]
      );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}
async function update(req, res) {
  try {
    const {
      isbn,
      titulo,
      descricao,
      preco,
      publicado_em,
      editora_id,
      categoria_id,
    } = req.body;
    const [result] = await db
      .getPool()
      .query(
        "UPDATE livros SET isbn = ?, titulo = ?, descricao = ?, preco = ?, publicado_em = ?, editora_id = ?, categoria_id = ? WHERE id = ?",
        [
          isbn,
          titulo,
          descricao,
          preco,
          publicado_em,
          editora_id,
          categoria_id,
          req.params.id,
        ]
      );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.status(200).json({ message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function apagar(req, res) {
  try {
    const [result] = await db
      .getPool()
      .query("DELETE FROM livros WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

module.exports = { list, getById, create, delete: apagar };
