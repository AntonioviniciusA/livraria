const db = require("../config/db");

async function list(req, res) {
  const [rows] = await db.getPool().query("SELECT * FROM editoras");
  res.json(rows);
}

async function create(req, res) {
  const { nome, pais, contato } = req.body;
  console.log("Received create editora request with data:", req.body);
  console.log("Creating editora:", nome, pais, contato);
  if (!nome || !pais) {
    return res.status(400).json({ error: "nome and pais are required" });
  }
  const [r] = await db
    .getPool()
    .query("INSERT INTO editoras (nome, pais, contato) VALUES (?,?,?)", [
      nome,
      pais,
      contato,
    ]);
  res.status(201).json({ id: r.insertId });
}

module.exports = { list, create };
