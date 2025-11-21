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
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* Make the game container full-bleed so it fits any laptop viewport */
#gameContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background: #181818;
  margin: 0;
  border-radius: 0;
  box-shadow: none;
  position: relative;
  overflow: hidden;
}
/* Make the canvas fill the container */
#gameCanvas {
  width: 100%;
  height: 100%;
  display: block;
  background: #111;
  border-radius: 0;
}
</style>

<!-- The game will render inside #gameContainer. -->
