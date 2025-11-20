

// Initialize global crypto tracking (backwards-compatible with playerBalance)
window.playerBalance = window.playerBalance || 0;
window.playerCrypto = window.playerCrypto || window.playerBalance || 0;

/**
 * Fetches and updates the game stats UI (Balance, Chat Score, Questions Answered).
 */
export function getStats() {
    // Set default values for DOM elements first
    if (document.getElementById('balance')) document.getElementById('balance').innerText = window.playerCrypto || '0';
    if (document.getElementById('chatScore')) document.getElementById('chatScore').innerText = '0';
    if (document.getElementById('questionsAnswered')) document.getElementById('questionsAnswered').innerText = '0';
    if (document.getElementById('money')) document.getElementById('money').innerText = window.playerCrypto || '0';
    if (document.getElementById('crypto')) document.getElementById('crypto').innerText = window.playerCrypto || '0';
    

}

/**
 * Updates balance based on correct answers
 */
export function updateBalance(points) {
    // Keep backwards compatibility: update both playerBalance and playerCrypto
    window.playerBalance = (window.playerBalance || 0) + points;
    window.playerCrypto = (window.playerCrypto || 0) + points;

    // Update DOM elements for balance, money, and crypto
    const setTextForId = (id, value) => {
        const elems = document.querySelectorAll(`[id="${id}"]`);
        elems.forEach(element => { element.innerText = value; });
    };

    setTextForId('balance', window.playerCrypto);
    setTextForId('money', window.playerCrypto);
    setTextForId('crypto', window.playerCrypto);

    return window.playerCrypto;
}

// Alias for clarity: updateCrypto is the same as updateBalance but explicit
export function updateCrypto(points) {
    return updateBalance(points);
}

// getBalance now just sets from local value
export function getBalance() {
    if (document.getElementById("balance")) {
        document.getElementById("balance").innerText = window.playerBalance;
    }
}

// getChatScore now just sets to 0
export function getChatScore() {
    if (document.getElementById("chatScore")) {
        document.getElementById("chatScore").innerText = 0;
    }
}

// getMoney now just sets from local value
export function getMoney() {
    if (document.getElementById("money")) {
        document.getElementById("money").innerText = window.playerCrypto;
    }
    if (document.getElementById("crypto")) {
        document.getElementById("crypto").innerText = window.playerCrypto;
    }
}

// getQuestionsAnswered now just sets to 0
export function getQuestionsAnswered() {
    if (document.getElementById("questionsAnswered")) {
        document.getElementById("questionsAnswered").innerText = 0;
    }
}

export function getPlayerAnswers() {
    console.log("getPlayerAnswers called");
    return []; // Return an empty array for now
}