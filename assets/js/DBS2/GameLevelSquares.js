// To build GameLevels, each contains GameObjects from below imports
import Background from './Background.js';
import PlayerOne from './PlayerOne.js';
import PlayerTwo from './PlayerTwo.js';

// Minimal Definition
class GameLevelSquares {
  constructor(path) {
    this.objects = [
      { class: Background, data: {} },
      { class: PlayerOne },
      { class: PlayerTwo },
    ];
  }
}

export default GameLevelSquares;