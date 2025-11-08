const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/gruposController');
const { authenticate, authorize } = require('../middleware/auth');

// Listar grupos (qualquer usuário autenticado)
router.get('/', authenticate, gruposController.list);

// (Opcional) criar / editar grupos - deixar só ADMIN
// router.post('/', authenticate, authorize(['ADMIN']), gruposController.create);

module.exports = router;
