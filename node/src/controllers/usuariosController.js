const db = require('../config/db');

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query('SELECT u.id, u.username, u.nome_completo, u.email, g.nome as grupo, u.ativo, u.criado_em FROM usuarios u JOIN grupos_usuarios g ON u.grupo_id = g.id');
    
    // Registrar consulta de usuários no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'usuarios',
        'LIST',
        'READ',
        null,
        {
          total_usuarios: rows.length,
          userId: req.user.id
        },
        req.user.id,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar consulta de usuários:', auditError);
    }

    res.json(rows);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'internal' }); 
  }
}

async function update(req, res) {
  const id = req.params.id; 
  const { nome_completo, email, ativo, grupo_id } = req.body;
  
  try {
    // Buscar dados antigos para auditoria
    const [oldRows] = await db.getPool().query(
      'SELECT * FROM usuarios WHERE id = ?', 
      [id]
    );

    await db.getPool().query(
      'UPDATE usuarios SET nome_completo = ?, email = ?, ativo = ?, grupo_id = ? WHERE id = ?', 
      [nome_completo, email, ativo, grupo_id, id]
    );

    // Registrar atualização no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'usuarios',
        id,
        'UPDATE',
        oldRows[0] || {},
        {
          nome_completo,
          email,
          ativo,
          grupo_id,
          updatedBy: req.user.id
        },
        req.user.id,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar atualização:', auditError);
    }

    res.json({ ok: true });
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ error: 'internal' }); 
  }
}

// Nova função para estatísticas de usuários
async function getStats(req, res) {
  try {
    const [stats] = await db.getPool().query(`
      SELECT 
        g.nome as grupo,
        COUNT(u.id) as total_usuarios,
        SUM(u.ativo) as usuarios_ativos,
        COUNT(u.id) - SUM(u.ativo) as usuarios_inativos
      FROM grupos_usuarios g
      LEFT JOIN usuarios u ON g.id = u.grupo_id
      GROUP BY g.id, g.nome
      ORDER BY total_usuarios DESC
    `);

    // Registrar consulta de estatísticas no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'usuarios',
        'STATS',
        'READ',
        null,
        {
          total_grupos: stats.length,
          userId: req.user.id
        },
        req.user.id,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar estatísticas:', auditError);
    }

    res.json(stats);
  } catch (err) {
    console.error('Erro ao buscar estatísticas de usuários:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { list, update, getStats };