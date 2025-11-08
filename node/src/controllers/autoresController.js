const db = require('../config/db');

async function list(req, res) {
  const [rows] = await db.getPool().query('SELECT * FROM autores');
  res.json(rows);
}

async function create(req, res) {
  const { nome, bio } = req.body;
  const [r] = await db.getPool().query('INSERT INTO autores (nome, bio) VALUES (?,?)', [nome, bio]);
  res.status(201).json({ id: r.insertId });
}

module.exports = { list, create };
