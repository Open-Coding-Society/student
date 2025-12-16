import { updateCrypto, completeMinigame, isMinigameCompleted, addInventoryItem } from './StatsManager.js';
import Prompt from './Prompt.js';

// Function to be called by Computer2 - with Bitcoin price integration
function cryptoMinerMinigame() {
    // Check if already running
    if (window.cryptoMinerActive) return;
    window.cryptoMinerActive = true;
    window.minigameActive = true;
    
    // Bitcoin data from API
    let btcPrice = 0;
    let btcChange24h = 0;
    let boostMultiplier = 1.0;
    let isFirstCompletion = false;
    
    // Get baseurl for images
    const baseurl = document.body.getAttribute('data-baseurl') || '';
    
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
        <h2 style="color: #f7931a; margin: 0 0 20px 0;">₿ BITCOIN MINER</h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: rgba(247, 147, 26, 0.1); border-radius: 5px; border: 1px solid #f7931a;">
            <div style="text-align: left;">
                <div style="font-size: 12px; color: #888;">BTC Price</div>
                <div id="btc-price" style="font-size: 18px; color: #f7931a;">Loading...</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 12px; color: #888;">24h Change</div>
                <div id="btc-change" style="font-size: 18px;">--</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 12px; color: #888;">Reward Boost</div>
                <div id="boost-multiplier" style="font-size: 18px; color: #0ff;">1.0x</div>
            </div>
        </div>
        <div style="font-size: 72px; font-weight: bold; margin: 20px 0;">
            Press: <span id="key" style="text-shadow: 0 0 10px #0f0;">-</span>
        </div>
        <div style="font-size: 24px; margin: 20px 0;">
            Progress: <span id="progress">0</span> / 50
        </div>
        <div id="reward-preview" style="font-size: 14px; color: #0ff; margin-bottom: 10px;">
            Est. Reward: ~10 Crypto
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
    let playerProgress = 0;
    const targetProgress = 50;
    
    // Fetch Bitcoin data from backend
    async function fetchBitcoinData() {
        try {
            // Import config dynamically or use default
            let baseUrl = 'http://localhost:8587';
            try {
                const config = await import('../api/config.js');
                baseUrl = config.pythonURI || baseUrl;
            } catch (e) {
                console.log('Using default API URL');
            }
            
            const res = await fetch(`${baseUrl}/api/dbs2/bitcoin-boost`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            
            if (res.ok) {
                const data = await res.json();
                btcPrice = data.btc_price_usd || 0;
                btcChange24h = data.btc_change_24h || 0;
                boostMultiplier = data.boost_multiplier || 1.0;
                
                updateBitcoinUI();
                return;
            }
        } catch (e) {
            console.log('Bitcoin API not available, using simulation');
        }
        
        // Fallback: simulate Bitcoin data
        btcPrice = 95000 + (Math.random() * 10000 - 5000);
        btcChange24h = (Math.random() * 20 - 10); // -10% to +10%
        boostMultiplier = Math.max(0.5, Math.min(2.0, 1.0 + (btcChange24h / 20)));
        updateBitcoinUI();
    }
    
    // Check first completion status
    async function checkFirstCompletion() {
        try {
            isFirstCompletion = !(await isMinigameCompleted('crypto_miner'));
            console.log('[CryptoMiner] First completion:', isFirstCompletion);
        } catch (e) {
            console.log('Could not check completion status');
            isFirstCompletion = true; // Default to giving bonus if we can't check
        }
    }
    
    // Update the Bitcoin display
    function updateBitcoinUI() {
        const priceEl = document.getElementById('btc-price');
        const changeEl = document.getElementById('btc-change');
        const boostEl = document.getElementById('boost-multiplier');
        const rewardEl = document.getElementById('reward-preview');
        
        if (priceEl) {
            priceEl.textContent = btcPrice > 0 ? `$${btcPrice.toLocaleString('en-US', {maximumFractionDigits: 0})}` : 'Offline';
        }
        
        if (changeEl) {
            const changeStr = btcChange24h >= 0 ? `+${btcChange24h.toFixed(2)}%` : `${btcChange24h.toFixed(2)}%`;
            changeEl.textContent = changeStr;
            changeEl.style.color = btcChange24h >= 0 ? '#0f0' : '#f00';
        }
        
        if (boostEl) {
            boostEl.textContent = `${boostMultiplier.toFixed(2)}x`;
            // Color based on boost
            if (boostMultiplier >= 1.5) {
                boostEl.style.color = '#0f0'; // Green for great boost
            } else if (boostMultiplier >= 1.0) {
                boostEl.style.color = '#0ff'; // Cyan for normal
            } else {
                boostEl.style.color = '#f00'; // Red for penalty
            }
        }
        
        if (rewardEl) {
            const estReward = Math.floor((targetProgress / 5) * boostMultiplier);
            const bonusText = isFirstCompletion ? ' (+25 first time!)' : '';
            rewardEl.textContent = `Est. Reward: ~${estReward} Crypto${bonusText}`;
        }
    }
    
    // Update reward preview as progress changes
    function updateRewardPreview() {
        const rewardEl = document.getElementById('reward-preview');
        if (rewardEl) {
            const currentReward = Math.floor((playerProgress / 5) * boostMultiplier);
            const bonusText = isFirstCompletion ? ' (+25 bonus)' : '';
            rewardEl.textContent = `Current Reward: ${currentReward} Crypto${bonusText}`;
        }
    }
    
    function randomKey() {
        const keys = "ASDFJKLQWERUIOP";
        return keys[Math.floor(Math.random() * keys.length)];
    }
    
    // Show code scrap popup on first completion
    function showCodeScrapPopup(finalReward) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'code-scrap-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        // Create popup container
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border: 4px solid #f7931a;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            max-width: 500px;
            box-shadow: 0 0 50px rgba(247, 147, 26, 0.5);
            animation: popIn 0.5s ease-out;
        `;
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popIn {
                0% { transform: scale(0.5); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 20px rgba(247, 147, 26, 0.5); }
                50% { box-shadow: 0 0 40px rgba(247, 147, 26, 0.8); }
            }
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
        document.head.appendChild(style);
        
        popup.innerHTML = `
            <h2 style="color: #ffd700; margin: 0 0 10px 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                🎉 FIRST COMPLETION! 🎉
            </h2>
            <p style="color: #0f0; font-size: 18px; margin-bottom: 20px;">
                You earned <span style="color: #ffd700; font-weight: bold;">${finalReward} Crypto!</span>
            </p>
            <div style="margin: 20px 0;">
                <p style="color: #0ff; font-size: 16px; margin-bottom: 15px;">You found a Code Scrap!</p>
                <div style="animation: float 2s ease-in-out infinite;">
                    <img src="${baseurl}/images/DBS2/codescrapCrypto.png" 
                         alt="Crypto Miner Code Scrap" 
                         style="max-width: 300px; max-height: 200px; border: 3px solid #f7931a; border-radius: 10px; animation: glow 2s ease-in-out infinite;"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <div style="display: none; padding: 20px; background: rgba(247, 147, 26, 0.2); border: 2px dashed #f7931a; border-radius: 10px;">
                        <span style="font-size: 48px;">📜</span>
                        <p style="color: #f7931a; margin: 10px 0 0 0;">Code Scrap: Crypto Miner</p>
                    </div>
                </div>
            </div>
            <p style="color: #888; font-size: 14px; margin: 15px 0;">
                This code scrap has been added to your inventory!
            </p>
            <button id="close-scrap-popup" style="
                background: linear-gradient(135deg, #f7931a 0%, #ff6b00 100%);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                margin-top: 10px;
                transition: transform 0.2s, box-shadow 0.2s;
            ">CONTINUE</button>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Add hover effect to button
        const closeBtn = document.getElementById('close-scrap-popup');
        closeBtn.onmouseover = () => {
            closeBtn.style.transform = 'scale(1.05)';
            closeBtn.style.boxShadow = '0 5px 20px rgba(247, 147, 26, 0.5)';
        };
        closeBtn.onmouseout = () => {
            closeBtn.style.transform = 'scale(1)';
            closeBtn.style.boxShadow = 'none';
        };
        
        // Close popup handler
        closeBtn.onclick = () => {
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s';
            setTimeout(() => {
                overlay.remove();
                style.remove();
                window.exitCryptoMiner();
            }, 300);
        };
    }
    
    async function sendHits(count) {
        playerProgress += count;
        
        const progressEl = document.getElementById('progress');
        if (progressEl) progressEl.textContent = playerProgress;
        
        updateRewardPreview();
        
        // Check if finished
        if (playerProgress >= targetProgress) {
            isActive = false;
            
            // Calculate reward with Bitcoin boost
            const baseReward = Math.floor(playerProgress / 5);
            let finalReward = Math.floor(baseReward * boostMultiplier);
            
            // First completion bonus
            if (isFirstCompletion) {
                finalReward += 25;
            }
            
            // Award crypto
            updateCrypto(finalReward);
            
            // Mark minigame complete and add code scrap to inventory
            try {
                await completeMinigame('crypto_miner');
                console.log('[CryptoMiner] Marked as complete in backend');
                
                // Add code scrap to inventory on first completion
                if (isFirstCompletion) {
                    await addInventoryItem({
                        name: 'Code Scrap: Crypto Miner',
                        found_at: 'crypto_miner',
                        timestamp: new Date().toISOString()
                    });
                    console.log('[CryptoMiner] Code scrap added to inventory');
                }
            } catch (e) {
                console.log('Could not save completion:', e);
            }
            
            // Hide the miner UI
            if (minerUI) {
                minerUI.style.display = 'none';
            }
            
            // Show code scrap popup on first completion
            if (isFirstCompletion) {
                showCodeScrapPopup(finalReward);
            } else {
                // Regular completion message
                let message = `Mining complete!\n\nBase: ${baseReward} Crypto`;
                if (boostMultiplier !== 1.0) {
                    message += `\nBTC Boost (${boostMultiplier.toFixed(2)}x): ${Math.floor(baseReward * boostMultiplier)} Crypto`;
                }
                message += `\n\nTotal: ${finalReward} Crypto!`;
                
                try {
                    Prompt.showDialoguePopup('Bitcoin Miner', message);
                } catch (e) {
                    console.warn(message);
                    alert(message);
                }
                
                setTimeout(() => {
                    window.exitCryptoMiner();
                }, 2000);
            }
        }
    }
    
    function loop() {
        if (!isActive) return;
        
        const now = Date.now();
        if (now > nextKeyChange) {
            currentKey = randomKey();
            nextKeyChange = now + (2000 + Math.random() * 5000); // 2–7 sec
            const keyEl = document.getElementById('key');
            if (keyEl) keyEl.textContent = currentKey;
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
        
        // Award partial progress with boost
        if (playerProgress > 0 && playerProgress < targetProgress) {
            const baseReward = Math.floor(playerProgress / 5);
            const finalReward = Math.floor(baseReward * boostMultiplier);
            if (finalReward > 0) updateCrypto(finalReward);
        }
        
        if (minerUI && minerUI.parentNode) {
            minerUI.remove();
        }
        
        // Remove any code scrap overlay if still present
        const scrapOverlay = document.getElementById('code-scrap-overlay');
        if (scrapOverlay) scrapOverlay.remove();
        
        window.removeEventListener('keydown', keyDownHandler, true);
        window.removeEventListener('keyup', keyUpHandler, true);
        heldKeys.clear();
        delete window.exitCryptoMiner;
    };
    
    // Start the game
    window.addEventListener('keydown', keyDownHandler, true);
    window.addEventListener('keyup', keyUpHandler, true);
    
    // Initialize: fetch Bitcoin data and check completion status
    Promise.all([fetchBitcoinData(), checkFirstCompletion()]).then(() => {
        updateBitcoinUI();
    });
    
    // Refresh Bitcoin data every 5 minutes
    setInterval(fetchBitcoinData, 5 * 60 * 1000);
    
    loop();
}

// Export default function that NPCs can call
export default cryptoMinerMinigame;