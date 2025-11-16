const db = require("../config/db");

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query(`
      SELECT 
        e.id,
        e.nome,
        e.pais,
        e.contato,
        DATE_FORMAT(e.data_cadastro, '%d/%m/%Y') as data_cadastro,
        COUNT(l.id) as total_livros,
      FROM editoras e
      LEFT JOIN livros l ON e.id = l.editora_id
      GROUP BY e.id
      ORDER BY e.nome
    `);
    
  const editoras = rows.map(editora => ({
  id: editora.id,
  nome: editora.nome,
  pais: editora.pais,
  contato: editora.contato,
  data_cadastro: editora.data_cadastro,
  total_livros: parseInt(editora.total_livros),
}));
    res.json(editoras);
  } catch (error) {
    console.error('Erro ao buscar editoras:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
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
