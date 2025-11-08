const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const { authenticate, authorize } = require('../middleware/auth');

// Listar clientes (autenticado)
router.get('/', authenticate, clientesController.list);

// Criar cliente (ATENDIMENTO ou ADMIN)
router.post('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), clientesController.create);

module.exports = router;
