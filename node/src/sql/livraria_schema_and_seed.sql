-- SCHEMA + SEED para Livraria (MySQL)

CREATE DATABASE IF NOT EXISTS livraria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE livraria;

-- tabelas obrigatórias e demais entidades (id auto_increment para PK técnica)
-- 3) Tabelas de controle de usuários e grupos (obrigatórias)
CREATE TABLE IF NOT EXISTS grupos_usuarios (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
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
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS autores (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    bio TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS categorias (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao VARCHAR(255),
	criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
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
        ON UPDATE CASCADE ON DELETE SET NULL,
    -- Constraints de validação
    CONSTRAINT chk_livro_preco_positivo CHECK (preco >= 0)
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
    CONSTRAINT fk_estoque_livro FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    -- Constraints de validação
    CONSTRAINT chk_estoque_quantidade_positiva CHECK (quantidade >= 0)
) ENGINE=InnoDB;

-- Clientes (pessoas físicas) — poderia ter pessoa juridica opcional
CREATE TABLE IF NOT EXISTS clientes (
    id INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    cpf VARCHAR(14),
    telefone VARCHAR(30),
    endereco VARCHAR(255),
    ativo TINYINT(1) DEFAULT 1,  -- Coluna adicionada para soft delete
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
     
    CONSTRAINT chk_cliente_email_valido CHECK (email IS NULL OR email LIKE '%_@__%.__%')
) ENGINE=InnoDB;

-- Pedidos (venda) - para demonstrar regra de geração customizada de ID
CREATE TABLE IF NOT EXISTS pedidos (
    id INT NOT NULL AUTO_INCREMENT,
    numero_negocio VARCHAR(50) NOT NULL UNIQUE,
    cliente_id INT NOT NULL,
    usuario_id INT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('PENDENTE','ENTREGUE','CANCELADO','PROCESSANDO') DEFAULT 'PENDENTE',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pedido_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
        ON DELETE CASCADE,  -- CORRIGIDO: RESTRICT em vez de SET NULL para coluna NOT NULL
    CONSTRAINT fk_pedido_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)  
        ON DELETE CASCADE,
    CONSTRAINT chk_pedido_total_positivo CHECK (total >= 0)
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

-- Tabela para logs de atividades importantes
CREATE TABLE IF NOT EXISTS logs_sistema (
    id INT NOT NULL AUTO_INCREMENT,
    usuario_id INT NULL,
    acao VARCHAR(100) NOT NULL,
    descricao TEXT,
    ip_origem VARCHAR(45),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Índices para acelerar buscas frequentes:
CREATE INDEX idx_livro_titulo ON livros(titulo);
CREATE INDEX idx_livro_isbn ON livros(isbn);
CREATE INDEX idx_est_livro ON estoque(livro_id);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_autor_nome ON autores(nome);
CREATE INDEX idx_pedidos_numero ON pedidos(numero_negocio);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedidos_data ON pedidos(criado_em);
CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_pedidos_itens_pedido ON pedidos_itens(pedido_id);
CREATE INDEX idx_audit_livros_data ON audit_livros(evento_em);
CREATE INDEX idx_logs_data ON logs_sistema(criado_em);
CREATE INDEX idx_clientes_ativo ON clientes(ativo);  -- Índice para busca por clientes ativos

-- 4. CORREÇÃO DA FUNÇÃO fn_gen_id para evitar duplicatas
DROP FUNCTION IF EXISTS fn_gen_id;

DELIMITER $$
CREATE FUNCTION fn_gen_id(prefix VARCHAR(10))
RETURNS VARCHAR(50)
DETERMINISTIC
BEGIN
    DECLARE new_id VARCHAR(50);
    DECLARE counter INT DEFAULT 0;
    
    REPEAT
        SET new_id = CONCAT(prefix, DATE_FORMAT(NOW(), '%Y%m%d%H%i%s'), 
                           LPAD(FLOOR(RAND()*1000), 3, '0'));
        SET counter = counter + 1;
    UNTIL (SELECT COUNT(*) FROM pedidos WHERE numero_negocio = new_id) = 0 OR counter >= 10
    END REPEAT;
    
    RETURN new_id;
END $$
DELIMITER ;

-- procedure de criar pedido (corrigida e melhorada)
-- 1. CORREÇÃO DA PROCEDURE sp_criar_pedido - problema principal
DROP PROCEDURE IF EXISTS sp_criar_pedido;

DELIMITER $$
CREATE PROCEDURE sp_criar_pedido (
    IN p_cliente_id INT,
    IN p_usuario_id INT,
    IN p_itens JSON,
    OUT p_numero_negocio VARCHAR(50),
    OUT p_pedido_id INT
)
BEGIN
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_items_count INT DEFAULT 0;
    DECLARE v_livro_id INT;
    DECLARE v_qt INT;
    DECLARE v_preco DECIMAL(10,2);
    DECLARE v_total DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_livro_json JSON;

    -- Verificar se cliente está ativo
    IF (SELECT ativo FROM clientes WHERE id = p_cliente_id) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente inativo. Não é possível criar pedido.';
    END IF;

    START TRANSACTION;
    
    SET p_numero_negocio = fn_gen_id('PED');

    INSERT INTO pedidos (numero_negocio, cliente_id, usuario_id, total)
        VALUES (p_numero_negocio, p_cliente_id, p_usuario_id, 0.00);
    SET p_pedido_id = LAST_INSERT_ID();

    -- Processar itens do JSON de forma simples e compatível
    SET v_items_count = JSON_LENGTH(p_itens);
    
    WHILE v_index < v_items_count DO
        SET v_livro_json = JSON_EXTRACT(p_itens, CONCAT('$[', v_index, ']'));
        SET v_livro_id = JSON_UNQUOTE(JSON_EXTRACT(v_livro_json, '$.livro_id'));
        SET v_qt = JSON_UNQUOTE(JSON_EXTRACT(v_livro_json, '$.quantidade'));
        
        SET v_livro_id = CAST(v_livro_id AS UNSIGNED);
        SET v_qt = CAST(v_qt AS UNSIGNED);

        SELECT preco INTO v_preco FROM livros WHERE id = v_livro_id;
        IF v_preco IS NULL THEN
            ROLLBACK; 
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('Livro não encontrado: ID ', v_livro_id);
        END IF;

        SELECT quantidade INTO @qty FROM estoque WHERE livro_id = v_livro_id;
        IF @qty IS NULL OR @qty < v_qt THEN
            ROLLBACK;
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('Estoque insuficiente para livro_id=', v_livro_id, '. Disponível: ', IFNULL(@qty, 0));
        END IF;

        INSERT INTO pedidos_itens (pedido_id, livro_id, quantidade, preco_unitario)
            VALUES (p_pedido_id, v_livro_id, v_qt, v_preco);

        UPDATE estoque SET quantidade = quantidade - v_qt WHERE livro_id = v_livro_id;

        SET v_index = v_index + 1;
    END WHILE;

    INSERT INTO logs_sistema (usuario_id, acao, descricao)
    VALUES (p_usuario_id, 'CRIAR_PEDIDO', CONCAT('Pedido ', p_numero_negocio, ' criado para cliente ', p_cliente_id));

    COMMIT;
END $$
DELIMITER ;

-- Procedure para cancelar pedido e restaurar estoque
DROP PROCEDURE IF EXISTS sp_cancelar_pedido;

DELIMITER $$
CREATE PROCEDURE sp_cancelar_pedido(
    IN p_pedido_id INT,
    IN p_usuario_id INT
)
BEGIN
    DECLARE v_status VARCHAR(20);
    DECLARE v_numero_negocio VARCHAR(50);
    DECLARE v_pedido_exists INT DEFAULT 0;
    
    -- Verificar se pedido existe primeiro
    SELECT COUNT(*) INTO v_pedido_exists FROM pedidos WHERE id = p_pedido_id;
    IF v_pedido_exists = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido não encontrado';
    END IF;
    
    SELECT status, numero_negocio INTO v_status, v_numero_negocio 
    FROM pedidos WHERE id = p_pedido_id FOR UPDATE;
    
    IF v_status != 'CANCELADO' THEN
        START TRANSACTION;
        
        -- Restaurar estoque
        UPDATE estoque e
        JOIN pedidos_itens pi ON e.livro_id = pi.livro_id
        SET e.quantidade = e.quantidade + pi.quantidade
        WHERE pi.pedido_id = p_pedido_id;
        
        -- Atualizar status do pedido
        UPDATE pedidos 
        SET status = 'CANCELADO', atualizado_em = NOW()
        WHERE id = p_pedido_id;
        
        -- Log da operação
        INSERT INTO logs_sistema (usuario_id, acao, descricao)
        VALUES (p_usuario_id, 'CANCELAR_PEDIDO', CONCAT('Pedido ', v_numero_negocio, ' cancelado'));
        
        COMMIT;
    END IF;
END $$
DELIMITER ;

-- Procedure para deletar cliente de forma segura
DROP PROCEDURE IF EXISTS sp_deletar_cliente;

DELIMITER $$
CREATE PROCEDURE sp_deletar_cliente(
    IN p_cliente_id INT,
    IN p_usuario_id INT
)
BEGIN
    DECLARE v_has_pedidos INT DEFAULT 0;
    DECLARE v_cliente_nome VARCHAR(150);
    DECLARE v_pedidos_count INT DEFAULT 0;
    
    -- Verificar se o cliente existe
    SELECT nome INTO v_cliente_nome FROM clientes WHERE id = p_cliente_id;
    IF v_cliente_nome IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente não encontrado';
    END IF;
    
    -- Verificar se o cliente tem pedidos
    SELECT COUNT(*) INTO v_has_pedidos 
    FROM pedidos 
    WHERE cliente_id = p_cliente_id;
    
    IF v_has_pedidos > 0 THEN
        -- Cliente tem pedidos, vamos fazer soft delete (marcar como inativo)
        -- Marcar cliente como inativo
        UPDATE clientes 
        SET ativo = 0, 
            atualizado_em = NOW(),
            email = CONCAT('inativo_', UNIX_TIMESTAMP(), '_', IFNULL(email, 'sem_email'))  -- Evita conflito de email único
        WHERE id = p_cliente_id;
        
        -- Log da operação (soft delete)
        INSERT INTO logs_sistema (usuario_id, acao, descricao)
        VALUES (p_usuario_id, 'SOFT_DELETE_CLIENTE', 
                CONCAT('Cliente ', v_cliente_nome, ' (ID:', p_cliente_id, ') marcado como inativo. Possui ', v_has_pedidos, ' pedidos.'));
        
        SELECT 
            'soft_delete' as tipo_operacao,
            CONCAT('Cliente marcado como inativo. Possui ', v_has_pedidos, ' pedidos associados.') as mensagem;
            
    ELSE
        -- Cliente não tem pedidos, pode ser deletado permanentemente
        START TRANSACTION;
        
        -- Deletar cliente
        DELETE FROM clientes WHERE id = p_cliente_id;
        
        -- Log da operação (hard delete)
        INSERT INTO logs_sistema (usuario_id, acao, descricao)
        VALUES (p_usuario_id, 'DELETE_CLIENTE', 
                CONCAT('Cliente ', v_cliente_nome, ' (ID:', p_cliente_id, ') deletado permanentemente.'));
        
        COMMIT;
        
        SELECT 
            'hard_delete' as tipo_operacao,
            'Cliente deletado permanentemente do sistema.' as mensagem;
    END IF;
    
END $$
DELIMITER ;

-- Procedure alternativa para forçar delete (administrativa)
DROP PROCEDURE IF EXISTS sp_deletar_cliente_forcado;

DELIMITER $$
CREATE PROCEDURE sp_deletar_cliente_forcado(
    IN p_cliente_id INT,
    IN p_usuario_id INT
)
BEGIN
    DECLARE v_cliente_nome VARCHAR(150);
    DECLARE v_pedidos_count INT DEFAULT 0;
    
    -- Verificar se o cliente existe
    SELECT nome INTO v_cliente_nome FROM clientes WHERE id = p_cliente_id;
    IF v_cliente_nome IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente não encontrado';
    END IF;
    
    -- Contar pedidos do cliente
    SELECT COUNT(*) INTO v_pedidos_count 
    FROM pedidos 
    WHERE cliente_id = p_cliente_id;
    
    START TRANSACTION;
    
    -- Se houver pedidos, atualizar para NULL (mantém os pedidos sem cliente)
    IF v_pedidos_count > 0 THEN
        UPDATE pedidos 
        SET cliente_id = NULL, 
            atualizado_em = NOW()
        WHERE cliente_id = p_cliente_id;
    END IF;
    
    -- Deletar cliente
    DELETE FROM clientes WHERE id = p_cliente_id;
    
    -- Log da operação
    INSERT INTO logs_sistema (usuario_id, acao, descricao)
    VALUES (p_usuario_id, 'FORCE_DELETE_CLIENTE', 
            CONCAT('Cliente ', v_cliente_nome, ' (ID:', p_cliente_id, ') forçadamente deletado. ', 
                   v_pedidos_count, ' pedidos atualizados para cliente NULL.'));
    
    COMMIT;
    
    SELECT 
        'force_delete' as tipo_operacao,
        CONCAT('Cliente deletado forçadamente. ', v_pedidos_count, ' pedidos atualizados.') as mensagem;
        
END $$
DELIMITER ;

-- 2. CORREÇÃO DA PROCEDURE sp_relatorio_vendas_mensal - status inexistente
DROP PROCEDURE IF EXISTS sp_relatorio_vendas_mensal;

DELIMITER $$
CREATE PROCEDURE sp_relatorio_vendas_mensal(
    IN p_ano INT,
    IN p_mes INT
)
BEGIN
    SELECT 
        l.titulo,
        SUM(pi.quantidade) as unidades_vendidas,
        SUM(pi.subtotal) as receita,
        e.nome as editora,
        c.nome as categoria
    FROM pedidos_itens pi
    JOIN livros l ON pi.livro_id = l.id
    JOIN editoras e ON l.editora_id = e.id
    JOIN categorias c ON l.categoria_id = c.id
    JOIN pedidos p ON pi.pedido_id = p.id
    WHERE YEAR(p.criado_em) = p_ano 
        AND MONTH(p.criado_em) = p_mes
        AND p.status = 'ENTREGUE'  -- CORREÇÃO: status que existe
    GROUP BY l.id, l.titulo, e.nome, c.nome
    ORDER BY receita DESC;
END $$
DELIMITER ;

-- Remove triggers se existirem e cria novamente
DROP TRIGGER IF EXISTS trg_audit_livros_after_insert;
DROP TRIGGER IF EXISTS trg_audit_livros_after_update;
DROP TRIGGER IF EXISTS trg_audit_livros_after_delete;
DROP TRIGGER IF EXISTS trg_update_total_pedido;
DROP TRIGGER IF EXISTS trg_estoque_minimo;

DELIMITER $$
CREATE TRIGGER trg_audit_livros_after_insert
AFTER INSERT ON livros
FOR EACH ROW
BEGIN
    INSERT INTO audit_livros (livro_id, operacao, dados_novos, evento_em)
    VALUES (NEW.id, 'INSERT', JSON_OBJECT('titulo', NEW.titulo, 'preco', NEW.preco, 'isbn', NEW.isbn), NOW());
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_audit_livros_after_update
AFTER UPDATE ON livros
FOR EACH ROW
BEGIN
    INSERT INTO audit_livros (livro_id, operacao, dados_antigos, dados_novos, evento_em)
    VALUES (OLD.id, 'UPDATE', JSON_OBJECT('titulo', OLD.titulo, 'preco', OLD.preco, 'isbn', OLD.isbn), JSON_OBJECT('titulo', NEW.titulo, 'preco', NEW.preco, 'isbn', NEW.isbn), NOW());
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_audit_livros_after_delete
AFTER DELETE ON livros
FOR EACH ROW
BEGIN
    INSERT INTO audit_livros (livro_id, operacao, dados_antigos, evento_em)
    VALUES (OLD.id, 'DELETE', JSON_OBJECT('titulo', OLD.titulo, 'preco', OLD.preco, 'isbn', OLD.isbn), NOW());
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_update_total_pedido
AFTER INSERT ON pedidos_itens
FOR EACH ROW
BEGIN
    UPDATE pedidos 
    SET total = (SELECT SUM(subtotal) FROM pedidos_itens WHERE pedido_id = NEW.pedido_id),
        atualizado_em = NOW()
    WHERE id = NEW.pedido_id;
END $$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER trg_estoque_minimo
AFTER UPDATE ON estoque
FOR EACH ROW
BEGIN
    IF NEW.quantidade < 5 THEN
        INSERT INTO logs_sistema (acao, descricao)
        VALUES ('ESTOQUE_BAIXO', CONCAT('Estoque baixo para livro ID ', NEW.livro_id, ': ', NEW.quantidade, ' unidades'));
    END IF;
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

-- 3. CORREÇÃO DAS VIEWS 
CREATE OR REPLACE VIEW vw_vendas_por_periodo AS
SELECT 
    DATE(p.criado_em) as data_venda,
    COUNT(p.id) as total_pedidos,
    SUM(p.total) as receita_total,
    SUM(pi.quantidade) as total_livros_vendidos
FROM pedidos p
LEFT JOIN pedidos_itens pi ON p.id = pi.pedido_id
WHERE p.status = 'ENTREGUE'  -- CORREÇÃO
GROUP BY DATE(p.criado_em)
ORDER BY data_venda DESC;

CREATE OR REPLACE VIEW vw_livros_mais_vendidos AS
SELECT 
    l.id,
    l.titulo,
    COUNT(pi.id) as vezes_vendido,
    SUM(pi.quantidade) as total_unidades,
    SUM(pi.subtotal) as receita_total
FROM livros l
LEFT JOIN pedidos_itens pi ON l.id = pi.livro_id
JOIN pedidos p ON pi.pedido_id = p.id AND p.status = 'ENTREGUE'  -- CORREÇÃO
GROUP BY l.id, l.titulo
ORDER BY total_unidades DESC;

-- View para clientes ativos (útil após implementar soft delete)
CREATE OR REPLACE VIEW vw_clientes_ativos AS
SELECT 
    id,
    nome,
    email,
    telefone,
    endereco,
    criado_em,
    atualizado_em
FROM clientes 
WHERE ativo = 1;

-- seed (dados básicos melhorados)
INSERT IGNORE INTO grupos_usuarios(nome, descricao) VALUES 
    ('ADMIN','Administradores do sistema'), 
    ('ATENDIMENTO','Pessoal de vendas/caixa'), 
    ('LEITURA','Acesso somente leitura');

INSERT IGNORE INTO usuarios(username, senha_hash, nome_completo, email, grupo_id) VALUES 
    ('admin', '$2b$10$dummyhashadminreplace', 'Admin Sistema', 'admin@livraria.local', 1),
    ('caixa1', '$2b$10$dummyhashcaixareplace', 'Caixa 1', 'caixa1@livraria.local', 2),
    ('gerente', '$2b$10$dummyhashgerente', 'Gerente Loja', 'gerente@livraria.local', 1);

INSERT IGNORE INTO editoras(nome, pais) VALUES 
    ('Alta Books','Brasil'), 
    ('GlobalPress','EUA'),
    ('TecnoLivros','Brasil');

INSERT IGNORE INTO autores(nome, bio) VALUES 
    ('Autor Exemplo A', 'Escritor premiado de ficção'),
    ('Autor Exemplo B', 'Especialista em tecnologia'),
    ('Autor Exemplo C', 'Autor best-seller internacional');

INSERT IGNORE INTO categorias(nome, descricao) VALUES 
    ('Ficção', 'Romances, contos e literatura ficcional'),
    ('Tecnologia', 'Livros técnicos de TI e programação'),
    ('Autoajuda', 'Desenvolvimento pessoal e profissional');

INSERT IGNORE INTO livros(isbn, titulo, descricao, preco, publicado_em, editora_id, categoria_id) VALUES
    ('9780000000001','Livro A','Descricao A', 49.90, '2024-03-10', 1, 1),
    ('9780000000002','Livro B','Descricao B', 79.90, '2023-07-22', 2, 2),
    ('9780000000003', 'Livro C', 'Descrição C', 59.90, '2024-01-15', 1, 2),
    ('9780000000004', 'Livro D', 'Descrição D', 39.90, '2023-11-20', 2, 1),
    ('9780000000005', 'Livro E', 'Descrição E', 89.90, '2024-02-01', 3, 3);

INSERT IGNORE INTO livros_autores(livro_id, autor_id, ordem_autor) VALUES 
    (1, 1, 1), 
    (2, 2, 1), 
    (3, 1, 1), 
    (4, 2, 1),
    (5, 3, 1);

INSERT IGNORE INTO estoque(livro_id, quantidade, localizacao) VALUES 
    (1, 10, 'Prateleira A1'), 
    (2, 3, 'Prateleira B2'),
    (3, 5, 'Prateleira C1'), 
    (4, 8, 'Prateleira D2'),
    (5, 15, 'Prateleira E3');

INSERT IGNORE INTO clientes(nome, email, telefone, endereco, ativo) VALUES
    ('Cliente Teste', 'cliente@teste.com', '(11) 9999-8888', 'Rua Exemplo, 123 - São Paulo, SP', 1),
    ('Maria Silva', 'maria@email.com', '(11) 9999-8888', 'Rua A, 123 - São Paulo, SP', 1),
    ('João Santos', 'joao@email.com', '(11) 7777-6666', 'Av. B, 456 - Rio de Janeiro, RJ', 1),
    ('Ana Oliveira', 'ana.oliveira@email.com', '(21) 8888-7777', 'Rua C, 789 - Belo Horizonte, MG', 1);

-- Log inicial do sistema
INSERT IGNORE INTO logs_sistema (usuario_id, acao, descricao) 
VALUES (1, 'SISTEMA_INICIADO', 'Banco de dados e dados iniciais configurados');