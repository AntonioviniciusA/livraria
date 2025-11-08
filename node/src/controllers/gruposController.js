const db = require('../config/db');

async function list(req, res) {
  const [rows] = await db.getPool().query('SELECT * FROM grupos_usuarios');
  res.json(rows);
}

module.exports = { list };
