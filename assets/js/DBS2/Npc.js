import GameEnv from "./GameEnv.js";
import Character from "./Character.js";
import Prompt from "./Prompt.js";
import { showAshTrailMinigame } from "./AshTrailMinigame.js";
import infiniteUserMinigame from "./InfiniteUserMinigame.js";

class Npc extends Character {
    constructor(data = null) {
        super(data);
        // Keep NPC lightweight: quizzes removed. Keep an alert timeout and bind interaction keys.
        this.alertTimeout = null;
        this.bindEventListeners();
    }
    /**
     * Override the update method to draw the NPC.
     * This NPC is stationary, so the update method only calls the draw method.
     */
    update() {
        this.draw();
    }
    /**
     * Bind key event listeners for proximity interaction.
     */
    bindEventListeners() {
        addEventListener('keydown', this.handleKeyDown.bind(this));
        addEventListener('keyup', this.handleKeyUp.bind(this));
    }
    /**
     * Handle keydown events for interaction.
     * @param {Object} event - The keydown event.
     */
    handleKeyDown({ key }) {
        switch (key) {
            case 'e': // Player 1 interaction
            case 'u': // Player 2 interaction
                try {
                    // Only react if a player is colliding with this NPC
                    const players = GameEnv.gameObjects.filter(
                        obj => obj.state?.collisionEvents?.includes(this.spriteData.id)
                    );
                    if (players.length === 0) return;

                    // Special case: bookshelf opens the Ash Trail minigame popup
                    if (this.spriteData.id === 'Bookshelf') {
                        showAshTrailMinigame();
                        return;
                    } else if (this.spriteData.id === "Computer1") {
                        infiniteUserMinigame();
                        return;
                    } else if (this.spriteData.id === 'laundry') {
                        // Laundry machine minigame
                        if (typeof window.showLaundryMinigame === 'function') {
                            window.showLaundryMinigame(() => {
                                console.log('Player completed laundry minigame!');
                                // TODO: Add code to player's inventory or update game state
                                // Example: GameEnv.player.addCode('4729');
                                alert('You discovered the code: 4-7-2-9!');
                            });
                        } else {
                            console.error('Laundry minigame not loaded!');
                            alert('Fix the laundry machine! (Minigame not loaded)');
                        }
                        return;
                    }

                    // Default behaviour: open generic dialogue prompt
                    if (!Prompt.isOpen) {
                        Prompt.currentNpc = this;
                        Prompt.openPromptPanel(this);
                    }
                } catch (err) {
                    console.error('Error handling NPC interaction', err);
                }
                break;
        }
    }
    /**
     * Handle keyup events to stop player actions.
     * @param {Object} event - The keyup event.
     */
    handleKeyUp({ key }) {
        if (key === 'e' || key === 'u') {
            // Clear any active timeouts when the interaction key is released
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }
}

export default Npc;