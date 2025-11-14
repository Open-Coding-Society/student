import GameEnv from './GameEnv.js';
import GameObject from './GameObject.js';

// Define non-mutable constants as defaults
const SCALE_FACTOR = 25; // 1/nth of the height of the canvas
const STEP_FACTOR = 100; // 1/nth, or N steps up and across the canvas
const ANIMATION_RATE = 1; // 1/nth of the frame rate
const INIT_POSITION = { x: 0, y: 0 };

/**
 * Character is a dynamic class that manages the data and events for objects like player and NPCs.
 * 
 * The focus of this class is to handle the object's state, rendering, and key events.
 * 
 * This class uses a classic Java class pattern which is nice for managing object data and events.
 * 
 * The classic Java class pattern provides a structured way to define the properties and methods
 * associated with the object. This approach helps encapsulate the object's state and behavior,
 * making the code more modular and easier to maintain. By using this pattern, we can create
 * multiple instances of the Player class, each with its own state and behavior.
 * 
 * @property {Object} position - The current position of the object.
 * @property {Object} velocity - The current velocity of the object.
 * @property {Object} scale - The scale of the object based on the game environment.
 * @property {number} size - The size of the object.
 * @property {number} width - The width of the object.
 * @property {number} height - The height of the object.
 * @property {number} xVelocity - The velocity of the object along the x-axis.
 * @property {number} yVelocity - The velocity of the object along the y-axis.
 * @property {Image} spriteSheet - The sprite sheet image for the object.
 * @property {number} frameIndex - The current frame index for animation.
 * @property {number} frameCount - The total number of frames for each direction.
 * @property {Object} spriteData - The data for the sprite sheet.
 * @property {number} frameCounter - Counter to control the animation rate.
 * @method draw - Draws the object on the canvas.
 * @method update - Updates the object's position and ensures it stays within the canvas boundaries.
 * @method resize - Resizes the object based on the game environment.
 * @method destroy - Removes the object from the game environment.    
 */
class Character extends GameObject {
    /**
     * The constructor method is called when a new Player object is created.
     * 
     * @param {Object|null} data - The sprite data for the object. If null, a default red square is used.
     */
    constructor(data = null) {
        super();
        this.state = {
            ...this.state,
            animation: 'idle',
            direction: 'right',
            isDying: false,
            isFinishing: false,
        }; // Object control data

        // Create canvas element
        this.canvas = document.createElement("canvas");
        this.canvas.id = data.id || "default";
        this.canvas.width = data.pixels?.width || 0;
        this.canvas.height = data.pixels?.height || 0;
        this.hitbox = data?.hitbox || {};
        this.ctx = this.canvas.getContext('2d');
        document.getElementById("gameContainer").appendChild(this.canvas);

        // Set initial object properties 
        this.x = 0;
        this.y = 0;
        this.frame = 0;
        
        // Initialize the object's scale based on the game environment
        this.scale = { width: GameEnv.innerWidth, height: GameEnv.innerHeight };
        
        // Check if sprite data is provided
        if (data && data.src) {
            this.scaleFactor = data.SCALE_FACTOR || SCALE_FACTOR;
            this.stepFactor = data.STEP_FACTOR || STEP_FACTOR;
            this.animationRate = data.ANIMATION_RATE || ANIMATION_RATE;
            this.position = data.INIT_POSITION || INIT_POSITION;
    
            // Load the sprite sheet
            this.spriteSheet = new Image();
            this.spriteSheet.src = data.src;

            // Initialize animation properties
            this.frameIndex = 0; // index reference to current frame
            this.frameCounter = 0; // count each frame rate refresh
            this.direction = 'down'; // Initial direction
            this.spriteData = data;
        } else {
            throw new Error('Sprite data is required');
        }

        // Initialize the object's position and velocity
        this.velocity = { x: 0, y: 0 };

        // Add this object to the gameLoop
        GameEnv.gameObjects.push(this);

        // Set the initial size and velocity of the object
        this.resize();

    }


