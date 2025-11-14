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
    const image_src_basement = path + "/images/gamify/basement.png"; // be sure to include the path
    const image_data_basement = {
        name: 'basement',
        greeting: "IShowGreen has locked you in his discord mod basement. Earn enough money to escape.",
        src: image_src_basement,
        pixels: {height: 580, width: 1038}
    };


    // Player data for Chillguy
    const sprite_src_chillguy = path + "/images/gamify/chillguy.png"; // be sure to include the path
    const CHILLGUY_SCALE_FACTOR = 3; //smaller = bigger chillguy.
    const sprite_data_chillguy = {
        id: 'Chill Guy',
        greeting: "I am Chill Guy, the desert wanderer. I am looking for wisdom and adventure!",
        src: sprite_src_chillguy,
        SCALE_FACTOR: CHILLGUY_SCALE_FACTOR,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        INIT_POSITION: { x: 0, y: height - (height/CHILLGUY_SCALE_FACTOR) }, 
        pixels: {height: 384, width: 512}, //change these to alter dimensinos
        orientation: {rows: 3, columns: 4 }, //change these to fit spritesheet properly.
        down: {row: 0, start: 0, columns: 3 },
        left: {row: 2, start: 0, columns: 3 },
        right: {row: 1, start: 0, columns: 3 },
        up: {row: 3, start: 0, columns: 3 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
        keypress: { up: 87, left: 65, down: 83, right: 68 } // W, A, S, D. A is 65, B is 66, etc...
    };


    // NPC data for computer1 
    const sprite_src_computer1 = path + "/images/gamify/computer1.png"; // be sure to include the path
    const sprite_data_computer1 = {
      id: 'Computer1',
      greeting: "Game -- Start!",
      src: sprite_src_computer1,
      SCALE_FACTOR: 8,  // Adjust this based on your scaling needs
      ANIMATION_RATE: 8,
      pixels: {height: 64, width: 1280},
      INIT_POSITION: { x: (width * 1 / 4), y: (height * 48 / 400)}, // Swapped position
      orientation: {rows: 1, columns: 20},
      down: {row: 0, start: 0, columns: 20},  // Adjusted to fit the spritesheet properly
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      // Linux command quiz
      quiz: { 
        title: "Hi testing man",
        questions: [
        "Please get out of here and fix this, computer1 shouldn't be able to interact with the player like this.\n1. ok\n2. bye\n3. lol\n4. :0",
        ] 
      }
      };
      // NPC data for Computer2
      const sprite_src_computer2 = path + "/images/gamify/computer2.png"; // be sure to include the path
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
        ANIMATION_RATE: 8,
        pixels: {height: 64, width: 832},
        INIT_POSITION: { x: (width * 7 / 12), y: (height / 14)}, // Swapped position
        orientation: {rows: 1, columns: 13 },
        down: {row: 0, start: 0, columns: 12 },  // This is the stationary npc, down is default 
        hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
        // Javascript Game 
        quiz: { 
          title: "Mr. Mortensen's CS Gauntlet",
          questions: [
            "How many ways can you define a variable in JS?\n1. 1\n2. 2\n3. 3\n4. 4",
            "How many primitive data types are there in JS?\n1. 5\n2. 7\n3. 9\n4. 2",
            "What is the official name of GitHub's mascot?\n1. Gitcat\n2. Git\n3. Octocat\n4. Octogit",
            "How do you send changes to a remote repository?\n1. git push\n2. git upload\n3. git send\n4. git commit",
            "What is new coding group's worst nightmare?\n1. The Github Cat\n2. Syntax Errors\n3. Bad Commits\n4. Merge Conflicts",
            "What is Mr. Mortensen's Motto?\n1. Ball, Ball, Ball\n2. Eat, Sleep, Code\n3. Commit, Push, Win\n4. Code, Code, Code",
            "What command creates a new code cell in Jupyter notebooks?\n1. C\n2. command+C\n3. option+C\n4. Right click",
            "How does Slack organize information and conversations?\n1. Channels\n2. Servers\n3. Huddles\n4. Branches",
            "What is the most important skill in CS?\n1. Grit\n2. Talent\n3. Communication\n4. Money",
          ] 
        }
    }
    const sprite_src_ishowgreen = path + "/images/gamify/ishowgreen.png"; // be sure to include the path
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
        ANIMATION_RATE: 6,
        pixels: {height: 128, width: 896},
        INIT_POSITION: { x: (width * 17 / 22), y: (height * 1 / 4)},
        orientation: {rows: 1, columns: 7 },
        down: {row: 0, start: 0, columns: 6 },  // This is the stationary npc, down is default 
        hitbox: { widthPercentage: 0.01, heightPercentage: 0.01 },
        //Final test -  after player has enough money, interacting with ishowgreen results in this uiz. You must get 100% to win.
        quiz: { 
          title: "You want to... leave, huh?",
          questions: [
            "Fine. You got the cash?\n1. Yes\n2. No\n3. Maybe\n4. Errr....",
          ] 
        }
      };

  /*  // NPC data for HTML Hank
const sprite_src_htmlhank = path + "/images/gamify/htmlhank.png"; // be sure to include the path
const sprite_data_htmlhank = {
    id: 'HTML Hank',
    greeting: "Hey there! I'm HTML Hank, the web architect. Let's build some awesome webpages together!",
    src: sprite_src_html_hank,
    SCALE_FACTOR: 8,  // Adjust this based on your scaling needs
    ANIMATION_RATE: 60,
    pixels: { height: 350, width: 550 },
    INIT_POSITION: { x: (width / 2), y: (height / 2) },
    orientation: { rows: 2, columns: 4 },
    down: { row: 0, start: 0, columns: 3 },  // This is the stationary NPC, down is default
    hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },

    // HTML & CSS quiz
    quiz: { 
        title: "HTML & CSS Mastery Quiz",
        questions: [
            "What does HTML stand for?\n1. HyperText Markup Language\n2. HighText Machine Learning\n3. Hyper Transfer Markup Language\n4. Hyper Tool Markup Language",
            "Which HTML tag is used to define the largest heading?\n1. <h1>\n2. <h6>\n3. <header>\n4. <h0>",
            "Which tag is used to create a hyperlink in HTML?\n1. <a>\n2. <link>\n3. <href>\n4. <url>",
            "Which CSS property is used to change text color?\n1. color\n2. text-color\n3. font-color\n4. bgcolor",
            "Which unit is relative to the font size of the root element in CSS?\n1. rem\n2. em\n3. px\n4. vh",
            "What is the correct way to reference an external CSS file?\n1. <link rel='stylesheet' href='styles.css'>\n2. <style src='styles.css'>\n3. <css file='styles.css'>\n4. <script href='styles.css'>",
            "How do you center an element horizontally using CSS?\n1. margin: auto;\n2. align: center;\n3. text-align: middle;\n4. float: center;",
            "Which HTML tag is used for creating an unordered list?\n1. <ul>\n2. <ol>\n3. <list>\n4. <li>",
            "What is the purpose of the <meta> tag in HTML?\n1. To provide metadata about the document\n2. To create a navigation menu\n3. To define the main content area\n4. To embed images"
        ]
    }
}; */

    // List of objects defnitions for this level
    this.objects = [
      { class: Background, data: image_data_basement },
      { class: Player, data: sprite_data_chillguy },
      { class: Npc, data: sprite_data_computer1 },
      { class: Npc, data: sprite_data_computer2 },
      { class: Npc, data: sprite_data_ishowgreen }
    ];
  }

}

export default GameLevelBasement;