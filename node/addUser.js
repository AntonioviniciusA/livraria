import mysql from "mysql2/promise";
import bcrypt from "bcrypt";

async function main() {
  const [, , username, nome_completo, email, grupo_id] = process.argv;

  if (!username || !nome_completo || !email || !grupo_id) {
    console.log(
      "Uso: node addUser.js <username> <nome_completo> <email> <grupo_id>"
    );
    process.exit(1);
  }

  const senhaCriptografada = await bcrypt.hash("admin123", 10);

  const conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "h9t70p55",
    database: "livraria",
  });

  await conn.execute(
    `INSERT INTO usuarios (username, senha_hash, nome_completo, email, grupo_id)
     VALUES (?, ?, ?, ?, ?)`,
    [username, senhaCriptografada, nome_completo, email, grupo_id]
  );

  console.log("Usuário criado com sucesso!");
  await conn.end();
}

main();
