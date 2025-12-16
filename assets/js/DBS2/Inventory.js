import Prompt from './Prompt.js';
import { getInventory, addInventoryItem, removeInventoryItem } from './StatsManager.js';

/**
 * Inventory System for DBS2
 * Syncs with backend and displays code scraps with descriptions
 */

// Code Scrap definitions - awarded by each minigame
const CODE_SCRAPS = {
    crypto_miner: {
        id: 'codescrap_crypto',
        name: 'Crypto Miner Code Scrap',
        image: 'codescrapCrypto.png',
        icon: '⛏️',
        description: 'A fragment of encrypted mining algorithms. The code hints at underground crypto operations.',
        hint: 'Found by completing the Bitcoin Miner minigame.'
    },
    laundry: {
        id: 'codescrap_laundry',
        name: 'Laundry Code Scrap',
        image: 'codescrapLaundry.png',
        icon: '🧺',
        description: 'Suspicious transaction records hidden in laundry machine logs. Money laundering evidence?',
        hint: 'Found by completing the Laundry minigame.'
    },
    whackarat: {
        id: 'codescrap_rats',
        name: 'Rat Exterminator Code Scrap',
        image: 'codescrapRats.png',
        icon: '🐀',
        description: 'Pest control logs with coded messages. The rats know more than they let on...',
        hint: 'Found by completing the Whack-a-Rat minigame.'
    },
    ash_trail: {
        id: 'codescrap_pages',
        name: 'Ash Trail Code Scrap',
        image: 'codescrapPages.png',
        icon: '📚',
        description: 'Burnt document fragments with partial account numbers. Someone tried to destroy evidence.',
        hint: 'Found by completing the Ash Trail minigame.'
    },
    infinite_user: {
        id: 'codescrap_password',
        name: 'Infinite User Code Scrap',
        image: 'codescrapPassword.png',
        icon: '💻',
        description: 'Login credentials and backdoor access codes. The system has been compromised.',
        hint: 'Found by completing the Infinite User minigame.'
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

    /**
     * Initialize the inventory system
     */
    init(options = {}) {
        if (options.slots) this.slots = options.slots;
        
        // Get base path for images
        const baseurl = document.body.getAttribute('data-baseurl') || '';
        this.baseImagePath = `${baseurl}/images/DBS2`;
        
        this.ensureStyles();
        this.renderButton();
        this.renderPanel();
        
        // Load from backend asynchronously (don't block)
        this.loadFromBackend().catch(e => {
            console.error('[Inventory] Background load failed:', e);
        });
        
        // Keyboard shortcut
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

    /**
     * Load inventory from backend
     */
    async loadFromBackend() {
        this.isLoading = true;
        this.updateLoadingState();
        
        try {
            const inventory = await getInventory();
            console.log('[Inventory] Loaded from backend:', inventory);
            
            // Convert backend format to display format
            this.items = [];
            if (Array.isArray(inventory) && inventory.length > 0) {
                for (const item of inventory) {
                    if (!item) continue;
                    
                    try {
                        // Check if it's a code scrap
                        const scrapInfo = this.getCodeScrapInfo(item);
                        if (scrapInfo) {
                            this.items.push({
                                ...scrapInfo,
                                raw: item
                            });
                        } else {
                            // Regular item - extract name safely
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
                                icon: '📦',
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
        } catch (e) {
            console.error('[Inventory] Failed to load from backend:', e);
            // Show empty state instead of loading forever
            this.items = [];
            this.refreshGrid();
        }
        
        this.isLoading = false;
        this.updateLoadingState();
    },

    /**
     * Check if an item is a code scrap and return its info
     */
    getCodeScrapInfo(item) {
        if (!item) return null;
        
        // Handle various item formats from backend
        let itemName = '';
        let foundAt = '';
        
        // Get item name (could be string or nested object)
        if (typeof item === 'string') {
            itemName = item.toLowerCase();
        } else if (typeof item.name === 'string') {
            itemName = item.name.toLowerCase();
        } else if (item.name && typeof item.name.name === 'string') {
            // Handle nested {name: {name: "..."}} format
            itemName = item.name.name.toLowerCase();
        } else if (item.item_name && typeof item.item_name === 'string') {
            itemName = item.item_name.toLowerCase();
        }
        
        // Get found_at
        if (typeof item.found_at === 'string') {
            foundAt = item.found_at.toLowerCase();
        } else if (item.name && typeof item.name.found_at === 'string') {
            foundAt = item.name.found_at.toLowerCase();
        }
        
        console.log('[Inventory] Parsing item:', { itemName, foundAt, raw: item });
        
        // Check each code scrap type
        for (const [minigame, scrap] of Object.entries(CODE_SCRAPS)) {
            // Match by found_at location or by name containing the minigame
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
        
        // Check for generic "code scrap" items
        if (itemName.includes('code scrap') || itemName.includes('codescrap')) {
            // Try to determine which one based on other clues
            if (itemName.includes('crypto') || itemName.includes('miner') || itemName.includes('bitcoin')) {
                return { ...CODE_SCRAPS.crypto_miner, minigame: 'crypto_miner' };
            }
            if (itemName.includes('laundry') || itemName.includes('wash')) {
                return { ...CODE_SCRAPS.laundry, minigame: 'laundry' };
            }
            if (itemName.includes('rat') || itemName.includes('whack')) {
                return { ...CODE_SCRAPS.whackarat, minigame: 'whackarat' };
            }
            if (itemName.includes('ash') || itemName.includes('trail') || itemName.includes('book') || itemName.includes('page')) {
                return { ...CODE_SCRAPS.ash_trail, minigame: 'ash_trail' };
            }
            if (itemName.includes('infinite') || itemName.includes('user') || itemName.includes('password')) {
                return { ...CODE_SCRAPS.infinite_user, minigame: 'infinite_user' };
            }
        }
        
        return null;
    },

    /**
     * Add styles to page
     */
    ensureStyles() {
        if (document.getElementById('inventory-styles')) return;
        const style = document.createElement('style');
        style.id = 'inventory-styles';
        style.textContent = `
            #inventoryButton {
                position: fixed;
                bottom: 18px;
                right: 18px;
                width: 50px;
                height: 50px;
                border-radius: 8px;
                background: linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(50,50,50,0.95) 100%);
                color: #ffd700;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                z-index: 10050;
                border: 2px solid #666;
                box-shadow: 3px 3px 0px rgba(0,0,0,0.5);
                font-size: 24px;
                transition: all 0.2s;
            }
            #inventoryButton:hover {
                background: linear-gradient(135deg, rgba(50,50,50,0.95) 0%, rgba(70,70,70,0.95) 100%);
                border-color: #ffd700;
                transform: scale(1.05);
            }
            #inventoryButton .badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4444;
                color: white;
                font-size: 12px;
                font-weight: bold;
                padding: 2px 6px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }
            
            #inventoryPanel {
                position: fixed;
                bottom: 80px;
                right: 18px;
                width: 420px;
                max-width: 95vw;
                max-height: 70vh;
                background: linear-gradient(135deg, rgba(20,20,30,0.98) 0%, rgba(30,30,40,0.98) 100%);
                color: #fff;
                border-radius: 12px;
                border: 3px solid #666;
                box-shadow: 0 8px 32px rgba(0,0,0,0.7);
                z-index: 10050;
                display: none;
                overflow: hidden;
            }
            
            #inventoryPanel .inv-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 16px;
                background: rgba(0,0,0,0.3);
                border-bottom: 2px solid #444;
            }
            
            #inventoryPanel .inv-title {
                font-size: 18px;
                font-weight: bold;
                color: #ffd700;
                text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
            }
            
            #inventoryPanel .inv-close {
                background: rgba(255,100,100,0.2);
                border: 2px solid #ff6464;
                color: #ff6464;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                transition: all 0.2s;
            }
            #inventoryPanel .inv-close:hover {
                background: rgba(255,100,100,0.4);
            }
            
            #inventoryPanel .inv-content {
                padding: 16px;
                overflow-y: auto;
                max-height: calc(70vh - 60px);
            }
            
            #inventoryPanel .inv-section-title {
                font-size: 14px;
                color: #888;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #333;
            }
            
            #inventoryPanel .inv-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .inventory-slot {
                aspect-ratio: 1;
                position: relative;
                background: rgba(255,255,255,0.03);
                border-radius: 8px;
                border: 2px solid #333;
                cursor: pointer;
                transition: all 0.2s;
                overflow: hidden;
            }
            .inventory-slot:hover {
                border-color: #ffd700;
                transform: scale(1.05);
                z-index: 1;
            }
            .inventory-slot.empty {
                opacity: 0.4;
                cursor: default;
            }
            .inventory-slot.empty:hover {
                border-color: #333;
                transform: none;
            }
            .inventory-slot.code-scrap {
                border-color: #0f0;
                background: rgba(0,255,0,0.1);
            }
            .inventory-slot.code-scrap:hover {
                border-color: #0f0;
                box-shadow: 0 0 10px rgba(0,255,0,0.3);
            }
            
            .inventory-slot .slot-content {
                position: absolute;
                inset: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }
            .inventory-slot .slot-content img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
            }
            
            .inventory-slot .slot-label {
                position: absolute;
                bottom: 2px;
                left: 2px;
                right: 2px;
                font-size: 8px;
                text-align: center;
                color: #aaa;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                background: rgba(0,0,0,0.7);
                padding: 2px;
                border-radius: 0 0 4px 4px;
            }
            
            /* Item Detail Modal */
            #itemDetailModal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10060;
                display: none;
                align-items: center;
                justify-content: center;
            }
            #itemDetailModal.show {
                display: flex;
            }
            #itemDetailModal .modal-content {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 3px solid #0f0;
                border-radius: 12px;
                padding: 24px;
                max-width: 450px;
                width: 90%;
                text-align: center;
                box-shadow: 0 0 30px rgba(0,255,0,0.3);
            }
            #itemDetailModal .modal-image {
                max-width: 200px;
                max-height: 150px;
                margin: 16px auto;
                border: 2px solid #0f0;
                border-radius: 8px;
            }
            #itemDetailModal .modal-title {
                font-size: 20px;
                font-weight: bold;
                color: #0f0;
                margin-bottom: 12px;
            }
            #itemDetailModal .modal-description {
                font-size: 14px;
                color: #ccc;
                line-height: 1.6;
                margin-bottom: 16px;
            }
            #itemDetailModal .modal-hint {
                font-size: 12px;
                color: #888;
                font-style: italic;
            }
            #itemDetailModal .modal-close {
                margin-top: 20px;
                background: linear-gradient(135deg, #0f0 0%, #0a0 100%);
                color: #000;
                border: none;
                padding: 12px 32px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
                font-size: 14px;
                transition: all 0.2s;
            }
            #itemDetailModal .modal-close:hover {
                transform: scale(1.05);
                box-shadow: 0 0 15px rgba(0,255,0,0.5);
            }
            
            /* Loading state */
            .inv-loading {
                text-align: center;
                padding: 40px;
                color: #888;
            }
            .inv-loading .spinner {
                display: inline-block;
                width: 30px;
                height: 30px;
                border: 3px solid #333;
                border-top-color: #ffd700;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* Empty state */
            .inv-empty {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }
            .inv-empty-icon {
                font-size: 48px;
                margin-bottom: 16px;
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Render the inventory button
     */
    renderButton() {
        if (document.getElementById('inventoryButton')) return;
        const btn = document.createElement('div');
        btn.id = 'inventoryButton';
        btn.title = 'Inventory (I)';
        btn.innerHTML = '🎒<span class="badge" id="invBadge" style="display:none;">0</span>';
        btn.addEventListener('click', () => this.toggle());
        document.body.appendChild(btn);
        this.updateBadge();
    },

    /**
     * Update the item count badge
     */
    updateBadge() {
        const badge = document.getElementById('invBadge');
        if (!badge) return;
        
        const count = this.items.filter(i => i).length;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    },

    /**
     * Render the inventory panel
     */
    renderPanel() {
        let panel = document.getElementById('inventoryPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'inventoryPanel';
            panel.innerHTML = `
                <div class="inv-header">
                    <div class="inv-title">🎒 Inventory</div>
                    <div class="inv-close" id="invClose">✕ Close</div>
                </div>
                <div class="inv-content" id="invContent">
                    <div class="inv-loading"><div class="spinner"></div><p>Loading...</p></div>
                </div>
            `;
            document.body.appendChild(panel);
            document.getElementById('invClose').addEventListener('click', () => this.close());
        }
        
        // Create item detail modal
        if (!document.getElementById('itemDetailModal')) {
            const modal = document.createElement('div');
            modal.id = 'itemDetailModal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-icon" id="modalIcon"></div>
                    <img class="modal-image" id="modalImage" src="" alt="" style="display:none;">
                    <div class="modal-title" id="modalTitle"></div>
                    <div class="modal-description" id="modalDescription"></div>
                    <div class="modal-hint" id="modalHint"></div>
                    <button class="modal-close" id="modalClose">OK</button>
                </div>
            `;
            document.body.appendChild(modal);
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeItemDetail();
            });
            document.getElementById('modalClose').addEventListener('click', () => this.closeItemDetail());
        }
        
        this.refreshGrid();
    },

    /**
     * Update loading state
     */
    updateLoadingState() {
        const content = document.getElementById('invContent');
        if (!content) return;
        
        if (this.isLoading) {
            content.innerHTML = '<div class="inv-loading"><div class="spinner"></div><p>Loading inventory...</p></div>';
        }
    },

    /**
     * Refresh the inventory grid
     */
    refreshGrid() {
        const content = document.getElementById('invContent');
        if (!content) return;
        
        // Count code scraps
        const codeScraps = this.items.filter(i => i && i.minigame);
        const otherItems = this.items.filter(i => i && !i.minigame);
        
        let html = '';
        
        // Code Scraps Section
        html += `<div class="inv-section-title">📜 Code Scraps (${codeScraps.length}/5)</div>`;
        html += '<div class="inv-grid">';
        
        // Show all 5 code scrap slots
        const minigames = ['crypto_miner', 'laundry', 'whackarat', 'ash_trail', 'infinite_user'];
        for (const mg of minigames) {
            const scrap = codeScraps.find(s => s.minigame === mg);
            const scrapDef = CODE_SCRAPS[mg];
            
            if (scrap) {
                html += `
                    <div class="inventory-slot code-scrap" data-minigame="${mg}" onclick="Inventory.showItemDetail('${mg}')">
                        <div class="slot-content">
                            <img src="${this.baseImagePath}/${scrapDef.image}" alt="${scrapDef.name}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                            <span style="display:none; font-size:28px;">${scrapDef.icon}</span>
                        </div>
                        <div class="slot-label">${scrapDef.icon}</div>
                    </div>
                `;
            } else {
                html += `
                    <div class="inventory-slot empty" title="${scrapDef.hint}">
                        <div class="slot-content" style="opacity:0.3; font-size:28px;">?</div>
                        <div class="slot-label">${scrapDef.icon}</div>
                    </div>
                `;
            }
        }
        html += '</div>';
        
        // Other Items Section
        if (otherItems.length > 0) {
            html += `<div class="inv-section-title">📦 Other Items (${otherItems.length})</div>`;
            html += '<div class="inv-grid">';
            for (let i = 0; i < otherItems.length; i++) {
                const item = otherItems[i];
                html += `
                    <div class="inventory-slot" data-index="${i}" onclick="Inventory.showOtherItemDetail(${i})">
                        <div class="slot-content">${item.icon || '📦'}</div>
                        <div class="slot-label">${item.name.substring(0, 10)}</div>
                    </div>
                `;
            }
            html += '</div>';
        }
        
        // Progress indicator
        html += `
            <div style="margin-top: 20px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: center;">
                <div style="color: #888; font-size: 12px; margin-bottom: 8px;">Collection Progress</div>
                <div style="display: flex; justify-content: center; gap: 8px;">
                    ${minigames.map(mg => {
                        const has = codeScraps.some(s => s.minigame === mg);
                        return `<span style="font-size: 20px; opacity: ${has ? 1 : 0.3};" title="${CODE_SCRAPS[mg].name}">${CODE_SCRAPS[mg].icon}</span>`;
                    }).join('')}
                </div>
                <div style="color: ${codeScraps.length === 5 ? '#0f0' : '#ffd700'}; font-size: 14px; margin-top: 8px;">
                    ${codeScraps.length === 5 ? '✨ All Code Scraps Collected! ✨' : `${codeScraps.length}/5 Code Scraps`}
                </div>
            </div>
        `;
        
        content.innerHTML = html;
        this.updateBadge();
    },

    /**
     * Show item detail modal for code scraps
     */
    showItemDetail(minigame) {
        const scrap = CODE_SCRAPS[minigame];
        if (!scrap) return;
        
        const modal = document.getElementById('itemDetailModal');
        const modalIcon = document.getElementById('modalIcon');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalHint = document.getElementById('modalHint');
        
        modalIcon.innerHTML = `<span style="font-size: 48px;">${scrap.icon}</span>`;
        modalImage.src = `${this.baseImagePath}/${scrap.image}`;
        modalImage.style.display = 'block';
        modalImage.onerror = () => { modalImage.style.display = 'none'; };
        modalTitle.textContent = scrap.name;
        modalDescription.textContent = scrap.description;
        modalHint.textContent = scrap.hint;
        
        modal.classList.add('show');
    },

    /**
     * Show item detail for other items
     */
    showOtherItemDetail(index) {
        const otherItems = this.items.filter(i => i && !i.minigame);
        const item = otherItems[index];
        if (!item) return;
        
        const modal = document.getElementById('itemDetailModal');
        const modalIcon = document.getElementById('modalIcon');
        const modalImage = document.getElementById('modalImage');
        const modalTitle = document.getElementById('modalTitle');
        const modalDescription = document.getElementById('modalDescription');
        const modalHint = document.getElementById('modalHint');
        
        modalIcon.innerHTML = `<span style="font-size: 48px;">${item.icon || '📦'}</span>`;
        modalImage.style.display = 'none';
        modalTitle.textContent = item.name;
        modalDescription.textContent = item.description || 'A mysterious item.';
        modalHint.textContent = item.raw?.found_at ? `Found at: ${item.raw.found_at}` : '';
        
        modal.classList.add('show');
    },

    /**
     * Close item detail modal
     */
    closeItemDetail() {
        const modal = document.getElementById('itemDetailModal');
        if (modal) modal.classList.remove('show');
    },

    /**
     * Open inventory panel
     */
    open() {
        const panel = document.getElementById('inventoryPanel');
        if (panel) panel.style.display = 'block';
        this.isOpen = true;
        this.loadFromBackend(); // Refresh data when opening
    },

    /**
     * Close inventory panel
     */
    close() {
        const panel = document.getElementById('inventoryPanel');
        if (panel) panel.style.display = 'none';
        this.isOpen = false;
        this.closeItemDetail();
    },

    /**
     * Toggle inventory panel
     */
    toggle() {
        if (this.isOpen) this.close(); else this.open();
    },

    /**
     * Add item (for local use, syncs to backend via StatsManager)
     */
    async addItem(item) {
        try {
            await addInventoryItem(item);
            await this.loadFromBackend();
            return true;
        } catch (e) {
            console.error('[Inventory] Failed to add item:', e);
            return false;
        }
    },

    /**
     * Get all items
     */
    getItems() {
        return this.items.slice();
    },

    /**
     * Check if player has a specific code scrap
     */
    hasCodeScrap(minigame) {
        return this.items.some(i => i && i.minigame === minigame);
    },

    /**
     * Get count of code scraps
     */
    getCodeScrapCount() {
        return this.items.filter(i => i && i.minigame).length;
    },

    /**
     * Set owner for backward compatibility with Player.js
     */
    setOwner(owner) {
        this.owner = owner || null;
        if (this.owner) {
            this.owner.inventory = this.getItems();
        }
    }
};

// Make available globally for onclick handlers
window.Inventory = Inventory;

export default Inventory;