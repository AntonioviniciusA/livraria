const express = require('express');
const router = express.Router();
const editorasController = require('../controllers/editorasController');
const { authenticate, authorize } = require('../middleware/auth');

// Listar editoras
router.get('/', authenticate, editorasController.list);

// Criar editora (ADMIN ou ATENDIMENTO)
router.post('/', authenticate, authorize(['ADMIN','ATENDIMENTO']), editorasController.create);

module.exports = router;
