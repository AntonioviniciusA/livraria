const express = require('express');
const router = express.Router();
const pedidosController = require('../controllers/pedidosController');
const { authenticate, authorize } = require('../middleware/auth');

// Criar pedido (transacional) - ADMIN ou ATENDIMENTO
// Body esperado: { cliente_id: number, itens: [{ livro_id, quantidade }, ...] }
router.post('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.create);

// (Opcional) listar pedidos, detalhes etc. se implementar controllers correspondentes
// router.get('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.list);

module.exports = router;
