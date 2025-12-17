/**
 * Inventory.js
 * Manages player inventory with backend sync and code scrap collection
 * 
 * STORY: IShowGreen once ran a legendary crypto mining rig he called "The Green Machine."
 * Years of neglect destroyed it - rats gnawed the cables, a flood ruined the drives,
 * a fire burned his backups, and he forgot his own passwords. Now he has trapped you
 * in his basement until you help him recover the fragments of his lost program.
 */

import { getInventory, addInventoryItem } from './StatsManager.js';

// Code scrap definitions with story elements
const CODE_SCRAPS = {
    crypto_miner: {
        id: 'crypto_miner',
        name: 'Mining Algorithm Core',
        icon: 'CORE',
        image: 'codescrapCrypto.png',
        description: 'The heart of The Green Machine. A mining algorithm that once generated thousands of crypto per hour. IShowGreen wrote this during a sleepless weekend, fueled by energy drinks and desperation. Without it, the rest of the code is worthless.',
        hint: 'Prove your worth at the mining terminal.',
        storyFragment: '"The algorithm was my masterpiece. Sixty hours of pure focus. I would give anything to have it back." - Journal Entry #47'
    },
    laundry: {
        id: 'laundry',
        name: 'Transaction Validator',
        icon: 'VALID',
        image: 'codescrapLaundry.png', 
        description: 'The transaction verification module. It processed and validated every crypto exchange. A burst pipe flooded the basement and destroyed the drive it was stored on. The water damage was total.',
        hint: 'The old washing machine holds secrets in its wreckage.',
        storyFragment: '"The flood came at 3 AM. By morning, half my drives were dead. The validator was gone." - Journal Entry #62'
    },
    whackarat: {
        id: 'whackarat',
        name: 'Security Protocol',
        icon: 'SECURE',
        image: 'codescrapRats.png',
        description: 'The firewall and intrusion detection system that kept The Green Machine safe from hackers. When the rat infestation hit, they chewed through everything. Power cables. Network lines. Storage drives. The security module was corrupted beyond recovery.',
        hint: 'The rats still guard their territory.',
        storyFragment: '"I heard them in the walls for weeks before I saw the damage. By then it was too late." - Journal Entry #78'
    },
    ash_trail: {
        id: 'ash_trail',
        name: 'Backup Recovery Data',
        icon: 'BACKUP',
        image: 'codescrapPages.png',
        description: 'Printed documentation and recovery keys. IShowGreen was paranoid about digital-only backups, so he printed everything. Then he knocked over a candle. The fire was small, but his "paper backups" were ash in minutes.',
        hint: 'Trace what remains of the burned pages.',
        storyFragment: '"I printed them to be SAFE. Ironic. The fire took everything on the bookshelf." - Journal Entry #91'
    },
    infinite_user: {
        id: 'infinite_user',
        name: 'Authentication System',
        icon: 'AUTH',
        image: 'codescrapPassword.png',
        description: 'The master access control system. After months of not logging in, IShowGreen forgot his own credentials. The system he built to keep others out now keeps him locked away from his own creation.',
        hint: 'Crack the password encryption to recover the access keys.',
        storyFragment: '"PASSWORD DENIED. Again. I wrote this system. I should remember. Why cant I remember?" - Journal Entry #103'
    }
};

