---
layout: page
title: "DBS2 Game"
permalink: /DBS2
---


<div id="gameContainer">
  <canvas id="gameCanvas"></canvas>
</div>

<script type="module">
  import GameControl from "{{ site.baseurl }}/assets/js/DBS2/GameControl.js";

  // Start the game with the correct baseurl for asset loading
  document.addEventListener('DOMContentLoaded', () => {
    let baseurl = "{{ site.baseurl }}";
    if (baseurl.endsWith('/')) baseurl = baseurl.slice(0, -1);
    GameControl.start(baseurl);
  });
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Make the game container full-bleed so it fits any laptop viewport */
#gameContainer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #181818;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* Make the canvas fill available space while maintaining aspect ratio */
#gameCanvas {
  max-width: 100%;
  max-height: 100%;
  display: block;
  background: #111;
}

/* Hide any page elements that might interfere */
header, footer, nav {
  display: none !important;
}
</style>

<!-- The game will render inside #gameContainer. -->