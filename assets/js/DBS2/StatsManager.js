/**
 * StatsManager.js
 * Bridges local game state with backend DBS2 API
 * Handles crypto, inventory, scores, and minigame completion tracking
 */

// Try to import DBS2API - it may not be available in all contexts
let DBS2API = null;
try {
    const module = await import('./DBS2API.js');
    DBS2API = module.default || module;
} catch (e) {
    console.log('DBS2API not available, using local storage fallback');
}

// Local state (fallback when API unavailable)
let localState = {
    crypto: 0,
    inventory: [],
    scores: {},
    minigames_completed: {}
};

// Load local state from localStorage
function loadLocalState() {
    try {
        const saved = localStorage.getItem('dbs2_local_state');
        if (saved) {
            localState = JSON.parse(saved);
        }
    } catch (e) {
        console.log('Could not load local state:', e);
    }
}

// Save local state to localStorage
function saveLocalState() {
    try {
        localStorage.setItem('dbs2_local_state', JSON.stringify(localState));
    } catch (e) {
        console.log('Could not save local state:', e);
    }
}

// Initialize local state on load
loadLocalState();

/**
 * Get current crypto balance
 * @returns {Promise<number>} Current crypto amount
 */
export async function getCrypto() {
    try {
        if (DBS2API && DBS2API.getCrypto) {
            const result = await DBS2API.getCrypto();
            return result.crypto || 0;
        }
    } catch (e) {
        console.log('API getCrypto failed, using local:', e);
    }
    return localState.crypto;
}

/**
 * Add crypto to player's balance
 * @param {number} amount - Amount to add
 * @returns {Promise<number>} New crypto balance
 */
export async function addCrypto(amount) {
    try {
        if (DBS2API && DBS2API.addCrypto) {
            const result = await DBS2API.addCrypto(amount);
            return result.crypto || 0;
        }
    } catch (e) {
        console.log('API addCrypto failed, using local:', e);
    }
    // Local fallback
    localState.crypto += amount;
    saveLocalState();
    return localState.crypto;
}

/**
 * Update crypto (add to current balance)
 * Alias for addCrypto for backwards compatibility
 * @param {number} amount - Amount to add
 * @returns {Promise<number>} New crypto balance
 */
export async function updateCrypto(amount) {
    return addCrypto(amount);
}

/**
 * Set crypto to specific value
 * @param {number} amount - New crypto amount
 * @returns {Promise<number>} New crypto balance
 */
export async function setCrypto(amount) {
    try {
        if (DBS2API && DBS2API.setCrypto) {
            const result = await DBS2API.setCrypto(amount);
            return result.crypto || 0;
        }
    } catch (e) {
        console.log('API setCrypto failed, using local:', e);
    }
    // Local fallback
    localState.crypto = amount;
    saveLocalState();
    return localState.crypto;
}

/**
 * Get player's inventory
 * @returns {Promise<Array>} Inventory items
 */
export async function getInventory() {
    try {
        if (DBS2API && DBS2API.getInventory) {
            const result = await DBS2API.getInventory();
            // API returns array directly or in inventory property
            return Array.isArray(result) ? result : (result.inventory || []);
        }
    } catch (e) {
        console.log('API getInventory failed, using local:', e);
    }
    return localState.inventory;
}

/**
 * Add item to inventory
 * @param {string} item - Item to add
 * @returns {Promise<Array>} Updated inventory
 */
export async function addInventoryItem(item) {
    try {
        if (DBS2API && DBS2API.addInventoryItem) {
            // Handle both object format and string format
            let name, foundAt;
            if (typeof item === 'object') {
                name = item.name;
                foundAt = item.found_at || 'unknown';
            } else {
                name = item;
                foundAt = 'unknown';
            }
            const result = await DBS2API.addInventoryItem(name, foundAt);
            return result.inventory || [];
        }
    } catch (e) {
        console.log('API addInventoryItem failed, using local:', e);
    }
    // Local fallback
    const itemObj = typeof item === 'object' ? item : { name: item, found_at: 'unknown' };
    const exists = localState.inventory.some(i => 
        (typeof i === 'object' ? i.name : i) === (itemObj.name)
    );
    if (!exists) {
        localState.inventory.push(itemObj);
        saveLocalState();
    }
    return localState.inventory;
}

/**
 * Remove item from inventory
 * @param {string} item - Item to remove
 * @returns {Promise<Array>} Updated inventory
 */
export async function removeInventoryItem(item) {
    try {
        if (DBS2API && DBS2API.removeInventoryItem) {
            const result = await DBS2API.removeInventoryItem(item);
            return result.inventory || [];
        }
    } catch (e) {
        console.log('API removeInventoryItem failed, using local:', e);
    }
    // Local fallback
    const index = localState.inventory.indexOf(item);
    if (index > -1) {
        localState.inventory.splice(index, 1);
        saveLocalState();
    }
    return localState.inventory;
}