const Inventory = {
    slots: 10,
    items: [],
    isOpen: false,
    isLoading: false,
    baseImagePath: '',
    owner: null,
    _keyListenerAdded: false,

    init(options = {}) {
        if (options.slots) this.slots = options.slots;
        
        const baseurl = document.body.getAttribute('data-baseurl') || '';
        this.baseImagePath = `${baseurl}/images/DBS2`;
        
        this.ensureStyles();
        this.renderButton();
        this.renderPanel();
        
        this.loadFromBackend().catch(e => {
            console.error('[Inventory] Background load failed:', e);
        });
        
        if (!this._keyListenerAdded) {
            this._keyListenerAdded = true;
            window.addEventListener('keydown', (e) => {
                if ((e.key === 'i' || e.key === 'I') && !window.minigameActive) {
                    this.toggle();
                }
            });
        }
        
        console.log('[Inventory] Initialized');
    },

    setOwner(owner) {
        this.owner = owner || null;
        if (this.owner) {
            this.owner.inventory = this.getItems();
        }
    },

    async loadFromBackend() {
        this.isLoading = true;
        this.updateLoadingState();
        
        try {
            const inventory = await getInventory();
            console.log('[Inventory] Loaded from backend:', inventory);
            
            this.items = [];
            if (Array.isArray(inventory) && inventory.length > 0) {
                for (const item of inventory) {
                    if (!item) continue;
                    
                    try {
                        const scrapInfo = this.getCodeScrapInfo(item);
                        if (scrapInfo) {
                            this.items.push({
                                ...scrapInfo,
                                raw: item
                            });
                        } else {
                            let name = 'Unknown Item';
                            if (typeof item === 'string') {
                                name = item;
                            } else if (typeof item.name === 'string') {
                                name = item.name;
                            } else if (item.name && typeof item.name.name === 'string') {
                                name = item.name.name;
                            } else if (item.item_name) {
                                name = item.item_name;
                            }
                            
                            this.items.push({
                                id: item.id || name || 'unknown',
                                name: name,
                                icon: 'ITEM',
                                description: item.description || `Found at: ${item.found_at || 'unknown'}`,
                                raw: item
                            });
                        }
                    } catch (parseError) {
                        console.warn('[Inventory] Failed to parse item:', item, parseError);
                    }
                }
            }
            
            this.refreshGrid();
            this.updateBadge();
            this.checkCodeScrapWinCondition();
            
        } catch (e) {
            console.error('[Inventory] Failed to load from backend:', e);
            this.items = [];
            this.refreshGrid();
        }
        
        this.isLoading = false;
        this.updateLoadingState();
    },

    getCodeScrapInfo(item) {
        if (!item) return null;
        
        let itemName = '';
        let foundAt = '';
        
        if (typeof item === 'string') {
            itemName = item.toLowerCase();
        } else if (typeof item.name === 'string') {
            itemName = item.name.toLowerCase();
        } else if (item.name && typeof item.name.name === 'string') {
            itemName = item.name.name.toLowerCase();
        } else if (item.item_name && typeof item.item_name === 'string') {
            itemName = item.item_name.toLowerCase();
        }
        
        if (typeof item.found_at === 'string') {
            foundAt = item.found_at.toLowerCase();
        } else if (item.name && typeof item.name.found_at === 'string') {
            foundAt = item.name.found_at.toLowerCase();
        }
        
        for (const [minigame, scrap] of Object.entries(CODE_SCRAPS)) {
            if (foundAt.includes(minigame) || 
                foundAt.includes(minigame.replace('_', '')) ||
                itemName.includes(minigame) ||
                itemName.includes(minigame.replace('_', ' ')) ||
                itemName.includes(scrap.name.toLowerCase())) {
                return {
                    ...scrap,
                    minigame: minigame
                };
            }
        }
        
        if (itemName.includes('code scrap') || itemName.includes('codescrap')) {
            if (itemName.includes('crypto') || itemName.includes('miner') || itemName.includes('bitcoin') || itemName.includes('algorithm')) {
                return { ...CODE_SCRAPS.crypto_miner, minigame: 'crypto_miner' };
            }
            if (itemName.includes('laundry') || itemName.includes('wash') || itemName.includes('transaction') || itemName.includes('validator')) {
                return { ...CODE_SCRAPS.laundry, minigame: 'laundry' };
            }
            if (itemName.includes('rat') || itemName.includes('whack') || itemName.includes('security')) {
                return { ...CODE_SCRAPS.whackarat, minigame: 'whackarat' };
            }
            if (itemName.includes('ash') || itemName.includes('trail') || itemName.includes('book') || itemName.includes('page') || itemName.includes('backup')) {
                return { ...CODE_SCRAPS.ash_trail, minigame: 'ash_trail' };
            }
            if (itemName.includes('infinite') || itemName.includes('user') || itemName.includes('password') || itemName.includes('auth')) {
                return { ...CODE_SCRAPS.infinite_user, minigame: 'infinite_user' };
            }
        }
        
        return null;
    },

    hasAllCodeScraps() {
        const collected = this.getCollectedMinigames();
        return collected.size >= 5;
    },

    getCollectedMinigames() {
        const collected = new Set();
        for (const item of this.items) {
            if (item.minigame) {
                collected.add(item.minigame);
            }
        }
        return collected;
    },

    checkCodeScrapWinCondition() {
        if (this.hasAllCodeScraps()) {
            window.dispatchEvent(new CustomEvent('allCodeScrapsCollected', {
                detail: { items: this.items }
            }));
            console.log('[Inventory] All code scraps collected. Player can present to IShowGreen.');
        }
    },

    ensureStyles() {
        if (document.getElementById('inventory-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'inventory-styles';
        style.textContent = `
            #inventory-btn {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #0a5;
                border-radius: 10px;
                cursor: pointer;
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: bold;
                color: #0a5;
                font-family: 'Courier New', monospace;
                box-shadow: 0 4px 15px rgba(0, 170, 85, 0.3);
                transition: all 0.3s ease;
            }
            #inventory-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(0, 170, 85, 0.5);
                border-color: #0f0;
                color: #0f0;
            }
            #inventory-btn .badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #a00;
                color: white;
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: bold;
            }
            #inventory-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 100%);
                border: 2px solid #0a5;
                border-radius: 10px;
                padding: 20px;
                z-index: 9999;
                min-width: 450px;
                max-width: 95vw;
                box-shadow: 0 0 30px rgba(0, 100, 50, 0.4);
                font-family: 'Courier New', monospace;
                display: none;
            }
            #inventory-panel.open {
                display: block;
                animation: inventoryOpen 0.2s ease;
            }
            @keyframes inventoryOpen {
                from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
            #inventory-panel h2 {
                color: #0a5;
                margin: 0 0 5px 0;
                text-align: center;
                font-size: 18px;
                letter-spacing: 2px;
            }
            .inventory-subtitle {
                color: #666;
                font-size: 11px;
                text-align: center;
                margin-bottom: 15px;
            }
            .inventory-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                margin-bottom: 15px;
            }
            .inventory-slot {
                aspect-ratio: 1;
                background: rgba(0, 40, 20, 0.4);
                border: 2px solid #052;
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
                min-height: 70px;
            }
            .inventory-slot:hover {
                border-color: #0a5;
                background: rgba(0, 80, 40, 0.4);
            }
            .inventory-slot.collected {
                border-color: #0a5;
                box-shadow: inset 0 0 15px rgba(0, 170, 85, 0.3);
            }
            .inventory-slot.empty {
                opacity: 0.5;
            }
            .inventory-slot .slot-icon {
                font-size: 10px;
                color: #0a5;
                font-weight: bold;
            }
            .inventory-slot .slot-image {
                width: 80%;
                height: 80%;
                object-fit: contain;
                image-rendering: pixelated;
            }
            .inventory-slot .slot-unknown {
                font-size: 24px;
                color: #333;
            }
            .inventory-progress {
                text-align: center;
                padding: 12px;
                background: rgba(0, 40, 20, 0.4);
                border-radius: 6px;
                margin-bottom: 15px;
                border: 1px solid #052;
            }
            .inventory-progress-title {
                color: #0a5;
                font-size: 12px;
                margin-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .inventory-progress-icons {
                font-size: 11px;
                letter-spacing: 3px;
                color: #0a5;
                font-weight: bold;
            }
            .inventory-progress-text {
                color: #888;
                font-size: 12px;
                margin-top: 8px;
            }
            .inventory-story-hint {
                background: rgba(80, 60, 0, 0.2);
                border: 1px solid #640;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 15px;
                text-align: center;
            }
            .inventory-story-hint p {
                color: #a80;
                font-size: 11px;
                margin: 0;
                line-height: 1.5;
            }
            .inventory-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: #600;
                color: #ccc;
                border: 1px solid #800;
                padding: 4px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                font-family: 'Courier New', monospace;
            }
            .inventory-close:hover {
                background: #800;
            }
            .inventory-loading {
                text-align: center;
                padding: 40px;
                color: #0a5;
                font-size: 12px;
            }
            .item-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.85);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .item-modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #0a5;
                border-radius: 10px;
                padding: 25px;
                max-width: 400px;
                text-align: center;
            }
            .item-modal-content h3 {
                color: #0a5;
                margin: 0 0 15px 0;
                font-size: 16px;
                letter-spacing: 1px;
            }
            .item-modal-content img {
                max-width: 120px;
                margin: 15px auto;
                display: block;
                border: 1px solid #0a5;
                border-radius: 6px;
                image-rendering: pixelated;
            }
            .item-modal-content p {
                color: #999;
                font-size: 12px;
                line-height: 1.6;
                margin: 10px 0;
            }
            .item-modal-content .story-fragment {
                color: #a80;
                font-style: italic;
                font-size: 11px;
                background: rgba(80, 60, 0, 0.2);
                padding: 12px;
                border-radius: 4px;
                margin-top: 15px;
                border-left: 3px solid #640;
                text-align: left;
            }
            .item-modal-content .hint {
                color: #088;
                font-size: 11px;
            }
            .item-modal-content button {
                margin-top: 15px;
                background: #052;
                color: #0a5;
                border: 1px solid #0a5;
                padding: 8px 20px;
                border-radius: 4px;
                cursor: pointer;
                font-family: 'Courier New', monospace;
                font-size: 12px;
            }
            .item-modal-content button:hover {
                background: #0a5;
                color: #000;
            }
        `;
        document.head.appendChild(style);
    },

    renderButton() {
        if (document.getElementById('inventory-btn')) return;
        
        const btn = document.createElement('div');
        btn.id = 'inventory-btn';
        btn.innerHTML = 'DATA<span class="badge" style="display:none">0</span>';
        btn.title = 'Code Fragments [I]';
        btn.onclick = () => this.toggle();
        document.body.appendChild(btn);
    },

    renderPanel() {
        if (document.getElementById('inventory-panel')) return;
        
        const panel = document.createElement('div');
        panel.id = 'inventory-panel';
        panel.innerHTML = `
            <button class="inventory-close" onclick="Inventory.close()">CLOSE</button>
            <h2>THE GREEN MACHINE</h2>
            <div class="inventory-subtitle">Recovery Status</div>
            
            <div class="inventory-story-hint">
                <p>Recover all five code fragments and present them to IShowGreen.</p>
                <p>He may let you leave. Or you can earn 500 crypto to buy your way out.</p>
            </div>
            
            <div class="inventory-progress">
                <div class="inventory-progress-title">Code Fragments</div>
                <div class="inventory-progress-icons" id="progress-icons">[ ] [ ] [ ] [ ] [ ]</div>
                <div class="inventory-progress-text" id="progress-text">0 of 5 recovered</div>
            </div>
            
            <div class="inventory-grid" id="inventory-grid"></div>
            
            <div class="inventory-loading" id="inventory-loading" style="display:none">
                Loading...
            </div>
        `;
        document.body.appendChild(panel);
        
        this.refreshGrid();
    },

    updateBadge() {
        const badge = document.querySelector('#inventory-btn .badge');
        if (badge) {
            const count = this.getCodeScrapCount();
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
            
            if (count >= 5) {
                badge.style.background = '#0a5';
                badge.style.color = '#000';
            }
        }
    },

    refreshGrid() {
        const grid = document.getElementById('inventory-grid');
        if (!grid) return;
        
        const collected = this.getCollectedMinigames();
        
        let html = '';
        for (const [minigame, scrap] of Object.entries(CODE_SCRAPS)) {
            const isCollected = collected.has(minigame);
            html += `
                <div class="inventory-slot ${isCollected ? 'collected' : 'empty'}" 
                     onclick="Inventory.showItemDetail('${minigame}')"
                     title="${isCollected ? scrap.name : 'Unknown'}">
                    ${isCollected 
                        ? `<img class="slot-image" src="${this.baseImagePath}/${scrap.image}" alt="${scrap.name}" onerror="this.outerHTML='<span class=\\'slot-icon\\'>${scrap.icon}</span>'">`
                        : '<span class="slot-unknown">?</span>'
                    }
                </div>
            `;
        }
        
        grid.innerHTML = html;
        this.updateProgress(collected);
        this.updateBadge();
    },

    updateProgress(collected) {
        const icons = document.getElementById('progress-icons');
        const text = document.getElementById('progress-text');
        
        if (icons) {
            const order = ['crypto_miner', 'laundry', 'whackarat', 'ash_trail', 'infinite_user'];
            icons.innerHTML = order.map(m => {
                return collected.has(m) ? '[X]' : '[ ]';
            }).join(' ');
        }
        
        if (text) {
            const count = collected.size;
            if (count >= 5) {
                text.innerHTML = '<span style="color:#0a5">All fragments recovered. Present them to IShowGreen.</span>';
            } else {
                text.textContent = `${count} of 5 recovered`;
            }
        }
    },

    showItemDetail(minigame) {
        const scrap = CODE_SCRAPS[minigame];
        if (!scrap) return;
        
        const collected = this.getCollectedMinigames();
        const isCollected = collected.has(minigame);
        
        const modal = document.createElement('div');
        modal.className = 'item-modal';
        modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="item-modal-content">
                <h3>${scrap.name.toUpperCase()}</h3>
                ${isCollected 
                    ? `<img src="${this.baseImagePath}/${scrap.image}" alt="${scrap.name}" onerror="this.style.display='none'">`
                    : '<div style="font-size: 48px; margin: 20px 0; color: #333;">?</div>'
                }
                <p>${isCollected ? scrap.description : 'Fragment not yet recovered.'}</p>
                ${isCollected 
                    ? `<div class="story-fragment">${scrap.storyFragment}</div>`
                    : `<p class="hint">${scrap.hint}</p>`
                }
                <button onclick="this.closest('.item-modal').remove()">CLOSE</button>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    updateLoadingState() {
        const loading = document.getElementById('inventory-loading');
        const grid = document.getElementById('inventory-grid');
        
        if (loading) loading.style.display = this.isLoading ? 'block' : 'none';
        if (grid) grid.style.display = this.isLoading ? 'none' : 'grid';
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        const panel = document.getElementById('inventory-panel');
        if (panel) {
            panel.classList.add('open');
            this.isOpen = true;
            this.loadFromBackend();
        }
    },

    close() {
        const panel = document.getElementById('inventory-panel');
        if (panel) {
            panel.classList.remove('open');
            this.isOpen = false;
        }
    },

    getItems() {
        return this.items;
    },

    getCodeScrapCount() {
        return this.getCollectedMinigames().size;
    }
};

window.Inventory = Inventory;

export default Inventory;