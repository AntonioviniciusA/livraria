const db = require('../config/db');

async function list(req, res) {
  try {
    const [rows] = await db.getPool().query(`
      SELECT 
        g.id,
        g.nome,
        g.descricao,
        g.nivel_acesso,
        DATE_FORMAT(g.data_criacao, '%d/%m/%Y') as data_criacao,
        COUNT(u.id) as total_usuarios
      FROM grupos_usuarios g
      LEFT JOIN usuarios u ON g.id = u.grupo_id
      GROUP BY g.id
      ORDER BY g.nome
    `);
    
    const grupos = rows.map(grupo => ({
      id: grupo.id,
      nome: grupo.nome,
      descricao: grupo.descricao,
      nivel_acesso: grupo.nivel_acesso,
      data_criacao: grupo.data_criacao,
      total_usuarios: parseInt(grupo.total_usuarios)
    }));

    // Registrar consulta de grupos no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'grupos_usuarios',
        'LIST',
        'READ',
        null,
        {
          total_grupos: grupos.length,
          userId: req.user.id
        },
        req.user.id,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar consulta de grupos:', auditError);
    }

    res.json(grupos);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

module.exports = { list };