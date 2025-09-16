class SpriteCharacter {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Configuration
        this.dialogueInterval = options.dialogueInterval || 5000; // 5 seconds default
        this.dialogueDuration = options.dialogueDuration || 3000; // 3 seconds default
        this.spriteSize = options.spriteSize || 128; // Each sprite is 128x128 in the 256x256 image
        this.scale = options.scale || 4; // 2 times bigger than original (was 2, now 4)
        
        // Dialogue array - empty template for user to fill
        this.dialogues = options.dialogues || [
            // Add your dialogue here, for example:
            // "Hello there!",
            // "How's it going?",
            // "Nice weather today!",
            // "Did you know...?",
            // "Keep up the great work!"
        ];
        
        // Sprite states
        this.isIdle = true;
        this.currentFrame = 0;
        this.animationSpeed = options.animationSpeed || 500; // milliseconds per frame
        
        // Canvas setup
        this.canvas.width = this.spriteSize * this.scale;
        this.canvas.height = this.spriteSize * this.scale;
        this.ctx.imageSmoothingEnabled = false; // Pixel perfect scaling
        
        console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`); // Debug log
        
        // Create sprite image from the provided spritesheet
        this.spriteImage = new Image();
        this.spriteImage.onerror = () => {
            console.error('Failed to load sprite image. Check the path:', options.imagePath || '/hacks/cookie-clicker/assets/smugjughelper.png');
            // Draw a placeholder rectangle if image fails to load
            this.drawPlaceholder();
        };
        this.spriteImage.onload = () => {
            console.log('Sprite image loaded successfully');
            this.init();
        };
        
        // Set the sprite image source 
        this.spriteImage.src = options.imagePath || '/hacks/cookie-clicker/assets/smugjughelper.png';
        
        // Dialogue elements
        this.dialogueElement = null;
        this.createDialogueElement();
        
        // Timers
        this.dialogueTimer = null;
        this.animationTimer = null;
    }
    
    init() {
        this.startIdleAnimation();
        this.startDialogueTimer();
        this.addResizeListener(); // Add resize listener
    }
    
    createDialogueElement() {
        this.dialogueElement = document.createElement('div');
        this.dialogueElement.style.cssText = `
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 12px 16px;
            border-radius: 12px;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            max-width: 250px;
            word-wrap: break-word;
            display: none;
            z-index: 10000;
            border: 3px solid #fff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            transform: none;
        `;
        
        document.body.appendChild(this.dialogueElement);
        this.updateDialoguePosition();
    }
    
    updateDialoguePosition() {
        if (!this.dialogueElement) return;
        
        const canvasRect = this.canvas.getBoundingClientRect();
        const margin = 15; // Space between sprite and dialogue
        
        // Always position dialogue to the left of the sprite, regardless of canvas position
        this.dialogueElement.style.left = (canvasRect.left - this.dialogueElement.offsetWidth - margin) + 'px';
        this.dialogueElement.style.top = (canvasRect.top + canvasRect.height / 2 - this.dialogueElement.offsetHeight / 2) + 'px';
    }

    // Add window resize listener for repositioning
    addResizeListener() {
        window.addEventListener('resize', () => {
            if (this.dialogueElement && this.dialogueElement.style.display === 'block') {
                this.updateDialoguePosition();
            }
        });
    }
    
    drawPlaceholder() {
        // Draw a placeholder if image fails to load
        this.ctx.fillStyle = '#4a5568';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#68d391';
        this.ctx.font = '20px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('?', this.canvas.width / 2, this.canvas.height / 2);
    }

    drawSprite() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.spriteImage.complete || !this.spriteImage.naturalWidth) {
            this.drawPlaceholder();
            return;
        }
        
        // 256x256 image with 2x2 grid, so each sprite is 128x128
        // Top row: idle sprites (frames 0,1)  
        // Bottom row: talking sprites (frames 0,1)
        let srcX, srcY;
        
        if (this.isIdle) {
            // Top row - idle sprites
            srcX = this.currentFrame * 128; // 0 or 128
            srcY = 0;
        } else {
            // Bottom row - talking sprites  
            srcX = this.currentFrame * 128; // 0 or 128
            srcY = 128;
        }
        
        // Draw sprite scaled up
        this.ctx.drawImage(
            this.spriteImage,
            srcX, srcY, 128, 128, // Source: 128x128 from spritesheet
            0, 0, this.canvas.width, this.canvas.height // Destination: scaled to canvas size
        );
    }
    
    startIdleAnimation() {
        this.isIdle = true;
        this.animationTimer = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % 2; // Alternate between frames 0 and 1
            this.drawSprite();
        }, this.animationSpeed);
    }
    
    startTalkingAnimation() {
        this.isIdle = false;
        this.currentFrame = 0;
        
        clearInterval(this.animationTimer);
        this.animationTimer = setInterval(() => {
            this.currentFrame = (this.currentFrame + 1) % 2; // Alternate between frames 0 and 1
            this.drawSprite();
        }, this.animationSpeed / 2); // Faster animation when talking
    }
    
    showDialogue() {
        if (this.dialogues.length === 0) return;
        
        // Pick random dialogue
        const randomDialogue = this.dialogues[Math.floor(Math.random() * this.dialogues.length)];
        
        // Start talking animation
        this.startTalkingAnimation();
        
        // Show dialogue bubble first so we can measure its size
        this.dialogueElement.textContent = randomDialogue;
        this.dialogueElement.style.display = 'block';
        
        // Update dialogue position after it's visible (so offsetWidth/Height are available)
        // Use multiple attempts to ensure positioning works even with canvas shifts
        const positionDialogue = () => {
            this.updateDialoguePosition();
        };
        
        setTimeout(positionDialogue, 10);
        setTimeout(positionDialogue, 50);  // Second attempt in case of delays
        setTimeout(positionDialogue, 100); // Third attempt for safety
        
        // Hide dialogue after duration and return to idle
        setTimeout(() => {
            this.dialogueElement.style.display = 'none';
            clearInterval(this.animationTimer);
            this.startIdleAnimation();
        }, this.dialogueDuration);
    }
    
    startDialogueTimer() {
        this.dialogueTimer = setInterval(() => {
            this.showDialogue();
        }, this.dialogueInterval);
    }
    
    // Public methods for controlling the character
    addDialogue(dialogue) {
        this.dialogues.push(dialogue);
    }
    
    setDialogues(dialogues) {
        this.dialogues = dialogues;
    }
    
    setDialogueInterval(interval) {
        this.dialogueInterval = interval;
        clearInterval(this.dialogueTimer);
        this.startDialogueTimer();
    }
    
    triggerDialogue() {
        this.showDialogue();
    }
    
    destroy() {
        clearInterval(this.dialogueTimer);
        clearInterval(this.animationTimer);
        if (this.dialogueElement) {
            document.body.removeChild(this.dialogueElement);
        }
    }
}
// TIPS AND TRICKS!!!!!!!!!!!!!!
// Usage example:
// 1. Create a canvas element in your HTML: <canvas id="spriteCanvas"></canvas>
// 2. Initialize the character:
/*
const character = new SpriteCharacter('spriteCanvas', {
    dialogueInterval: 8000, // this is in milliseconds, scale as u want
    dialogueDuration: 4000, // 4 seconds dialogue display
    spriteSize: 128,        // Each sprite is 128x128 in your 256x256 image
    scale: 4,               // Makes sprite 2x bigger (128 * 4 = 512px)
    imagePath: '/hacks/cookie-clicker/assets/smugjughelper.png', //image path here
    dialogues: [ //insert cool dialogues here these are corny af
        "Hello there!",
        "How are you doing?", 
        "This is pretty cool!",
        "I'm just a little sprite guy!",
        "Hope you're having a great day!"
    ]
});
*/