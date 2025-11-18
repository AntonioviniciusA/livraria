const db = require("../config/db");
const { addLog } = require("../services/logService");

const possibleDateColumns = [
  "data_criacao",
  "created_at",
  "data_cadastro",
  "criado_em",
  "timestamp",
  "createdAt",
  "data_criado",
];
let foundDateColumn = null;

// Função para descobrir a coluna de data uma vez
async function discoverDateColumn() {
  if (foundDateColumn) return foundDateColumn;

  for (const col of possibleDateColumns) {
    try {
      const testQuery = `SELECT ${col} FROM clientes LIMIT 1`;
      await db.getPool().query(testQuery);
      foundDateColumn = col;
      console.log(`Coluna de data encontrada: ${col}`);
      return col;
    } catch (err) {
      continue;
    }
  }

  console.log("Nenhuma coluna de data encontrada, usando NULL como fallback");
  foundDateColumn = null;
  return null;
}

// Função auxiliar para construir a query com a coluna de data correta
function buildDateColumn(columnName, alias, format = "%d/%m/%Y") {
  if (!columnName) {
    return `NULL as ${alias}`;
  }
  return `DATE_FORMAT(c.${columnName}, '${format}') as ${alias}`;
}

async function list(req, res) {
  try {
    const dateColumnName = await discoverDateColumn();
    const dateColumn = buildDateColumn(dateColumnName, "data_cadastro");

    const [rows] = await db.getPool().query(`
      SELECT 
        c.id,
        c.nome,
        c.email,
        c.telefone,
        c.endereco,
        ${dateColumn},
        COUNT(p.id) as total_pedidos,
        COALESCE(SUM(p.total), 0) as valor_total_pedidos
      FROM clientes c
      LEFT JOIN pedidos p ON c.id = p.cliente_id
      GROUP BY c.id
      ORDER BY c.nome
    `);

    const clientes = rows.map((cliente) => ({
      id: cliente.id,
      nome: cliente.nome,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco,
      cidade: cliente.cidade,
      estado: cliente.estado,
      cep: cliente.cep,
      data_cadastro: cliente.data_cadastro,
      total_pedidos: parseInt(cliente.total_pedidos),
      valor_total_pedidos: parseFloat(cliente.valor_total_pedidos),
    }));

    console.log(clientes);
    res.json(clientes);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}

async function create(req, res) {
  try {
    const { nome, email, telefone, endereco } = req.body;
    const username = req.user.username;

    const [result] = await db
      .getPool()
      .query(
        "INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)",
        [nome, email, telefone, endereco]
      );
    await addLog({
      type: "Registro de cliente: " + nome,
      message: "Cliente registrado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    console.log(result);
    res.status(201).json({
      message: "Cliente criado com sucesso",
      cliente: result,
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);

    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Email já cadastrado" });
    } else {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }
}

async function deleteCliente(req, res) {
  const { id } = req.params;
  try {
    const username = req.user.username;
    const [result] = await db
      .getPool()
      .query("DELETE FROM clientes WHERE id = ?", [id]);
    await addLog({
      type: "Exclusão de cliente: " + id,
      message: "Cliente excluído",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    console.log(result);
    res.json({ message: "Cliente excluído com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    throw new Error("Erro interno do servidor");
  }
}

module.exports = { list, create, delete: deleteCliente };
