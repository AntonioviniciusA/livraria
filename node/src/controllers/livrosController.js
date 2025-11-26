const db = require("../config/db");
const { addLog } = require("../services/logService");

async function list(req, res) {
  try {
    // Tentar buscar do cache MongoDB primeiro para melhor performance
    try {
      const { CacheService } = await import('../services/cacheService.js');
      
      // Para demonstração, vamos buscar apenas livros populares do cache
      const cachedTopBooks = await CacheService.getTopSellingBooks(5);
      if (cachedTopBooks.length > 0) {
        console.log('📚 Livros populares carregados do cache MongoDB');
      }
    } catch (cacheError) {
      console.error('Erro ao acessar cache:', cacheError);
    }

    const [rows] = await db.getPool().query(`
      SELECT 
        l.*,
        e.nome as editora_nome,
        e.pais as editora_pais,
        e.contato as editora_contato,
        c.nome as categoria_nome,
        c.descricao as categoria_descricao,
        COALESCE(est.quantidade, 0) as quantidade
      FROM livros l
      LEFT JOIN editoras e ON l.editora_id = e.id
      LEFT JOIN categorias c ON l.categoria_id = c.id
      LEFT JOIN estoque est ON l.id = est.livro_id
    `);

    const livros = rows.map((row) => ({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      isbn: row.isbn,
      preco: row.preco,
      publicado_em: row.publicado_em,
      editora: {
        id: row.editora_id,
        nome: row.editora_nome,
        pais: row.editora_pais,
        contato: row.editora_contato,
      },
      categoria: {
        id: row.categoria_id,
        nome: row.categoria_nome,
        descricao: row.categoria_descricao,
      },
      quantidade: row.quantidade
    }));

    res.json(livros);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function getById(req, res) {
  try {
    // Tentar buscar do cache MongoDB primeiro
    try {
      const { CacheService } = await import('../services/cacheService.js');
      const cachedBook = await CacheService.getCachedBook(parseInt(req.params.id));
      
      if (cachedBook) {
        console.log('📖 Livro carregado do cache MongoDB');
        
        // Registrar consulta de cache no MongoDB
        const { AuditService } = await import('../services/auditService.js');
        await AuditService.logAction(
          'livros',
          req.params.id,
          'READ_CACHE',
          null,
          {
            livro_id: req.params.id,
            cache_hit: true,
            userId: req.user.id
          },
          req.user.id,
          req.ip
        );
        
        return res.json({
          ...cachedBook,
          fonte: 'cache_mongodb'
        });
      }
    } catch (cacheError) {
      console.error('Erro ao acessar cache:', cacheError);
    }

    // Se não encontrou no cache, busca do MySQL
    const [rows] = await db
      .getPool()
      .query("SELECT * FROM livros WHERE id = ?", [req.params.id]);
    
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    
    const livro = rows[0];

    // Registrar consulta MySQL no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'livros',
        req.params.id,
        'READ_MYSQL',
        null,
        {
          livro_id: req.params.id,
          cache_hit: false,
          userId: req.user.id
        },
        req.user.id,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar consulta MySQL:', auditError);
    }

    res.json({
      ...livro,
      fonte: 'mysql'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function create(req, res) {
  const {
    isbn,
    titulo,
    descricao,
    preco,
    quantidade,
    publicado_em,
    editora_id,
    categoria_id,
  } = req.body;
  const username = req.user.username;
  const conn = await db.getPool().getConnection();
  try {
    await conn.beginTransaction();

    // Registrar início da criação no MongoDB
    const { AuditService } = await import('../services/auditService.js');
    await AuditService.logAction(
      'livros',
      null,
      'CREATE_START',
      null,
      {
        titulo,
        isbn,
        preco,
        userId: req.user.id
      },
      req.user.id,
      req.ip
    );

    // Insere o livro
    const [result] = await conn.query(
      "INSERT INTO livros (isbn,titulo,descricao,preco,publicado_em,editora_id,categoria_id) VALUES (?,?,?,?,?,?,?)",
      [isbn, titulo, descricao, preco, publicado_em, editora_id, categoria_id]
    );

    const livroId = result.insertId;

    // Cria registro de estoque com quantidade 0 automaticamente
    await conn.query(
      "INSERT INTO estoque (livro_id, quantidade) VALUES (?, ?)",
      [livroId, quantidade]
    );

    await conn.commit();

    await addLog({
      type: "Registro de livro: " + titulo,
      message: "Livro registrado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    res.status(201).json({ id: livroId });
  } catch (err) {
    await conn.rollback();
    console.error(err);

    // Registrar falha no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'livros',
        null,
        'CREATE_FAILED',
        null,
        {
          titulo,
          isbn,
          error: err.message,
          userId: req.user.id
        },
        req.user.id,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar falha:', auditError);
    }

    res.status(500).json({ error: "internal" });
  } finally {
    conn.release();
  }
}

async function update(req, res) {
  const {
    isbn,
    titulo,
    descricao,
    preco,
    publicado_em,
    editora_id,
    categoria_id,
  } = req.body;

  try {
    // Buscar dados antigos para auditoria
    const [oldRows] = await db.getPool().query(
      "SELECT * FROM livros WHERE id = ?", 
      [req.params.id]
    );

    const [result] = await db
      .getPool()
      .query(
        "UPDATE livros SET isbn = ?, titulo = ?, descricao = ?, preco = ?, publicado_em = ?, editora_id = ?, categoria_id = ? WHERE id = ?",
        [
          isbn,
          titulo,
          descricao,
          preco,
          publicado_em,
          editora_id,
          categoria_id,
          req.params.id,
        ]
      );
    
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });

    // Registrar atualização no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'livros',
        req.params.id,
        'UPDATE',
        oldRows[0] || {},
        {
          isbn,
          titulo,
          descricao,
          preco,
          publicado_em,
          editora_id,
          categoria_id
        },
        req.user.id,
        req.ip
      );

      // Atualizar cache
      const { CacheService } = await import('../services/cacheService.js');
      await CacheService.cacheBook({
        id: parseInt(req.params.id),
        titulo,
        isbn,
        preco
      });
    } catch (mongoError) {
      console.error('Erro no MongoDB:', mongoError);
    }

    res.json({ message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function deleteBook(req, res) {
  try {
    // Buscar dados para auditoria
    const [oldRows] = await db.getPool().query(
      "SELECT * FROM livros WHERE id = ?", 
      [req.params.id]
    );

    const [result] = await db
      .getPool()
      .query("DELETE FROM livros WHERE id = ?", [req.params.id]);
    
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Not found" });

    await addLog({
      type: "Apagando de livro, id: " + req.params.id,
      message: "Livro apagado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

module.exports = { list, getById, create, update, delete: deleteBook };