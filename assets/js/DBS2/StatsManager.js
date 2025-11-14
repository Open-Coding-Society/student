import { javaURI, fetchOptions } from "../api/config.js";
import computer2answers from "./computer2answers.js";

// Initialize global balance tracking if not already set
window.playerBalance = window.playerBalance || 0;

/**
 * Fetches and updates the game stats UI (Balance, Chat Score, Questions Answered).
 */
export function getStats() {
    // Set default values for DOM elements first
    if (document.getElementById('balance')) document.getElementById('balance').innerText = window.playerBalance || '0';
    if (document.getElementById('chatScore')) document.getElementById('chatScore').innerText = '0';
    if (document.getElementById('questionsAnswered')) document.getElementById('questionsAnswered').innerText = '0';
    if (document.getElementById('money')) document.getElementById('money').innerText = window.playerBalance || '0';
    
    // Try API calls, but don't rely on them
    try {
        const personId = 1;
        const endpoints = {
            balance: `${javaURI}/rpg_answer/getBalance/${personId}`,
            chatScore: `${javaURI}/rpg_answer/getChatScore/${personId}`,
            questionsAnswered: `${javaURI}/rpg_answer/getQuestionsAnswered/${personId}`,
            money: `${javaURI}/rpg_answer/getQuestionsAnswered/${personId}`
        };

        for (let [key, url] of Object.entries(endpoints)) {
            fetch(url, fetchOptions)
                .then(response => response.json())
                .then(data => {
                    // Only update if this is not the balance/money or if there's no playerBalance
                    if ((key !== 'balance' && key !== 'money') || !window.playerBalance) {
                        document.getElementById(key).innerText = data ?? 0;
                    }
                })
                .catch(err => {
                    console.error(`Error fetching ${key}:`, err);
                });
        }
    } catch (error) {
        console.log("Error in API calls, using default values", error);
    }
}

/**
 * Updates balance based on correct answers
 */
export function updateBalance(points) {
    window.playerBalance += points;
    
    // Update all balance display elements
    const balanceElements = document.querySelectorAll('[id="balance"]');
    balanceElements.forEach(element => {
        element.innerText = window.playerBalance;
    });
    
    // Also update money display if it exists
    const moneyElements = document.querySelectorAll('[id="money"]');
    moneyElements.forEach(element => {
        element.innerText = window.playerBalance;
    });
    
    return window.playerBalance;
}

/**
 * Fetches the player's current balance.
 */
export function getBalance() {
    // First set from window.playerBalance
    if (document.getElementById("balance")) {
        document.getElementById("balance").innerText = window.playerBalance;
    }
    
    // Then try API
    try {
        fetch(`${javaURI}/rpg_answer/getBalance/1`, fetchOptions)
            .then(response => response.json())
            .then(data => {
                // Only update if there's no playerBalance
                if (!window.playerBalance) {
                    document.getElementById("balance").innerText = data ?? 0;
                }
            })
            .catch(err => console.error("Error fetching balance:", err));
    } catch (error) {
        console.error("Error in getBalance:", error);
    }
}

/**
 * Fetches the player's current chat score.
 */
export function getChatScore() {
    try {
        fetch(`${javaURI}/rpg_answer/getChatScore/1`, fetchOptions)
            .then(response => response.json())
            .then(data => {
                document.getElementById("chatScore").innerText = data ?? 0;
            })
            .catch(err => console.error("Error fetching chat score:", err));
    } catch (error) {
        console.error("Error in getChatScore:", error);
    }
}

/**
 * Fetches the player's current money value and updates the UI.
 */
export function getMoney() {
    // First set from window.playerBalance
    if (document.getElementById("money")) {
        document.getElementById("money").innerText = window.playerBalance;
    }
    
    // Then try API
    try {
        fetch(`${javaURI}/rpg_answer/getMoney/1`, fetchOptions)
            .then(response => response.json())
            .then(data => {
                // Only update if there's no playerBalance
                if (!window.playerBalance) {
                    const moneyValue = data ?? 0;
                    document.getElementById("money").innerText = moneyValue;
                    console.log(`Current money: ${moneyValue}`);
                }
            })
            .catch(err => console.error("Error fetching money:", err));
    } catch (error) {
        console.error("Error in getMoney:", error);
    }
}

export function getQuestionsAnswered() {
    try {
        fetch(`${javaURI}/rpg_answer/getQuestionsAnswered/1`, fetchOptions)
            .then(response => response.json())
            .then(data => {
                document.getElementById("questionsAnswered").innerText = data ?? 0;
            })
            .catch(err => console.error("Error fetching questions answered:", err));
    } catch (error) {
        console.error("Error in getQuestionsAnswered:", error);
    }
}

export function getPlayerAnswers() {
    console.log("getPlayerAnswers called");
    return []; // Return an empty array for now
}