require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("./config/db");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth");
const usuariosRoutes = require("./routes/usuarios");
const gruposRoutes = require("./routes/grupos");
const livrosRoutes = require("./routes/livros");
const autoresRoutes = require("./routes/autores");
const editorasRoutes = require("./routes/editoras");
const clientesRoutes = require("./routes/clientes");
const pedidosRoutes = require("./routes/pedidos");
const categoriasRoutes = require("./routes/categorias");


const app = express();

app.use(
  cors({
    origin: process.env.SITE_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    maxAge: 600,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

app.get("/", (req, res) => res.json({ ok: true, service: "livraria-backend" }));

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/grupos", gruposRoutes);
app.use("/livros", livrosRoutes);
app.use("/autores", autoresRoutes);
app.use("/editoras", editorasRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/categorias", categoriasRoutes);

const PORT = process.env.PORT;

(async () => {
  try {
    await db.init();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
