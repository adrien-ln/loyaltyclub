// module qui gère les données de session admin

class SessionData {
    
    constructor() {
        this.admin = []
        this.clients = [];
        this.cadeaux = [];
        this.commandes = [];
    }

    setAdmin(admin) {
        this.admin = admin;
    }

    setClients(clients) {
        this.clients = clients;
    }

    setCadeaux(cadeaux) {
        this.cadeaux = cadeaux;
    }

    setCommandes(commandes) {
        this.commandes = commandes;
    }
}

module.exports = new SessionData();
