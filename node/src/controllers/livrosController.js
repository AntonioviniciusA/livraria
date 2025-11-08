const db = require('../config/db');

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query('SELECT * FROM vw_livros_disponiveis');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }); }
}

async function getById(req, res) {
  try {
    const [rows] = await db.getPool().query('SELECT * FROM livros WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }); }
}

async function create(req, res) {
  const { isbn, titulo, descricao, preco, publicado_em, editora_id, categoria_id } = req.body;
  try {
    const [result] = await db.getPool().query(
      'INSERT INTO livros (isbn,titulo,descricao,preco,publicado_em,editora_id,categoria_id) VALUES (?,?,?,?,?,?,?)',
      [isbn,titulo,descricao,preco,publicado_em,editora_id,categoria_id]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }); }
}

module.exports = { list, getById, create };
