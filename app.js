// Point d'entrée de l'application : lance le serveur et de définit les routes.

// Configuration de l'application
const express = require('express');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;
const HOSTNAME = 'localhost';

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Génération d'une clé secrète pour la session
const secretKey = require('./public/js/utils').generateSecretKey();
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    cookie: { false: true }
}));

// Définition des routes
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
app.use(userRoutes);
app.use(dashboardRoutes);

// Lancement du serveur
app.listen(PORT, HOSTNAME, () => {
    console.log(`Serveur en cours d'exécution sur http://${HOSTNAME}:${PORT}/`);
});
