// Lightweight Inventory manager and UI
// Designed to be backend-friendly later: uses a simple data model and localStorage persistence for now.

const STORAGE_KEY = 'playerInventory_v1';

const Inventory = {
    slots: 20, // default slots
    items: [], // array of item objects: { id, name, icon }
    isOpen: false,
    owner: null, // reference to player object

    init(options = {}) {
        if (options.slots) this.slots = options.slots;
        this.load();
        this.ensureStyles();
        this.renderButton();
        this.renderPanel();
        // keyboard shortcut
        window.addEventListener('keydown', (e) => {
            if (e.key === 'i' || e.key === 'I') {
                this.toggle();
            }
        });
    },

    /**
     * Attach the inventory to a player/owner object.
     * The owner will receive an `inventory` property that mirrors the Inventory items array.
     */
    setOwner(owner) {
        this.owner = owner || null;
        if (this.owner) {
            // expose a live reference for convenience
            this.owner.inventory = this.getItems();
        }
    },

    ensureStyles() {
        if (document.getElementById('inventory-styles')) return;
        const style = document.createElement('style');
        style.id = 'inventory-styles';
        style.textContent = `
            #inventoryButton { position: fixed; bottom: 18px; right: 18px; width: 44px; height: 44px; border-radius: 8px; background: rgba(0,0,0,0.6); color: #fff; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index: 10050; border: 1px solid rgba(255,255,255,0.08);} 
            #inventoryButton:hover { background: rgba(0,0,0,0.8);} 
            #inventoryPanel { position: fixed; bottom: 72px; right: 18px; width: 360px; max-width: 90vw; height: 320px; background: rgba(10,10,10,0.95); color: #fff; border-radius: 8px; box-shadow: 0 6px 24px rgba(0,0,0,0.6); padding: 12px; z-index: 10050; display: none; }
            #inventoryPanel .inv-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
            #inventoryPanel .inv-grid { display:grid; grid-template-columns: repeat(5, 1fr); grid-gap:8px; }
            .inventory-slot { width:100%; padding-top:100%; position:relative; background: rgba(255,255,255,0.03); border-radius:6px; border:1px dashed rgba(255,255,255,0.03); overflow:hidden; }
            .inventory-slot .content { position:absolute; inset:6%; display:flex; align-items:center; justify-content:center; font-size:0.9rem; text-align:center; }
            .inventory-slot.empty { opacity:0.5; }
            .inventory-controls { display:flex; gap:8px; }
            .inventory-small { font-size:0.85rem; padding:6px 8px; background: rgba(255,255,255,0.04); border-radius:6px; cursor:pointer; }
        `;
        document.head.appendChild(style);
    },

    renderButton() {
        if (document.getElementById('inventoryButton')) return;
        const btn = document.createElement('div');
        btn.id = 'inventoryButton';
        btn.title = 'Inventory (I)';
        btn.innerHTML = '<span style="font-weight:700">I</span>';
        btn.addEventListener('click', () => this.toggle());
        document.body.appendChild(btn);
    },

    renderPanel() {
        let panel = document.getElementById('inventoryPanel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'inventoryPanel';
            panel.innerHTML = `
                <div class="inv-header">
                    <div style="font-weight:700">Inventory</div>
                    <div class="inventory-controls">
                        <div id="invClose" class="inventory-small">Close</div>
                        <div id="invClear" class="inventory-small">Clear</div>
                    </div>
                </div>
                <div class="inv-grid" id="invGrid"></div>
            `;
            document.body.appendChild(panel);
            document.getElementById('invClose').addEventListener('click', () => this.close());
            document.getElementById('invClear').addEventListener('click', () => { if(confirm('Clear inventory?')){ this.clear(); }});
        }
        this.refreshGrid();
    },

    refreshGrid() {
        const grid = document.getElementById('invGrid');
        if (!grid) return;
        grid.innerHTML = '';
        for (let i = 0; i < this.slots; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            if (!this.items[i]) slot.classList.add('empty');
            slot.dataset.index = i;
            const content = document.createElement('div');
            content.className = 'content';
            if (this.items[i]) {
                const it = this.items[i];
                if (it.icon) {
                    const img = document.createElement('img');
                    img.src = it.icon;
                    img.style.maxWidth = '100%';
                    img.style.maxHeight = '100%';
                    content.appendChild(img);
                } else {
                    content.innerText = it.name || 'Item';
                }
            } else {
                content.innerText = '';
            }
            slot.appendChild(content);
            slot.addEventListener('click', (e) => this.slotClicked(i));
            grid.appendChild(slot);
        }
        // keep owner in sync with UI representation
        if (this.owner) this.owner.inventory = this.getItems();
    },

    slotClicked(index) {
        const item = this.items[index];
        if (item) {
            if (confirm(`Use or remove '${item.name}'? Press OK to remove.`)) {
                this.removeItem(index);
            }
        } else {
            alert('Empty slot. Items will appear here when collected.');
        }
    },

    open() {
        const panel = document.getElementById('inventoryPanel');
        if (panel) panel.style.display = 'block';
        this.isOpen = true;
    },

    close() {
        const panel = document.getElementById('inventoryPanel');
        if (panel) panel.style.display = 'none';
        this.isOpen = false;
    },

    toggle() {
        if (this.isOpen) this.close(); else this.open();
    },

    addItem(item) {
        // find first empty slot
        for (let i = 0; i < this.slots; i++) {
            if (!this.items[i]) {
                this.items[i] = item;
                this.save();
                this.refreshGrid();
                if (this.owner) this.owner.inventory = this.getItems();
                return i;
            }
        }
        alert('Inventory full');
        return -1;
    },

    removeItem(index) {
        if (index < 0 || index >= this.slots) return false;
        this.items[index] = null;
        this.save();
        this.refreshGrid();
        if (this.owner) this.owner.inventory = this.getItems();
        return true;
    },

    getItems() {
        return this.items.slice();
    },

    setItems(itemsArray) {
        this.items = itemsArray.slice(0, this.slots);
        while (this.items.length < this.slots) this.items.push(null);
        this.save();
        this.refreshGrid();
        if (this.owner) this.owner.inventory = this.getItems();
    },

    clear() {
        this.items = new Array(this.slots).fill(null);
        this.save();
        this.refreshGrid();
    },

    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
            window.playerInventory = this.getItems();
            if (this.owner) this.owner.inventory = this.getItems();
        } catch (e) {
            console.error('Error saving inventory', e);
        }
    },

    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.items = parsed.concat();
                // Ensure length
                while (this.items.length < this.slots) this.items.push(null);
                return;
            }
        } catch (e) {
            console.error('Error loading inventory', e);
        }
        this.items = new Array(this.slots).fill(null);
    }
};

export default Inventory;
