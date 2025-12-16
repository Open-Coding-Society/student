// Laundry Machine Repair Minigame
// Call showLaundryMinigame() to display the popup

export function showLaundryMinigame(onComplete) {
    const baseurl = document.body.getAttribute('data-baseurl') || '';
    
    window.laundryMinigameActive = true;
    window.minigameActive = true;
    
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
        background: #2a2a2a;
        border-radius: 15px;
        padding: 20px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        position: relative;
        display: flex;
        flex-direction: column;
        background-size: cover;
        background-position: center;
    `;
    container.style.backgroundImage = `url('${baseurl}/images/DBS2/basement.png')`;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff4444;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        z-index: 10;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#cc0000';
    closeBtn.onmouseout = () => closeBtn.style.background = '#ff4444';
    closeBtn.onclick = () => {
        window.laundryMinigameActive = false;
        window.minigameActive = false;
        document.body.removeChild(overlay);
    };

    const title = document.createElement('h1');
    title.textContent = '🔧 Repair the Washing Machine';
    title.style.cssText = `
        text-align: center;
        color: #fff;
        font-size: 24px;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    `;

    const instructions = document.createElement('div');
    instructions.textContent = 'Drag and drop the parts onto the correct spots on the washing machine. Once all parts are installed, load the laundry!';
    instructions.style.cssText = `
        text-align: center;
        color: #ffff99;
        font-size: 14px;
        margin-bottom: 15px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.6);
        border-radius: 8px;
        transition: all 0.3s;
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
            border: 3px dashed #888;
            border-radius: 8px;
            background: rgba(100, 100, 100, 0.3);
            transition: all 0.3s;
        `;

        const label = document.createElement('div');
        label.textContent = zoneInfo.label;
        label.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #fff;
            font-size: 11px;
            text-align: center;
            pointer-events: none;
            text-shadow: 1px 1px 2px #000;
        `;

        zone.appendChild(label);
        dropZones.push(zone);
        machineContainer.appendChild(zone);
    });

    const machineDoorZone = document.createElement('div');
    machineDoorZone.style.cssText = `
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 40%;
        height: 40%;
        border: 3px dashed #88aaff;
        border-radius: 50%;
        background: rgba(100, 100, 150, 0.2);
        display: none;
        transition: all 0.3s;
    `;

    const doorLabel = document.createElement('div');
    doorLabel.textContent = 'Drop Laundry Here';
    doorLabel.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #fff;
        font-size: 14px;
        text-align: center;
        pointer-events: none;
        text-shadow: 1px 1px 3px #000;
    `;
    machineDoorZone.appendChild(doorLabel);
    machineContainer.appendChild(machineDoorZone);

    const laundryItemsArea = document.createElement('div');
    laundryItemsArea.style.cssText = `
        display: none;
        margin-top: 15px;
        padding: 15px;
        background: rgba(80, 80, 120, 0.8);
        border-radius: 10px;
    `;

    const laundryTitle = document.createElement('h3');
    laundryTitle.textContent = 'Dirty Laundry - Drag into Machine';
    laundryTitle.style.cssText = `
        color: #fff;
        font-size: 16px;
        margin-bottom: 10px;
        text-align: center;
    `;

    const laundryContainer = document.createElement('div');
    laundryContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
    `;

    const laundryList = [
        { name: 'Shirt', type: 'shirt', sprite: `${baseurl}/images/DBS2/shirt.png` },
        { name: 'Pants', type: 'pants', sprite: `${baseurl}/images/DBS2/pants.png` },
        { name: 'Socks', type: 'socks', sprite: `${baseurl}/images/DBS2/socks.png` },
        { name: 'Towel', type: 'towel', sprite: `${baseurl}/images/DBS2/towel.png` },
        { name: 'Jacket', type: 'jacket', sprite: `${baseurl}/images/DBS2/jacket.png` }
    ];

    const laundryItems = [];
    laundryList.forEach(item => {
        const laundryItem = document.createElement('div');
        laundryItem.className = 'laundry-item';
        laundryItem.textContent = item.name;
        laundryItem.draggable = true;
        laundryItem.dataset.laundry = item.type;
        laundryItem.style.cssText = `
            width: 60px;
            height: 60px;
            background: #6a6a8a;
            border: 2px solid #8888aa;
            border-radius: 8px;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #fff;
            text-align: center;
            transition: all 0.2s;
            background-size: contain;
            background-position: center;
            background-repeat: no-repeat;
        `;
        laundryItem.style.backgroundImage = `url('${item.sprite}')`;

        laundryItem.onmouseover = () => {
            if (!laundryItem.classList.contains('loaded')) {
                laundryItem.style.borderColor = '#aaaaff';
                laundryItem.style.transform = 'scale(1.05)';
            }
        };
        laundryItem.onmouseout = () => {
            laundryItem.style.borderColor = '#8888aa';
            laundryItem.style.transform = 'scale(1)';
        };

        laundryItems.push(laundryItem);
        laundryContainer.appendChild(laundryItem);
    });

    laundryItemsArea.appendChild(laundryTitle);
    laundryItemsArea.appendChild(laundryContainer);

    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Laundry Cycle';
    startBtn.disabled = true;
    startBtn.style.cssText = `
        margin-top: 15px;
        padding: 15px;
        background: #666;
        color: #999;
        border: none;
        border-radius: 8px;
        font-size: 18px;
        cursor: not-allowed;
        transition: all 0.3s;
    `;

    machineArea.appendChild(machineContainer);
    machineArea.appendChild(laundryItemsArea);
    machineArea.appendChild(startBtn);

    // Paper discovery screen - UPDATED: Shows ONLY the code scrap image
    const paperDiscovery = document.createElement('div');
    paperDiscovery.style.cssText = `
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #fff;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        font-size: 18px;
        z-index: 100;
        box-shadow: 0 0 30px rgba(255, 255, 100, 0.5);
        max-width: 600px;
    `;

    const paperTitle = document.createElement('div');
    paperTitle.innerHTML = '📄 Wait... What\'s this?';
    paperTitle.style.cssText = `
        font-size: 24px;
        margin-bottom: 20px;
        color: #ffff99;
    `;

    const paperText = document.createElement('div');
    paperText.innerHTML = 'You found a crumpled piece of paper in the washing machine!';
    paperText.style.cssText = `
        margin-bottom: 20px;
        line-height: 1.6;
    `;

    // UPDATED: Shows ONLY the code scrap image, no text overlay
    const paperImage = document.createElement('div');
    paperImage.style.cssText = `
        width: 100%;
        max-width: 450px;
        height: 500px;
        margin: 20px auto;
        background: transparent;
        border: none;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;
    `;
    paperImage.style.backgroundImage = `url('${baseurl}/images/DBS2/codescrapLaundry.png')`;

    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Take the Paper';
    continueBtn.style.cssText = `
        padding: 12px 30px;
        background: #44cc44;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        margin-top: 20px;
    `;
    continueBtn.onmouseover = () => continueBtn.style.background = '#55dd55';
    continueBtn.onmouseout = () => continueBtn.style.background = '#44cc44';

    paperDiscovery.appendChild(paperTitle);
    paperDiscovery.appendChild(paperText);
    paperDiscovery.appendChild(paperImage);
    paperDiscovery.appendChild(continueBtn);

    const successMessage = document.createElement('div');
    successMessage.innerHTML = '✅ Success!<br>The washing machine is fixed and the laundry is done!';
    successMessage.style.cssText = `
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95);
        color: #44ff44;
        padding: 40px;
        border-radius: 15px;
        text-align: center;
        font-size: 24px;
        z-index: 100;
        box-shadow: 0 0 30px rgba(68, 255, 68, 0.5);
    `;

    gameArea.appendChild(partsArea);
    gameArea.appendChild(machineArea);
    container.appendChild(closeBtn);
    container.appendChild(title);
    container.appendChild(instructions);
    container.appendChild(gameArea);
    container.appendChild(paperDiscovery);
    container.appendChild(successMessage);
    overlay.appendChild(container);

    // Drag and Drop Event Handlers
    function handleDragStart(e) {
        if (this.classList.contains('placed') || this.classList.contains('loaded')) return;
        currentDraggedElement = this;
        this.style.opacity = '0.5';
        this.style.cursor = 'grabbing';
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
        this.style.cursor = 'grab';
    }

    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }

    function handleDragEnter(e) {
        if (!this.classList.contains('filled')) {
            this.style.borderColor = this.id === 'machine-door-zone' ? '#aaffaa' : '#88ff88';
            this.style.background = 'rgba(136, 255, 136, 0.3)';
            this.style.borderStyle = 'solid';
        }
    }

    function handleDragLeave(e) {
        this.style.borderColor = this.id === 'machine-door-zone' ? '#88aaff' : '#888';
        this.style.background = this.id === 'machine-door-zone' ? 'rgba(100, 100, 150, 0.2)' : 'rgba(100, 100, 100, 0.3)';
        this.style.borderStyle = 'dashed';
    }

    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();

        this.style.borderColor = '#888';
        this.style.background = 'rgba(100, 100, 100, 0.3)';
        this.style.borderStyle = 'dashed';

        if (this.classList.contains('filled')) {
            return false;
        }

        const partType = currentDraggedElement.getAttribute('data-part');
        const acceptedType = this.getAttribute('data-accepts');

        if (partType === acceptedType) {
            this.classList.add('filled');
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
        
        // FIXED: Moved onclick inside enableStartButton function
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
                    }, 2000);
                }, 3000);
            }
        };
    }

    // Continue button - syncs to backend
    continueBtn.onclick = async () => {
        continueBtn.textContent = 'Saving...';
        continueBtn.disabled = true;
        continueBtn.style.background = '#666';
        continueBtn.style.cursor = 'wait';
        
        if (window.DBS2API) {
            try {
                console.log('🧺 Syncing laundry minigame completion...');
                
                const minigameResult = await window.DBS2API.completeMinigame('laundry');
                console.log('✅ Minigame marked complete:', minigameResult);
                
                const cryptoResult = await window.DBS2API.addCrypto(500);
                console.log('✅ Crypto added:', cryptoResult);
                
                const inventoryResult = await window.DBS2API.addInventoryItem({
                    name: 'Exit Code Paper',
                    found_at: 'washing_machine'
                });
                console.log('✅ Inventory updated:', inventoryResult);
                
                const balanceEl = document.getElementById('balance');
                if (balanceEl && cryptoResult.crypto) {
                    balanceEl.textContent = cryptoResult.crypto;
                    balanceEl.style.color = '#44ff44';
                    balanceEl.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        balanceEl.style.color = '';
                        balanceEl.style.transform = 'scale(1)';
                    }, 500);
                }
                
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
                console.error('Error details:', error.message);
                
                continueBtn.textContent = '⚠️ Error';
                continueBtn.style.background = '#ff4444';
                
                const errorMsg = error.message || 'Unknown error';
                alert(`⚠️ Failed to save progress:\n${errorMsg}\n\nCheck console for details.`);
                
                setTimeout(() => {
                    window.laundryMinigameActive = false;
                    window.minigameActive = false;
                    document.body.removeChild(overlay);
                    if (onComplete) onComplete();
                }, 2000);
            }
        } else {
            console.warn('⚠️ DBS2API not available');
            alert('⚠️ You must be logged in to save progress.');
            window.laundryMinigameActive = false;
            window.minigameActive = false;
            document.body.removeChild(overlay);
            if (onComplete) onComplete();
        }
    };

    document.body.appendChild(overlay);
}

window.showLaundryMinigame = showLaundryMinigame;
export default showLaundryMinigame;