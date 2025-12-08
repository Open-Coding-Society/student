const DBS2API = {
    baseUrl: '/api/dbs2',
    
    async getPlayer() {
        const res = await fetch(`${this.baseUrl}/player`, { credentials: 'include' });
        return res.json();
    },
    
    async updatePlayer(data) {
        const res = await fetch(`${this.baseUrl}/player`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return res.json();
    },
    
    async getCrypto() {
        const res = await fetch(`${this.baseUrl}/crypto`, { credentials: 'include' });
        const data = await res.json();
        return data.crypto;
    },
    
    async setCrypto(amount) {
        const res = await fetch(`${this.baseUrl}/crypto`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ crypto: amount })
        });
        return res.json();
    },
    
    async addCrypto(amount) {
        const res = await fetch(`${this.baseUrl}/crypto`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ add: amount })
        });
        const data = await res.json();
        
        window.playerCrypto = data.crypto;
        window.playerBalance = data.crypto;
        this.updateCryptoUI(data.crypto);
        
        return data.crypto;
    },
    
    async getInventory() {
        const res = await fetch(`${this.baseUrl}/inventory`, { credentials: 'include' });
        const data = await res.json();
        return data.inventory;
    },
    
    async addInventoryItem(name, foundAt) {
        const res = await fetch(`${this.baseUrl}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name: name, found_at: foundAt || 'unknown' })
        });
        return res.json();
    },
    
    async removeInventoryItem(index) {
        const res = await fetch(`${this.baseUrl}/inventory`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ index: index })
        });
        return res.json();
    },
    
    async getScores() {
        const res = await fetch(`${this.baseUrl}/scores`, { credentials: 'include' });
        const data = await res.json();
        return data.scores;
    },
    
    async submitScore(game, score) {
        const res = await fetch(`${this.baseUrl}/scores`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ game: game, score: score })
        });
        return res.json();
    },
    
    async getMinigameStatus() {
        const res = await fetch(`${this.baseUrl}/minigames`, { credentials: 'include' });
        return res.json();
    },
    
    async completeMinigame(gameName) {
        const data = {};
        data[gameName] = true;
        
        const res = await fetch(`${this.baseUrl}/minigames`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return res.json();
    },
    
    async getLeaderboard(limit = 10) {
        const res = await fetch(`${this.baseUrl}/leaderboard?limit=${limit}`);
        const data = await res.json();
        return data.leaderboard;
    },
    
    updateCryptoUI(crypto) {
        const ids = ['balance', 'money', 'crypto', 'playerCrypto'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = crypto;
        });
    },
    
    async init() {
        try {
            const player = await this.getPlayer();
            window.playerCrypto = player.crypto;
            window.playerBalance = player.crypto;
            window.playerInventory = player.inventory;
            this.updateCryptoUI(player.crypto);
            console.log('DBS2API initialized:', player);
            return player;
        } catch (e) {
            console.log('DBS2API: Not logged in or error:', e);
            return null;
        }
    }
};

window.DBS2API = DBS2API;

document.addEventListener('DOMContentLoaded', () => {
    DBS2API.init();
});

export default DBS2API;