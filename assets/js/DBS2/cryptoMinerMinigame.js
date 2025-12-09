import { updateCrypto, completeMinigame, submitMinigameScore } from './StatsManager.js';
import Prompt from './Prompt.js';

// Function to be called by Computer2 - with Bitcoin boost integration
function cryptoMinerMinigame() {
    // Check if already running
    if (window.cryptoMinerActive) return;
    window.cryptoMinerActive = true;
    window.minigameActive = true;
    
    // Track if this is first completion for bonus
    let isFirstCompletion = false;
    let bitcoinBoostData = null;
    
    // Create the UI
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
        min-width: 450px;
        text-align: center;
        box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
    `;
    
    minerUI.innerHTML = `
        <h2 style="color: #0f0; margin: 0 0 20px 0;">⛏️ CRYPTO MINER</h2>
        <div id="btc-boost-display" style="font-size: 14px; margin-bottom: 15px; padding: 10px; background: rgba(255,165,0,0.1); border: 1px solid #f90; border-radius: 5px; display: none;">
            <span style="color: #f90;">₿ Bitcoin Boost:</span> <span id="boost-multiplier">1.0x</span>
            <div style="font-size: 11px; color: #888; margin-top: 4px;">BTC 24h: <span id="btc-change">0%</span></div>
        </div>
        <div style="font-size: 18px; margin-bottom: 10px;">Active Coin: <span id="coin">BASEMENT</span></div>
        <div style="font-size: 18px; margin-bottom: 10px;">Change: <span id="pct">+0%</span></div>
        <div style="font-size: 72px; font-weight: bold; margin: 20px 0;">
            Press: <span id="key" style="text-shadow: 0 0 10px #0f0;">-</span>
        </div>
        <div style="font-size: 24px; margin: 20px 0;">
            Progress: <span id="progress">0</span> / 50
        </div>
        <div style="font-size: 12px; color: #888; margin-bottom: 15px;">
            (Tap keys - holding won't work!)
        </div>
        <button onclick="window.exitCryptoMiner()" style="background: #f00; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px;">EXIT (ESC)</button>
    `;
    
    document.body.appendChild(minerUI);
    
    // Game state
    let currentKey = "";
    let nextKeyChange = 0;
    let isActive = true;
    let heldKeys = new Set();
    
    // Local fallback data
    let playerProgress = 0;
    const targetProgress = 50;
    const coins = ["BASEMENT", "ISHOWGREEN", "CHILLGUY", "DORITO", "NFTBRO"];
    let activeCoin = coins[0];
    let percentChange = 0;
    
    // Fetch Bitcoin boost data on start
    async function fetchBitcoinBoost() {
        try {
            if (typeof window.DBS2API !== 'undefined') {
                bitcoinBoostData = await window.DBS2API.getBitcoinBoost();
                if (bitcoinBoostData && bitcoinBoostData.boost_multiplier) {
                    const boostDisplay = document.getElementById('btc-boost-display');
                    const boostMultiplier = document.getElementById('boost-multiplier');
                    const btcChange = document.getElementById('btc-change');
                    
                    if (boostDisplay) boostDisplay.style.display = 'block';
                    if (boostMultiplier) {
                        boostMultiplier.textContent = bitcoinBoostData.boost_multiplier.toFixed(2) + 'x';
                        boostMultiplier.style.color = bitcoinBoostData.boost_multiplier >= 1 ? '#0f0' : '#f00';
                    }
                    if (btcChange) {
                        const change = bitcoinBoostData.btc_change_24h || 0;
                        btcChange.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
                        btcChange.style.color = change >= 0 ? '#0f0' : '#f00';
                    }
                    
                    console.log('Bitcoin boost loaded:', bitcoinBoostData);
                }
            }
        } catch (e) {
            console.log('Could not fetch Bitcoin boost:', e);
        }
    }
    
    // Check if first completion
    async function checkFirstCompletion() {
        try {
            if (typeof window.DBS2API !== 'undefined') {
                const status = await window.DBS2API.getMinigameStatus();
                isFirstCompletion = !status.crypto_miner;
            }
        } catch (e) {
            console.log('Could not check minigame status:', e);
        }
    }
    
    // Initialize boost and completion status
    fetchBitcoinBoost();
    checkFirstCompletion();
    
    function randomKey() {
        const keys = "ASDFJKLQWERUIOP";
        return keys[Math.floor(Math.random() * keys.length)];
    }
    
    async function updateState() {
        if (!isActive) return;
        
        // Simulate locally (original API fallback removed for simplicity)
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
    
    async function finishGame() {
        isActive = false;
        
        // Calculate base reward
        let baseReward = Math.floor(playerProgress / 5); // 5 hits = 1 crypto
        
        // Apply Bitcoin boost if available
        let finalReward = baseReward;
        let boostMessage = '';
        
        if (bitcoinBoostData && bitcoinBoostData.boost_multiplier) {
            finalReward = Math.round(baseReward * bitcoinBoostData.boost_multiplier);
            if (bitcoinBoostData.boost_multiplier !== 1) {
                boostMessage = ` (${bitcoinBoostData.boost_multiplier.toFixed(2)}x Bitcoin boost!)`;
            }
        }
        
        // First completion bonus
        let firstCompletionBonus = 0;
        if (isFirstCompletion) {
            firstCompletionBonus = 25;
            finalReward += firstCompletionBonus;
        }
        
        // Award crypto
        updateCrypto(finalReward);
        
        // Mark minigame as complete and submit score
        try {
            await completeMinigame('crypto_miner');
            await submitMinigameScore('crypto_miner', playerProgress);
        } catch (e) {
            console.log('Could not save minigame completion:', e);
        }
        
        // Build completion message
        let message = `Mining complete! You earned ${finalReward} Crypto${boostMessage}`;
        if (firstCompletionBonus > 0) {
            message += ` (includes +${firstCompletionBonus} first completion bonus!)`;
        }
        
        try {
            Prompt.showDialoguePopup('Crypto Miner', message);
        } catch (e) {
            console.warn(message);
        }
        
        // Clean up after message
        setTimeout(() => {
            window.exitCryptoMiner();
        }, 2000);
    }
    
    async function sendHits(count) {
        playerProgress += count;
        
        const progressEl = document.getElementById('progress');
        if (progressEl) progressEl.textContent = playerProgress;
        
        // Check if finished
        if (playerProgress >= targetProgress) {
            await finishGame();
        }
    }
    
    function loop() {
        if (!isActive) return;
        
        const now = Date.now();
        if (now > nextKeyChange) {
            currentKey = randomKey();
            nextKeyChange = now + (2000 + Math.random() * 5000);
            document.getElementById('key').textContent = currentKey;
        }
        requestAnimationFrame(loop);
    }
    
    const keyDownHandler = (e) => {
        if (!isActive) return;
        
        const key = e.key.toUpperCase();
        
        if (e.key === 'Escape') {
            window.exitCryptoMiner();
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        if (heldKeys.has(key)) return;
        heldKeys.add(key);
        
        if (key === currentKey) {
            sendHits(1);
            
            const keyEl = document.getElementById('key');
            if (keyEl) {
                keyEl.style.color = '#0ff';
                setTimeout(() => {
                    if (keyEl) keyEl.style.color = '#0f0';
                }, 100);
            }
        }
    };
    
    const keyUpHandler = (e) => {
        const key = e.key.toUpperCase();
        heldKeys.delete(key);
        e.preventDefault();
        e.stopPropagation();
    };
    
    window.exitCryptoMiner = function() {
        isActive = false;
        window.cryptoMinerActive = false;
        window.minigameActive = false;
        
        // Award partial progress
        if (playerProgress > 0 && playerProgress < targetProgress) {
            const reward = Math.floor(playerProgress / 5);
            if (reward > 0) updateCrypto(reward);
        }
        
        if (minerUI && minerUI.parentNode) {
            minerUI.remove();
        }
        window.removeEventListener('keydown', keyDownHandler, true);
        window.removeEventListener('keyup', keyUpHandler, true);
        heldKeys.clear();
        delete window.exitCryptoMiner;
    };
    
    window.addEventListener('keydown', keyDownHandler, true);
    window.addEventListener('keyup', keyUpHandler, true);
    
    setInterval(updateState, 2000);
    updateState();
    loop();
}

export default cryptoMinerMinigame;