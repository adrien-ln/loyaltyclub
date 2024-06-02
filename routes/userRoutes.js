// module gérant les routes pour les utilisateurs du site (inscription, connexion, déconnexion)

// importation des modules nécessaires
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const { pool } = require('../config/db');

// Page d'acceuil
router.get('/', async (req, res) => {
    if(req.session && req.session.userId) {
        const user = await pool.query('SELECT * FROM clients WHERE id = $1', [req.session.userId]);
        const cadeaux = await pool.query('SELECT * FROM cadeaux ORDER BY id');
        const isBirthday = user.rows[0].birthdate.getDate() === new Date().getDate() && user.rows[0].birthdate.getMonth() === new Date().getMonth();
        res.render('index', { user: user.rows[0], cadeaux: cadeaux.rows, isBirthday});
    }else{
        res.render('index', { user: null});
    }
});

// Connexion d'un client
router.post('/login', async (req, res) => {
    // Récupération des données du formulaire
    let { email, password } = req.body;
    // Vérification de l'existence de l'email dans la base de données
    try {
        const client = await pool.query(
            `SELECT * FROM clients WHERE email = $1`,
            [email]
        );

        if (client.rows.length === 0) {
            res.render('index', { user: null, message: 'Email ou mot de passe incorrect.' });
        } else {
            // Vérification du mot de passe
            const passwordMatch = await bcrypt.compare(password, client.rows[0].password);

            if (passwordMatch) {
                const userId = client.rows[0].id;
                req.session.userId = userId;
                res.redirect('/');
            } else {
                res.render('index', { user: null, message: 'Email ou mot de passe incorrect.' });
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Une erreur est survenue lors de la connexion.');
    }
});

// Déconnexion d'un client
router.get('/logout', async (req, res) => {
    if(req.session && req.session.userId) {
        // Déconnexion de l'utilisateur en détruisant la session
        req.session.destroy();
        res.redirect('/');
    }else{
        res.status(401).send('Vous devez être connecté pour accéder à cette page.');
    }
});

// Page de compte client
router.get('/account', async (req, res) => {
    if (req.session && req.session.userId) {
        // Récupérer les informations du client et ses commandes
        const user = await pool.query('SELECT * FROM clients WHERE id = $1', [req.session.userId]);
        const commandes = await pool.query('SELECT c.name, c.prix, cmd.date_commande FROM commandes AS cmd JOIN cadeaux AS c ON cmd.cadeau_id = c.id WHERE cmd.client_id = $1', [req.session.userId]);
        res.render('account', { user: user.rows[0], commandes: commandes.rows });
    } else {
        res.status(401).send('Vous devez être connecté pour accéder à cette page.');
    }
});

// Commande d'un cadeau
router.post('/commander', async (req, res) => {
    if (req.session && req.session.userId) {
        // Récupérer le panier du corps de la requête
        const panier = req.body;

        // Vérifier que le panier n'est pas vide
        if(!Array.isArray(panier) || panier.length === 0) {
            return res.status(400).send('Le panier est vide.');
        }

        // Déduit le total des points nécessaires pour commander
        let total = 0;
        for (const item of panier) {
            total += parseInt(item.prix);
        }

        await pool.query('UPDATE clients SET points = points - $1 WHERE id = $2', [total, req.session.userId]);

        // Insérer les détails de la commande dans la table de commandes
        for (const item of panier) {
            await pool.query(
            'INSERT INTO commandes (client_id, cadeau_id, date_commande) VALUES ($1, $2, $3)',
            [req.session.userId, item.id, new Date()]
            );
        }res.status(201).send('Commande créée avec succès.');
    } else {
        res.status(401).send('Vous devez être connecté pour passer une commande.');
    }
});


module.exports = router;