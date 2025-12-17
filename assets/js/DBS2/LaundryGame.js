// Laundry Machine Repair Minigame
// Call showLaundryMinigame() to display the popup

import { isMinigameCompleted, completeMinigame, addInventoryItem, updateCrypto } from './StatsManager.js';

export async function showLaundryMinigame(onComplete) {
    const baseurl = document.body.getAttribute('data-baseurl') || '';
    
    window.laundryMinigameActive = true;
    window.minigameActive = true;
    
    // Check if this is first completion
    let isFirstCompletion = false;
    try {
        isFirstCompletion = !(await isMinigameCompleted('laundry'));
        console.log('[Laundry] First completion:', isFirstCompletion);
    } catch (e) {
        console.log('[Laundry] Could not check completion status:', e);
    }
    
    let partsPlaced = 0;
    const totalParts = 4;
    let laundryLoaded = 0;
    const totalLaundry = 5;
    let currentDraggedElement = null;
    let repairComplete = false;

    const overlay = document.createElement('div');
    overlay.id = 'minigame-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    const container = document.createElement('div');
    container.id = 'minigame-container';
    container.style.cssText = `
        width: 90%;
        max-width: 900px;
        height: 80vh;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 2px solid #0a5;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: 'Courier New', monospace;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'EXIT';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #600;
        color: #ccc;
        border: 1px solid #800;
        padding: 8px 15px;
        cursor: pointer;
        font-size: 12px;
        font-family: 'Courier New', monospace;
        z-index: 10;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#800';
    closeBtn.onmouseout = () => closeBtn.style.background = '#600';
    closeBtn.onclick = () => {
        window.laundryMinigameActive = false;
        window.minigameActive = false;
        document.body.removeChild(overlay);
    };

    const title = document.createElement('h1');
    title.textContent = 'WASHING MACHINE REPAIR';
    title.style.cssText = `
        text-align: center;
        color: #0a5;
        font-size: 20px;
        margin-bottom: 10px;
        letter-spacing: 2px;
        font-family: 'Courier New', monospace;
    `;

    const instructions = document.createElement('div');
    instructions.textContent = 'Drag the parts to the correct spots on the machine. Then load the laundry.';
    instructions.style.cssText = `
        text-align: center;
        color: #888;
        font-size: 12px;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 5px;
        font-family: 'Courier New', monospace;
    `;

    const gameArea = document.createElement('div');
    gameArea.style.cssText = `
        display: flex;
        gap: 20px;
        flex: 1;
        overflow: hidden;
    `;

    const partsArea = document.createElement('div');
    partsArea.style.cssText = `
        flex: 1;
        background: rgba(50, 50, 50, 0.9);
        border-radius: 10px;
        padding: 15px;
        overflow-y: auto;
    `;

    const partsTitle = document.createElement('h2');
    partsTitle.textContent = 'Spare Parts';
    partsTitle.style.cssText = `
        color: #fff;
        font-size: 18px;
        margin-bottom: 15px;
        text-align: center;
    `;

    const partsContainer = document.createElement('div');
    partsContainer.style.cssText = `
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
    `;

    const partsList = [
        { name: 'Motor', type: 'motor', sprite: `${baseurl}/images/DBS2/motor.png` },
        { name: 'Belt', type: 'belt', sprite: `${baseurl}/images/DBS2/belt.png` },
        { name: 'Pump', type: 'pump', sprite: `${baseurl}/images/DBS2/pump.jpg` },
        { name: 'Hose', type: 'hose', sprite: `${baseurl}/images/DBS2/hose.png` }
    ];

    const parts = [];
    partsList.forEach(partInfo => {
        const part = document.createElement('div');
        part.className = 'part';
        part.textContent = partInfo.name;
        part.draggable = true;
        part.dataset.part = partInfo.type;
        part.style.cssText = `
            width: 100%;
            aspect-ratio: 1;
            background: #4a4a4a;
            border: 3px solid #666;
            border-radius: 10px;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #fff;
            text-align: center;
            transition: all 0.2s;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        `;
        part.style.backgroundImage = `url('${partInfo.sprite}')`;

        part.onmouseover = () => {
            if (!part.classList.contains('placed')) {
                part.style.borderColor = '#88ff88';
                part.style.transform = 'scale(1.05)';
            }
        };
        part.onmouseout = () => {
            part.style.borderColor = '#666';
            part.style.transform = 'scale(1)';
        };

        parts.push(part);
        partsContainer.appendChild(part);
    });

    partsArea.appendChild(partsTitle);
    partsArea.appendChild(partsContainer);

    const machineArea = document.createElement('div');
    machineArea.style.cssText = `
        flex: 1.5;
        background: rgba(30, 30, 30, 0.9);
        border-radius: 10px;
        padding: 20px;
        position: relative;
        display: flex;
        flex-direction: column;
    `;

    const machineContainer = document.createElement('div');
    machineContainer.style.cssText = `
        flex: 1;
        position: relative;
        background: #555;
        border-radius: 10px;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
        transition: transform 0.1s;
    `;
    machineContainer.style.backgroundImage = `url('${baseurl}/images/DBS2/broken-washing-machine-jpeg.jpeg')`;

    const zones = [
        { id: 'zone-motor', accepts: 'motor', label: 'Motor', style: 'top: 20%; left: 15%; width: 25%; height: 20%;' },
        { id: 'zone-belt', accepts: 'belt', label: 'Belt', style: 'top: 45%; left: 10%; width: 30%; height: 15%;' },
        { id: 'zone-pump', accepts: 'pump', label: 'Pump', style: 'bottom: 20%; left: 15%; width: 25%; height: 20%;' },
        { id: 'zone-hose', accepts: 'hose', label: 'Hose', style: 'top: 25%; right: 15%; width: 20%; height: 30%;' }
    ];

    const dropZones = [];
    zones.forEach(zoneInfo => {
        const zone = document.createElement('div');
        zone.className = 'drop-zone';
        zone.id = zoneInfo.id;
        zone.dataset.accepts = zoneInfo.accepts;
        zone.style.cssText = `
            position: absolute;
            ${zoneInfo.style}
            background: rgba(100, 100, 100, 0.3);
            border: 3px dashed #88aaff;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        `;

        const label = document.createElement('div');
        label.textContent = zoneInfo.label;
        label.style.cssText = `
            color: #aaa;
            font-size: 12px;
            text-align: center;
            pointer-events: none;
        `;
        zone.appendChild(label);

        dropZones.push(zone);
        machineContainer.appendChild(zone);
    });

    // Laundry items area (hidden initially)
    const laundryItemsArea = document.createElement('div');
    laundryItemsArea.style.cssText = `
        display: none;
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        width: 120px;
        background: rgba(50, 50, 50, 0.9);
        border-radius: 10px;
        padding: 10px;
    `;

    const laundryTitle = document.createElement('div');
    laundryTitle.textContent = 'Dirty Laundry';
    laundryTitle.style.cssText = `
        color: #fff;
        font-size: 14px;
        margin-bottom: 10px;
        text-align: center;
    `;
    laundryItemsArea.appendChild(laundryTitle);

    const laundryItems = [];
    const laundryTypes = ['🧦', '👕', '👖', '🧥', '🩳'];
    laundryTypes.forEach((emoji, i) => {
        const item = document.createElement('div');
        item.className = 'laundry-item';
        item.draggable = true;
        item.textContent = emoji;
        item.style.cssText = `
            width: 50px;
            height: 50px;
            background: #666;
            border: 2px solid #888;
            border-radius: 8px;
            margin: 5px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            cursor: grab;
            transition: all 0.2s;
        `;
        item.onmouseover = () => {
            if (!item.classList.contains('loaded')) {
                item.style.borderColor = '#88ff88';
                item.style.transform = 'scale(1.1)';
            }
        };
        item.onmouseout = () => {
            item.style.borderColor = '#888';
            item.style.transform = 'scale(1)';
        };
        laundryItems.push(item);
        laundryItemsArea.appendChild(item);
    });

    // Machine door zone (for loading laundry)
    const machineDoorZone = document.createElement('div');
    machineDoorZone.style.cssText = `
        display: none;
        position: absolute;
        top: 30%;
        left: 30%;
        width: 40%;
        height: 40%;
        background: rgba(100, 100, 150, 0.2);
        border: 3px dashed #88aaff;
        border-radius: 50%;
        transition: all 0.2s;
    `;
    machineContainer.appendChild(machineDoorZone);

    // Start button
    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Wash Cycle';
    startBtn.disabled = true;
    startBtn.style.cssText = `
        margin-top: 15px;
        padding: 12px 24px;
        font-size: 16px;
        background: #666;
        color: #999;
        border: none;
        border-radius: 8px;
        cursor: not-allowed;
        transition: all 0.3s;
    `;

    // Success message
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 150, 0, 0.9);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 24px;
        text-align: center;
        z-index: 100;
    `;
    successMessage.innerHTML = '✅ Wash Complete!';

    // Paper discovery message
    const paperDiscovery = document.createElement('div');
    paperDiscovery.style.cssText = `
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        color: white;
        padding: 30px;
        border-radius: 15px;
        border: 3px solid #ffd700;
        font-size: 16px;
        text-align: center;
        z-index: 100;
        max-width: 400px;
        box-shadow: 0 0 30px rgba(0, 170, 85, 0.3);
    `;
    
    // Show different message based on first completion
    const rewardAmount = isFirstCompletion ? 520 : 20;
    paperDiscovery.innerHTML = `
        <h2 style="color: #0a5; margin-bottom: 10px; font-size: 16px; letter-spacing: 1px;">
            ${isFirstCompletion ? 'CODE FRAGMENT RECOVERED' : 'MACHINE REPAIRED'}
        </h2>
        <p style="margin-bottom: 15px; font-size: 13px; color: #888;">
            ${isFirstCompletion 
                ? 'A soggy piece of paper was stuck in the drum. The ink ran but the code is still readable.' 
                : 'The machine runs again.'}
        </p>
        ${isFirstCompletion ? `
            <div style="background: rgba(0,170,85,0.1); padding: 12px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #052;">
                <p style="color: #0a5; font-size: 12px;">Code fragment recovered. 1 of 5.</p>
                <img src="${baseurl}/images/DBS2/codescrapLaundry.png" style="max-width: 80px; margin: 10px auto; display: block; border: 1px solid #0a5; border-radius: 4px;" onerror="this.style.display='none'">
            </div>
        ` : ''}
        <p style="color: #0a5; font-size: 16px;">+${rewardAmount} Crypto</p>
        <button id="continueBtn" style="
            margin-top: 15px;
            padding: 10px 25px;
            font-size: 13px;
            background: #052;
            color: #0a5;
            border: 1px solid #0a5;
            cursor: pointer;
            font-family: 'Courier New', monospace;
        ">CONTINUE</button>
    `;

    machineArea.appendChild(machineContainer);
    machineArea.appendChild(startBtn);
    machineArea.appendChild(successMessage);
    machineArea.appendChild(paperDiscovery);
    machineArea.appendChild(laundryItemsArea);

    gameArea.appendChild(partsArea);
    gameArea.appendChild(machineArea);

    container.appendChild(closeBtn);
    container.appendChild(title);
    container.appendChild(instructions);
    container.appendChild(gameArea);

    // Drag and drop handlers
    function handleDragStart(e) {
        currentDraggedElement = this;
        this.style.opacity = '0.5';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.dataset.part || 'laundry');
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        this.style.borderColor = '#ffff00';
        this.style.background = 'rgba(255, 255, 0, 0.2)';
    }

    function handleDragLeave(e) {
        this.style.borderColor = '#88aaff';
        this.style.background = 'rgba(100, 100, 100, 0.3)';
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        this.style.borderColor = '#88aaff';
        this.style.background = 'rgba(100, 100, 100, 0.3)';

        const draggedPart = currentDraggedElement.dataset.part;
        const acceptsPart = this.dataset.accepts;

        if (draggedPart === acceptsPart && !currentDraggedElement.classList.contains('placed')) {
            this.style.borderStyle = 'solid';
            this.style.borderColor = '#44ff44';
            this.style.background = 'rgba(68, 255, 68, 0.3)';
            currentDraggedElement.classList.add('placed');
            currentDraggedElement.style.opacity = '0.3';
            currentDraggedElement.style.cursor = 'not-allowed';
            currentDraggedElement.style.pointerEvents = 'none';
            currentDraggedElement.draggable = false;
            partsPlaced++;

            const label = this.querySelector('div');
            if (label) label.style.display = 'none';

            if (partsPlaced === totalParts) {
                completeRepair();
            }
        } else {
            this.style.background = 'rgba(255, 0, 0, 0.3)';
            setTimeout(() => {
                this.style.background = 'rgba(100, 100, 100, 0.3)';
            }, 500);
        }

        return false;
    }

    function handleLaundryDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        this.style.borderColor = '#88aaff';
        this.style.background = 'rgba(100, 100, 150, 0.2)';
        this.style.borderStyle = 'dashed';

        if (currentDraggedElement.classList.contains('laundry-item')) {
            currentDraggedElement.classList.add('loaded');
            currentDraggedElement.style.opacity = '0.3';
            currentDraggedElement.style.cursor = 'not-allowed';
            currentDraggedElement.style.pointerEvents = 'none';
            currentDraggedElement.draggable = false;
            laundryLoaded++;

            this.style.background = 'rgba(68, 255, 68, 0.3)';
            setTimeout(() => {
                this.style.background = 'rgba(100, 100, 150, 0.2)';
            }, 300);

            if (laundryLoaded === totalLaundry) {
                enableStartButton();
            }
        }

        return false;
    }

    parts.forEach(part => {
        part.addEventListener('dragstart', handleDragStart);
        part.addEventListener('dragend', handleDragEnd);
    });

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });

    laundryItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
    });

    machineDoorZone.addEventListener('dragover', handleDragOver);
    machineDoorZone.addEventListener('dragenter', handleDragEnter);
    machineDoorZone.addEventListener('dragleave', handleDragLeave);
    machineDoorZone.addEventListener('drop', handleLaundryDrop);

    function completeRepair() {
        repairComplete = true;
        instructions.innerHTML = '✅ Machine repaired! Now drag all the dirty laundry into the washing machine.';
        instructions.style.background = 'rgba(0, 100, 0, 0.6)';
        laundryItemsArea.style.display = 'block';
        machineDoorZone.style.display = 'block';
        dropZones.forEach(zone => {
            zone.style.display = 'none';
        });
    }

    function enableStartButton() {
        startBtn.style.background = '#44cc44';
        startBtn.style.color = 'white';
        startBtn.style.cursor = 'pointer';
        startBtn.disabled = false;
        instructions.innerHTML = '✅ All laundry loaded! Click the button to start the wash cycle.';
        instructions.style.background = 'rgba(0, 150, 0, 0.7)';
        
        startBtn.onmouseover = () => startBtn.style.background = '#55dd55';
        startBtn.onmouseout = () => startBtn.style.background = '#44cc44';
        
        startBtn.onclick = () => {
            if (repairComplete && laundryLoaded === totalLaundry) {
                laundryItemsArea.style.display = 'none';
                machineDoorZone.style.display = 'none';

                let animFrame = 0;
                const washingInterval = setInterval(() => {
                    animFrame++;
                    const offset = Math.sin(animFrame * 0.3) * 3;
                    const rotation = Math.sin(animFrame * 0.3) * 0.5;
                    machineContainer.style.transform = `translateX(${offset}px) rotate(${rotation}deg)`;
                }, 50);

                startBtn.textContent = 'Running...';
                startBtn.disabled = true;
                startBtn.style.background = '#666';
                startBtn.style.cursor = 'not-allowed';
                instructions.innerHTML = '🌊 Washing cycle in progress...';
                instructions.style.background = 'rgba(0, 100, 200, 0.6)';

                setTimeout(() => {
                    clearInterval(washingInterval);
                    machineContainer.style.transform = 'translateX(0) rotate(0)';
                    successMessage.style.display = 'block';
                    
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                        paperDiscovery.style.display = 'block';
                        
                        // Add continue button handler after it's in DOM
                        const continueBtn = document.getElementById('continueBtn');
                        if (continueBtn) {
                            continueBtn.onclick = handleContinue;
                        }
                    }, 2000);
                }, 3000);
            }
        };
    }

    // Continue button handler - syncs to backend
    async function handleContinue() {
        const continueBtn = document.getElementById('continueBtn');
        if (!continueBtn) return;
        
        continueBtn.textContent = 'Saving...';
        continueBtn.disabled = true;
        continueBtn.style.background = '#666';
        continueBtn.style.cursor = 'wait';
        
        try {
            console.log('🧺 Syncing laundry minigame completion...');
            
            // Award crypto
            const cryptoAmount = isFirstCompletion ? 520 : 20;
            await updateCrypto(cryptoAmount);
            console.log('✅ Crypto added:', cryptoAmount);
            
            // Mark minigame complete and add code scrap on first completion
            if (isFirstCompletion) {
                await completeMinigame('laundry');
                console.log('✅ Minigame marked complete');
                
                await addInventoryItem({
                    name: 'Code Scrap: Laundry',
                    found_at: 'laundry',
                    timestamp: new Date().toISOString()
                });
                console.log('✅ Code scrap added to inventory');
            }
            
            // Update UI
            const balanceEl = document.getElementById('balance');
            if (balanceEl) {
                balanceEl.style.color = '#44ff44';
                balanceEl.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    balanceEl.style.color = '';
                    balanceEl.style.transform = 'scale(1)';
                }, 500);
            }
            
            // Refresh leaderboard
            if (window.GameControl && window.GameControl.leaderboard) {
                try {
                    await window.GameControl.leaderboard.refresh();
                    console.log('✅ Leaderboard refreshed');
                } catch (leaderboardError) {
                    console.warn('⚠️ Leaderboard refresh failed:', leaderboardError);
                }
            }
            
            continueBtn.textContent = '✅ Saved!';
            continueBtn.style.background = '#44cc44';
            
            setTimeout(() => {
                window.laundryMinigameActive = false;
                window.minigameActive = false;
                document.body.removeChild(overlay);
                if (onComplete) onComplete();
            }, 800);
            
        } catch (error) {
            console.error('❌ Sync failed:', error);
            continueBtn.textContent = '⚠️ Error - Closing...';
            continueBtn.style.background = '#ff4444';
            
            setTimeout(() => {
                window.laundryMinigameActive = false;
                window.minigameActive = false;
                document.body.removeChild(overlay);
                // Refresh leaderboard
                try {
                    if (window.Leaderboard && typeof window.Leaderboard.refresh === 'function') {
                        window.Leaderboard.refresh();
                    }
                } catch(e) { console.log('Could not refresh leaderboard'); }
                if (onComplete) onComplete();
            }, 1500);
        }
    }

    overlay.appendChild(container);
    document.body.appendChild(overlay);
}

window.showLaundryMinigame = showLaundryMinigame;
export default showLaundryMinigame;