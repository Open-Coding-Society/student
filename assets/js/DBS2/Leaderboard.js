/**
 * Leaderboard component for DBS2 game
 * Displays a pixel-themed leaderboard with data from backend API
 */
class Leaderboard {
    constructor(apiBase = null) {
        this.container = null;
        this.isVisible = true;
        // Default to full backend URL, but allow override
        // Try to detect from window.location or use default backend port
        if (apiBase) {
            this.apiBase = apiBase;
        } else {
            // Check if we're on the same origin as backend (development)
            const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            if (isLocalhost) {
                // Use full URL to backend on port 8587
                this.apiBase = 'http://localhost:8587/api/dbs2';
            } else {
                // For production, use relative URL (assuming same domain or proxy)
                this.apiBase = '/api/dbs2';
            }
        }
        this.refreshInterval = null;
        
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
     * Fetch leaderboard data from backend API
     * @param {number} limit - Maximum number of entries to fetch (default: 10)
     * @returns {Promise<Array>} Array of leaderboard entries
     */
    async fetchLeaderboard(limit = 10) {
        try {
            const url = `${this.apiBase}/leaderboard?limit=${limit}`;
            console.log('[Leaderboard] Fetching from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include', // Include cookies for authentication if needed
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('[Leaderboard] Response status:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[Leaderboard] HTTP error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('[Leaderboard] Received data:', data);
            
            if (!data.leaderboard || !Array.isArray(data.leaderboard)) {
                console.warn('[Leaderboard] Invalid leaderboard data format:', data);
                console.warn('[Leaderboard] Using fallback data');
                return null; // Return null to indicate failure
            }
            
            if (data.leaderboard.length === 0) {
                console.warn('[Leaderboard] Empty leaderboard received');
                return null; // Return null to indicate no data
            }
            
            // Transform backend data format to frontend format
            // Backend: { rank, user_info: { name, uid }, crypto, ... }
            // Frontend: { rank, name, score }
            const transformedData = data.leaderboard.map(entry => ({
                rank: entry.rank || 0,
                name: entry.user_info?.name || entry.user_info?.uid || 'Unknown',
                score: entry.crypto || 0
            }));
            
            console.log('[Leaderboard] Transformed data:', transformedData);
            return transformedData;
        } catch (error) {
            console.error('[Leaderboard] Error fetching leaderboard:', error);
            console.error('[Leaderboard] Error details:', {
                message: error.message,
                stack: error.stack,
                apiBase: this.apiBase
            });
            // Return null to indicate failure
            return null;
        }
    }

    /**
     * Initialize and render the leaderboard UI
     * @param {boolean} autoRefresh - Whether to automatically refresh the leaderboard (default: false)
     * @param {number} refreshIntervalMs - Refresh interval in milliseconds (default: 30000 = 30 seconds)
     */
    async init(autoRefresh = false, refreshIntervalMs = 30000) {
        console.log('[Leaderboard] Initializing...');
        
        // Remove existing leaderboard if present
        const existing = document.getElementById('leaderboard-container');
        if (existing) {
            existing.remove();
        }

        // Fetch real data from backend
        const fetchedData = await this.fetchLeaderboard(10);
        
        // Only use fetched data if it's valid, otherwise keep/use fallback
        if (fetchedData && fetchedData.length > 0) {
            console.log('[Leaderboard] Using fetched data from backend');
            this.leaderboardData = fetchedData;
        } else {
            console.warn('[Leaderboard] No valid data from backend, using fallback data');
            // Keep the existing fallback data
        }
        
        console.log('[Leaderboard] Rendering with data:', this.leaderboardData);

        // Create container
        this.container = document.createElement('div');
        this.container.id = 'leaderboard-container';
        this.container.style.cssText = `
            position: fixed;
            top: 75px;
            left: 10px;
            width: 220px;
            background: rgba(24, 24, 24, 0.95);
            border: 4px solid #666666;
            border-radius: 0;
            padding: 14px;
            color: #ffffff;
            font-family: 'Sixtyfour', 'Courier New', monospace;
            font-size: 13px;
            z-index: 1000;
            box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.8), inset 0 0 0 2px rgba(255, 255, 255, 0.1);
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            line-height: 1.2;
        `;

        // Create title
        const title = document.createElement('div');
        title.textContent = 'LEADERBOARD';
        title.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 14px;
            padding-bottom: 10px;
            border-bottom: 3px solid #666666;
            text-shadow: 3px 3px 0px rgba(0, 0, 0, 1), 1px 1px 0px rgba(255, 255, 255, 0.3);
            letter-spacing: 2px;
            color: #ffd700;
        `;
        this.container.appendChild(title);

        // Create leaderboard entries
        const entriesContainer = document.createElement('div');
        entriesContainer.id = 'leaderboard-entries';
        entriesContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;

        this.leaderboardData.forEach((entry, index) => {
            const entryElement = this.createEntry(entry, index);
            entriesContainer.appendChild(entryElement);
        });

        this.container.appendChild(entriesContainer);
        document.body.appendChild(this.container);

        // Set up auto-refresh if enabled
        if (autoRefresh) {
            this.startAutoRefresh(refreshIntervalMs);
        }
    }

    /**
     * Create a leaderboard entry element
     * @param {Object} entry - Entry data with name, score, and rank
     * @param {number} index - Index in the array
     * @returns {HTMLElement} Entry element
     */
    createEntry(entry, index) {
        const entryDiv = document.createElement('div');
        entryDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 10px;
            background: ${index === 0 ? 'rgba(255, 215, 0, 0.15)' : index % 2 === 0 ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.06)'};
            border: 2px solid ${index === 0 ? '#ffd700' : '#555555'};
            border-left-width: ${index === 0 ? '4px' : '2px'};
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 2px;
        `;

        // Rank badge
        const rankSpan = document.createElement('span');
        rankSpan.textContent = `#${entry.rank}`;
        rankSpan.style.cssText = `
            font-weight: bold;
            color: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#ffffff'};
            min-width: 35px;
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
            font-size: ${index === 0 ? '14px' : '12px'};
        `;

        // Name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = entry.name;
        nameSpan.style.cssText = `
            flex: 1;
            margin-left: 10px;
            text-transform: uppercase;
            font-weight: ${index === 0 ? 'bold' : 'normal'};
            color: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#ffffff'};
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
            letter-spacing: 0.5px;
        `;

        // Score
        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = entry.score.toLocaleString();
        scoreSpan.style.cssText = `
            font-weight: bold;
            color: ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#a0a0a0'};
            text-shadow: 2px 2px 0px rgba(0, 0, 0, 1);
            font-family: 'Courier New', monospace;
        `;

        entryDiv.appendChild(rankSpan);
        entryDiv.appendChild(nameSpan);
        entryDiv.appendChild(scoreSpan);

        return entryDiv;
    }

    /**
     * Update leaderboard data from backend and refresh the display
     * @param {number} limit - Maximum number of entries to fetch (default: 10)
     */
    async refresh(limit = 10) {
        console.log('[Leaderboard] Refreshing data...');
        const newData = await this.fetchLeaderboard(limit);
        
        // Only update if we got valid data
        if (newData && newData.length > 0) {
            console.log('[Leaderboard] Updating with new data');
            this.updateData(newData);
        } else {
            console.warn('[Leaderboard] Refresh failed, keeping current data');
        }
    }

    /**
     * Update leaderboard data (for future use when real data is available)
     * @param {Array} newData - New leaderboard data array
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
     * Start automatic refresh of leaderboard
     * @param {number} intervalMs - Refresh interval in milliseconds
     */
    startAutoRefresh(intervalMs = 30000) {
        this.stopAutoRefresh(); // Clear any existing interval
        this.refreshInterval = setInterval(() => {
            this.refresh();
        }, intervalMs);
    }

    /**
     * Stop automatic refresh of leaderboard
     */
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Toggle leaderboard visibility
     */
    toggle() {
        this.isVisible = !this.isVisible;
        if (this.container) {
            this.container.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    /**
     * Show the leaderboard
     */
    show() {
        this.isVisible = true;
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    /**
     * Hide the leaderboard
     */
    hide() {
        this.isVisible = false;
        if (this.container) {
            this.container.style.display = 'none';
        }
    }

    /**
     * Remove the leaderboard from DOM
     */
    destroy() {
        this.stopAutoRefresh(); // Stop auto-refresh if running
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

export default Leaderboard;



