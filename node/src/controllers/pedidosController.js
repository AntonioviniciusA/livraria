const db = require("../config/db");

async function create(req, res) {
  const { cliente_id, itens } = req.body;
  console.log(
    "Creating order for cliente_id:",
    cliente_id,
    "with items:",
    itens
  );
  if (!cliente_id || !Array.isArray(itens) || itens.length === 0)
    return res.status(400).json({ error: "cliente_id and itens required" });

  const conn = await db.getPool().getConnection();
  try {
    await conn.beginTransaction();

    // gerar numero de negocio via função SQL
    const [r] = await conn.query("SELECT fn_gen_id('PED') as num");
    const numero_negocio = r[0].num;

    const [ins] = await conn.query(
      "INSERT INTO pedidos (numero_negocio, cliente_id, usuario_id, total) VALUES (?,?,?,?)",
      [numero_negocio, cliente_id, req.user.id, 0.0]
    );
    const pedido_id = ins.insertId;

    let total = 0.0;

    for (const it of itens) {
      const [bookRows] = await conn.query(
        "SELECT preco FROM livros WHERE id = ? FOR UPDATE",
        [it.livro_id]
      );
      if (bookRows.length === 0)
        throw new Error(`Livro ${it.livro_id} not found`);
      const preco = bookRows[0].preco;

      const [stockRows] = await conn.query(
        "SELECT quantidade FROM estoque WHERE livro_id = ? FOR UPDATE",
        [it.livro_id]
      );
      // Se não existe estoque, cria com quantidade 0
      if (stockRows.length === 0) {
        await conn.query(
          "INSERT INTO estoque (livro_id, quantidade) VALUES (?, 0)",
          [it.livro_id]
        );
        throw new Error(
          `Estoque criado para livro ${it.livro_id}, mas quantidade é 0. Não é possível processar o pedido.`
        );
      }
      if (stockRows.length === 0)
        throw new Error(`Estoque não encontrado para livro ${it.livro_id}`);
      const available = stockRows[0].quantidade;
      if (available < it.quantidade)
        throw new Error(
          `Estoque insuficiente para livro ${it.livro_id}. Disponível: ${available}, Solicitado: ${it.quantidade}`
        );

      await conn.query(
        "INSERT INTO pedidos_itens (pedido_id, livro_id, quantidade, preco_unitario) VALUES (?,?,?,?)",
        [pedido_id, it.livro_id, it.quantidade, preco]
      );
      await conn.query(
        "UPDATE estoque SET quantidade = quantidade - ? WHERE livro_id = ?",
        [it.quantidade, it.livro_id]
      );

      total += preco * it.quantidade;
    }

    await conn.query("UPDATE pedidos SET total = ? WHERE id = ?", [
      total,
      pedido_id,
    ]);

    await conn.commit();

    res.status(201).json({ id: pedido_id, numero_negocio, total });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
}

async function list(req, res) {
  const [rows] = await db
    .getPool()
    .query(
      "SELECT p.*, l.titulo AS livro_titulo, l.isbn AS livro_isbn, l.preco AS livro_preco, l.descricao AS livro_descricao FROM pedidos p LEFT JOIN livros l ON p.livro_id = l.id"
    );
  res.status(200).json(rows);
}
module.exports = { create, list };
