const express = require('express');
const router = express.Router();
const autoresController = require('../controllers/autoresController');
const { authenticate, authorize } = require('../middleware/auth');

// Listar autores (autenticado)
router.get('/', authenticate, autoresController.list);

// Criar autor (ADMIN ou ATENDIMENTO)
router.post('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), autoresController.create);

module.exports = router;
