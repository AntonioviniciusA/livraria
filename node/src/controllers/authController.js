const db = require("../config/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const secret = process.env.JWT_SECRET || "secret_dev";
const expiresIn = process.env.JWT_EXPIRES_IN || "8h";

async function login(req, res) {
  const { username, password } = req.body;
  console.log("username", username);
  console.log("password", password);
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

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: (Number(expiresIn) || 3600) * 1000, // 1 hora padrão
      sameSite: "strict",
    });
    res.status(200).json({ message: "Login successful" });
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
    res.status(201).json({ id: result.insertId, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "internal" });
  }
}

async function logout(req, res) {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
}
async function checkAuth(req, res) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }
  try {
    jwt.verify(token, secret);
    return res.status(200).json({ authenticated: true });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
}
async function checkAuth(req, res) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ authenticated: false });
  }
  try {
    jwt.verify(token, secret);
    return res.status(200).json({ authenticated: true });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
}
module.exports = { login, register };
