# LoyaltyClub: Un site de cartes de fidélité
### Projet de Programmation Web 2024

## Installation

- Cloner le dépôt :

```bash
git clone https://github.com/adrien-ln/loyaltyclub.git
cd projet-pw
```

- Initialiser la base de donnée :
```bash
createdb loyaltyclub
psql -d loyaltyclub
```
```
\i config/sql/init.sql
``` 

> **IMPORTANT** : Modifiez les valeurs des variables *DB_USER* et *DB_PASSWORD* présentes dans le fichier `.env` selon vos identifiants PostgreSQL.

- Installer les dépendances et lancer l'application :

```bash
npm install
npm start
```

Pour accéder au site : http://localhost:3000/