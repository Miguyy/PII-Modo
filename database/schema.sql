CREATE TABLE Utilizador (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    pontos INT DEFAULT 0,
    nivel INT DEFAULT 1,
    data_criacao_conta DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipo_utilizador ENUM('cliente', 'admin') DEFAULT 'cliente'
);

CREATE TABLE Notificacao (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT,
    tipo_notificacao ENUM('nivel','avatar','admin','sistema'),
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data DATETIME,
    FOREIGN KEY (id_utilizador) REFERENCES Utilizador(id_utilizador)
);

CREATE TABLE Relatorio (
    id_relatorio INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT,
    mes INT,
    semana INT,
    data_geracao DATETIME,
    conteudo VARCHAR(255),
    caminho_relatorio VARCHAR(255),
    FOREIGN KEY (id_utilizador) REFERENCES Utilizador(id_utilizador)
);

CREATE TABLE Decoracao_Avatar (
    id_decoracao INT AUTO_INCREMENT PRIMARY KEY,
    nome_decoracao VARCHAR(100) NOT NULL,
    nivel_necessario INT DEFAULT 1,
    caminho_decoracao VARCHAR(255) NOT NULL
);

CREATE TABLE Decoracao_Avatar_Utilizador (
    id_utilizador INT,
    id_decoracao INT,
    decoracao_ativa BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_utilizador, id_decoracao),
    FOREIGN KEY (id_utilizador) REFERENCES Utilizador(id_utilizador),
    FOREIGN KEY (id_decoracao) REFERENCES Decoracao_Avatar(id_decoracao)
);

CREATE TABLE Localizacao (
    id_localizacao INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    cidade VARCHAR(100),
    pais VARCHAR(100),
    FOREIGN KEY (id_utilizador) REFERENCES Utilizador(id_utilizador)
);

CREATE TABLE Habitos (
    id_habito INT AUTO_INCREMENT PRIMARY KEY,
    nome_habito VARCHAR(100) NOT NULL,
    descricao_habito TEXT,
    categoria VARCHAR(100)
);

CREATE TABLE Tarefas (
    id_tarefa INT AUTO_INCREMENT PRIMARY KEY,
    id_habito INT,
    nome_tarefa VARCHAR(100) NOT NULL,
    pontos_tarefa INT DEFAULT 0,
    tipo_tarefa VARCHAR(50),
    localizacao_tarefa ENUM('Dentro','Fora'),
    prioridade_tarefa INT,
    duracao_temporizador INT,
    quantidade_necessaria INT,
    FOREIGN KEY (id_habito) REFERENCES Habitos(id_habito)
);

CREATE TABLE Tarefas_Utilizador (
    id_tarefa INT,
    id_utilizador INT,
    tarefa_ativa BOOLEAN DEFAULT TRUE,
    estado_tarefa ENUM('Pendente','Completa'),
    progresso INT DEFAULT 0,
    data_inicio DATETIME,
    data_conclusao DATETIME,
    PRIMARY KEY (id_tarefa, id_utilizador),
    FOREIGN KEY (id_tarefa) REFERENCES Tarefas(id_tarefa),
    FOREIGN KEY (id_utilizador) REFERENCES Utilizador(id_utilizador)
);

CREATE TABLE Impacto (
    id_impacto INT AUTO_INCREMENT PRIMARY KEY,
    id_tarefa INT,
    tipo_impacto ENUM('agua','energia','co2'),
    valor_por_unidade DECIMAL(10,2),
    unidade VARCHAR(20),
    FOREIGN KEY (id_tarefa) REFERENCES Tarefas(id_tarefa)
);


