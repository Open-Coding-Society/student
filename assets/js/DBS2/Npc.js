import GameEnv from "./GameEnv.js";
import Character from "./Character.js";
import Prompt from "./Prompt.js";
import { showAshTrailMinigame } from "./AshTrailMinigame.js";
import infiniteUserMinigame from "./InfiniteUserMinigame.js";
import cryptoMinerMinigame from "./cryptoMinerMinigame.js";
import { showLaundryMinigame } from "./LaundryGame.js";
import startWhackGame from "./whackarat.js";

class Npc extends Character {
    constructor(data = null) {
        super(data);
        this.alertTimeout = null;
        this.bindEventListeners();
    }

    update() {
        this.draw();
    }

    bindEventListeners() {
        addEventListener('keydown', this.handleKeyDown.bind(this));
        addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    closeAllDialogues() {
        const dialoguePopup = document.getElementById('dialoguePopup');
        if (dialoguePopup) {
            dialoguePopup.remove();
        }
        
        if (Prompt.isOpen) {
            Prompt.backgroundDim.remove();
        }
        
        const dimDiv = document.getElementById('dim');
        if (dimDiv) {
            dimDiv.remove();
        }
        
        const promptDropDown = document.querySelector('.promptDropDown');
        if (promptDropDown) {
            promptDropDown.style.display = 'none';
        }
        
        window.dialogueActive = false;
        Prompt.isOpen = false;
    }
    
    handleKeyDown({ key }) {
        switch (key) {
            case 'e': // Player 1 interaction
            case 'u': // Player 2 interaction
                try {
                    
                    const players = GameEnv.gameObjects.filter(
                        obj => obj.state?.collisionEvents?.includes(this.spriteData.id)
                    );
                    
                    
                    if (players.length === 0) {
                        // Check if player is at least close to this NPC (fallback for SodaCan)
                        const player = GameEnv.gameObjects.find(obj => obj.spriteData?.id === 'player');
                        if (player && this.spriteData.id === 'SodaCan') {
                            // Calculate distance
                            const dist = Math.sqrt(
                                Math.pow(player.position.x - this.position.x, 2) + 
                                Math.pow(player.position.y - this.position.y, 2)
                            );
                            
                            // If within 200 pixels, launch anyway
                            if (dist < 200) {
                                this.launchWhackARat();
                                return;
                            }
                        }
                        return;
                    }

                    this.closeAllDialogues();

                    const npcId = this.spriteData.id;

                    switch (npcId) {
                        case 'Bookshelf':
                            showAshTrailMinigame();
                            return;

                        case 'Computer1':
                            infiniteUserMinigame();
                            return;

                        case 'Computer2':
                            cryptoMinerMinigame();
                            return;

                        case 'laundry':
                            showLaundryMinigame();
                            return;

                        case 'SodaCan':
                            this.launchWhackARat();
                            return;

                        case 'IShowGreen':
                            Prompt.currentNpc = this;
                            Prompt.openPromptPanel(this);
                            return;

                        case 'ShellNpc1':
                        case 'ShellNpc2':
                            Prompt.showDialoguePopup(npcId, this.spriteData.greeting || 'Shell NPC');
                            return;

                        default:
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

    async launchWhackARat() {
        try {

            // Create fullscreen overlay
            const overlay = document.createElement('div');
            overlay.id = 'whackarat-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '10000';
            document.body.appendChild(overlay);

            // Get player for crypto reward
            const player = GameEnv.gameObjects?.find(obj => obj.spriteData?.id === 'player');

            // Determine the correct base path for images
            // Try to extract path from the NPC's own sprite source
            let basePath = 'images/DBS2'; // default
            if (this.spriteData?.src) {
                const srcParts = this.spriteData.src.split('/images/DBS2');
                if (srcParts.length > 1) {
                    basePath = srcParts[0] + '/images/DBS2';
                }
            }
            console.log('Using base path:', basePath);

            // Start the game
            await startWhackGame(overlay, basePath, (cryptoEarned) => {
                console.log('✅ Game finished! Crypto earned:', cryptoEarned);

                // Award crypto
                if (player?.spriteData?.crypto !== undefined && cryptoEarned > 0) {
                    player.spriteData.crypto += cryptoEarned;

                    setTimeout(() => {
                        alert(`🎉 You Win!\n\n💰 +${cryptoEarned} Crypto Earned!\n💎 Total Crypto: ${player.spriteData.crypto}`);
                    }, 100);
                } else if (cryptoEarned === 0) {
                    setTimeout(() => {
                        alert(`😞 Game Over!\n\nTry again!`);
                    }, 100);
                }

                // Remove overlay
                if (overlay?.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            });
        } catch (error) {
            console.error('❌ Error launching Rat Clicker:', error);
            const overlay = document.getElementById('whackarat-overlay');
            if (overlay?.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            alert('Error starting minigame: ' + error.message);
        }
    }

    handleKeyUp({ key }) {
        if (key === 'e' || key === 'u') {
            if (this.alertTimeout) {
                clearTimeout(this.alertTimeout);
                this.alertTimeout = null;
            }
        }
    }
}

export default Npc;