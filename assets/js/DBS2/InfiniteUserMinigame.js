import { updateCrypto, isMinigameCompleted, completeMinigame, addInventoryItem } from './StatsManager.js';
import { javaURI, pythonURI, fetchOptions } from '../api/config.js';
import Prompt from './Prompt.js';

// Backend setup
const url = `${pythonURI}/api/dbs2`;
const getURL = url;

// Fetch passwords from backend
fetch(getURL, fetchOptions).then(response => {
    if (response.status != 200) {
        console.warn("Could not fetch passwords from backend");
        return;
    }
    response.json().then(parsed => {
        console.log('DBS2 items:', parsed);
        try {
            let pwItem = null;
            if (Array.isArray(parsed)) {
                pwItem = parsed.find(it => it && it.name && String(it.name).toLowerCase() === 'passwords');
            } else if (parsed && parsed.name && String(parsed.name).toLowerCase() === 'passwords') {
                pwItem = parsed;
            }
            if (pwItem) {
                if (Array.isArray(pwItem.data) && pwItem.data.length) {
                    passwords = pwItem.data;
                } else if (Array.isArray(pwItem.passwords) && pwItem.passwords.length) {
                    passwords = pwItem.passwords;
                } else if (typeof pwItem.description === 'string' && pwItem.description.trim().length) {
                    try {
                        const parsedDesc = JSON.parse(pwItem.description);
                        if (Array.isArray(parsedDesc) && parsedDesc.length) passwords = parsedDesc;
                    } catch (e) {
                        const parts = pwItem.description.split(/[,\n]+/).map(s => s.trim()).filter(Boolean);
                        if (parts.length) passwords = parts;
                    }
                }
                console.log('Passwords loaded from backend:', passwords);
            }
        } catch (e) {
            console.error('Error parsing DBS2 passwords:', e);
        }
    });
}).catch(err => {
    console.warn("Could not fetch DBS2 passwords from backend:", err);
});

let quizzing = false;

let passwords = [
    "ishowgreen",
    "helloworld",
    "albuquerque",
    "ilovebitcoin",
    "cryptorules",
    "unemployment",
];

function convertToAlphaNumeric(str) {
    let newString = "";
    for (let i = 0; i < str.length; i++) {
        newString += str.charCodeAt(i) - 96;
        newString += "/";
    }
    return newString;
}

