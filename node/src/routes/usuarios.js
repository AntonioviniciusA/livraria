const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authenticate, authorize } = require('../middleware/auth');

// Listar usuários (ADMIN ou LEITURA)
router.get('/', authenticate, authorize(['ADMIN','LEITURA']), usuariosController.list);

// Atualizar usuário (ADMIN)
router.put('/:id', authenticate, authorize(['ADMIN']), usuariosController.update);

// Nova rota: Estatísticas de usuários
router.get('/stats', authenticate, authorize(['ADMIN']), usuariosController.getStats);

module.exports = router;