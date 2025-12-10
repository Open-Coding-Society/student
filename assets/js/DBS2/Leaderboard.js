/**
 * Leaderboard component for DBS2 game
 * Fetches real data from backend API, falls back to filler data if not available
 */
class Leaderboard {
    constructor() {
        this.container = null;
        this.isVisible = true;
        // Filler leaderboard data (used as fallback)
        this.leaderboardData = [
            { name: "Loading...", score: 0, rank: 1 }
        ];
    }

    /**
     * Initialize and render the leaderboard UI
     */
    async init() {
        // Remove existing leaderboard if present
        const existing = document.getElementById('leaderboard-container');
        if (existing) {
            existing.remove();
        }

        // Try to fetch real data from API
        await this.fetchLeaderboardData();

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

        // Create refresh button
        const refreshBtn = document.createElement('div');
        refreshBtn.textContent = '↻ Refresh';
        refreshBtn.style.cssText = `
            font-size: 10px;
            text-align: center;
            margin-bottom: 10px;
            padding: 4px 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid #444;
            cursor: pointer;
            color: #888;
        `;
        refreshBtn.addEventListener('click', () => this.refresh());
        refreshBtn.addEventListener('mouseenter', () => {
            refreshBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            refreshBtn.style.color = '#fff';
        });
        refreshBtn.addEventListener('mouseleave', () => {
            refreshBtn.style.background = 'rgba(255, 255, 255, 0.05)';
            refreshBtn.style.color = '#888';
        });
        this.container.appendChild(refreshBtn);

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
    }

    /**
     * Fetch leaderboard data from API
     */
    async fetchLeaderboardData() {
        try {
            // Check if DBS2API is available
            if (typeof window.DBS2API !== 'undefined') {
                const data = await window.DBS2API.getLeaderboard(5);
                if (data && data.length > 0) {
                    this.leaderboardData = data.map((player, index) => ({
                        name: player.user_info?.name || player.user_info?.uid || 'Unknown',
                        score: player.crypto || 0,
                        rank: index + 1,
                        completed: player.completed_all || false
                    }));
                    console.log('Leaderboard loaded from API:', this.leaderboardData);
                    return;
                }
            }
        } catch (e) {
            console.log('Could not fetch leaderboard from API, using fallback data:', e);
        }

        // Fallback data if API not available
        this.leaderboardData = [
            { name: "West", score: 1250, rank: 1 },
            { name: "Cyrus", score: 980, rank: 2 },
            { name: "Maya", score: 750, rank: 3 },
            { name: "???", score: 0, rank: 4 },
            { name: "???", score: 0, rank: 5 }
        ];
    }

    /**
     * Refresh leaderboard data
     */
    async refresh() {
        const refreshBtn = this.container?.querySelector('div:nth-child(2)');
        if (refreshBtn) {
            refreshBtn.textContent = '↻ Loading...';
        }
        
        await this.fetchLeaderboardData();
        this.updateData(this.leaderboardData);
        
        if (refreshBtn) {
            refreshBtn.textContent = '↻ Refresh';
        }
    }

    /**
     * Create a leaderboard entry element
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

        // Name (with completion indicator)
        const nameSpan = document.createElement('span');
        const displayName = entry.name.length > 8 ? entry.name.substring(0, 8) + '...' : entry.name;
        nameSpan.textContent = displayName + (entry.completed ? ' ✓' : '');
        nameSpan.title = entry.name + (entry.completed ? ' (All minigames completed!)' : '');
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
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

export default Leaderboard;