export default async function infiniteUserMinigame() {
    if (!quizzing) {
        // Cleanup any existing instance
        const existing = document.getElementById("quizWindow");
        if (existing) {
            existing.remove();
        }
        if (window._infiniteUserKeyHandler) {
            try { window.removeEventListener("keydown", window._infiniteUserKeyHandler, true); } catch (e) {}
            window._infiniteUserKeyHandler = null;
        }

        quizzing = true;
        window.infiniteUserActive = true;
        window.minigameActive = true;
        
        let creatingNew = false;
        const selectedPassword = passwords[Math.floor(Math.random() * passwords.length)];
        
        const baseurl = document.body.getAttribute('data-baseurl') || '';
        
        // Create DOM elements FIRST before any async operations
        let quizWindow = document.createElement("div");
        quizWindow.style = 'position: fixed; width: 50%; height: 50%; top: 25%; left: 25%; z-index: 10000; background-color: black; border-width: 10px; border-style: solid; border-color: rgb(50, 50, 50); text-align: center; vertical-align: center; color: rgb(0, 255, 0); font-size: 3vh; font-family: "Sixtyfour", monospace; border-radius: 3vh;';
        quizWindow.id = "quizWindow";
        document.body.appendChild(quizWindow);
        
        let messageDiv = document.createElement("div");
        messageDiv.style = 'width: 100%; height: 60%; padding-top: 2vh; color: rgb(0, 255, 0);';
        messageDiv.innerText = `Please decrypt alphanumeric password to continue: ${convertToAlphaNumeric(selectedPassword)}`;
        quizWindow.appendChild(messageDiv);

        let typebox = document.createElement("div");
        typebox.style = 'position: absolute; width: 100%; height: 20%; bottom: 15%; background-color: black; font-size: auto; font-family: "Sixtyfour", monospace; font-size: 5vh; text-align: center; vertical-align: center; color: rgb(0, 255, 0);';
        typebox.innerText = ">";
        quizWindow.appendChild(typebox);
        
        // Close button
        let closeBtn = document.createElement("button");
        closeBtn.innerText = "✕ Close (ESC)";
        closeBtn.style = 'position: absolute; top: 10px; right: 10px; background: #f00; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 14px;';
        closeBtn.onclick = closeMinigame;
        quizWindow.appendChild(closeBtn);
        
        // Check if first completion AFTER DOM is created
        let isFirstCompletion = false;
        try {
            isFirstCompletion = !(await isMinigameCompleted('infinite_user'));
            console.log('[InfiniteUser] First completion:', isFirstCompletion);
        } catch (e) {
            console.log('[InfiniteUser] Could not check completion status:', e);
        }
        
        function closeMinigame() {
            try { quizWindow.remove(); } catch (e) {}
            quizzing = false;
            window.infiniteUserActive = false;
            window.minigameActive = false;
            window.removeEventListener("keydown", keyHandler, true);
        }
        
        async function completeWithReward() {
            // Calculate reward
            const baseReward = 15 + Math.floor(Math.random() * 10); // 15-24 crypto
            const bonus = isFirstCompletion ? 20 : 0;
            const totalReward = baseReward + bonus;
            
            // Award crypto
            await updateCrypto(totalReward);
            
            // Mark complete and add code scrap on first completion
            if (isFirstCompletion) {
                try {
                    await completeMinigame('infinite_user');
                    console.log('[InfiniteUser] Marked as complete');
                    
                    await addInventoryItem({
                        name: 'Code Scrap: Infinite User',
                        found_at: 'infinite_user',
                        timestamp: new Date().toISOString()
                    });
                    console.log('[InfiniteUser] Code scrap added to inventory');
                } catch (e) {
                    console.log('[InfiniteUser] Could not save completion:', e);
                }
            }
            
            // Update passwords list
            passwords.push(typebox.innerText.slice(1, typebox.innerText.length));
            passwords.splice(0, 1);
            
            // Show completion message
            if (isFirstCompletion) {
                messageDiv.innerHTML = `
                    <div style="font-size: 2.5vh;">🎉 FIRST COMPLETION! 🎉</div>
                    <div style="font-size: 2vh; margin-top: 10px;">New user password created!</div>
                    <div style="margin-top: 15px;">
                        <img src="${baseurl}/images/DBS2/codescrapPassword.png" style="max-width: 80px; border: 2px solid #0f0; border-radius: 8px;" onerror="this.style.display='none'">
                    </div>
                    <div style="font-size: 2.5vh; margin-top: 10px; color: #ffd700;">+${totalReward} Crypto!</div>
                    <div style="font-size: 1.5vh; color: #888;">(includes +20 first completion bonus)</div>
                `;
            } else {
                messageDiv.innerText = `New user password created. You earned ${totalReward} Crypto!`;
            }
            
            setTimeout(() => {
                closeMinigame();
                try {
                    if (isFirstCompletion) {
                        Prompt.showDialoguePopup('Computer1', `🎉 First completion! Code scrap collected! +${totalReward} Crypto!`);
                    } else {
                        Prompt.showDialoguePopup('Computer1', `Password system updated! You earned ${totalReward} Crypto!`);
                    }
                } catch(e) {
                    console.log(`Earned ${totalReward} Crypto!`);
                }
            }, isFirstCompletion ? 2500 : 1500);
        }

        function keyHandler(event) {
            event.preventDefault();
            event.stopPropagation();
            
            if (event.key == 'Backspace' && typebox.innerText.length > 1) {
                typebox.innerText = typebox.innerText.slice(0, -1);
            } else if (event.key == "Escape") {
                closeMinigame();
            } else if (event.key == "Enter" || event.key == "Return") {
                if (creatingNew) {
                    completeWithReward();
                } else {
                    if (typebox.innerText.slice(1, typebox.innerText.length) == selectedPassword) {
                        messageDiv.innerText = `Password approved. You may now move on.`;
                        setTimeout(() => {
                            creatingNew = true;
                            messageDiv.innerText = `Create a new user password:`;
                            typebox.innerText = ">";
                        }, 1000);
                    } else {
                        typebox.style.color = "red";
                        typebox.innerText = ">TRY AGAIN";
                        setTimeout(() => {
                            typebox.innerText = ">";
                            typebox.style.color = "rgb(0, 255, 0)";
                        }, 1000);
                    }
                }
            } else if (event.key.length == 1 && typebox.innerText.length < 20 && /^[a-z]$/i.test(event.key[0])) {
                typebox.innerText += event.key.toLowerCase();
            }
        }
        
        window.addEventListener("keydown", keyHandler, true);
        window._infiniteUserKeyHandler = keyHandler;
    }
}