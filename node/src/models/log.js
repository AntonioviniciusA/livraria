const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // ex: "login", "erro", "cadastro"
    message: { type: String, required: true }, // descrição curta
    data: { type: Object, default: {} }, // dados adicionais
    user: { type: String, default: null }, // id do usuário, email etc
  },
  { timestamps: true }
);

module.exports = mongoose.model("Log", LogSchema);
