// whackarat.js
// NEW MINIGAME: Click the moving rat 10 times to win 5 crypto!

const Whack = {
  canvas: null,
  ctx: null,
  width: 900,
  height: 700,
  images: {},
  mouse: { x: 0, y: 0 },
  rat: null,
  score: 0,
  targetScore: 10,  // Need 10 hits to win
  running: false,
  moveInterval: null
};

function loadImage(name, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ name, img });
    img.onerror = () => reject(new Error('Failed to load ' + src));
    img.src = src;
  });
}

async function loadAssets(basePath) {
  const manifest = [
    ['rat', `${basePath}/movingrat.gif`]
  ];
  const promises = manifest.map(m => loadImage(m[0], m[1]));
  const results = await Promise.all(promises);
  results.forEach(r => Whack.images[r.name] = r.img);
}

function createCanvasInOverlay(overlay) {
  const existing = overlay.querySelector('#whack-root');
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = 'whack-root';
  root.style.cssText = 'position:relative;width:920px;max-width:96%;height:720px;background:#1a1a1a;border-radius:8px;padding:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;box-sizing:border-box';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.cssText = 'position:absolute;top:8px;right:8px;z-index:30;font-size:20px;background:#ff4444;border:none;color:white;width:32px;height:32px;border-radius:50%;cursor:pointer;font-weight:bold';
  closeBtn.addEventListener('click', () => {
    stopGame();
    if (overlay?.parentNode) overlay.parentNode.removeChild(overlay);
  });
  root.appendChild(closeBtn);

  const canvas = document.createElement('canvas');
  canvas.id = 'whack-canvas';
  canvas.width = Whack.width;
  canvas.height = Whack.height;
  canvas.style.cssText = 'width:100%;height:100%;border:4px solid rgba(255,255,255,0.1);border-radius:6px;display:block;box-sizing:border-box;cursor:crosshair;background:#2a2a2a';

  const info = document.createElement('div');
  info.style.cssText = 'width:100%;display:flex;justify-content:space-between;align-items:center;color:white;font-family:monospace;margin-bottom:8px;font-size:24px;font-weight:bold';

  const instructionSpan = document.createElement('div');
  instructionSpan.id = 'whack-instruction';
  instructionSpan.textContent = 'Click the rat 10 times!';
  instructionSpan.style.fontSize = '18px';

  const scoreSpan = document.createElement('div');
  scoreSpan.id = 'whack-score';
  scoreSpan.textContent = 'Hits: 0/10';

  info.appendChild(instructionSpan);
  info.appendChild(scoreSpan);

  root.appendChild(info);
  root.appendChild(canvas);
  overlay.appendChild(root);

  return canvas;
}

function initGameListeners(canvas) {
  function updateMouse(e) {
    const r = canvas.getBoundingClientRect();
    Whack.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    Whack.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  }
  
  canvas.addEventListener('mousemove', updateMouse);
  canvas.addEventListener('click', handleClick);
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}

function handleClick(e) {
  if (!Whack.running || !Whack.rat) return;

  // Check if click is on the rat
  if (Whack.mouse.x > Whack.rat.x && 
      Whack.mouse.x < Whack.rat.x + Whack.rat.w &&
      Whack.mouse.y > Whack.rat.y && 
      Whack.mouse.y < Whack.rat.y + Whack.rat.h) {
    
    Whack.score++;
    
    // Flash effect on hit
    Whack.rat.flash = 5;
    
    // Check if won
    if (Whack.score >= Whack.targetScore) {
      Whack.running = false;
      endGame(true);
    } else {
      // Move rat to new random position immediately after hit
      moveRatToRandomPosition();
    }
  }
}

function moveRatToRandomPosition() {
  if (!Whack.rat) return;
  
  const padding = 50;
  Whack.rat.x = padding + Math.random() * (Whack.width - Whack.rat.w - padding * 2);
  Whack.rat.y = padding + Math.random() * (Whack.height - Whack.rat.h - padding * 2);
}

