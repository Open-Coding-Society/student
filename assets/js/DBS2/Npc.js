import GameEnv from "./GameEnv.js";
import Character from "./Character.js";
import Prompt from "./Prompt.js";
import { showAshTrailMinigame } from "./AshTrailMinigame.js";
import infiniteUserMinigame from "./InfiniteUserMinigame.js";
import cryptoMinerMinigame from "./cryptoMinerMinigame.js";
import { showLaundryMinigame } from "./LaundryGame.js";

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
     * Close all currently open dialogue boxes and prompts
     */
    closeAllDialogues() {
        // Close dialogue popup if exists
        const dialoguePopup = document.getElementById('dialoguePopup');
        if (dialoguePopup) {
            dialoguePopup.remove();
        }
        
        // Close prompt panel if open
        if (Prompt.isOpen) {
            Prompt.backgroundDim.remove();
        }
        
        // Close dim overlay if exists
        const dimDiv = document.getElementById('dim');
        if (dimDiv) {
            dimDiv.remove();
        }
        
        // Close prompt dropdown if visible
        const promptDropDown = document.querySelector('.promptDropDown');
        if (promptDropDown) {
            promptDropDown.style.display = 'none';
        }
        
        // Reset flags
        window.dialogueActive = false;
        Prompt.isOpen = false;
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

                    // Close all existing dialogues before opening new interaction
                    this.closeAllDialogues();

                    const npcId = this.spriteData.id;

                    // Route each NPC to their specific minigame
                    switch (npcId) {
                        case 'Bookshelf':
                            // Ash Trail minigame
                            showAshTrailMinigame();
                            return;

                        case 'Computer1':
                            // Infinite User password decryption minigame
                            infiniteUserMinigame();
                            return;

                        case 'Computer2':
                            // Crypto Miner minigame
                            cryptoMinerMinigame();
                            return;

                        case 'laundry':
                            // Laundry Machine Repair minigame
                            showLaundryMinigame();
                            return;

                        case 'IShowGreen':
                            // IShowGreen has special escape logic - use prompt panel for interaction
                            Prompt.currentNpc = this;
                            Prompt.openPromptPanel(this);
                            return;

                        case 'ShellNpc1':
                        case 'ShellNpc2':
                        case 'ShellNpc3':
                            // Shell NPCs - just show their greeting, no interaction panel
                            // The greeting is already shown via collision in GameObject.js
                            // So we can either do nothing or show a simple dialogue
                            Prompt.showDialoguePopup(npcId, this.spriteData.greeting || 'Shell NPC (customize me)');
                            return;

                        default:
                            // Default behaviour: open generic dialogue prompt for NPCs with interactions
                            Prompt.currentNpc = this;
                            Prompt.openPromptPanel(this);
                            return;
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