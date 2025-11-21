/**
 * GameEnv is a static class that manages the game environment.
 * 
 * The focus of the file is the canvas management and the calculation of the game area dimensions. 
 * All calculations are based on the window size, header, and footer.
 * 
 * This code uses a classic Java static class pattern, which is nice for managing centralized data.
 * 
 * The static class pattern ensures that there is only one instance of the game environment,
 * providing a single point of reference for all game objects. This approach helps maintain
 * consistency and simplifies the management of shared resources like the canvas and its dimensions.
 * 
 * @class GameEnv
 * @property {Array} gameObjects - An array of game objects for the current level.
 * @property {Object} canvas - The canvas element.
 * @property {Object} ctx - The 2D rendering context of the canvas.
 * @property {number} innerWidth - The inner width of the game area.
 * @property {number} innerHeight - The inner height of the game area.
 * @property {number} top - The top offset of the game area.
 * @property {number} bottom - The bottom offset of the game area.
 * @property {boolean} timerActive - Flag to indicate if the timer is active.
 * @property {number} timerInterval - The interval for the timer.
 * @property {number} time - The current time.
 */
class GameEnv {
    static gameObjects = [];
    static continueLevel = true;
    static canvas;
    static ctx;
    static innerWidth;
    static innerHeight;
    static top;
    static bottom;
    static timerActive = false;
    static timerInterval = 10;
    static time = 0;
    
    /**
     * Private constructor to prevent instantiation.
     * 
     * @constructor
     * @throws {Error} Throws an error if an attempt is made to instantiate the class.
     */
    constructor() {
        throw new Error('GameEnv is a static class and cannot be instantiated.');
    }

    /**
     * Create the game environment by setting up the canvas and calculating dimensions.
     * 
     * This method sets the canvas element, calculates the top and bottom offsets,
     * and determines the inner width and height of the game area. It then sizes the canvas
     * to fit within the calculated dimensions.
     * 
     * @static
     */
    static create() {
        this.setCanvas();
        this.setTop();
        this.setBottom();
        // Base sizing primarily off the window (viewport) size, then constrain to container if present.
        const aspect = 16 / 9;
        const availWidth = window.innerWidth;
        const availHeight = Math.max(100, window.innerHeight - this.top - this.bottom);

        // Start from the available viewport size
        let targetWidth = availWidth;
        let targetHeight = availHeight;

        // Respect the container max width if present (keeps site layout intact)
        const container = document.getElementById('gameContainer');
        if (container) {
            const rect = container.getBoundingClientRect();
            // allow the container to be a limiting factor but do not exceed viewport
            targetWidth = Math.min(rect.width || availWidth, availWidth * 0.98);
            // If the container provides an explicit height (via aspect-ratio), use that as guidance
            if (rect.height && rect.height > 0) targetHeight = Math.min(rect.height, availHeight * 0.98);
        }

        // Maintain aspect ratio within the available box
        if (targetWidth / targetHeight > aspect) {
            targetWidth = Math.floor(targetHeight * aspect);
        } else {
            targetHeight = Math.floor(targetWidth / aspect);
        }

        // Store computed CSS pixel dimensions (used by size())
        this.innerWidth = Math.max(1, Math.floor(targetWidth));
        this.innerHeight = Math.max(1, Math.floor(targetHeight));

        this.size();
    }

    /**
     * Sets the canvas element and its 2D rendering context.
     * 
     * @static
     */
    static setCanvas() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Sets the top offset based on the height of the header element.
     * 
     * @static
     */
    static setTop() {
        const header = document.querySelector('header');
        this.top = header ? header.offsetHeight : 0;
    }

    /**
     * Sets the bottom offset based on the height of the footer element.
     * 
     * @static
     */
    static setBottom() {
        // We're hiding footer for more game space, so no offset needed
        this.bottom = 0;
    }

    /**
     * Sizes the canvas to fit within the calculated dimensions.
     * 
     * @static
     */
    static size() {
        // Use devicePixelRatio to make canvas crisp on high-DPI displays
        const dpr = window.devicePixelRatio || 1;
        // If container exists, measure it to compute CSS size
        const container = document.getElementById('gameContainer');
        let cssWidth = this.innerWidth;
        let cssHeight = this.innerHeight;
        if (container) {
            const rect = container.getBoundingClientRect();
            cssWidth = Math.floor(rect.width);
            cssHeight = Math.floor(rect.height);
        }

        // Set CSS size
        this.canvas.style.width = `${cssWidth}px`;
        this.canvas.style.height = `${cssHeight}px`;
        this.canvas.style.display = 'block';
        this.canvas.style.position = 'relative';

        // Set internal resolution according to DPR
        this.canvas.width = Math.max(1, Math.floor(cssWidth * dpr));
        this.canvas.height = Math.max(1, Math.floor(cssHeight * dpr));

        // Scale the drawing context so drawing coordinates match CSS pixels
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Update stored values
        this.innerWidth = cssWidth;
        this.innerHeight = cssHeight;
    }

    /**
     * Resizes the game environment by re-creating it.
     * 
     * @static
     */
    static resize() {
        this.create();
    }

    /**
     * Clears the canvas.
     * 
     * This method clears the entire canvas, making it ready for the next frame.
     * 
     * @static
     */
    static clear() {
        this.ctx.clearRect(0, 0, this.innerWidth, this.innerHeight);
    }
}

export default GameEnv;