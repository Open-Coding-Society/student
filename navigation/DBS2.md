---
layout: page
title: "DBS2 Game"
permalink: /DBS2
---


<div id="gameContainer">
  <canvas id="gameCanvas" style="image-rendering: pixelated;"></canvas>
</div>

<script>
  // Set baseurl immediately (before module loads) to avoid race condition
  (function() {
    let baseurl = "{{ site.baseurl }}";
    if (baseurl.endsWith('/')) baseurl = baseurl.slice(0, -1);
    // Set it on document if body doesn't exist yet
    if (document.body) {
      document.body.setAttribute('data-baseurl', baseurl);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.setAttribute('data-baseurl', baseurl);
      });
    }
  })();
</script>

<script type="module">
  import GameControl from "{{ site.baseurl }}/assets/js/DBS2/GameControl.js";

  // Ensure baseurl is set and start the game
  document.addEventListener('DOMContentLoaded', () => {
    console.log("3. DOM loaded!");
    
    let baseurl = "{{ site.baseurl }}";
    if (baseurl.endsWith('/')) baseurl = baseurl.slice(0, -1);
    
    console.log("4. Setting baseurl:", baseurl);
    document.body.setAttribute('data-baseurl', baseurl);
    
    // GameControl will auto-start from its own DOMContentLoaded listener
    console.log("5. Baseurl set, GameControl should start automatically");
  });
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

/* Make the game container fill viewport minus header */
#gameContainer {
  position: fixed;
  top: var(--header-height, 60px); /* Adjust based on your header height */
  left: 0;
  width: 100vw;
  height: calc(100vh - var(--header-height, 60px));
  background: #181818;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999; /* Below header z-index */
}

/* Make the canvas fill available space while maintaining aspect ratio */
#gameCanvas {
  max-width: 100%;
  max-height: 100%;
  display: block;
  background: #111;
}

/* Ensure header/nav stay on top */
header, nav {
  position: relative;
  z-index: 1000;
}

/* Hide footer to maximize game space */
footer {
  display: none !important;
}

/* Calculate and set header height dynamically */
@media screen {
  :root {
    --header-height: 60px; /* Default, will be overridden by JS if needed */
  }
}
</style>

<script>
  // Dynamically calculate header height and set CSS variable
  window.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if (header) {
      const headerHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    }
  });
</script>

<!-- The game will render inside #gameContainer. -->