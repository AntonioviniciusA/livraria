const express = require("express");
const router = express.Router();
const categoriasController = require("../controllers/categoriasController");
const { authenticate } = require("../middleware/auth");

// Todas as rotas exigem autenticação
router.get("/", authenticate, categoriasController.list);
router.get("/by-id/:id", authenticate, categoriasController.getById);
router.post("/", authenticate, categoriasController.create);
router.put("/:id", authenticate, categoriasController.update);
router.delete("/:id", authenticate, categoriasController.remove);

module.exports = router;
