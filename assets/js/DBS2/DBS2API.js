import { pythonURI, fetchOptions } from '../api/config.js';

const DBS2API = {
    baseUrl: `${pythonURI}/api/dbs2`,
    
    // ============ PLAYER DATA ============
    async getPlayer() {
        const res = await fetch(`${this.baseUrl}/player`, fetchOptions);
        return res.json();
    },
    
    async updatePlayer(data) {
        const res = await fetch(`${this.baseUrl}/player`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return res.json();
    },
    
    // ============ CRYPTO ============
    async getCrypto() {
        const res = await fetch(`${this.baseUrl}/crypto`, fetchOptions);
        const data = await res.json();
        return data.crypto;
    },
    
    async setCrypto(amount) {
        const res = await fetch(`${this.baseUrl}/crypto`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify({ crypto: amount })
        });
        return res.json();
    },
    
    async addCrypto(amount) {
        const res = await fetch(`${this.baseUrl}/crypto`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify({ add: amount })
        });
        const data = await res.json();
        
        // Update window variables for backward compatibility
        window.playerCrypto = data.crypto;
        window.playerBalance = data.crypto;
        this.updateCryptoUI(data.crypto);
        
        return data.crypto;
    },
    
    // ============ INVENTORY ============
    async getInventory() {
        const res = await fetch(`${this.baseUrl}/inventory`, fetchOptions);
        const data = await res.json();
        return data.inventory;
    },
    
    async addInventoryItem(name, foundAt) {
        const res = await fetch(`${this.baseUrl}/inventory`, {
            ...fetchOptions,
            method: 'POST',
            body: JSON.stringify({ name: name, found_at: foundAt || 'unknown' })
        });
        return res.json();
    },
    
    async removeInventoryItem(index) {
        const res = await fetch(`${this.baseUrl}/inventory`, {
            ...fetchOptions,
            method: 'DELETE',
            body: JSON.stringify({ index: index })
        });
        return res.json();
    },
    
    // ============ SCORES ============
    async getScores() {
        const res = await fetch(`${this.baseUrl}/scores`, fetchOptions);
        const data = await res.json();
        return data.scores;
    },
    
    async submitScore(game, score) {
        const res = await fetch(`${this.baseUrl}/scores`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify({ game: game, score: score })
        });
        return res.json();
    },
    
    // ============ MINIGAMES ============
    async getMinigameStatus() {
        const res = await fetch(`${this.baseUrl}/minigames`, fetchOptions);
        return res.json();
    },
    
    async completeMinigame(gameName) {
        const data = {};
        data[gameName] = true;
        
        const res = await fetch(`${this.baseUrl}/minigames`, {
            ...fetchOptions,
            method: 'PUT',
            body: JSON.stringify(data)
        });
        return res.json();
    },
    
    // ============ LEADERBOARD ============
    async getLeaderboard(limit = 10) {
        // Leaderboard is public, no auth needed
        const res = await fetch(`${this.baseUrl}/leaderboard?limit=${limit}`);
        const data = await res.json();
        return data.leaderboard;
    },
    
    // ============ BITCOIN BOOST (for Crypto Miner) ============
    async getBitcoinBoost() {
        const res = await fetch(`${this.baseUrl}/bitcoin-boost`);
        return res.json();
    },
    
    /**
     * Add crypto with Bitcoin boost applied
     * @param {number} baseAmount - Base crypto to add before boost
     * @returns {object} { crypto, boost_multiplier, boosted_amount, btc_change_24h }
     */
    async addCryptoWithBoost(baseAmount) {
        // Get current Bitcoin boost
        const boostData = await this.getBitcoinBoost();
        const multiplier = boostData.boost_multiplier || 1.0;
        
        // Calculate boosted amount
        const boostedAmount = Math.round(baseAmount * multiplier);
        
        // Add the boosted crypto
        const newTotal = await this.addCrypto(boostedAmount);
        
        return {
            crypto: newTotal,
            base_amount: baseAmount,
            boosted_amount: boostedAmount,
            boost_multiplier: multiplier,
            btc_change_24h: boostData.btc_change_24h || 0,
            btc_price_usd: boostData.btc_price_usd || 0,
            message: boostData.message || ''
        };
    },
    
    // ============ UI HELPERS ============
    updateCryptoUI(crypto) {
        const ids = ['balance', 'money', 'crypto', 'playerCrypto'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = crypto;
        });
    },
    
    // ============ INITIALIZATION ============
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

// Make available globally
window.DBS2API = DBS2API;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DBS2API.init();
});

export default DBS2API;