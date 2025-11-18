const db = require("../config/db");
const { addLog } = require("../services/logService");

async function list(req, res) {
  try {
    // Tente diferentes nomes de coluna de data
    const possibleDateColumns = [
      "criado_em",
      "data_criacao",
      "createdAt",
      "data_cadastro",
      "timestamp",
    ];

    let dateColumn = "NULL as data_cadastro"; // Fallback
    for (const col of possibleDateColumns) {
      // Você pode verificar se a coluna existe antes, ou tentar um por um
      dateColumn = `DATE_FORMAT(e.${col}, '%d/%m/%Y') as data_cadastro`;
      break; // Remove este break para testar todas, ou faça uma verificação real
    }

    const [rows] = await db.getPool().query(`
      SELECT 
        e.id,
        e.nome,
        e.pais,
        e.contato,
        ${dateColumn},
        COUNT(l.id) as total_livros
      FROM editoras e
      LEFT JOIN livros l ON e.id = l.editora_id
      GROUP BY e.id
      ORDER BY e.nome
    `);

    const editoras = rows.map((editora) => ({
      id: editora.id,
      nome: editora.nome,
      pais: editora.pais,
      contato: editora.contato,
      data_cadastro: editora.data_cadastro,
      total_livros: parseInt(editora.total_livros),
    }));

    res.json(editoras);
  } catch (error) {
    console.error("Erro ao buscar editoras:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req, res) {
  const { nome, pais, contato } = req.body;
  const username = req.user.username;
  try {
    console.log(username, "username no editoras controller para addLog");
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

    await addLog({
      type: "Registro de Editora: " + nome,
      message: "Editora registrada",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    // Buscar a editora recém-criada para retornar o objeto completo
    const [editora] = await db
      .getPool()
      .query("SELECT * FROM editoras WHERE id = ?", [r.insertId]);

    res.status(201).json(editora[0]); // Retorna o objeto completo
  } catch (error) {
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

module.exports = { list, create };
