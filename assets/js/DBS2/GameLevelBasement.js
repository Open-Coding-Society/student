// GameLevelBasement.js
import GameEnv from './GameEnv.js';
import Background from './Background.js';
import Player from './Player.js';
import Npc from './Npc.js';
import startWhackGame from './whackarat.js';

/**
 * GameLevelBasement
 * 
 * STORY: IShowGreen was once a crypto mining legend. His program, "The Green Machine,"
 * generated wealth beyond imagination. But years of neglect destroyed it - rats, floods,
 * fire, and forgotten passwords reduced his empire to rubble. Now he traps wanderers
 * in his basement, forcing them to recover the fragments of his lost code.
 * 
 * You can escape by earning 500 crypto, or by recovering all 5 code fragments
 * and presenting them to IShowGreen to rebuild The Green Machine.
 */
class GameLevelBasement {
  constructor(path = '') {
    this.path = path;

    let width = GameEnv.innerWidth;
    let height = GameEnv.innerHeight;

    /* ----------------------
       BACKGROUND
    ------------------------*/
    const image_data_basement = {
      name: 'basement',
      greeting: "You wake up in a basement. The air is stale. A figure watches from the corner.",
      src: `${this.path}/images/DBS2/basement.png`,
      pixels: { height: 580, width: 1038 }
    };

    /* ----------------------
       PLAYER - CHILL GUY
    ------------------------*/
    const CHILLGUY_SCALE_FACTOR = 5;
    const sprite_data_chillguy = {
      id: 'player',
      greeting: "...",
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
    
    // Computer1 - The Password Terminal (Infinite User minigame)
    const sprite_data_computer1 = {
      id: 'Computer1',
      greeting: "SYSTEM LOCKED. IShowGreen wrote down all the passwords somewhere. Maybe behind the keyboard.",
      src: `${this.path}/images/DBS2/computer1.png`,
      SCALE_FACTOR: 8,
      ANIMATION_RATE: 8,
      pixels: { height: 64, width: 1280 },
      INIT_POSITION: { x: width * 1 / 4, y: height * 0.07 },
      orientation: { rows: 1, columns: 20 },
      down: { row: 0, start: 0, columns: 20 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 }
    };

    // Computer2 - The Mining Terminal (Crypto Miner minigame)
    const sprite_data_computer2 = {
      id: 'Computer2',
      greeting: [
        "$list$",
        "Mining terminal. The algorithm was written on paper during a blackout.",
        "IShowGreen lost the page somewhere behind here.",
        "Press E to search while mining."
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

    // IShowGreen - The Captor
    const sprite_data_ishowgreen = {
      id: 'IShowGreen',
      greeting: [
        "$list$",
        "I wrote The Green Machine by hand. Every line of code on paper first.",
        "Then I lost the pages. All five of them. Scattered around this basement.",
        "Find them all and bring them to me. Or earn 500 crypto. Then you can leave."
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

    // Shell NPC - Old Server Rack
    const sprite_data_shell1 = {
      id: 'ShellNpc1',
      greeting: "Old hardware. Nothing useful here. The code was never digital. He wrote it all on paper.",
      src: `${this.path}/images/DBS2/computer2.png`,
      SCALE_FACTOR: 8,
      ANIMATION_RATE: 24,
      pixels: { height: 64, width: 832 },
      INIT_POSITION: { x: width * 4 / 12, y: height * 0.07 },
      orientation: { rows: 1, columns: 13 },
      down: { row: 0, start: 0, columns: 12 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 }
    };

    // Laundry Machine - paper in pants pocket
    const sprite_data_shell2 = {
      id: 'laundry',
      greeting: "A washing machine. IShowGreen left a page in his pants pocket. It went through the wash.",
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

    // Bookshelf - Burned pages
    const sprite_data_bookshelf = {
      id: 'Bookshelf',
      greeting: "A charred bookshelf. IShowGreen kept his backup pages here. A candle set them on fire.",
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

    // Soda Can area - Rat territory
    const sprite_data_sodacan = {
      id: 'SodaCan',
      greeting: [
        "$list$",
        "Rats live in the walls here.",
        "IShowGreen hid a page in a crack. The rats took it for their nest.",
        "They shredded part of it but the code might still be readable."
      ],
    };

    // All objects in the basement level
    this.objects = [
      { class: Background, data: image_data_basement },
      { class: Player, data: sprite_data_chillguy },
      { class: Npc, data: sprite_data_computer1 },
      { class: Npc, data: sprite_data_computer2 },
      { class: Npc, data: sprite_data_ishowgreen },
      { class: Npc, data: sprite_data_shell1 },
      { class: Npc, data: sprite_data_shell2 },
      { class: Npc, data: sprite_data_bookshelf },
    ];

    this._createSodaLauncher(`${this.path}/images/DBS2/sodacan.png`);
  }

  _createSodaLauncher(sodaSrc) {
    if (document.getElementById('sodacan-launcher')) return;

    const container = document.querySelector('#gameControls') || document.body;
    const img = document.createElement('img');
    img.id = 'sodacan-launcher';
    img.src = sodaSrc;
    img.alt = 'Rat Territory';
    img.style.position = 'fixed';
    img.style.bottom = '24px';
    img.style.left = '24px';
    img.style.width = '80px';
    img.style.height = '80px';
    img.style.cursor = 'pointer';
    img.style.zIndex = 9999;
    img.style.boxShadow = '0 6px 18px rgba(0,0,0,0.4)';
    img.title = 'Rat Territory - Click to investigate';

    img.addEventListener('click', async (e) => {
      try {
        let overlay = document.getElementById('whack-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'whack-overlay';
          overlay.style.position = 'fixed';
          overlay.style.top = 0;
          overlay.style.left = 0;
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.style.display = 'flex';
          overlay.style.alignItems = 'center';
          overlay.style.justifyContent = 'center';
          overlay.style.background = 'rgba(0,0,0,0.5)';
          overlay.style.zIndex = 10000;
          document.body.appendChild(overlay);
        }
        startWhackGame(overlay, `${this.path}/images/DBS2`);
      } catch (err) {
        console.error('Failed to load minigame:', err);
      }
    });

    container.appendChild(img);
  }
}

export default GameLevelBasement;