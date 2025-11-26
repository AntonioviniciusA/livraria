const express = require("express");
const router = express.Router();
const pedidosController = require("../controllers/pedidosController");
const { authenticate, authorize } = require("../middleware/auth");

// Criar pedido (transacional) - ADMIN ou ATENDIMENTO
// Body esperado: { cliente_id: number, itens: [{ livro_id, quantidade }, ...] }
router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "ATENDIMENTO"]),
  pedidosController.create
);

// (Opcional) listar pedidos, detalhes etc. se implementar controllers correspondentes
router.get(
  "/",
  authenticate,
  authorize(["ADMIN", "ATENDIMENTO"]),
  pedidosController.list
);

router.put(
  "/:id",
  authenticate,
  authorize(["ADMIN", "ATENDIMENTO"]),
  pedidosController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize(["ADMIN", "ATENDIMENTO"]),
  pedidosController.delete
);

// Detalhes de um pedido específico
router.get('/:id', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.getById);

// Estatísticas de pedidos (com dados do MongoDB)
router.get('/stats/estatisticas', authenticate, authorize(['ADMIN']), pedidosController.getStats);

// Atualizar status do pedido
router.patch('/:id/status', authenticate, authorize(['ADMIN','ATENDIMENTO']), pedidosController.updateStatus);

module.exports = router;