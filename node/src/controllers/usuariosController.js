const db = require('../config/db');

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query('SELECT u.id, u.username, u.nome_completo, u.email, g.nome as grupo, u.ativo, u.criado_em FROM usuarios u JOIN grupos_usuarios g ON u.grupo_id = g.id');
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }); }
}

async function update(req, res) {
  const id = req.params.id; const { nome_completo, email, ativo, grupo_id } = req.body;
  try {
    await db.getPool().query('UPDATE usuarios SET nome_completo = ?, email = ?, ativo = ?, grupo_id = ? WHERE id = ?', [nome_completo, email, ativo, grupo_id, id]);
    res.json({ ok: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'internal' }); }
}

module.exports = { list, update };
