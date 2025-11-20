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
#gameContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 80vh;
  min-height: 400px;
  background: #181818;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.18);
  position: relative;
  overflow: hidden;
}
#gameCanvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  aspect-ratio: 16/9;
  margin: auto;
  background: #111;
  border-radius: 8px;
}
</style>

<!-- The game will render inside #gameContainer. -->