    /**
     * Draws the object on the canvas.
     * 
     * This method renders the object using the sprite sheet if provided, otherwise a red square.
     */
    draw() {
        if (this.spriteSheet) {
            // Sprite Sheet frame size: pixels = total pixels / total frames
            const frameWidth = this.spriteData.pixels.width / this.spriteData.orientation.columns;
            const frameHeight = this.spriteData.pixels.height / this.spriteData.orientation.rows;
    
            // Sprite Sheet direction data source (e.g., front, left, right, back)
            const directionData = this.spriteData[this.direction];
    
            // Sprite Sheet x and y declarations to store coordinates of current frame
            let frameX, frameY;
            // Sprite Sheet x and y current frame: coordinate = (index) * (pixels)
            frameX = (directionData.start + this.frameIndex) * frameWidth;
            frameY = directionData.row * frameHeight;
    
            // Set up the canvas dimensions and styles
            this.canvas.width = frameWidth;
            this.canvas.height = frameHeight;
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = `${this.position.x}px`;
            this.canvas.style.top = `${GameEnv.top+this.position.y}px`;
    
            // Clear the canvas before drawing
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
            // Draw the current frame of the sprite sheet
            this.ctx.drawImage(
                this.spriteSheet,
                frameX, frameY, frameWidth, frameHeight, // Source rectangle
                0, 0, this.canvas.width, this.canvas.height // Destination rectangle
            );
    
            // Update the frame index for animation at a slower rate
            this.frameCounter++;
            if (this.frameCounter % this.animationRate === 0) {
                this.frameIndex = (this.frameIndex + 1) % directionData.columns;
            }
        } else {
            // Draw default red square
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * Updates the object's position and ensures it stays within the canvas boundaries.
     * 
     * This method updates the object's position based on its velocity and ensures that the object
     * stays within the boundaries of the canvas.
     */
    update() {
        // Update begins by drawing the object object
        this.draw();

        this.collisionChecks();

        // Update or change position according to velocity events
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Ensure the object stays within the canvas boundaries
        // Bottom of the canvas
        if (this.position.y + this.height > GameEnv.innerHeight) {
            this.position.y = GameEnv.innerHeight - this.height;
            this.velocity.y = 0;
        }
        // Top of the canvas
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }
        // Right of the canvas
        if (this.position.x + this.width > GameEnv.innerWidth) {
            this.position.x = GameEnv.innerWidth - this.width;
            this.velocity.x = 0;
        }
        // Left of the canvas
        if (this.position.x < 0) {
            this.position.x = 0;
            this.velocity.x = 0;
        }
    }

    /**
     * Resizes the object based on the game environment.
     * 
     * This method adjusts the object's size and velocity based on the scale of the game environment.
     * It also adjusts the object's position proportionally based on the previous and current scale.
     */
    resize() {
        // Calculate the new scale resulting from the window resize
        const newScale = { width: GameEnv.innerWidth, height: GameEnv.innerHeight };

        // Adjust the object's position proportionally
        this.position.x = (this.position.x / this.scale.width) * newScale.width;
        this.position.y = (this.position.y / this.scale.height) * newScale.height;

        // Update the object's scale to the new scale
        this.scale = newScale;

        // Recalculate the object's size based on the new scale
        this.size = this.scale.height / this.scaleFactor; 

        // Recalculate the object's velocity steps based on the new scale
        this.xVelocity = this.scale.width / this.stepFactor;
        this.yVelocity = this.scale.height / this.stepFactor;

        // Set the object's width and height to the new size (object is a square)
        this.width = this.size;
        this.height = this.size;
    }
    

    /* Destroy Game Object
     * remove canvas element of object
     * remove object from GameEnv.gameObjects array
     */
    destroy() {
        const index = GameEnv.gameObjects.indexOf(this);
        if (index !== -1) {
            // Remove the canvas from the DOM
            this.canvas.parentNode.removeChild(this.canvas);
            GameEnv.gameObjects.splice(index, 1);
        }
    }
    
}

export default Character;