/**
 * Check if player has an item
 * @param {string} item - Item to check
 * @returns {Promise<boolean>} Whether player has the item
 */
export async function hasItem(item) {
    const inventory = await getInventory();
    return inventory.includes(item);
}

/**
 * Get player's scores
 * @returns {Promise<Object>} Scores object
 */
export async function getScores() {
    try {
        if (DBS2API && DBS2API.getScores) {
            const result = await DBS2API.getScores();
            return result.scores || {};
        }
    } catch (e) {
        console.log('API getScores failed, using local:', e);
    }
    return localState.scores;
}

/**
 * Update a score
 * @param {string} game - Game name
 * @param {number} score - New score
 * @returns {Promise<Object>} Updated scores
 */
export async function updateScore(game, score) {
    try {
        if (DBS2API && DBS2API.updateScore) {
            const result = await DBS2API.updateScore(game, score);
            return result.scores || {};
        }
    } catch (e) {
        console.log('API updateScore failed, using local:', e);
    }
    // Local fallback - keep highest score
    if (!localState.scores[game] || score > localState.scores[game]) {
        localState.scores[game] = score;
        saveLocalState();
    }
    return localState.scores;
}

/**
 * Get minigame completion status
 * @returns {Promise<Object>} Minigame completion status
 */
export async function getMinigameStatus() {
    try {
        if (DBS2API && DBS2API.getMinigameStatus) {
            const result = await DBS2API.getMinigameStatus();
            return result.minigames_completed || result || {};
        }
    } catch (e) {
        console.log('API getMinigameStatus failed, using local:', e);
    }
    return localState.minigames_completed;
}

/**
 * Check if a specific minigame has been completed
 * @param {string} minigameName - Name of the minigame (e.g., 'crypto_miner', 'ash_trail')
 * @returns {Promise<boolean>} Whether the minigame has been completed
 */
export async function isMinigameCompleted(minigameName) {
    try {
        const status = await getMinigameStatus();
        return status[minigameName] === true;
    } catch (e) {
        console.log('Could not check minigame status:', e);
    }
    return localState.minigames_completed[minigameName] === true;
}

/**
 * Mark a minigame as complete
 * @param {string} minigameName - Name of the minigame
 * @returns {Promise<Object>} Updated minigame status
 */
export async function completeMinigame(minigameName) {
    try {
        if (DBS2API && DBS2API.completeMinigame) {
            const result = await DBS2API.completeMinigame(minigameName);
            return result.minigames_completed || result || {};
        }
    } catch (e) {
        console.log('API completeMinigame failed, using local:', e);
    }
    // Local fallback
    localState.minigames_completed[minigameName] = true;
    saveLocalState();
    return localState.minigames_completed;
}

/**
 * Get full player data
 * @returns {Promise<Object>} Full player data
 */
export async function getPlayerData() {
    try {
        if (DBS2API && DBS2API.getPlayer) {
            return await DBS2API.getPlayer();
        }
    } catch (e) {
        console.log('API getPlayer failed, using local:', e);
    }
    return localState;
}

/**
 * Sync local state with server
 * Call this after login to merge any offline progress
 */
export async function syncWithServer() {
    if (!DBS2API) {
        console.log('Cannot sync - DBS2API not available');
        return false;
    }
    
    try {
        // Get server state
        const serverData = await DBS2API.getPlayer();
        
        // If local has more crypto, add the difference
        if (localState.crypto > 0) {
            await DBS2API.addCrypto(localState.crypto);
            localState.crypto = 0;
        }
        
        // Sync inventory items
        for (const item of localState.inventory) {
            if (!serverData.inventory?.includes(item)) {
                await DBS2API.addInventoryItem(item);
            }
        }
        localState.inventory = [];
        
        // Sync scores (keep highest)
        for (const [game, score] of Object.entries(localState.scores)) {
            const serverScore = serverData.scores?.[game] || 0;
            if (score > serverScore) {
                await DBS2API.updateScore(game, score);
            }
        }
        localState.scores = {};
        
        // Sync minigame completions
        for (const [game, completed] of Object.entries(localState.minigames_completed)) {
            if (completed && !serverData.minigames_completed?.[game]) {
                await DBS2API.completeMinigame(game);
            }
        }
        localState.minigames_completed = {};
        
        saveLocalState();
        console.log('Synced local state with server');
        return true;
    } catch (e) {
        console.log('Sync failed:', e);
        return false;
    }
}

// Alias for backwards compatibility with Prompt.js
export const updateBalance = updateCrypto;

// Export default object with all functions for backwards compatibility
export default {
    getCrypto,
    addCrypto,
    updateCrypto,
    updateBalance,
    setCrypto,
    getInventory,
    addInventoryItem,
    removeInventoryItem,
    hasItem,
    getScores,
    updateScore,
    getMinigameStatus,
    isMinigameCompleted,
    completeMinigame,
    getPlayerData,
    syncWithServer
};