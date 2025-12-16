import GameEnv from './GameEnv.js';
import GameObject from './GameObject.js';

/** Background class for primary background
 * 
 */
export class Background extends GameObject {
    constructor(data = null) {
        super();
        if (data && data.src) {
            console.log('Background: Loading image from:', data.src);
            this.image = new Image();
            this.image.onload = () => {
                console.log('Background: Image loaded successfully:', data.src);
            };
            this.image.onerror = (error) => {
                console.error('Background: Failed to load image:', data.src, error);
            };
            this.image.src = data.src;
        } else {
            console.warn('Background: No image source provided');
            this.image = null;
        }
        GameEnv.gameObjects.push(this);
        console.log('Background: Background object created and added to gameObjects');
    }

    /** This method draws to GameEnv context, primary background
     * 
     */
    draw() {
        const ctx = GameEnv.ctx;
        const width = GameEnv.innerWidth;
        const height = GameEnv.innerHeight;

        if (!ctx) {
            console.warn('Background: Cannot draw - GameEnv.ctx is not initialized');
            return;
        }

        if (width <= 0 || height <= 0) {
            console.warn('Background: Cannot draw - invalid dimensions:', width, height);
            return;
        }

        if (this.image && this.image.complete && this.image.naturalWidth > 0) {
            // Draw the background image scaled to the canvas size
            ctx.drawImage(this.image, 0, 0, width, height);
        } else {
            // Fill the canvas with fillstyle color if no image is provided or not loaded yet
            console.log('Background: Image not loaded, drawing fallback color. Image:', this.image, 'complete:', this.image?.complete, 'naturalWidth:', this.image?.naturalWidth);
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, width, height);
        }
    }

    /** For primary background, update is the same as draw
     * 
     */
    update() {
        this.draw();
    }

    /** For primary background, resize is the same as draw
     *
     */
    resize() {
        this.draw();
    }

    /** Destroy Game Object
     * remove object from GameEnv.gameObjects array
     */
    destroy() {
        const index = GameEnv.gameObjects.indexOf(this);
        if (index !== -1) {
            GameEnv.gameObjects.splice(index, 1);
        }
    }
    
}

export default Background;

//I'm sorry, but 1660 lines of code is just way too much.