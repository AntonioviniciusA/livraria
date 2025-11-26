const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");

router.get("/logs", authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { AuditService } = await import('../services/auditService.js');
    const { collection, documentId, page = 1, limit = 50 } = req.query;
    
    const result = await AuditService.getLogs(collection, documentId, parseInt(page), parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;