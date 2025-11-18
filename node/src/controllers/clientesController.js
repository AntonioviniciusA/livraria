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

async function update(req, res) {
  const { id } = req.params;
  const { nome, email, telefone, cpf, endereco, cidade, estado, cep } =
    req.body;
  const username = req.user.username;

  try {
    // Validar se o ID foi fornecido
    if (!id) {
      return res.status(400).json({ error: "ID do cliente é obrigatório" });
    }

    // Validar campos obrigatórios
    if (!nome || !email || !telefone) {
      return res.status(400).json({
        error: "Campos obrigatórios: nome, email e telefone",
      });
    }

    // Verificar se o cliente existe
    const [clienteExistente] = await db
      .getPool()
      .query("SELECT * FROM clientes WHERE id = ?", [id]);

    if (clienteExistente.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // Verificar se o email já está em uso por outro cliente
    const [emailExistente] = await db
      .getPool()
      .query("SELECT * FROM clientes WHERE email = ? AND id != ?", [email, id]);

    if (emailExistente.length > 0) {
      return res
        .status(400)
        .json({ error: "E-mail já está em uso por outro cliente" });
    }

    // Verificar se o CPF já está em uso por outro cliente (se CPF foi fornecido)
    if (cpf) {
      const [cpfExistente] = await db
        .getPool()
        .query("SELECT * FROM clientes WHERE cpf = ? AND id != ?", [cpf, id]);

      if (cpfExistente.length > 0) {
        return res
          .status(400)
          .json({ error: "CPF já está em uso por outro cliente" });
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      nome,
      email,
      telefone,
      cpf: cpf || null,
      endereco: endereco || null,
      cidade: cidade || null,
      estado: estado || null,
      cep: cep || null,
      updated_at: new Date(),
    };

    // Atualizar o cliente no banco de dados
    const [result] = await db
      .getPool()
      .query(
        "UPDATE clientes SET nome = ?, email = ?, telefone = ?, cpf = ?, endereco = ?, atualizado_em = ? WHERE id = ?",
        [
          dadosAtualizacao.nome,
          dadosAtualizacao.email,
          dadosAtualizacao.telefone,
          dadosAtualizacao.cpf,
          dadosAtualizacao.endereco,
          dadosAtualizacao.updated_at,
          id,
        ]
      );

    // Buscar o cliente atualizado
    const [clienteAtualizado] = await db
      .getPool()
      .query("SELECT * FROM clientes WHERE id = ?", [id]);

    if (clienteAtualizado.length === 0) {
      return res.status(500).json({ error: "Erro ao atualizar cliente" });
    }

    // Adicionar log
    await addLog({
      type: "Atualização de cliente: " + nome,
      message: "Cliente atualizado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        clienteId: id,
      },
    });

    // Retornar o cliente atualizado
    return res.status(200).json({
      message: "Cliente atualizado com sucesso",
      cliente: clienteAtualizado[0],
    });
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);

    // Verificar se é um erro de duplicidade do MySQL
    if (error.code === "ER_DUP_ENTRY") {
      if (error.sqlMessage.includes("email")) {
        return res.status(400).json({ error: "E-mail já está em uso" });
      } else if (error.sqlMessage.includes("cpf")) {
        return res.status(400).json({ error: "CPF já está em uso" });
      }
      return res.status(400).json({ error: "Dados duplicados" });
    }

    return res.status(500).json({
      error: "Erro interno do servidor ao atualizar cliente",
    });
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

module.exports = { list, create, update, delete: deleteCliente };
