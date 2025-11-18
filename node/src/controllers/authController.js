const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { addLog } = require("../services/logService");

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
    console.log(rows[0]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.senha_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ uid: user.id, username: user.username }, secret, {
      expiresIn,
    });
    await addLog({
      type: "login",
      message: "Usuário fez login",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function register(req, res) {
  const { username, password, nome_completo, email, grupo_id } = req.body;
  if (!username || !password || !grupo_id)
    return res
      .status(400)
      .json({ error: "username,password,grupo_id required" });
  try {
    const senha_hash = await bcrypt.hash(password, 10);
    const [result] = await db
      .getPool()
      .query(
        "INSERT INTO usuarios (username, senha_hash, nome_completo, email, grupo_id) VALUES (?,?,?,?,?)",
        [username, senha_hash, nome_completo || null, email || null, grupo_id]
      );
    await addLog({
      type: "registro de usuário",
      message: "Usuário registrado",
      user: username,
      data: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
    res.status(201).json({ id: result.insertId, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function getUserProfile(req, res) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  try {
    const decoded = jwt.verify(token, secret);
    const [rows] = await db
      .getPool()
      .query(
        "SELECT id, username, nome_completo, email, grupo_id FROM usuarios WHERE id = ?",
        [decoded.uid]
      );
    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = rows[0];
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}
module.exports = { login, register, getUserProfile };
