const db = require('../config/db');

async function list(req, res) {
  const [rows] = await db.getPool().query('SELECT * FROM clientes');
  res.json(rows);
}

async function create(req, res) {
  const { nome, email, telefone, endereco } = req.body;
  const [r] = await db.getPool().query('INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?,?,?,?)', [nome, email, telefone, endereco]);
  res.status(201).json({ id: r.insertId });
}

module.exports = { list, create };
