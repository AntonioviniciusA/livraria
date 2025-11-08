# Livraria Backend

Backend em **Node.js + Express** conectado ao **MySQL** (projeto para o Trabalho Final de Banco de Dados).

Este repositório inclui:
- `package.json` — dependências e scripts.
- `.env.example` — variáveis de ambiente.
- `sql/livraria_schema_and_seed.sql` — script para criar schema, views, triggers, procedures e dados seed (rodar no MySQL Workbench).
- `src/` — código-fonte do servidor:
  - `index.js` — entrypoint
  - `config/db.js` — pool MySQL
  - `middleware/auth.js` — autenticação JWT e autorização por grupos
  - `controllers/*.js` — lógica dos endpoints
  - `routes/*.js` — rotas Express
  - `utils/hash.js` — wrappers bcrypt

---

## Requisitos

- Node.js v16+ (recomendado)
- MySQL 8.x (MySQL Workbench para executar o script SQL)
- (opcional) nodemon para desenvolvimento

---

## Instalação

1. Clone o repositório:
```bash
git clone <seu-repo-url> livraria-backend
cd livraria-backend
