const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");

router.get("/top-books", authenticate, async (req, res) => {
  try {
    const { CacheService } = await import('../services/cacheService.js');
    const { limit = 10 } = req.query;
    
    const topBooks = await CacheService.getTopSellingBooks(parseInt(limit));
    res.json(topBooks);
  } catch (error) {
    console.error('Erro ao buscar livros mais vendidos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;