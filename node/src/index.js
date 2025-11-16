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

// Novas rotas MongoDB
const auditRoutes = require("./routes/audit");
const cacheRoutes = require("./routes/cache");

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

// Middleware para logging de requests no MongoDB
app.use(async (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', async () => {
    try {
      // Usando require em vez de import para CommonJS
      const { AuditService } = require('./services/auditService.js');
      await AuditService.logAction(
        'HTTP_REQUEST',
        null,
        'REQUEST',
        null,
        {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration: Date.now() - start,
          userAgent: req.get('User-Agent')
        },
        req.user?.id,
        req.ip
      );
    } catch (error) {
      console.error('Erro ao logar request:', error);
    }
  });
  
  next();
});

app.get("/", (req, res) => res.json({ 
  ok: true, 
  service: "livraria-backend",
  databases: {
    mysql: "ativo",
    mongodb: "ativo"
  }
}));

// Health check dos bancos
app.get("/health", async (req, res) => {
  try {
    const dbStatus = await db.testConnections();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      databases: {
        mysql: dbStatus ? "connected" : "disconnected",
        mongodb: dbStatus ? "connected" : "disconnected"
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.use("/auth", authRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/grupos", gruposRoutes);
app.use("/livros", livrosRoutes);
app.use("/autores", autoresRoutes);
app.use("/editoras", editorasRoutes);
app.use("/clientes", clientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/categorias", categoriasRoutes);

// Novas rotas
app.use("/audit", auditRoutes);
app.use("/cache", cacheRoutes);

const PORT = process.env.PORT || 3000;

// Logs para debug
console.log('🔧 Configurações carregadas:');
console.log('MySQL Host:', process.env.MYSQL_HOST);
console.log('MongoDB URI:', process.env.MONGODB_URI ? '✅ Configurado' : '❌ Não configurado');
console.log('Porta:', PORT);

(async () => {
  try {
    await db.init();
    console.log('📊 Bancos de dados inicializados: MySQL + MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();