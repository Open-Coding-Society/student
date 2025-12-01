/**
 * Leaderboard component for DBS2 game
 * Displays a pixel-themed leaderboard with filler data
 */
class Leaderboard {
    constructor() {
        this.container = null;
        this.isVisible = true;
        // Filler leaderboard data
        this.leaderboardData = [
            { name: "Cyrus", score: 1250, rank: 1 },
            { name: "Evan", score: 980, rank: 2 },
            { name: "Aryaan", score: 875, rank: 3 },
            { name: "West", score: 720, rank: 4 },
            { name: "Maya", score: 650, rank: 5 }
        ];
    }

    /**
     * Initialize and render the leaderboard UI
     */
    init() {
        // Remove existing leaderboard if present
        const existing = document.getElementById('leaderboard-container');
        if (existing) {
            existing.remove();
        }

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
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
    }
}

export default Leaderboard;

