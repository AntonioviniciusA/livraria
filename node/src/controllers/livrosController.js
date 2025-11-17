const db = require("../config/db");
const { addLog } = require("../services/logService");

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
    quantidade,
    publicado_em,
    editora_id,
    categoria_id,
  } = req.body;
  const username = req.user.username;
  const conn = await db.getPool().getConnection();
  try {
    await conn.beginTransaction();

    // Insere o livro
    const [result] = await conn.query(
      "INSERT INTO livros (isbn,titulo,descricao,preco,publicado_em,editora_id,categoria_id) VALUES (?,?,?,?,?,?,?)",
      [isbn, titulo, descricao, preco, publicado_em, editora_id, categoria_id]
    );

    const livroId = result.insertId;

    // Cria registro de estoque com quantidade 0 automaticamente
    await conn.query(
      "INSERT INTO estoque (livro_id, quantidade) VALUES (?, ?)",
      [livroId, quantidade]
    );

    await conn.commit();

    await addLog({
      type: "Registro de livro: " + titulo,
      message: "Livro registrado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    res.status(201).json({ id: livroId });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(500).json({ error: "internal" });
  } finally {
    conn.release();
  }
}
async function update(req, res) {
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
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function deleteBook(req, res) {
  try {
    const [result] = await db
      .getPool()
      .query("DELETE FROM livros WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });

    await addLog({
      type: "Apagando de livro, id: " + req.params.id,
      message: "Livro apagado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

module.exports = { list, getById, create, update, delete: deleteBook };
