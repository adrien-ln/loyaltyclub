DROP TABLE IF EXISTS commandes CASCADE;
DROP TABLE IF EXISTS cadeaux CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS gerante CASCADE;

-- Création de la table de la gérante
CREATE TABLE IF NOT EXISTS gerants (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Création de la table des clients
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    birthdate DATE NOT NULL,
    password VARCHAR(255) NOT NULL,
    points INTEGER DEFAULT 0
);

-- Création de la table des cadeaux
CREATE TABLE IF NOT EXISTS cadeaux (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    prix INTEGER NOT NULL,
    description TEXT,
    image_url VARCHAR(255)
);

-- Création de la table des commandes
CREATE TABLE IF NOT EXISTS commandes (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id),
    cadeau_id INTEGER REFERENCES cadeaux(id),
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (cadeau_id) REFERENCES cadeaux(id)
);

-- Insertion des données tests
INSERT INTO gerants (username, password)
VALUES ('admin', 'admin');

INSERT INTO cadeaux (name, prix, description, image_url)
VALUES 
('Carte cadeau Spotify', 200, 'Carte cadeau Spotify', 'https://i.imgur.com/R7uz3Hf.jpeg'),
('Carte cadeau Steam', 500, 'Carte cadeau Steam', 'https://i.imgur.com/iwMNTFV.jpeg'),
('Carte cadeau Amazon', 700, 'Carte cadeau Amazon à utiliser sur le site amazon.fr', 'https://i.imgur.com/6ZH8vJD.jpeg'),
('Carte cadeau Apple Music', 50, 'Carte cadeau Apple Music', 'https://i.imgur.com/MGFMsdX.jpeg'),
('Enceinte Bluetooth', 100, 'Enceinte sans fil pour écouter de la musique avec une qualité sonore exceptionnelle.', 'https://i.imgur.com/FPodNct.jpeg'),
('Montre connectée', 150, 'Montre intelligente avec des fonctionnalités avancées telles que le suivi de la santé et des notifications.', 'https://i.imgur.com/ctAnvFT.jpeg');