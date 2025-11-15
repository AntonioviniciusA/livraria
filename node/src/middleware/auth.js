const jwt = require("jsonwebtoken");
const db = require("../config/db");

const secret = process.env.JWT_SECRET;

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  console.log("auth middleware:", token);
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, secret);
    console.log("payload:", payload);
    console.log("payload.uid:", payload.uid);
    const [rows] = await db
      .getPool()
      .query(
        "SELECT u.id, u.username, u.email, g.nome as grupo FROM usuarios u JOIN grupos_usuarios g ON u.grupo_id = g.id WHERE u.id = ?",
        [payload.uid]
      );
    if (rows.length === 0)
      return res.status(401).json({ error: "User not found" });
    req.user = rows[0];
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

function authorize(requiredGroups = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (requiredGroups.length === 0) return next();
    if (requiredGroups.includes(req.user.grupo)) return next();
    return res.status(403).json({ error: "Forbidden" });
  };
}

module.exports = { authenticate, authorize };
