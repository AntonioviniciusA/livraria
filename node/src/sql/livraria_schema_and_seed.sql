-- SCHEMA + SEED para Livraria (MySQL)
CREATE DATABASE IF NOT EXISTS livraria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE livraria;

-- tabelas obrigatórias e demais entidades (id auto_increment para PK técnica)
-- 3) Tabelas de controle de usuários e grupos (obrigatórias)
CREATE TABLE IF NOT EXISTS grupos_usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(150),
    email VARCHAR(150) UNIQUE,
    grupo_id INT NOT NULL,
    ativo TINYINT(1) DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_usuario_grupo FOREIGN KEY (grupo_id) REFERENCES grupos_usuarios(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4) Entidades principais da livraria
CREATE TABLE IF NOT EXISTS editoras (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    pais VARCHAR(80),
    contato VARCHAR(150),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS autores (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS livros (
    id INT NOT NULL AUTO_INCREMENT,
    isbn VARCHAR(20) UNIQUE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    publicado_em DATE,
    editora_id INT,
    categoria_id INT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_livro_editora FOREIGN KEY (editora_id) REFERENCES editoras(id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_livro_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB;
-- Tabela N:M entre livros e autores
CREATE TABLE IF NOT EXISTS livros_autores (
    livro_id INT NOT NULL,
    autor_id INT NOT NULL,
    ordem_autor TINYINT DEFAULT 1,
    PRIMARY KEY (livro_id, autor_id),
    CONSTRAINT fk_la_livro FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    CONSTRAINT fk_la_autor FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- Estoque separado (quantidade por livro + localização)
CREATE TABLE IF NOT EXISTS estoque (
    id INT NOT NULL AUTO_INCREMENT,
    livro_id INT NOT NULL UNIQUE,
    quantidade INT NOT NULL DEFAULT 0,
    localizacao VARCHAR(100),
    atualizacao_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_estoque_livro FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE
) ENGINE=InnoDB;
-- Clientes (pessoas físicas) — poderia ter pessoa juridica opcional
CREATE TABLE IF NOT EXISTS clientes (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(30),
    endereco VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;
-- Pedidos (venda) - para demonstrar regra de geração customizada de ID
-- Usamos um id_numero de negócio gerado por função (fn_gen_id) e mantemos PK técnico auto_increment para integridade.
CREATE TABLE IF NOT EXISTS pedidos (
    id INT NOT NULL AUTO_INCREMENT,
    numero_negocio VARCHAR(50) NOT NULL UNIQUE,
    cliente_id INT NOT NULL,
    usuario_id INT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('ABERTO','PAGO','CANCELADO','ENVIADO') DEFAULT 'ABERTO',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Itens do pedido
CREATE TABLE IF NOT EXISTS pedidos_itens (
    id INT NOT NULL AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    livro_id INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) AS (quantidade * preco_unitario) STORED,
    PRIMARY KEY (id),
    CONSTRAINT fk_pi_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_livro FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
-- Auditoria simples para alterações em livros
CREATE TABLE IF NOT EXISTS audit_livros (
    id INT NOT NULL AUTO_INCREMENT,
    livro_id INT,
    operacao ENUM('INSERT','UPDATE','DELETE') NOT NULL,
    dados_antigos JSON NULL,
    dados_novos JSON NULL,
    usuario_id INT NULL,
    evento_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

-- Índices para acelerar buscas frequentes:
CREATE INDEX IF NOT EXISTS idx_livro_titulo ON livros(titulo);
CREATE INDEX IF NOT EXISTS idx_livro_isbn ON livros(isbn);
CREATE INDEX IF NOT EXISTS idx_est_livro ON estoque(livro_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_autor_nome ON autores(nome);

-- função de geração de ID de negócio
DELIMITER $$
CREATE FUNCTION IF NOT EXISTS fn_gen_id(prefix VARCHAR(10))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    RETURN CONCAT(prefix, DATE_FORMAT(NOW(), '%Y%m%d%H%i%S'), LPAD(FLOOR(RAND()*10000),4,'0'));
END $$
DELIMITER ;

-- procedure de criar pedido (simplificada)
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS sp_criar_pedido (
    IN p_cliente_id INT,
    IN p_usuario_id INT,
    IN p_itens JSON,
    OUT p_numero_negocio VARCHAR(50),
    OUT p_pedido_id INT
)
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_livro_id INT;
    DECLARE v_qt INT;
    DECLARE v_preco DECIMAL(10,2);
    DECLARE v_subtotal DECIMAL(12,2);
    DECLARE v_total DECIMAL(12,2) DEFAULT 0.00;
    DECLARE cur CURSOR FOR SELECT JSON_EXTRACT(value, '$.livro_id') AS livro_id,
                                 JSON_EXTRACT(value, '$.quantidade') AS quantidade
                          FROM JSON_TABLE(p_itens, '$[*]' COLUMNS (value JSON PATH '$')) AS jt;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    START TRANSACTION;
    SET p_numero_negocio = fn_gen_id('PED');

    INSERT INTO pedidos (numero_negocio, cliente_id, usuario_id, total)
        VALUES (p_numero_negocio, p_cliente_id, p_usuario_id, 0.00);
    SET p_pedido_id = LAST_INSERT_ID();

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_livro_id, v_qt;
        IF done = 1 THEN LEAVE read_loop; END IF;

        SELECT preco INTO v_preco FROM livros WHERE id = v_livro_id FOR UPDATE;
        IF v_preco IS NULL THEN
            ROLLBACK; 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Livro não encontrado';
        END IF;

        SELECT quantidade INTO @qty FROM estoque WHERE livro_id = v_livro_id FOR UPDATE;
        IF @qty IS NULL OR @qty < v_qt THEN
            ROLLBACK;
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('Estoque insuficiente para livro_id=', v_livro_id);
        END IF;

        INSERT INTO pedidos_itens (pedido_id, livro_id, quantidade, preco_unitario)
            VALUES (p_pedido_id, v_livro_id, v_qt, v_preco);

        UPDATE estoque SET quantidade = quantidade - v_qt WHERE livro_id = v_livro_id;

        SET v_subtotal = v_preco * v_qt;
        SET v_total = v_total + v_subtotal;
    END LOOP;
    CLOSE cur;

    UPDATE pedidos SET total = v_total WHERE id = p_pedido_id;

    COMMIT;
END $$
DELIMITER ;

-- triggers de auditoria simplificada
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS trg_audit_livros_after_insert
AFTER INSERT ON livros
FOR EACH ROW
BEGIN
    INSERT INTO audit_livros (livro_id, operacao, dados_novos, evento_em)
    VALUES (NEW.id, 'INSERT', JSON_OBJECT('titulo', NEW.titulo, 'preco', NEW.preco, 'isbn', NEW.isbn), NOW());
END $$
$$
CREATE TRIGGER IF NOT EXISTS trg_audit_livros_after_update
AFTER UPDATE ON livros
FOR EACH ROW
BEGIN
    INSERT INTO audit_livros (livro_id, operacao, dados_antigos, dados_novos, evento_em)
    VALUES (OLD.id, 'UPDATE', JSON_OBJECT('titulo', OLD.titulo, 'preco', OLD.preco, 'isbn', OLD.isbn), JSON_OBJECT('titulo', NEW.titulo, 'preco', NEW.preco, 'isbn', NEW.isbn), NOW());
END $$
$$
CREATE TRIGGER IF NOT EXISTS trg_audit_livros_after_delete
AFTER DELETE ON livros
FOR EACH ROW
BEGIN
    INSERT INTO audit_livros (livro_id, operacao, dados_antigos, evento_em)
    VALUES (OLD.id, 'DELETE', JSON_OBJECT('titulo', OLD.titulo, 'preco', OLD.preco, 'isbn', OLD.isbn), NOW());
END $$
DELIMITER ;

-- views
CREATE OR REPLACE VIEW vw_livros_disponiveis AS
SELECT 
    l.id AS livro_id,
    l.titulo,
    l.isbn,
    l.preco,
    e.nome AS editora,
    c.nome AS categoria,
    IFNULL(s.quantidade, 0) AS estoque_qt
FROM livros l
LEFT JOIN editoras e ON l.editora_id = e.id
LEFT JOIN categorias c ON l.categoria_id = c.id
LEFT JOIN estoque s ON s.livro_id = l.id;

CREATE OR REPLACE VIEW vw_resumo_vendas_livro AS
SELECT
    li.livro_id,
    l.titulo,
    SUM(li.quantidade) AS total_vendido,
    SUM(li.quantidade * li.preco_unitario) AS receita_total
FROM pedidos_itens li
JOIN livros l ON li.livro_id = l.id
GROUP BY li.livro_id, l.titulo;

-- seed (dados básicos)
INSERT INTO grupos_usuarios(nome, descricao) VALUES ('ADMIN','Administradores do sistema'), ('ATENDIMENTO','Pessoal de vendas/caixa'), ('LEITURA','Acesso somente leitura');
INSERT INTO usuarios(username, senha_hash, nome_completo, email, grupo_id) VALUES 
    ('admin', '$2b$10$dummyhashadminreplace', 'Admin Sistema', 'admin@livraria.local', 1),
    ('caixa1', '$2b$10$dummyhashcaixareplace', 'Caixa 1', 'caixa1@livraria.local', 2);

INSERT INTO editoras(nome, pais) VALUES ('Alta Books','Brasil'), ('GlobalPress','EUA');
INSERT INTO autores(nome) VALUES ('Autor Exemplo A'), ('Autor Exemplo B');
INSERT INTO categorias(nome) VALUES ('Ficção'), ('Tecnologia');

INSERT INTO livros(isbn, titulo, descricao, preco, publicado_em, editora_id, categoria_id)
VALUES ('9780000000001','Livro A','Descricao A', 49.90, '2024-03-10', 1, 1),
       ('9780000000002','Livro B','Descricao B', 79.90, '2023-07-22', 2, 2);

INSERT INTO livros_autores(livro_id, autor_id, ordem_autor) VALUES (1,1,1), (2,2,1);

INSERT INTO estoque(livro_id, quantidade, localizacao) VALUES (1, 10, 'Prateleira A1'), (2, 3, 'Prateleira B2');

INSERT INTO clientes(nome, email) VALUES ('Cliente Teste','cliente@teste.com');
