/**
 * Leaderboard component for DBS2 game
 * Displays a pixel-themed leaderboard with data from backend API
 * Features: refresh button, minimize button, auto-refresh, shows YOUR crypto
 */
class Leaderboard {
    constructor(apiBase = null) {
        this.container = null;
        this.isVisible = true;
        this.isMinimized = false;
        this.currentPlayerData = null; // Store current player's data
        
        if (apiBase) {
            this.apiBase = apiBase;
        } else {
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocalhost) {
                this.apiBase = 'http://localhost:8587/api/dbs2';
            } else {
                this.apiBase = '/api/dbs2';
            }
        }
        this.refreshInterval = null;
        this.isRefreshing = false;
        
        // Default filler data (used as fallback)
        this.leaderboardData = [
            { name: "Cyrus", score: 1250, rank: 1 },
            { name: "Evan", score: 980, rank: 2 },
            { name: "Aryaan", score: 875, rank: 3 },
            { name: "West", score: 720, rank: 4 },
            { name: "Maya", score: 650, rank: 5 }
        ];
    }

    /**
     * Fetch current player's data
     */
    async fetchCurrentPlayer() {
        try {
            const response = await fetch(`${this.apiBase}/player`, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.currentPlayerData = {
                    name: data.user_info?.name || data.user?.name || 'You',
                    uid: data.user_info?.uid || data.user?.uid || '',
                    crypto: data.crypto || 0
                };
                console.log('[Leaderboard] Current player:', this.currentPlayerData);
                return this.currentPlayerData;
            }
        } catch (error) {
            console.log('[Leaderboard] Could not fetch current player (not logged in?):', error.message);
        }
        return null;
    }

    /**
     * Fetch leaderboard data from backend API
     */
    async fetchLeaderboard(limit = 10) {
        try {
            const url = `${this.apiBase}/leaderboard?limit=${limit}`;
            console.log('[Leaderboard] Fetching from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.leaderboard || !Array.isArray(data.leaderboard)) {
                return null;
            }
            
            if (data.leaderboard.length === 0) {
                return null;
            }
            
            const transformedData = data.leaderboard.map(entry => ({
                rank: entry.rank || 0,
                name: entry.user_info?.name || entry.user_info?.uid || 'Unknown',
                uid: entry.user_info?.uid || '',
                score: entry.crypto || 0
            }));
            
            return transformedData;
        } catch (error) {
            console.error('[Leaderboard] Error fetching leaderboard:', error);
            return null;
        }
    }

    /**
     * Initialize and render the leaderboard UI
     */
    async init(autoRefresh = false, refreshIntervalMs = 30000) {
        console.log('[Leaderboard] Initializing...');
        
        const existing = document.getElementById('leaderboard-container');
        if (existing) {
            existing.remove();
        }

        // Fetch both leaderboard and current player data
        const [fetchedData, playerData] = await Promise.all([
            this.fetchLeaderboard(10),
            this.fetchCurrentPlayer()
        ]);
        
        if (fetchedData && fetchedData.length > 0) {
            this.leaderboardData = fetchedData;
        }

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'leaderboard-container';
        this.container.style.cssText = `
            position: fixed;
            top: 75px;
            left: 10px;
            min-width: 280px;
            width: auto;
            max-width: 400px;
            background: rgba(24, 24, 24, 0.95);
            border: 4px solid #666666;
            border-radius: 0;
            padding: 0;
            color: #ffffff;
            font-family: 'Sixtyfour', 'Courier New', monospace;
            font-size: 13px;
            z-index: 1000;
            box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.8), inset 0 0 0 2px rgba(255, 255, 255, 0.1);
            image-rendering: pixelated;
            line-height: 1.2;
            overflow: hidden;
        `;

        // Create header
        const header = document.createElement('div');
        header.id = 'leaderboard-header';
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 12px;
            border-bottom: 3px solid #666666;
            background: rgba(0, 0, 0, 0.3);
        `;

        const title = document.createElement('span');
        title.textContent = '🏆 LEADERS';
        title.style.cssText = `
            font-size: 14px;
            font-weight: bold;
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
            letter-spacing: 1px;
            color: #ffd700;
        `;

        const controls = document.createElement('div');
        controls.style.cssText = `display: flex; gap: 6px;`;

        // Refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'leaderboard-refresh-btn';
        refreshBtn.innerHTML = '🔄';
        refreshBtn.title = 'Refresh';
        refreshBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid #666;
            border-radius: 4px;
            color: #fff;
            cursor: pointer;
            font-size: 12px;
            padding: 4px 6px;
            transition: all 0.2s;
            line-height: 1;
        `;
        refreshBtn.onmouseover = () => {
            refreshBtn.style.background = 'rgba(255, 215, 0, 0.3)';
            refreshBtn.style.borderColor = '#ffd700';
        };
        refreshBtn.onmouseout = () => {
            if (!this.isRefreshing) {
                refreshBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                refreshBtn.style.borderColor = '#666';
            }
        };
        refreshBtn.onclick = () => this.manualRefresh();

        // Minimize button
        const minimizeBtn = document.createElement('button');
        minimizeBtn.id = 'leaderboard-minimize-btn';
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = 'Minimize';
        minimizeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid #666;
            border-radius: 4px;
            color: #fff;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            padding: 2px 8px;
            transition: all 0.2s;
            line-height: 1;
        `;
        minimizeBtn.onmouseover = () => {
            minimizeBtn.style.background = 'rgba(255, 100, 100, 0.3)';
            minimizeBtn.style.borderColor = '#ff6464';
        };
        minimizeBtn.onmouseout = () => {
            minimizeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            minimizeBtn.style.borderColor = '#666';
        };
        minimizeBtn.onclick = () => this.toggleMinimize();

        controls.appendChild(refreshBtn);
        controls.appendChild(minimizeBtn);
        header.appendChild(title);
        header.appendChild(controls);
        this.container.appendChild(header);

        // Create entries container
        const entriesContainer = document.createElement('div');
        entriesContainer.id = 'leaderboard-entries';
        entriesContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding: 10px;
            transition: all 0.3s ease;
        `;

        this.leaderboardData.forEach((entry, index) => {
            const entryElement = this.createEntry(entry, index);
            entriesContainer.appendChild(entryElement);
        });

        this.container.appendChild(entriesContainer);

        // Create YOUR CRYPTO section
        const yourSection = document.createElement('div');
        yourSection.id = 'leaderboard-your-crypto';
        yourSection.style.cssText = `
            border-top: 3px solid #666666;
            padding: 10px;
            background: rgba(0, 255, 100, 0.1);
            transition: all 0.3s ease;
        `;
        
        this.renderYourCrypto(yourSection);
        this.container.appendChild(yourSection);

        document.body.appendChild(this.container);

        if (autoRefresh) {
            this.startAutoRefresh(refreshIntervalMs);
        }
    }

    /**
     * Render the "YOUR CRYPTO" section
     */
    renderYourCrypto(container) {
        if (!container) {
            container = document.getElementById('leaderboard-your-crypto');
        }
        if (!container) return;

        const player = this.currentPlayerData;
        const isInLeaderboard = player && this.leaderboardData.some(e => e.uid === player.uid);
        
        // Find player's rank if they're in the full leaderboard
        let playerRank = '?';
        if (player && isInLeaderboard) {
            const entry = this.leaderboardData.find(e => e.uid === player.uid);
            if (entry) playerRank = entry.rank;
        }

        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
                <div style="white-space: nowrap;">
                    <div style="font-size: 10px; color: #888; margin-bottom: 4px;">YOUR CRYPTO</div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #0f0; font-size: 11px;">${player ? player.name : 'Not logged in'}</span>
                        ${player && isInLeaderboard ? `<span style="color: #ffd700; font-size: 10px;">#${playerRank}</span>` : ''}
                    </div>
                </div>
                <div style="text-align: right; white-space: nowrap;">
                    <span id="your-crypto-value" style="font-size: 18px; font-weight: bold; color: #0f0; text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);">
                        ${player ? player.crypto.toLocaleString() : '---'}
                    </span>
                    <span style="font-size: 12px; color: #0f0;"> 🪙</span>
                </div>
            </div>
        `;
    }

    /**
     * Create a leaderboard entry element
     */
    createEntry(entry, index) {
        const isCurrentPlayer = this.currentPlayerData && entry.uid === this.currentPlayerData.uid;
        
        const entryDiv = document.createElement('div');
        entryDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 6px 8px;
            background: ${isCurrentPlayer ? 'rgba(0, 255, 100, 0.2)' : index === 0 ? 'rgba(255, 215, 0, 0.15)' : index % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)'};
            border: 2px solid ${isCurrentPlayer ? '#0f0' : index === 0 ? '#ffd700' : '#444444'};
            border-left-width: ${isCurrentPlayer || index === 0 ? '4px' : '2px'};
            font-size: 11px;
            line-height: 1.4;
            white-space: nowrap;
        `;

        // Rank
        const rankSpan = document.createElement('span');
        rankSpan.textContent = `#${entry.rank}`;
        rankSpan.style.cssText = `
            font-weight: bold;
            color: ${isCurrentPlayer ? '#0f0' : index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#ffffff'};
            min-width: 28px;
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
            font-size: ${index === 0 ? '12px' : '11px'};
        `;

        // Name
        const nameSpan = document.createElement('span');
        const displayName = entry.name.length > 10 ? entry.name.substring(0, 9) + '…' : entry.name;
        nameSpan.textContent = isCurrentPlayer ? `${displayName} (YOU)` : displayName;
        nameSpan.title = entry.name;
        nameSpan.style.cssText = `
            flex: 1;
            margin-left: 6px;
            text-transform: uppercase;
            font-weight: ${isCurrentPlayer || index === 0 ? 'bold' : 'normal'};
            color: ${isCurrentPlayer ? '#0f0' : index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#ffffff'};
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
            letter-spacing: 0.5px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;

        // Score
        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = entry.score.toLocaleString();
        scoreSpan.style.cssText = `
            font-weight: bold;
            color: ${isCurrentPlayer ? '#0f0' : index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#a0a0a0'};
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
            font-family: 'Courier New', monospace;
            font-size: 11px;
            white-space: nowrap;
        `;

        entryDiv.appendChild(rankSpan);
        entryDiv.appendChild(nameSpan);
        entryDiv.appendChild(scoreSpan);

        return entryDiv;
    }

    /**
     * Manual refresh triggered by button
     */
    async manualRefresh() {
        if (this.isRefreshing) return;
        
        const refreshBtn = document.getElementById('leaderboard-refresh-btn');
        if (refreshBtn) {
            this.isRefreshing = true;
            refreshBtn.style.animation = 'spin 0.5s linear infinite';
            refreshBtn.style.background = 'rgba(255, 215, 0, 0.3)';
            refreshBtn.style.borderColor = '#ffd700';
            
            if (!document.getElementById('leaderboard-spin-style')) {
                const style = document.createElement('style');
                style.id = 'leaderboard-spin-style';
                style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }
        }
        
        await this.refresh();
        
        if (refreshBtn) {
            this.isRefreshing = false;
            refreshBtn.style.animation = '';
            refreshBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            refreshBtn.style.borderColor = '#666';
        }
    }

    /**
     * Toggle minimize state
     */
    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
        
        const entriesContainer = document.getElementById('leaderboard-entries');
        const yourCrypto = document.getElementById('leaderboard-your-crypto');
        const minimizeBtn = document.getElementById('leaderboard-minimize-btn');
        
        if (entriesContainer) {
            entriesContainer.style.maxHeight = this.isMinimized ? '0' : '500px';
            entriesContainer.style.padding = this.isMinimized ? '0 10px' : '10px';
            entriesContainer.style.opacity = this.isMinimized ? '0' : '1';
        }
        
        if (yourCrypto) {
            yourCrypto.style.maxHeight = this.isMinimized ? '0' : '100px';
            yourCrypto.style.padding = this.isMinimized ? '0 10px' : '10px';
            yourCrypto.style.opacity = this.isMinimized ? '0' : '1';
            yourCrypto.style.borderTop = this.isMinimized ? 'none' : '3px solid #666666';
        }
        
        if (minimizeBtn) {
            minimizeBtn.innerHTML = this.isMinimized ? '+' : '−';
            minimizeBtn.title = this.isMinimized ? 'Expand' : 'Minimize';
        }
    }

    /**
     * Update leaderboard data from backend and refresh the display
     */
    async refresh(limit = 10) {
        console.log('[Leaderboard] Refreshing data...');
        
        const [newData, playerData] = await Promise.all([
            this.fetchLeaderboard(limit),
            this.fetchCurrentPlayer()
        ]);
        
        if (newData && newData.length > 0) {
            this.updateData(newData);
        }
        
        // Update YOUR CRYPTO section
        this.renderYourCrypto();
    }

    /**
     * Update leaderboard data
     */
    updateData(newData) {
        this.leaderboardData = newData;
        if (this.container) {
            const entriesContainer = document.getElementById('leaderboard-entries');
            if (entriesContainer) {
                entriesContainer.innerHTML = '';
                this.leaderboardData.forEach((entry, index) => {
                    const entryElement = this.createEntry(entry, index);
                    entriesContainer.appendChild(entryElement);
                });
            }
        }
    }

    /**
     * Start automatic refresh
     */
    startAutoRefresh(intervalMs = 30000) {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, intervalMs);
    }

    /**
     * Stop automatic refresh
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.container) {
            this.container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    show() {
        this.isVisible = true;
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        this.isVisible = false;
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    destroy() {
        this.stopAutoRefresh();
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

export default Leaderboard;