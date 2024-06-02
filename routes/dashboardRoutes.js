// module gérant les routes pour le dashboard du gérant (connexion, déconnexion, ajout de cadeaux, ajout de points)

// importation des modules nécessaires
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { pool } = require('../config/db');

// instanciation des données de session
const sessionData = require('../public/js/sessionData');

// Page d'accueil du dashboard
router.get('/gerante', async (req, res) => {
    if (req.session && req.session.gerantId) {
        res.render('dashboard', { gerant: sessionData.admin, clients: sessionData.clients, cadeaux: sessionData.cadeaux, commandes: sessionData.commandes });
    } else {
        res.render('dashboard', { gerant: null});
    }
});

// Connexion d'un admin
router.post('/gerante/login', async (req, res) => {
    // Récupération des données du formulaire
    let { username, password } = req.body;
    try {
        // Vérification de l'existence de l'email dans la base de données
        const gerant = await pool.query(
            `SELECT * FROM gerants WHERE username = $1`,
            [username]
        );

        if (gerant.rows.length === 0) {
            res.render('dashboard', { gerant: null, message: 'Email ou mot de passe incorrect.' });
        } else {
            // Vérification du mot de passe
            const passwordMatch = gerant.rows[0].password === password;
            if (passwordMatch) {
                gerantId = gerant.rows[0].id;
                req.session.gerantId = gerantId;
                pool.query('SELECT * FROM clients', (error, clientResults) => {
                    if (error) {
                        throw error;
                    }
                    // Récupération de la table des cadeaux
                    pool.query('SELECT * FROM cadeaux', (error, cadeauResults) => {
                        if (error) {
                            throw error;
                        }
                        // Récupération de la table des commandes
                        pool.query('SELECT * FROM commandes', (error, commandeResults) => {
                            if (error) {
                                throw error;
                            }
                            // Ajoute les infos dans le tableau de session
                            sessionData.setAdmin(gerant.rows[0]);
                            sessionData.setClients(clientResults.rows);
                            sessionData.setCadeaux(cadeauResults.rows);
                            sessionData.setCommandes(commandeResults.rows);
                            res.redirect('/gerante');
                        });
                    });
                });
            } else {
                res.render('dashboard', { gerant: null, message: 'Email ou mot de passe incorrect.' });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Une erreur est survenue lors de la connexion.');
    }
});

// Enregistrement d'un client
router.post('/gerante/register', async (req, res) => {
    if (!req.session.gerantId) {
        return res.status(401).send('Vous devez être connecté pour accéder à cette page.');
    }
    let { name, email, birthdate, password, confirmPassword } = req.body;
    // met à jour birthdate pour ne conserver que la date
    birthdate = birthdate.split('T')[0];
    console.log(
        `Nom: ${name}, Date de naissance: ${birthdate}, Email: ${email}, Mot de passe: ${password}, Confirmation du mot de passe: ${confirmPassword}`
    );

    let errors = [];

    if (!name || !email || !birthdate || !password || !confirmPassword) {
        errors.push({ message: 'Veuillez saisir tous les champs.' });
    }

    if (password.length < 6) {
        errors.push({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
    }

    if(password !== confirmPassword) {
        errors.push({ message: 'Les mots de passe ne correspondent pas.' });
    }

    if (typeof password !== 'string' || typeof confirmPassword !== 'string') {
        errors.push({ message: 'Les mots de passe doivent être des chaînes de caractères.' });
    }
    
    if (errors.length > 0) {
        res.render('dashboard', { errors });
    } else {
        // Enregistrement du client valide
        // Hashage du mot de passe
        let hashedPassword = await bcrypt.hash(password, 10);
        // Conversion du password en string
        stringPassword = hashedPassword.toString();
        try {
            // Vérification de l'unicité de l'email
            const emailExists = await pool.query(
                `SELECT * FROM clients WHERE email = $1`,
                [email]
            );

            if (emailExists.rows.length > 0) {
                errors.push({ message: 'Cet email est déjà utilisé.' });
                res.render('dashboard', { errors });
            } else {
                // Enregistrement du client dans la base de données
                const newClient = await pool.query(
                    `INSERT INTO clients (name, email, birthdate, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, points`,
                    [name, email, birthdate, stringPassword]
                );
                sessionData.clients.push(newClient.rows[0]);
                res.render('dashboard', { message: 'Client enregistré avec succès.', gerant: sessionData.admin, clients: sessionData.clients, cadeaux: sessionData.cadeaux, commandes: sessionData.commandes });
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Une erreur est survenue lors de l\'enregistrement du client.');
        }
    }
});

// Se déconnecter
router.post('/gerante/add-cadeau', async (req, res) => {
    if (!req.session.gerantId) {
        return res.status(401).send('Vous devez être connecté pour accéder à cette page.');
    }

    // Récupération des données du formulaire
    let { name, prix, description, image_url } = req.body;
    prix = parseInt(prix);
    
    let errors = [];

    // Vérification de la saisie des champs
    if (!name || !prix || !description || !image_url) {
        errors.push({ message: 'Veuillez saisir tous les champs.' });
    }

    // Vérification de l'url de l'image
    if (!image_url.match(/\.(jpeg|jpg|gif|png)$/)) {
        errors.push({ message: 'L\'URL de l\'image doit être une URL valide.' });
    }

    if (errors.length > 0) {
        res.render('dashboard', { errors, gerant: sessionData.admin, clients: sessionData.clients, cadeaux: sessionData.cadeaux, commandes: sessionData.commandes });
    }

    try {
        // Enregistrement du cadeau dans la base de données
        const newCadeau = await pool.query(
            `INSERT INTO cadeaux (name, prix, description, image_url) VALUES ($1, $2, $3, $4) RETURNING name, prix, description, image_url`,
            [name, prix, description, image_url]
        );
        // Ajout du cadeau dans le tableau de session
        sessionData.cadeaux.push(newCadeau.rows[0]);
        res.render('dashboard', { message: 'Cadeau enregistré avec succès.', gerant: sessionData.admin, clients: sessionData.clients, cadeaux: sessionData.cadeaux, commandes: sessionData.commandes });
    } catch (err) {
        console.error(err);
        res.status(500).send('Une erreur est survenue lors de l\'enregistrement du cadeau.');
    }
});

// Ajouter des points à un client
router.post('/gerante/add-remove-points', async (req, res) => {
    // Récupération des données du formulaire
    let { clientID, points, operation } = req.body;

    // convertir points et clientID en nombre
    clientID = parseInt(clientID);
    points = parseInt(points);

    // vérifier si le client existe
    let clientExists = sessionData.clients.find(client => client.id === clientID);
    if (!clientExists) {
        return res.status(404).send('Le client n\'existe pas.');
    }

    // vérifier si le nombre de points est un nombre
    if (points < 0) {
        return res.status(400).send('Le nombre de points doit être un nombre positif.');
    }

    // vérifier si l'opération est une suppression et si le client a assez de points pour la suppression
    if (operation === 'remove') {
        if (clientExists.points < points) {
            points = -clientExists.points;
        }
    }

    try {
        // Ajout des points à un client
        const updatedClient = await pool.query(
            `UPDATE clients SET points = points + $1 WHERE id = $2 RETURNING points, id`,
            [points, clientID]
        );
        
        // Mettre à jour le tableau de session
        clientExists.points = updatedClient.rows[0].points;
        res.render('dashboard', { message: 'Points mis à jour avec succès.', gerant: sessionData.admin, clients: sessionData.clients, cadeaux: sessionData.cadeaux, commandes: sessionData.commandes });
    } catch (err) {
        console.error(err);
        res.status(500).send('Une erreur est survenue lors de l\'ajout des points.');
    }
});

module.exports = router;