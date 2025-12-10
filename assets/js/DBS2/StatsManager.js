// StatsManager.js - Bridges local state and backend API
// If DBS2API is available, uses backend. Otherwise falls back to local storage.

window.playerBalance = window.playerBalance || 0;
window.playerCrypto = window.playerCrypto || 0;
window.playerInventory = window.playerInventory || [];

function isAPIAvailable() {
    return typeof window.DBS2API !== 'undefined';
}

export function getStats() {
    let crypto = window.playerCrypto || 0;
    
    if (isAPIAvailable()) {
        DBS2API.getCrypto().then(c => {
            crypto = c;
            window.playerCrypto = c;
            window.playerBalance = c;
            updateDisplays(crypto);
        }).catch(() => {
            updateDisplays(crypto);
        });
    } else {
        updateDisplays(crypto);
    }
}

function updateDisplays(crypto) {
    const ids = ['balance', 'chatScore', 'questionsAnswered', 'money', 'crypto', 'playerCrypto'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'chatScore' || id === 'questionsAnswered') {
                el.innerText = '0';
            } else {
                el.innerText = crypto;
            }
        }
    });
}

export function updateBalance(points) {
    if (isAPIAvailable()) {
        DBS2API.addCrypto(points).then(newTotal => {
            window.playerCrypto = newTotal;
            window.playerBalance = newTotal;
            updateDisplays(newTotal);
        }).catch(e => {
            console.log('API error, updating locally:', e);
            fallbackUpdate(points);
        });
        return window.playerCrypto;
    }
    
    return fallbackUpdate(points);
}

function fallbackUpdate(points) {
    window.playerBalance = (window.playerBalance || 0) + points;
    window.playerCrypto = (window.playerCrypto || 0) + points;
    updateDisplays(window.playerCrypto);
    return window.playerCrypto;
}

export function updateCrypto(points) {
    return updateBalance(points);
}

export function getBalance() {
    return window.playerBalance || 0;
}

export function getMoney() {
    return window.playerCrypto || 0;
}

export function getInventory() {
    return window.playerInventory || [];
}

export async function addInventoryItem(item) {
    if (isAPIAvailable()) {
        try {
            const result = await DBS2API.addInventoryItem(item.name, item.found_at);
            window.playerInventory = result.inventory;
            return result.inventory;
        } catch (e) {
            console.log('API error, updating locally:', e);
        }
    }
    
    window.playerInventory = window.playerInventory || [];
    window.playerInventory.push(item);
    return window.playerInventory;
}

export async function submitMinigameScore(gameName, score) {
    if (isAPIAvailable()) {
        try {
            const result = await DBS2API.submitScore(gameName, score);
            return result.is_high_score;
        } catch (e) {
            console.log('Could not submit score:', e);
        }
    }
    return false;
}

export async function completeMinigame(gameName) {
    if (isAPIAvailable()) {
        try {
            return await DBS2API.completeMinigame(gameName);
        } catch (e) {
            console.log('Could not mark minigame complete:', e);
        }
    }
    return null;
}

export async function isMinigameCompleted(gameName) {
    if (isAPIAvailable()) {
        try {
            const status = await DBS2API.getMinigameStatus();
            return status[gameName] === true;
        } catch (e) {
            console.log('Could not check minigame status:', e);
        }
    }
    return false;
}