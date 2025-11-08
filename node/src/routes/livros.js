const express = require('express');
const router = express.Router();
const livrosController = require('../controllers/livrosController');
const { authenticate, authorize } = require('../middleware/auth');

// Listar livros (usa view vw_livros_disponiveis) - qualquer autenticado
router.get('/', authenticate, livrosController.list);

// Detalhe de livro
router.get('/:id', authenticate, livrosController.getById);

// Criar livro (ADMIN ou ATENDIMENTO)
router.post('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), livrosController.create);

// (Opcional) Atualizar / deletar - se implementar nos controllers
// router.put('/:id', authenticate, authorize(['ADMIN','ATENDIMENTO']), livrosController.update);
// router.delete('/:id', authenticate, authorize(['ADMIN']), livrosController.delete);

module.exports = router;
