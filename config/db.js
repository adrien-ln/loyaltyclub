// Configuration de la connexion à la base de données
const { Pool } = require('pg');

// Chargement des variables d'environnement
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

const pool = new Pool(dbConfig);

module.exports = { pool };
