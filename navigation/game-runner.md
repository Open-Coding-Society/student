---
layout: post
codemirror: true
title: Game Runner Examples
description: Learn game development using the GameEngine framework in a contained educational environment. Build game levels, add characters, and create interactive experiences with live code editing and debugging controls.
permalink: /rpg/game

---

## Basic Game: Desert Adventure

{% capture challenge1 %}
Run the basic desert adventure game. Use WASD or arrow keys to move Chill Guy around the desert. Walk up to R2D2 to trigger a mini-game!
{% endcapture %}

{% capture code1 %}
import GameControl from '/assets/js/adventureGame/GameEngine/GameControl.js';
import GameEnvBackground from '/assets/js/adventureGame/GameEngine/GameEnvBackground.js';

class CustomLevel {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;
        const bgData = {
            name: 'alien_world',
            src: path + "/images/gamebuilder/alien_planet.jpg",
            pixels: { height: 600, width: 1000 }
        };

        this.classes = [
                  { class: GameEnvBackground, data: bgData }
        ];
    }
}
export { GameControl };
export const gameLevelClasses = [CustomLevel];
{% endcapture %}

{% include game-runner.html
   runner_id="game1"
   challenge=challenge1
   code=code1
   height="150px"
%}
