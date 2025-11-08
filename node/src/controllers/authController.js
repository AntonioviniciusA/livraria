const db = require('../config/db');
const hash = require('../utils/hash');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'secret_dev';
const expiresIn = process.env.JWT_EXPIRES_IN || '8h';

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  try {
    const [rows] = await db.getPool().query('SELECT id, username, senha_hash FROM usuarios WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = rows[0];
    const ok = await hash.compare(password, user.senha_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ uid: user.id, username: user.username }, secret, { expiresIn });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
}

async function register(req, res) {
  const { username, password, nome_completo, email, grupo_id } = req.body;
  if (!username || !password || !grupo_id) return res.status(400).json({ error: 'username,password,grupo_id required' });
  try {
    const senha_hash = await hash.hash(password);
    const [result] = await db.getPool().query(
      'INSERT INTO usuarios (username, senha_hash, nome_completo, email, grupo_id) VALUES (?,?,?,?,?)',
      [username, senha_hash, nome_completo || null, email || null, grupo_id]
    );
    res.status(201).json({ id: result.insertId, username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal' });
  }
}

module.exports = { login, register };