function initRat() {
  Whack.rat = {
    x: Whack.width / 2 - 40,
    y: Whack.height / 2 - 40,
    w: 80,
    h: 80,
    flash: 0
  };
  
  // Move rat to random position every 800ms (very fast!)
  Whack.moveInterval = setInterval(() => {
    if (Whack.running) {
      moveRatToRandomPosition();
    }
  }, 800);
}

function draw() {
  const ctx = Whack.ctx;
  ctx.clearRect(0, 0, Whack.width, Whack.height);

  // Draw simple background
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, Whack.width, Whack.height);

  // Draw rat
  if (Whack.rat) {
    // Flash white when hit
    if (Whack.rat.flash > 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(Whack.rat.x - 5, Whack.rat.y - 5, Whack.rat.w + 10, Whack.rat.h + 10);
      Whack.rat.flash--;
    }
    
    const img = Whack.images.rat;
    if (img) {
      ctx.drawImage(img, Whack.rat.x, Whack.rat.y, Whack.rat.w, Whack.rat.h);
    } else {
      // Fallback
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(Whack.rat.x, Whack.rat.y, Whack.rat.w, Whack.rat.h);
    }
  }

  // Update score display
  const scoreSpan = document.getElementById('whack-score');
  if (scoreSpan) {
    scoreSpan.textContent = `Hits: ${Whack.score}/${Whack.targetScore}`;
  }
}

function loop() {
  if (!Whack.running) return;
  draw();
  requestAnimationFrame(loop);
}

function endGame(won) {
  Whack.running = false;
  
  if (Whack.moveInterval) {
    clearInterval(Whack.moveInterval);
    Whack.moveInterval = null;
  }

  if (Whack.ctx) {
    Whack.ctx.fillStyle = "rgba(0,0,0,0.85)";
    Whack.ctx.fillRect(0, 0, Whack.width, Whack.height);
    Whack.ctx.fillStyle = won ? "#4CAF50" : "white";
    Whack.ctx.font = "48px monospace";
    Whack.ctx.textAlign = "center";
    
    if (won) {
      Whack.ctx.fillText("YOU WIN! 🎉", Whack.width / 2, Whack.height / 2 - 30);
      Whack.ctx.font = "32px monospace";
      Whack.ctx.fillText("+ 5 Crypto Earned!", Whack.width / 2, Whack.height / 2 + 30);
    } else {
      Whack.ctx.fillText("GAME OVER", Whack.width / 2, Whack.height / 2);
    }
  }

  setTimeout(() => {
    const root = document.getElementById('whack-root');
    if (root?.parentNode) root.parentNode.removeChild(root);
    
    if (typeof Whack._onComplete === 'function') {
      Whack._onComplete(won ? 5 : 0);  // Award 5 crypto if won
    }
    
    cleanup();
  }, 2500);
}

function stopGame() {
  Whack.running = false;
  if (Whack.moveInterval) {
    clearInterval(Whack.moveInterval);
    Whack.moveInterval = null;
  }
  
  const root = document.getElementById('whack-root');
  if (root?.parentNode) root.parentNode.removeChild(root);
  
  cleanup();
}

function cleanup() {
  Whack.canvas = null;
  Whack.ctx = null;
  Whack.rat = null;
  Whack.score = 0;
}

export async function startWhackGame(overlayElement, basePath = '/images/DBS2', onComplete = null) {
  Whack.score = 0;
  Whack.running = true;
  Whack._onComplete = onComplete;

  await loadAssets(basePath);
  
  const canvas = createCanvasInOverlay(overlayElement);
  Whack.canvas = canvas;
  Whack.ctx = canvas.getContext('2d');
  
  initGameListeners(canvas);
  initRat();
  requestAnimationFrame(loop);
}

export function stopWhackGame() {
  stopGame();
}
