const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secret = process.env.JWT_SECRET || "secret_dev";
const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "username & password required" });
  
  try {
    const [rows] = await db
      .getPool()
      .query("SELECT id, username, senha_hash FROM usuarios WHERE email = ?", [
        username,
      ]);
    
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });
    
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.senha_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    
    const token = jwt.sign({ uid: user.id, username: user.username }, secret, {
      expiresIn,
    });

    // Criar sessão no MongoDB
    try {
      const { SessionService } = await import('../services/sessionService.js');
      await SessionService.createSession(
        user.id, 
        user.username, 
        token, 
        req.ip, 
        req.get('User-Agent')
      );
    } catch (sessionError) {
      console.error('Erro ao criar sessão:', sessionError);
    }

    // Registrar login no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'auth',
        user.id.toString(),
        'LOGIN_SUCCESS',
        null,
        {
          userId: user.id,
          username: user.username,
          ip: req.ip
        },
        user.id,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar login:', auditError);
    }

    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    console.error(err);

    // Registrar falha de login no MongoDB
    try {
      const { AuditService } = await import('../services/auditService.js');
      await AuditService.logAction(
        'auth',
        null,
        'LOGIN_FAILED',
        null,
        {
          username,
          error: 'Credenciais inválidas',
          ip: req.ip
        },
        null,
        req.ip
      );
    } catch (auditError) {
      console.error('Erro ao registrar falha de login:', auditError);
    }

    res.status(500).json({ error: "internal" });
  }
}

// ... resto do código do authController permanece similar, mas adicione auditoria