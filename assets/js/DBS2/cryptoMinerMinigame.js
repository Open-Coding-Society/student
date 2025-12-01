import { updateCrypto } from './StatsManager.js';
import Prompt from './Prompt.js';

// Function to be called by Computer2 - preserves original with API fallback
function cryptoMinerMinigame() {
    // Check if already running
    if (window.cryptoMinerActive) return;
    window.cryptoMinerActive = true;
    
    // Create the UI that mimics the original DOM structure
    const minerUI = document.createElement('div');
    minerUI.id = 'crypto-miner-ui';
    minerUI.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #0f0;
        padding: 30px;
        border-radius: 10px;
        border: 2px solid #0f0;
        font-family: 'Courier New', monospace;
        z-index: 10000;
        min-width: 400px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    `;
    
    minerUI.innerHTML = `
        <h2 style="color: #0f0; margin: 0 0 20px 0;">CRYPTO MINER</h2>
        <div style="font-size: 18px; margin-bottom: 10px;">Active Coin: <span id="coin">BASEMENT</span></div>
        <div style="font-size: 18px; margin-bottom: 10px;">Change: <span id="pct">+0%</span></div>
        <div style="font-size: 72px; font-weight: bold; margin: 20px 0;">
            Press: <span id="key" style="text-shadow: 0 0 10px #0f0;">-</span>
        </div>
        <div style="font-size: 24px; margin: 20px 0;">
            Progress: <span id="progress">0</span> / 100
        </div>
        <button onclick="window.exitCryptoMiner()" style="background: #f00; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">EXIT (ESC)</button>
    `;
    
    document.body.appendChild(minerUI);
    
    // Game state - exactly like original
    let currentKey = "";
    let nextKeyChange = 0;
    let isActive = true;
    
    // Local fallback data
    let playerProgress = 0;
    const coins = ["BASEMENT", "ISHOWGREEN", "CHILLGUY", "DORITO", "NFTBRO"];
    let activeCoin = coins[0];
    let percentChange = 0;
    
    // Original randomKey function
    function randomKey() {
        const keys = "ASDFJKLQWERUIOP";
        return keys[Math.floor(Math.random() * keys.length)];
    }
    
    // Original updateState with API call and fallback
    async function updateState() {
        if (!isActive) return;
        
        try {
            // Try the original API call first
            const res = await fetch('/state', { 
                method: 'GET',
                signal: AbortSignal.timeout(1000) // 1 second timeout
            });
            
            if (res.ok) {
                const data = await res.json();
                document.getElementById('coin').textContent = data.active_coin;
                document.getElementById('pct').textContent = data.percent_change;
                document.getElementById('progress').textContent = data.player_progress;
                return; // API worked, exit early
            }
        } catch (e) {
            // API failed, use fallback
            console.log('Crypto miner API not available, using local simulation');
        }
        
        // Fallback: simulate locally
        if (Math.random() > 0.7) {
            activeCoin = coins[Math.floor(Math.random() * coins.length)];
            percentChange = (Math.random() * 20 - 10).toFixed(1);
        }
        
        const coinEl = document.getElementById('coin');
        const pctEl = document.getElementById('pct');
        const progressEl = document.getElementById('progress');
        
        if (coinEl) coinEl.textContent = activeCoin;
        if (pctEl) {
            pctEl.textContent = percentChange > 0 ? `+${percentChange}%` : `${percentChange}%`;
            pctEl.style.color = percentChange > 0 ? '#0f0' : '#f00';
        }
        if (progressEl) progressEl.textContent = playerProgress;
    }
    
    // Original sendHits with API call and fallback
    async function sendHits(count) {
        try {
            // Try the original API call first
            const res = await fetch('/mine', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ hits: count }),
                signal: AbortSignal.timeout(1000) // 1 second timeout
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.finished) {
                    try { 
                        Prompt.showDialoguePopup('Miner', data.message); 
                    } catch (e) { 
                        console.warn(data.message); 
                    }
                    window.exitCryptoMiner();
                } else {
                    document.getElementById('progress').textContent = data.progress;
                }
                return; // API worked, exit early
            }
        } catch (e) {
            // API failed, use fallback
            console.log('Mine API not available, using local simulation');
        }
        
        // Fallback: simulate locally
        playerProgress += count;
        
        const progressEl = document.getElementById('progress');
        if (progressEl) progressEl.textContent = playerProgress;
        
        // Check if finished (100 progress = finished)
        if (playerProgress >= 100) {
            isActive = false;
            
            // Calculate reward based on progress
            const reward = Math.floor(playerProgress / 5); // 5 hits = 1 crypto
            updateCrypto(reward);
            
            try {
                Prompt.showDialoguePopup('Miner', `Mining complete! You earned ${reward} Crypto!`);
            } catch (e) {
                console.warn(`Mining complete! You earned ${reward} Crypto!`);
            }
            
            // Clean up after message
            setTimeout(() => {
                window.exitCryptoMiner();
            }, 2000);
        }
    }
    
    // Original loop function - exactly the same
    function loop() {
        if (!isActive) return;
        
        const now = Date.now();
        if (now > nextKeyChange) {
            currentKey = randomKey();
            nextKeyChange = now + (2000 + Math.random() * 5000); // 2–7 sec
            document.getElementById('key').textContent = currentKey;
        }
        requestAnimationFrame(loop);
    }
    
    // Original key handler - exactly the same
    const keyHandler = (e) => {
        if (!isActive) return;
        if (e.key.toUpperCase() === currentKey) {
            sendHits(1);
            
            // Visual feedback
            const keyEl = document.getElementById('key');
            if (keyEl) {
                keyEl.style.color = '#0ff';
                setTimeout(() => {
                    if (keyEl) keyEl.style.color = '#0f0';
                }, 100);
            }
        }
        // ESC to exit
        if (e.key === 'Escape') {
            window.exitCryptoMiner();
        }
    };
    
    // Exit function
    window.exitCryptoMiner = function() {
        isActive = false;
        window.cryptoMinerActive = false;
        
        // Award any remaining progress as crypto (local fallback)
        if (playerProgress > 0) {
            const reward = Math.floor(playerProgress / 5);
            if (reward > 0) updateCrypto(reward);
        }
        
        // Clean up
        if (minerUI && minerUI.parentNode) {
            minerUI.remove();
        }
        window.removeEventListener('keydown', keyHandler);
        delete window.exitCryptoMiner;
    };
    
    // Start the game - exactly like original
    window.addEventListener('keydown', keyHandler);
    
    // Original initialization
    setInterval(updateState, 2000);
    updateState();
    loop();
}

// Export default function that NPCs can call
export default cryptoMinerMinigame;