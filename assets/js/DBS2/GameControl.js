import GameEnv from './GameEnv.js';
import GameLevelBasement from './GameLevelBasement.js';
import Inventory from './Inventory.js';
import Prompt from './Prompt.js';
import Leaderboard from './Leaderboard.js';

console.log("GameControl.js loaded!");


/**
 * The GameControl object manages the game.
 * 
 * This code uses the JavaScript "object literal pattern" which is nice for centralizing control logic.
 * 
 * The object literal pattern is a simple way to create singleton objects in JavaScript.
 * It allows for easy grouping of related functions and properties, making the code more organized and readable.
 * In the context of GameControl, this pattern helps centralize the game's control logic, 
 * making it easier to manage game states, handle events, and maintain the overall flow of the game.
 * 
 * @type {Object}
 * @property {Player} turtle - The player object.
 * @property {Player} fish 
 * @property {function} start - Initialize game assets and start the game loop.
 * @property {function} gameLoop - The game loop.
 * @property {function} resize - Resize the canvas and player object when the window is resized.
 */
const GameControl = {
    intervalId: null,
    localStorageTimeKey: "localTimes",
    currentPass: 0,
    currentLevelIndex: 0,
    levelClasses: [],
    path: '',
    leaderboard: null,
    cryptoWinTriggered: false,
    scrapWinTriggered: false,

    start: function(path) {
        console.log("GameControl.start() called with path:", path);
        try {
            console.log("GameControl: Creating GameEnv...");
            GameEnv.create();
            console.log("GameControl: GameEnv created successfully");
            console.log("GameControl: Canvas dimensions:", GameEnv.innerWidth, "x", GameEnv.innerHeight);
        } catch (error) {
            console.error("GameControl: Failed to create GameEnv:", error);
            throw error;
        }
        // Initialize inventory UI
        try { Inventory.init(); } catch (e) { console.error('Inventory init failed', e); }
        
        // Initialize win condition listeners
        this.initWinConditionListeners();
        
        this.levelClasses = [GameLevelBasement];
        this.currentLevelIndex = 0;
        this.path = path;
        this.addExitKeyListener();
        console.log("GameControl: Loading level...");
        this.loadLevel();
        console.log("GameControl: Level loaded");
    },
    
    loadLevel: function() {
        if (this.currentLevelIndex >= this.levelClasses.length) {
            this.stopTimer();
            return;
        }
        GameEnv.continueLevel = true;
        GameEnv.gameObjects = [];
        this.currentPass = 0;
        const LevelClass = this.levelClasses[this.currentLevelIndex];
        const levelInstance = new LevelClass(this.path);
        this.loadLevelObjects(levelInstance);
    },
    
    loadLevelObjects: function(gameInstance) {
        console.log("GameControl: Initializing stats UI and leaderboard...");
        this.initStatsUI();
        this.initLeaderboard();
        console.log("GameControl: Creating game objects, count:", gameInstance.objects.length);
        // Instantiate the game objects
        for (let object of gameInstance.objects) {
            if (!object.data) object.data = {};
            try {
                console.log("GameControl: Creating object:", object.class.name, "with data:", object.data);
                new object.class(object.data);
            } catch (error) {
                console.error("GameControl: Error creating object:", error, object);
            }
        }
        console.log("GameControl: Game objects created, total:", GameEnv.gameObjects.length);
        // Start the game loop
        console.log("GameControl: Starting game loop...");
        this.gameLoop();
    },

    gameLoop: function() {
        // Base case: leave the game loop 
        if (!GameEnv.continueLevel) {
            this.handleLevelEnd();
            return;
        }
        // Nominal case: update the game objects 
        if (!GameEnv.ctx) {
            console.error("GameControl: GameEnv.ctx is null, cannot render!");
            return;
        }
        GameEnv.clear();
        for (let object of GameEnv.gameObjects) {
            try {
                object.update();  // Update the game objects
            } catch (error) {
                console.error("GameControl: Error updating game object:", error, object);
            }
        }
        this.handleLevelStart();
        // Recursively call this function at animation frame rate
        requestAnimationFrame(this.gameLoop.bind(this));
    },

    handleLevelStart: function() {
        // Story intro sequence
        if (this.currentLevelIndex === 0) {
            if (this.currentPass === 10) {
                try { 
                    Prompt.showDialoguePopup('???', 'You wake up in a basement. The door is locked.'); 
                } catch(e){ console.warn('Prompt not available', e); }
            }
            if (this.currentPass === 200) {
                try { 
                    Prompt.showDialoguePopup('IShowGreen', 'Good. You are awake. I need your help.'); 
                } catch(e){ console.warn('Prompt not available', e); }
            }
            if (this.currentPass === 400) {
                try { 
                    Prompt.showDialoguePopup('IShowGreen', 'I wrote a program called The Green Machine. Every line by hand. On paper.'); 
                } catch(e){ console.warn('Prompt not available', e); }
            }
            if (this.currentPass === 600) {
                try { 
                    Prompt.showDialoguePopup('IShowGreen', 'I lost the pages. Five of them. One in the wash. One burned. One the rats took. The others... somewhere in here.'); 
                } catch(e){ console.warn('Prompt not available', e); }
            }
            if (this.currentPass === 800) {
                try { 
                    Prompt.showDialoguePopup('IShowGreen', 'Find all five pages and bring them to me. Or earn 500 crypto and buy your way out. WASD to move. E to interact.'); 
                } catch(e){ console.warn('Prompt not available', e); }
            }
            
            // Check win conditions every 60 frames
            if (this.currentPass > 100 && this.currentPass % 60 === 0) {
                this.checkWinConditions();
            }
        }
        
        this.currentPass++;
    },

    checkWinConditions: function() {
        // Check crypto win condition (500 crypto)
        const cryptoEl = document.getElementById('balance');
        if (cryptoEl) {
            const crypto = parseInt(cryptoEl.textContent) || 0;
            if (crypto >= 500 && !this.cryptoWinTriggered) {
                this.cryptoWinTriggered = true;
                this.triggerCryptoWin();
            }
        }
        
        // Check if all code scraps collected (handled by event listener)
    },

    triggerCryptoWin: function() {
        try {
            Prompt.showDialoguePopup('IShowGreen', '500 crypto. You kept your end of the deal. The door is unlocked. Get out of my sight.');
            setTimeout(() => {
                this.showWinScreen('crypto');
            }, 3000);
        } catch(e) {
            console.warn('Could not show crypto win:', e);
        }
    },

    triggerCodeScrapWin: function() {
        try {
            Prompt.showDialoguePopup('IShowGreen', 'All five fragments. My program... I can rebuild it. You have done well.');
            setTimeout(() => {
                Prompt.showDialoguePopup('IShowGreen', 'There is another way this could end. But for now... the door is open. You may leave.');
                setTimeout(() => {
                    this.showWinScreen('scraps');
                }, 3000);
            }, 3000);
        } catch(e) {
            console.warn('Could not show scrap win:', e);
        }
    },

    showWinScreen: function(winType) {
        const overlay = document.createElement('div');
        overlay.id = 'win-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 20000;
            font-family: 'Courier New', monospace;
            color: #0a5;
        `;
        
        let title, subtitle, hint;
        
        if (winType === 'crypto') {
            title = 'BOUGHT YOUR FREEDOM';
            subtitle = 'You paid 500 crypto. IShowGreen unlocks the door. You climb the stairs and leave.';
            hint = '';
        } else if (winType === 'scraps') {
            title = 'THE PAGES RETURNED';
            subtitle = 'You gave IShowGreen his five pages. He can rebuild The Green Machine. He lets you go.';
            hint = '<p style="color: #640; margin-top: 30px; font-style: italic;">There was another choice. What if you had kept them?</p>';
        } else if (winType === 'alternate') {
            title = 'STOLEN';
            subtitle = 'You kept the pages. The Green Machine belongs to you now. IShowGreen can only watch as you walk out with his lifes work.';
            hint = '<p style="color: #640; margin-top: 30px; font-style: italic;">The full alternate ending is coming soon.</p>';
        } else {
            title = 'ESCAPED';
            subtitle = 'You found a way out.';
            hint = '';
        }
        
        overlay.innerHTML = `
            <h1 style="font-size: 32px; margin-bottom: 20px; letter-spacing: 3px;">${title}</h1>
            <p style="color: #888; font-size: 13px; max-width: 500px; text-align: center; line-height: 1.6;">${subtitle}</p>
            ${hint}
            <button onclick="location.reload()" style="
                margin-top: 40px;
                background: #052;
                color: #0a5;
                border: 1px solid #0a5;
                padding: 12px 30px;
                font-size: 13px;
                cursor: pointer;
                font-family: 'Courier New', monospace;
            ">PLAY AGAIN</button>
        `;
        
        document.body.appendChild(overlay);
        GameEnv.continueLevel = false;
    },

    initWinConditionListeners: function() {
        // Listen for code scrap collection event
        window.addEventListener('allCodeScrapsCollected', () => {
            if (!this.scrapWinTriggered) {
                // Don't auto-trigger - player must present to IShowGreen
                try {
                    Prompt.showDialoguePopup('System', 'All five pages found. Bring them to IShowGreen.');
                } catch(e) {}
            }
        });
    },

    handleLevelEnd: function() {
        // More levels to play 
        if (this.currentLevelIndex < this.levelClasses.length - 1) {
            try { Prompt.showDialoguePopup('System', 'Level ended.'); } catch(e){ console.warn('Prompt not available', e); }
        } else { // All levels completed
            try { Prompt.showDialoguePopup('System', 'Game over. All levels completed.'); } catch(e){ console.warn('Prompt not available', e); }
        }
        // Tear down the game environment
        for (let index = GameEnv.gameObjects.length - 1; index >= 0; index--) {
            GameEnv.gameObjects[index].destroy();
        }
        // Move to the next level
        this.currentLevelIndex++;
        // Go back to the loadLevel function
        this.loadLevel();
    },
    
    resize: function() {
        // Resize the game environment
        GameEnv.resize();
        // Resize the game objects
        for (let object of GameEnv.gameObjects) {
            object.resize(); // Resize the game objects
        }
    },

    addExitKeyListener: function() {
        document.addEventListener('keydown', (event) => {
            if (event.key === 'NumLock') {
                GameEnv.continueLevel = false;
            }
        });
    },

    /**
     * Updates and displays the game timer.
     * @function updateTimer
     * @memberof GameControl
     */
    getAllTimes() {
        let timeTable = null;

        try {
            timeTable = localStorage.getItem(this.localStorageTimeKey);
        }
        catch (e) {
            return null;
        }

        if (!timeTable) {
            return null;
        }

        try {
            return JSON.parse(timeTable);
        } catch (e) {
            return null;
        }
    },
    updateTimer() {
        const time = GameEnv.time

        if (GameEnv.timerActive) {
            const newTime = time + GameEnv.timerInterval
            GameEnv.time = newTime                
            if (document.getElementById('timeScore')) {
                document.getElementById('timeScore').textContent = (newTime/1000).toFixed(2) 
            }
            return newTime
        }
        if (document.getElementById('timeScore')) {
            document.getElementById('timeScore').textContent = (time/1000).toFixed(2) 
        }
    },   
    /**
     * Starts the game timer.
     * @function startTimer
     * @memberof GameControl
     */
    startTimer() {
        if (GameEnv.timerActive) {
            console.warn("TIMER ACTIVE: TRUE, TIMER NOT STARTED")
            return;
        }
        
        this.intervalId = setInterval(() => this.updateTimer(), GameEnv.timerInterval);
        GameEnv.timerActive = true;
    },

    /**
     * Stops the game timer.
     * @function stopTimer
     * @memberof GameControl
     */
    stopTimer() {   
        if (!GameEnv.timerActive) return;
        
        this.saveTime(GameEnv.time, GameEnv.coinScore)

        GameEnv.timerActive = false
        GameEnv.time = 0;
        GameEnv.coinScore = 0;
        this.updateCoinDisplay()
        clearInterval(this.intervalId)
    },

    saveTime(time, score) {
        if (time == 0) return;
        const userID = GameEnv.userID || 'anonymous';
        const oldTable = this.getAllTimes()

        const data = {
            userID: userID,
            time: time,
            score: score || GameEnv.coinScore || 0
        }

        if (!oldTable || !Array.isArray(oldTable)) {
            localStorage.setItem(this.localStorageTimeKey, JSON.stringify([data]))
            return;
        }

        oldTable.push(data)
        localStorage.setItem(this.localStorageTimeKey, JSON.stringify(oldTable))
    },
    
    updateCoinDisplay() {
        const coins = GameEnv.coinScore || 0;
        const coinDisplay = document.getElementById('coinScore');
        if (coinDisplay) {
            coinDisplay.textContent = coins;
        }
    },  

    // Initialize UI for game stats
    initStatsUI: function() {
        const statsContainer = document.createElement('div');
        statsContainer.id = 'stats-container';
        statsContainer.style.position = 'fixed';
        statsContainer.style.top = '75px'; 
        statsContainer.style.right = '10px';
        statsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        statsContainer.style.color = 'white';
        statsContainer.style.padding = '10px';
        statsContainer.style.borderRadius = '5px';
        statsContainer.innerHTML = `
            <div>Money Bucks: <span id="balance">0</span></div>
            <div>Chat Score: <span id="chatScore">0</span></div>
            <div>Questions Answered: <span id="questionsAnswered">0</span></div>
        `;
        document.body.appendChild(statsContainer);
    },

    // Initialize leaderboard UI
    initLeaderboard: function() {
        if (!this.leaderboard) {
            this.leaderboard = new Leaderboard();
        }
        this.leaderboard.init();
    },

};

// Detect window resize events and call the resize function.
window.addEventListener('resize', GameControl.resize.bind(GameControl));


// Auto-start the game when the module loads
function initGame() {
    console.log("GameControl: initGame() called");
    // Compute the base path for assets (strip trailing slash if present)
    let baseurl = document.body?.getAttribute('data-baseurl') || '';
    if (baseurl.endsWith('/')) baseurl = baseurl.slice(0, -1);
    console.log("GameControl: Starting game with baseurl:", baseurl);
    try {
        GameControl.start(baseurl);
        console.log("GameControl: Game started successfully");
    } catch (error) {
        console.error("GameControl: Error starting game:", error);
    }
}

// Check if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    // DOM is already loaded, initialize immediately
    console.log("GameControl: DOM already loaded, initializing immediately");
    initGame();
}

export default GameControl;