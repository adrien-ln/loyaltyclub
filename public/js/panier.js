// module de gestion du panier

let panier = []; // Tableau contenant les articles du panier
let cadeauIndex = 0; // Index du prochain cadeau à ajouter au panier
let total = 0; // Total des points des articles du panier

// Ajoute un cadeau au panier
function ajouterAuPanier(name, prix, id) {
    // maj du nombre de points restants
    let nb_point = document.getElementById('nb_point');
    nb_point = parseInt(nb_point.innerText);
    nb_point -= prix;

    if(nb_point < 0){
        alert('Vous n\'avez pas assez de points pour commander cet article.');
        return;
    }

    document.getElementById('nb_point').innerText = nb_point;

    // Ajouter l'article au panier
    panier.push({ name, prix, id });

    // Mettre à jour le total
    prix = parseInt(prix);
    total += prix;

    // Mettre à jour l'affichage du panier
    let listePanier = document.querySelector('#liste-panier');
    let li = document.createElement('li');
    li.textContent = name + ' - ' + prix + ' points';
    li.id = 'article-' + cadeauIndex;
    let removeButton = document.createElement('button');
    removeButton.className = 'fas fa-trash-alt';
    li.appendChild(removeButton);
    removeButton.onclick = function() {
        retirerDuPanier(this);
    };

    li.appendChild(removeButton);
    listePanier.appendChild(li);


    // Mettre à jour le total affiché
    let totalPanier = document.querySelector('#total-panier');
    totalPanier.textContent = total;

    // Afficher le panier
    let panierElement = document.querySelector('#panier');
    panierElement.style.display = 'block';
}

// Supprime un cadeau du panier
function retirerDuPanier(button) {
    // Récupére l'index de l'article
    let index = button.parentElement.id.split('-')[1];

    // Met à jour le total
    let prix = parseInt(panier[index].prix);
    total -= prix;

    // Met à jour le nombre de points restants
    let nb_point = document.getElementById('nb_point');
    nb_point = parseInt(nb_point.innerText);
    nb_point += prix;
    document.getElementById('nb_point').innerText = nb_point;

    // Met à jour l'affichage du panier
    let listePanier = document.querySelector('#liste-panier');
    listePanier.removeChild(button.parentElement);

    // Met à jour le total affiché
    let totalPanier = document.querySelector('#total-panier');
    totalPanier.textContent = total;

    // Supprime l'article du panier
    panier.splice(index, 1);

    // Cache le panier s'il est vide
    if (panier.length === 0) {
        fermerPanier();
    }
}

// Envoie la commande au serveur
function commander() {
    // Envoie une requête au serveur pour créer une nouvelle commande
    fetch('/commander', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(panier),
    })

    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur réseau lors de la tentative de création de la commande.');
        }
        return response;
    })

    .then(data => {
        // Vider le panier
        panier = [];
        total = 0;

        // Mettre à jour l'affichage du panier
        let listePanier = document.querySelector('#liste-panier');
        listePanier.innerHTML = '';
        let totalPanier = document.querySelector('#total-panier');
        totalPanier.textContent = total;

        fermerPanier();

        // Afficher un message de confirmation
        alert('Votre commande a bien été enregistrée');
        updateCadeaux();
    })
    .catch(error => {
        console.error('Erreur :', error);
    });
}

// Ferme le panier et affiche le logo du panier
function fermerPanier() {
    document.getElementById('panier').style.display = 'none';
    document.getElementById('logo-panier').style.display = 'block';
}

// Ouvre le panier et cache le logo du panier
function ouvrirPanier() {
    document.getElementById('panier').style.display = 'block';
    document.getElementById('logo-panier').style.display = 'none';
}