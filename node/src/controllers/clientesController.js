const db = require('../config/db');

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query(`
      SELECT 
        c.id,
        c.nome,
        c.email,
        c.telefone,
        c.endereco,
        DATE_FORMAT(c.data_cadastro, '%d/%m/%Y') as data_cadastro,
        COUNT(p.id) as total_pedidos,
        COALESCE(SUM(p.total), 0) as valor_total_pedidos
      FROM clientes c
      LEFT JOIN pedidos p ON c.id = p.cliente_id
      GROUP BY c.id
      ORDER BY c.nome
    `);
    
    const clientes = rows.map(cliente => ({
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
  valor_total_pedidos: parseFloat(cliente.valor_total_pedidos)
}));
    
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function create(req, res) {
  try {
    const { nome, email, telefone, endereco } = req.body;
    
    const [result] = await db.getPool().query(
      'INSERT INTO clientes (nome, email, telefone, endereco) VALUES (?, ?, ?, ?)', 
      [nome, email, telefone, endereco]
    );
    
    res.status(201).json({ 
      id: result.insertId,
      message: 'Cliente criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Email já cadastrado' });
    } else {
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = { list, create };