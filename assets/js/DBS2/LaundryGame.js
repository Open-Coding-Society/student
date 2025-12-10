// Laundry Machine Repair Minigame with Backend Integration
import { updateCrypto, completeMinigame } from './StatsManager.js';

export default function showLaundryMinigame(onComplete) {
    const baseurl = document.body.getAttribute('data-baseurl') || '';
    
    window.laundryMinigameActive = true;
    window.minigameActive = true;
    
    let isFirstCompletion = false;
    
    // Check first completion status
    async function checkFirstCompletion() {
        try {
            if (typeof window.DBS2API !== 'undefined') {
                const status = await window.DBS2API.getMinigameStatus();
                isFirstCompletion = !status.laundry;
            }
        } catch (e) {
            console.log('Could not check minigame status:', e);
        }
    }
    checkFirstCompletion();
    
    // Game state
    let partsPlaced = 0;
    const totalParts = 4;
    let laundryLoaded = 0;
    const totalLaundry = 5;
    let currentDraggedElement = null;
    let repairComplete = false;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'minigame-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;

    // Create container
    const container = document.createElement('div');
    container.id = 'minigame-container';
    container.style.cssText = `
        width: 90%; max-width: 900px; height: 80vh;
        background: #2a2a2a; border-radius: 15px; padding: 20px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
        position: relative; display: flex; flex-direction: column;
        background-size: cover; background-position: center;
        background-image: url('${baseurl}/images/DBS2/basement.png');
    `;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
        position: absolute; top: 10px; right: 10px;
        background: #ff4444; color: white; border: none;
        padding: 10px 15px; border-radius: 5px; cursor: pointer;
        font-size: 16px; z-index: 10;
    `;
    closeBtn.onclick = () => {
        window.laundryMinigameActive = false;
        window.minigameActive = false;
        overlay.remove();
    };

    // Title
    const title = document.createElement('h1');
    title.textContent = '🔧 Repair the Washing Machine';
    title.style.cssText = `
        text-align: center; color: #fff; font-size: 24px;
        margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    `;

    // Instructions
    const instructions = document.createElement('div');
    instructions.textContent = 'Drag parts to the correct spots. Then load the laundry!';
    instructions.style.cssText = `
        text-align: center; color: #ffff99; font-size: 14px;
        margin-bottom: 15px; padding: 10px;
        background: rgba(0, 0, 0, 0.6); border-radius: 8px;
    `;

    // Game area
    const gameArea = document.createElement('div');
    gameArea.style.cssText = 'display: flex; gap: 20px; flex: 1; overflow: hidden;';

    // Parts area (left)
    const partsArea = document.createElement('div');
    partsArea.style.cssText = `
        flex: 1; background: rgba(50, 50, 50, 0.9);
        border-radius: 10px; padding: 15px; overflow-y: auto;
    `;

    const partsTitle = document.createElement('h2');
    partsTitle.textContent = 'Spare Parts';
    partsTitle.style.cssText = 'color: #fff; font-size: 18px; margin-bottom: 15px; text-align: center;';

    const partsContainer = document.createElement('div');
    partsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;';

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
        part.draggable = true;
        part.dataset.part = partInfo.type;
        part.style.cssText = `
            width: 100%; aspect-ratio: 1; background: #4a4a4a;
            border: 3px solid #666; border-radius: 10px; cursor: grab;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; color: #fff; text-align: center;
            background-size: contain; background-position: center;
            background-repeat: no-repeat;
            background-image: url('${partInfo.sprite}');
        `;
        parts.push(part);
        partsContainer.appendChild(part);
    });

    partsArea.appendChild(partsTitle);
    partsArea.appendChild(partsContainer);

    // Machine area (right)
    const machineArea = document.createElement('div');
    machineArea.style.cssText = `
        flex: 1.5; background: rgba(30, 30, 30, 0.9);
        border-radius: 10px; padding: 20px; position: relative;
        display: flex; flex-direction: column;
    `;

    const machineContainer = document.createElement('div');
    machineContainer.style.cssText = `
        flex: 1; position: relative; background: #555; border-radius: 10px;
        background-size: contain; background-position: center;
        background-repeat: no-repeat;
        background-image: url('${baseurl}/images/DBS2/broken-washing-machine-jpeg.jpeg');
    `;

    // Drop zones
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
            position: absolute; ${zoneInfo.style}
            border: 3px dashed #888; border-radius: 8px;
            background: rgba(100, 100, 100, 0.3);
            display: flex; align-items: center; justify-content: center;
        `;
        const label = document.createElement('div');
        label.textContent = zoneInfo.label;
        label.style.cssText = 'color: #aaa; font-size: 12px;';
        zone.appendChild(label);
        dropZones.push(zone);
        machineContainer.appendChild(zone);
    });

    // Machine door zone (for laundry)
    const machineDoorZone = document.createElement('div');
    machineDoorZone.id = 'machine-door-zone';
    machineDoorZone.dataset.accepts = 'laundry';
    machineDoorZone.style.cssText = `
        position: absolute; top: 30%; left: 35%; width: 30%; height: 40%;
        border: 3px dashed #88aaff; border-radius: 50%;
        background: rgba(100, 100, 150, 0.2); display: none;
    `;
    machineContainer.appendChild(machineDoorZone);

    // Laundry items area
    const laundryItemsArea = document.createElement('div');
    laundryItemsArea.style.cssText = `
        display: none; margin-top: 15px; padding: 10px;
        background: rgba(50, 50, 50, 0.9); border-radius: 8px;
    `;
    const laundryTitle = document.createElement('div');
    laundryTitle.textContent = 'Dirty Laundry - Drag to machine!';
    laundryTitle.style.cssText = 'color: #fff; font-size: 14px; margin-bottom: 10px; text-align: center;';

    const laundryContainer = document.createElement('div');
    laundryContainer.style.cssText = 'display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;';

    const laundryTypes = ['🧦', '👕', '👖', '🩲', '🧥'];
    const laundryItems = [];
    laundryTypes.forEach((emoji, i) => {
        const item = document.createElement('div');
        item.className = 'laundry-item';
        item.draggable = true;
        item.dataset.part = 'laundry';
        item.textContent = emoji;
        item.style.cssText = `
            width: 50px; height: 50px; background: #666;
            border: 2px solid #888; border-radius: 8px; cursor: grab;
            display: flex; align-items: center; justify-content: center;
            font-size: 24px;
        `;
        laundryItems.push(item);
        laundryContainer.appendChild(item);
    });

    laundryItemsArea.appendChild(laundryTitle);
    laundryItemsArea.appendChild(laundryContainer);

    // Start button
    const startBtn = document.createElement('button');
    startBtn.textContent = 'Start Wash Cycle';
    startBtn.disabled = true;
    startBtn.style.cssText = `
        margin-top: 15px; padding: 12px 24px; font-size: 16px;
        background: #666; color: #999; border: none;
        border-radius: 8px; cursor: not-allowed;
    `;

    machineArea.appendChild(machineContainer);
    machineArea.appendChild(laundryItemsArea);
    machineArea.appendChild(startBtn);

    // Success message
    const successMessage = document.createElement('div');
    successMessage.style.cssText = `
        display: none; position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95); color: #44ff44;
        padding: 40px; border-radius: 15px; text-align: center;
        font-size: 24px; z-index: 100;
    `;
    successMessage.innerHTML = '✨ Laundry Complete! ✨<br><span style="font-size: 16px;">The machine is working perfectly!</span>';

    // Paper discovery
    const paperDiscovery = document.createElement('div');
    paperDiscovery.style.cssText = `
        display: none; position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.95); color: #fff;
        padding: 30px; border-radius: 15px; text-align: center;
        max-width: 80%; z-index: 100;
    `;
    
    const continueBtn = document.createElement('button');
    continueBtn.textContent = 'Continue';
    continueBtn.style.cssText = `
        margin-top: 20px; padding: 10px 30px;
        background: #44cc44; color: white; border: none;
        border-radius: 5px; cursor: pointer; font-size: 16px;
    `;

    // Assemble
    gameArea.appendChild(partsArea);
    gameArea.appendChild(machineArea);
    container.appendChild(closeBtn);
    container.appendChild(title);
    container.appendChild(instructions);
    container.appendChild(gameArea);
    container.appendChild(paperDiscovery);
    container.appendChild(successMessage);
    overlay.appendChild(container);

    // Drag handlers
    function handleDragStart(e) {
        if (this.classList.contains('placed') || this.classList.contains('loaded')) return;
        currentDraggedElement = this;
        this.style.opacity = '0.5';
    }

    function handleDragEnd(e) {
        this.style.opacity = '1';
    }

    function handleDragOver(e) {
        e.preventDefault();
        return false;
    }

    function handleDragEnter(e) {
        if (!this.classList.contains('filled')) {
            this.style.borderColor = '#88ff88';
            this.style.background = 'rgba(136, 255, 136, 0.3)';
        }
    }

    function handleDragLeave(e) {
        this.style.borderColor = '#888';
        this.style.background = 'rgba(100, 100, 100, 0.3)';
    }

    function handleDrop(e) {
        e.preventDefault();
        this.style.borderColor = '#888';
        this.style.background = 'rgba(100, 100, 100, 0.3)';

        if (this.classList.contains('filled')) return false;

        const partType = currentDraggedElement.dataset.part;
        const acceptedType = this.dataset.accepts;

        if (partType === acceptedType) {
            this.classList.add('filled');
            this.style.borderColor = '#44ff44';
            currentDraggedElement.classList.add('placed');
            currentDraggedElement.style.opacity = '0.3';
            currentDraggedElement.draggable = false;
            partsPlaced++;

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
        e.preventDefault();
        if (currentDraggedElement.classList.contains('laundry-item')) {
            currentDraggedElement.classList.add('loaded');
            currentDraggedElement.style.opacity = '0.3';
            currentDraggedElement.draggable = false;
            laundryLoaded++;

            if (laundryLoaded === totalLaundry) {
                enableStartButton();
            }
        }
        return false;
    }

    // Attach events
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
        instructions.innerHTML = '✅ Machine repaired! Now drag laundry into the machine.';
        instructions.style.background = 'rgba(0, 100, 0, 0.6)';
        laundryItemsArea.style.display = 'block';
        machineDoorZone.style.display = 'block';
        dropZones.forEach(zone => zone.style.display = 'none');
    }

    function enableStartButton() {
        startBtn.style.background = '#44cc44';
        startBtn.style.color = 'white';
        startBtn.style.cursor = 'pointer';
        startBtn.disabled = false;
        instructions.innerHTML = '✅ All loaded! Click Start!';
    }

    startBtn.onclick = async () => {
        if (!repairComplete || laundryLoaded !== totalLaundry) return;
        
        laundryItemsArea.style.display = 'none';
        machineDoorZone.style.display = 'none';

        // Shake animation
        let frame = 0;
        const shakeInterval = setInterval(() => {
            frame++;
            machineContainer.style.transform = `translateX(${Math.sin(frame * 0.3) * 3}px)`;
        }, 50);

        startBtn.textContent = 'Running...';
        startBtn.disabled = true;
        instructions.innerHTML = '🌊 Washing...';

        setTimeout(async () => {
            clearInterval(shakeInterval);
            machineContainer.style.transform = 'none';
            
            // Calculate reward
            let reward = 20;
            if (isFirstCompletion) {
                reward += 15;
            }

            // Award crypto
            updateCrypto(reward);

            // Mark complete
            try {
                await completeMinigame('laundry');
            } catch (e) {
                console.log('Could not save completion:', e);
            }

            // Update paper discovery message
            let message = `You found a mysterious paper in the laundry!<br><br>`;
            message += `<span style="color: #44ff44; font-size: 20px;">+${reward} Crypto!</span>`;
            if (isFirstCompletion) {
                message += `<br><span style="color: #88aaff; font-size: 14px;">(includes +15 first completion bonus!)</span>`;
            }
            paperDiscovery.innerHTML = message;
            paperDiscovery.appendChild(continueBtn);

            successMessage.style.display = 'block';
            setTimeout(() => {
                successMessage.style.display = 'none';
                paperDiscovery.style.display = 'block';
            }, 2000);
        }, 3000);
    };

    continueBtn.onclick = () => {
        window.laundryMinigameActive = false;
        window.minigameActive = false;
        overlay.remove();
        if (onComplete) onComplete();
    };

    document.body.appendChild(overlay);
}

window.showLaundryMinigame = showLaundryMinigame;