const Log = require("../models/log");

async function addLog({ type, message, data = {}, user = null }) {
  try {
    const log = await Log.create({
      type,
      message,
      data,
      user,
    });

    return log;
  } catch (error) {
    console.error("Erro ao salvar log:", error);
  }
}

// GET: buscar todos os logs
async function getLogs() {
  return Log.find().sort({ createdAt: -1 });
}

// GET: buscar logs por tipo
async function getLogsByType(type) {
  return Log.find({ type }).sort({ createdAt: -1 });
}

// GET: buscar logs por usuário
async function getLogsByUser(user) {
  return Log.find({ user }).sort({ createdAt: -1 });
}

module.exports = {
  addLog,
  getLogs,
  getLogsByType,
  getLogsByUser,
};
