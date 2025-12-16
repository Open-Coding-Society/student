// GameLevelBasement.js
import GameEnv from './GameEnv.js';
import Background from './Background.js';
import Player from './Player.js';
import Npc from './Npc.js';
import startWhackGame from './whackarat.js';

/**
 * GameLevelBasement
 * - All asset paths use `${path}/images/DBS2/...`
 * - SodaCan NPC replaces ShellNpc1 and launches Whackarat minigame
 */
class GameLevelBasement {
  constructor(path = '') {
    // path should be the base path for assets (e.g. '' or '/DBS2-Frontend' or location of site)
    this.path = path;

    // Responsive dimensions provided by GameEnv.create()
    let width = GameEnv.innerWidth;
    let height = GameEnv.innerHeight;

    /* ----------------------
       BACKGROUND
    ------------------------*/
    const image_data_basement = {
      name: 'basement',
      greeting: "IShowGreen has locked you in his discord mod basement. Earn enough Crypto to escape.",
      src: `${this.path}/images/DBS2/basement.png`,
      pixels: { height: 580, width: 1038 }
    };

    /* ----------------------
       PLAYER - CHILL GUY
    ------------------------*/
    const CHILLGUY_SCALE_FACTOR = 5;
    const sprite_data_chillguy = {
      id: 'player', // Note: GameLevel expects the player id to be "player" in some places
      greeting: "I am Chill Guy, the desert wanderer. I am looking for wisdom and adventure!",
      src: `${this.path}/images/DBS2/chillguy.png`,
      SCALE_FACTOR: CHILLGUY_SCALE_FACTOR,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 30,
      INIT_POSITION: { x: 0, y: height - height / CHILLGUY_SCALE_FACTOR },
      pixels: { height: 128, width: 128 },
      orientation: { rows: 4, columns: 4 },
      down: { row: 0, start: 0, columns: 4 },
      left: { row: 2, start: 0, columns: 4 },
      right: { row: 1, start: 0, columns: 4 },
      up: { row: 3, start: 0, columns: 4 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 },
      inventory: [],
      crypto: 0
    };

    /* ----------------------
       NPCs
    ------------------------*/
    const sprite_data_computer1 = {
      id: 'Computer1',
      greeting: "Computer of Infinite Users",
      src: `${this.path}/images/DBS2/computer1.png`,
      SCALE_FACTOR: 8,
      ANIMATION_RATE: 8,
      pixels: { height: 64, width: 1280 },
      INIT_POSITION: { x: width * 1 / 4, y: height * 0.07 },
      orientation: { rows: 1, columns: 20 },
      down: { row: 0, start: 0, columns: 20 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 }
    };

    const sprite_data_computer2 = {
      id: 'Computer2',
      greeting: [
        "$list$",
        "Hi, I am Computer2! I am the GitHub code guardian.",
        "Wait, you're not IShowGreen? Finally, someone with proper sanitation!",
        "Psst! Don't tell him I keep deleting his NFTs...",
        "Finally, someone without Dorito dust on their fingers."
      ],
      src: `${this.path}/images/DBS2/computer2.png`,
      SCALE_FACTOR: 8,
      ANIMATION_RATE: 12,
      pixels: { height: 64, width: 832 },
      INIT_POSITION: { x: width * 7 / 12, y: height * 0.01 },
      orientation: { rows: 1, columns: 13 },
      down: { row: 0, start: 0, columns: 12 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 }
    };

    const sprite_data_ishowgreen = {
      id: 'IShowGreen',
      greeting: [
        "$list$",
        "Crypto... bLOcKcHaIn...",
        "EW, WHAT IS THAT SMELL? ... SHAMPOO?!",
        "Get out of my room unless you're buying my meme coin!",
        "Don't give me water... I HATE the taste!"
      ],
      src: `${this.path}/images/DBS2/ishowgreen.png`,
      SCALE_FACTOR: 4,
      ANIMATION_RATE: 18,
      pixels: { height: 128, width: 896 },
      INIT_POSITION: { x: width * 17 / 22, y: height * 1 / 4 },
      orientation: { rows: 1, columns: 7 },
      down: { row: 0, start: 0, columns: 6 },
      hitbox: { widthPercentage: 0.01, heightPercentage: 0.01 }
    };

    /* ----------------------
       SODA CAN (NPC) - REPLACES ShellNpc1
       Shows "whack some rats" greeting and launches minigame
    ------------------------*/
    const sprite_data_sodacan = {
      id: 'SodaCan',
      greeting: 'Whack some rats!',
      src: `${this.path}/images/DBS2/sodacan.png`,
      SCALE_FACTOR: 6,
      ANIMATION_RATE: 0,
      pixels: { height: 512, width: 512 },
      INIT_POSITION: { x: width * 4 / 12, y: height * 0.5 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.3, heightPercentage: 0.3 },
      stationary: true
    };

    const sprite_data_shell2 = {
      id: 'laundry',
      greeting: 'Fix the laundry machine!',
      src: `${this.path}/images/DBS2/broken-washing-machine-jpeg.jpg`,
      SCALE_FACTOR: 5,
      ANIMATION_RATE: 0,
      pixels: { height: 423, width: 414 },
      INIT_POSITION: { x: 500, y: 200 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.3, heightPercentage: 0.3 },
      stationary: true
    };

    const sprite_data_bookshelf = {
      id: 'Bookshelf',
      greeting: 'A bookshelf filled with coding books and references.',
      src: `${this.path}/images/DBS2/Tracethepage.png`,
      SCALE_FACTOR: 3,
      ANIMATION_RATE: 0,
      pixels: { height: 592, width: 592 },
      INIT_POSITION: { x: width * 19 / 22, y: height * 3 / 5 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.3, heightPercentage: 0.3 },
      stationary: true
    };

    // All objects in the basement level
    this.objects = [
      { class: Background, data: image_data_basement },
      { class: Player, data: sprite_data_chillguy },
      { class: Npc, data: sprite_data_computer1 },
      { class: Npc, data: sprite_data_computer2 },
      { class: Npc, data: sprite_data_ishowgreen },
      { class: Npc, data: sprite_data_sodacan }, // REPLACED ShellNpc1 with SodaCan
      { class: Npc, data: sprite_data_shell2 },
      { class: Npc, data: sprite_data_bookshelf },
    ];

    // REMOVED: _createSodaLauncher - no longer need floating button
    // The SodaCan NPC now handles the interaction directly
  }
}

export default GameLevelBasement;