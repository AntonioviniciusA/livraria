const express = require("express");
const router = express.Router();
const logService = require("../services/logService");

// GET: buscar todos os logs
router.get("/", async (req, res) => {
  try {
    const logs = await logService.getLogs();
    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET: buscar logs por tipo
router.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const logs = await logService.getLogsByType(type);
    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs por tipo:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// GET: buscar logs por usuário
router.get("/user/:user", async (req, res) => {
  try {
    const { user } = req.params;
    const logs = await logService.getLogsByUser(user);
    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar logs por usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

module.exports = router;
