// To build GameLevels, each contains GameObjects from below imports
import GameEnv from './GameEnv.js';
import Background from './Background.js';
import Player from './Player.js';
import Npc from './Npc.js';

class GameLevelBasement {
  constructor(path) {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    // Values dependent on GameEnv.create()
    let width = GameEnv.innerWidth;
    let height = GameEnv.innerHeight;


    // Background data
    const image_src_basement = path + "/images/DBS2/basement.png";
    const image_data_basement = {
      name: 'basement',
      greeting: "IShowGreen has locked you in his discord mod basement. Earn enough Crypto to escape.",
      src: image_src_basement,
      pixels: {height: 580, width: 1038}
    };


    // Player data for Chillguy
    const sprite_src_chillguy = path + "/images/DBS2/chillguy.png";
    const CHILLGUY_SCALE_FACTOR = 5; //smaller = bigger chillguy.
    const sprite_data_chillguy = {
        id: 'Chill Guy',
        greeting: "I am Chill Guy, the desert wanderer. I am looking for wisdom and adventure!",
        src: sprite_src_chillguy,
        SCALE_FACTOR: CHILLGUY_SCALE_FACTOR,
      // Reduced movement speed for Chill Guy — much slower
      STEP_FACTOR: 1000,
      // Slow down animation updates so movement appears very relaxed
      ANIMATION_RATE: 60,
        INIT_POSITION: { x: 0, y: height - (height/CHILLGUY_SCALE_FACTOR) }, 
        pixels: {height: 128, width: 128}, //change these to alter dimensinos
        orientation: {rows: 4, columns: 4 }, //change these to fit spritesheet properly.
        down: {row: 0, start: 0, columns: 4 },
        left: {row: 2, start: 0, columns: 4 },
        right: {row: 1, start: 0, columns: 4 },
        up: {row: 3, start: 0, columns: 4 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }, // W, A, S, D. A is 65, B is 66, etc...
      // Placeholder for future inventory system and player's crypto balance
      inventory: [],
      crypto: 0
    };


    // NPC data for computer1 
    const sprite_src_computer1 = path + "/images/DBS2/computer1.png";
    const sprite_data_computer1 = {
      id: 'Computer1',
      greeting: "Computer of Infinite Users",
      src: sprite_src_computer1,
      SCALE_FACTOR: 8,  // Adjust this based on your scaling needs
      ANIMATION_RATE: 24,
      pixels: {height: 64, width: 1280},
      INIT_POSITION: { x: (width * 1 / 4), y: (height * 48 / 400)}, // Swapped position
      orientation: {rows: 1, columns: 20},
      down: {row: 0, start: 0, columns: 20},  // Adjusted to fit the spritesheet properly
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 }
    };
      // NPC data for Computer2
      const sprite_src_computer2 = path + "/images/DBS2/computer2.png";
      const sprite_data_computer2 = {
        id: 'Computer2',
        greeting: [
          "$list$",
          "Hi, I am Computer2! I am the GitHub code code code code code code code code code code code code code code code code code code code code code code code code code code code code code code code code collaboration mascot, except I'm not. That's Octocat.",
          "Initializing CS Examination...",
          "Wait, you're not IShowGreen? Finally, someone with proper sanitation!",
          "Psst! Don't tell IShowGreen, but I keep deleting his NFTs...",
          "Finally, someone without Dorito dust on their fingers. Take this quiz!"
        ],
        src: sprite_src_computer2,
        SCALE_FACTOR: 8,  // Adjust this based on your scaling needs
        ANIMATION_RATE: 24,
        pixels: {height: 64, width: 832},
        INIT_POSITION: { x: (width * 7 / 12), y: (height / 14)}, // Swapped position
        orientation: {rows: 1, columns: 13 },
        down: {row: 0, start: 0, columns: 12 },  // This is the stationary npc, down is default 
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
          // No quiz here; this NPC acts as a shell for future interactions
    }
    const sprite_src_ishowgreen = path + "/images/DBS2/ishowgreen.png";
    const sprite_data_ishowgreen = {
        id: 'IShowGreen',
        greeting: [
          "$list$",
          "Crypto... bLOcKcHaIn... i nEEd to fArm NFTs... buy meh mEme coin and I'll give yoU NFTs...",
          "EW, WHAT IS THAT HORRIBLE SMELL?... lavender? AUGH, SHAMPOO!",
          "Get out of my room, or you will pay the price... IN V-BUCKS!",
          "Hey there... my crypto mining job is WAY more stressful than your 9-5...",
          "Don't even TRY to give me water... I HATE the taste of water!"
        ],
        src: sprite_src_ishowgreen,
        SCALE_FACTOR: 4,  // Adjust this based on your scaling needs
        ANIMATION_RATE: 18,
        pixels: {height: 128, width: 896},
        INIT_POSITION: { x: (width * 17 / 22), y: (height * 1 / 4)},
        orientation: {rows: 1, columns: 7 },
        down: {row: 0, start: 0, columns: 6 },  // This is the stationary npc, down is default 
        hitbox: { widthPercentage: 0.01, heightPercentage: 0.01 },
        // Final interactions will be based on player's `crypto` balance in StatsManager
      };

      // Shell NPCs (placeholders for customization)
      const sprite_src_shell = path + "/images/DBS2/computer2.png";
      const sprite_data_shell1 = {
        id: 'ShellNpc1',
        greeting: 'Shell NPC 1 (customize me)',
        src: sprite_src_shell,
        SCALE_FACTOR: 8,
        ANIMATION_RATE: 24,
        pixels: {height: 64, width: 832},
        INIT_POSITION: { x: (width * 4 / 12), y: (height * 1 / 5)},
        orientation: {rows: 1, columns: 13 },
        down: {row: 0, start: 0, columns: 12 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 }
      };
      const sprite_data_shell2 = {
        id: 'ShellNpc2',
        greeting: 'Shell NPC 2 (customize me)',
        src: sprite_src_shell,
        SCALE_FACTOR: 8,
        ANIMATION_RATE: 24,
        pixels: {height: 64, width: 832},
        INIT_POSITION: { x: (width * 6 / 12), y: (height * 2 / 5)},
        orientation: {rows: 1, columns: 13 },
        down: {row: 0, start: 0, columns: 12 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 }
      };
      const sprite_data_shell3 = {
        id: 'ShellNpc3',
        greeting: 'Shell NPC 3 (customize me)',
        src: sprite_src_shell,
        SCALE_FACTOR: 8,
        ANIMATION_RATE: 24,
        pixels: {height: 64, width: 832},
        INIT_POSITION: { x: (width * 9 / 12), y: (height * 2 / 5)},
        orientation: {rows: 1, columns: 13 },
        down: {row: 0, start: 0, columns: 12 },
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 }
      };
    // List of objects defnitions for this level
    this.objects = [
      { class: Background, data: image_data_basement },
      { class: Player, data: sprite_data_chillguy },
      { class: Npc, data: sprite_data_computer1 },
      { class: Npc, data: sprite_data_computer2 },
      { class: Npc, data: sprite_data_ishowgreen },
      { class: Npc, data: sprite_data_shell1 },
      { class: Npc, data: sprite_data_shell2 },
      { class: Npc, data: sprite_data_shell3 }
    ];
  }

}

export default GameLevelBasement;