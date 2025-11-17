const db = require("../config/db");
const { addLog } = require("../services/logService");

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query(`
      SELECT 
        a.id,
        a.nome,
        a.bio,
        DATE_FORMAT(a.data_cadastro, '%d/%m/%Y') as data_cadastro,
        COUNT(l.id) as total_livros
      FROM autores a
      LEFT JOIN livros l ON a.id = l.autor_id
      GROUP BY a.id
      ORDER BY a.nome
    `);

    const autores = rows.map((autor) => ({
      id: autor.id,
      nome: autor.nome,
      bio: autor.bio,
      data_cadastro: autor.data_cadastro,
      total_livros: parseInt(autor.total_livros),
    }));

    res.json(autores);
  } catch (error) {
    console.error("Erro ao buscar autores:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req, res) {
  try {
    const { nome, bio } = req.body;

    const [result] = await db
      .getPool()
      .query("INSERT INTO autores (nome, bio) VALUES (?, ?)", [nome, bio]);
    await addLog({
      type: "registro de autor: " + nome,
      message: "Autor registrado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    res.status(201).json({
      id: result.insertId,
      message: "Autor criado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao criar autor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { list, create };
