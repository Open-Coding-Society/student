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
            updateDisplays(crypto);
        }).catch(() => {
            // Fallback to local value if API fails
            updateDisplays(crypto);
        });
    } else {
        // If API not available, use local value
        updateDisplays(crypto);
    }
}

function updateDisplays(crypto) {
    const ids = ['balance', 'chatScore', 'questionsAnswered', 'money', 'crypto'];
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
        DBS2API.addCrypto(points);
        return window.playerCrypto;
    }
    
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

export function getChatScore() {
    return 0;
}

export function getMoney() {
    return window.playerCrypto || 0;
}

export function getQuestionsAnswered() {
    return 0;
}

export function getPlayerAnswers() {
    return [];
}

export async function addInventoryItem(item) {
    if (isAPIAvailable()) {
        const result = await DBS2API.addInventoryItem(item.name, item.found_at);
        window.playerInventory = result.inventory;
        return result.inventory;
    }
    
    window.playerInventory = window.playerInventory || [];
    window.playerInventory.push(item);
    return window.playerInventory;
}

export function getInventory() {
    return window.playerInventory || [];
}

export async function submitMinigameScore(gameName, score) {
    if (isAPIAvailable()) {
        const result = await DBS2API.submitScore(gameName, score);
        return result.is_high_score;
    }
    return false;
}

export async function completeMinigame(gameName) {
    if (isAPIAvailable()) {
        return await DBS2API.completeMinigame(gameName);
    }
    return null;
}

export async function isMinigameCompleted(gameName) {
    if (isAPIAvailable()) {
        try {
            const result = await DBS2API.isMinigameCompleted(gameName);
            return result.completed || false;
        } catch (e) {
            console.error('Error checking minigame completion:', e);
            return false;
        }
    }
    // Fallback: assume not completed if API not available
    return false;
}