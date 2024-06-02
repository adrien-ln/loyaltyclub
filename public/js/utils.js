// module contenant la fonction de génération de clé secrète pour la session.

const crypto = require('crypto');

function generateSecretKey() {
    return crypto.randomBytes(64).toString('hex');
}

module.exports = {
    generateSecretKey
};