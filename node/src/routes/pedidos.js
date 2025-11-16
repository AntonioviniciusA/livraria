const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { authenticate, authorize } = require('../middleware/auth');

// Criar pedido (transacional) - ADMIN ou ATENDIMENTO
router.post('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.create);

// Listar pedidos
router.get('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.list);

// Detalhes de um pedido específico
router.get('/:id', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.getById);

// Estatísticas de pedidos (com dados do MongoDB)
router.get('/stats/estatisticas', authenticate, authorize(['ADMIN']), pedidosController.getStats);

// Atualizar status do pedido
router.patch('/:id/status', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.updateStatus);

module.exports = router;