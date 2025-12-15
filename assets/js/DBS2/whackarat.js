/// whackarat.js
// Ash-Trail style rewrite of Whack-a-rat game
// Exports: startWhackGame(overlayElement, basePath)
// overlayElement: DOM element to host the game (we create a canvas inside it)
// basePath: path to assets (e.g. '/images/DBS2')

const Whack = {
  canvas: null,
  ctx: null,
  width: 800,
  height: 600,
  images: {},
  mouse: { x: 0, y: 0, down: false },
  score: 0,
  timer: 120000,
  spawnInterval: 1000,
  lastSpawn: 0,
  entities: [],
  running: false,
  lastFrame: 0
};

function loadImage(name, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ name, img });
    img.onerror = (e) => reject(new Error('Failed to load ' + src));
    img.src = src;
  });
}

async function loadAssets(basePath) {
  const manifest = [
    ['basement', `${basePath}/basement.png`],
    ['pipes', `${basePath}/pipes.png`],
    ['hammer', `${basePath}/hammer.png`],
    ['rat', `${basePath}/movingrat.gif`],
    ['soda', `${basePath}/sodacan.png`]
  ];

  const promises = manifest.map(m => loadImage(m[0], m[1]));
  const assets = await Promise.all(promises);
  assets.forEach(a => Whack.images[a.name] = a.img);
}

function createCanvasInOverlay(overlay) {
  // remove existing canvas wrapper if present
  const existing = overlay.querySelector('#whack-root');
  if (existing) existing.remove();

  const root = document.createElement('div');
  root.id = 'whack-root';
  root.style.position = 'relative';
  root.style.width = '900px';
  root.style.maxWidth = '95%';
  root.style.height = '700px';
  root.style.background = '#000';
  root.style.borderRadius = '8px';
  root.style.padding = '12px';
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.alignItems = 'center';
  root.style.justifyContent = 'center';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.style.position = 'absolute';
  closeBtn.style.top = '8px';
  closeBtn.style.right = '8px';
  closeBtn.style.zIndex = 10;
  closeBtn.style.fontSize = '18px';
  closeBtn.style.background = 'transparent';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'white';
  closeBtn.style.cursor = 'pointer';

  closeBtn.addEventListener('click', () => {
    stopGame();
    const parentOverlay = overlay;
    if (parentOverlay && parentOverlay.parentNode) {
      parentOverlay.parentNode.removeChild(parentOverlay);
    }
  });

  root.appendChild(closeBtn);

  const canvas = document.createElement('canvas');
  canvas.id = 'whack-canvas';
  canvas.width = Whack.width;
  canvas.height = Whack.height;
  canvas.style.border = '4px solid rgba(255,255,255,0.06)';
  canvas.style.borderRadius = '6px';
  root.appendChild(canvas);

  overlay.appendChild(root);
  return canvas;
}

function initGameListeners(canvas) {
  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    Whack.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    Whack.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  });

  canvas.addEventListener('mousedown', () => Whack.mouse.down = true);
  canvas.addEventListener('mouseup', () => Whack.mouse.down = false);

  // prevent right click context on canvas
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}

function spawnTarget() {
  const slotsX = [120, 290, 460, 630];
  const slotsY = [240, 340];
  const x = slotsX[Math.floor(Math.random() * slotsX.length)];
  const y = slotsY[Math.floor(Math.random() * slotsY.length)];

  const isRat = Math.random() < 0.6; // rats more common than soda
  Whack.entities.push({
    type: isRat ? 'rat' : 'soda',
    x: x - 30,
    y: y - 30,
    w: 60,
    h: 60,
    alive: true,
    ttl: 800 + Math.random() * 900
  });
}

function update(dt) {
  Whack.timer -= dt;
  if (Whack.timer <= 0) {
    Whack.running = false;
  }

  // spawn rate ramps up slowly
  Whack.spawnInterval = Math.max(400, Whack.spawnInterval - dt * 0.002);

  if (performance.now() - Whack.lastSpawn > Whack.spawnInterval) {
    spawnTarget();
    Whack.lastSpawn = performance.now();
  }

  // update entities
  Whack.entities = Whack.entities.filter(e => {
    e.ttl -= dt;
    // click detection (simple)
    if (Whack.mouse.down &&
        Whack.mouse.x > e.x &&
        Whack.mouse.x < e.x + e.w &&
        Whack.mouse.y > e.y &&
        Whack.mouse.y < e.y + e.h) {

      // clicking consumes the down state until next up to avoid multi-hit
      Whack.mouse.down = false;

      if (e.type === 'rat') Whack.score += 100;
      else Whack.score -= 50;

      return false; // remove entity
    }
    return e.ttl > 0;
  });
}

function draw() {
  const ctx = Whack.ctx;
  // clear
  ctx.clearRect(0, 0, Whack.width, Whack.height);

  // background
  const bg = Whack.images.basement;
  if (bg) ctx.drawImage(bg, 0, 0, Whack.width, Whack.height);

  // pipes (center)
  const pipes = Whack.images.pipes;
  if (pipes) ctx.drawImage(pipes, (Whack.width - pipes.width)/2, 150);

  // entities
  Whack.entities.forEach(e => {
    const img = Whack.images[e.type];
    if (img) ctx.drawImage(img, e.x, e.y, e.w, e.h);
    else {
      // fallback box
      ctx.fillStyle = e.type === 'rat' ? 'brown' : 'cyan';
      ctx.fillRect(e.x, e.y, e.w, e.h);
    }
  });

  // UI
  ctx.fillStyle = "#ffffff";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + Whack.score, Whack.width - 160, 36);
  ctx.fillText("Time: " + Math.ceil(Whack.timer / 1000), 20, 36);

  // hammer cursor
  const hammer = Whack.images.hammer;
  if (hammer) ctx.drawImage(hammer, Whack.mouse.x - 24, Whack.mouse.y - 24, 48, 48);
}

function loop(ts) {
  if (!Whack.running) return;
  const dt = ts - Whack.lastFrame;
  Whack.lastFrame = ts;

  update(dt);
  draw();

  if (Whack.running) requestAnimationFrame(loop);
  else endGame();
}

function endGame() {
  // simple end: show alert and stop loop
  Whack.running = false;
  const canvas = Whack.canvas;
  if (canvas && Whack.ctx) {
    Whack.ctx.fillStyle = "rgba(0,0,0,0.6)";
    Whack.ctx.fillRect(0, 0, Whack.width, Whack.height);
    Whack.ctx.fillStyle = "white";
    Whack.ctx.font = "28px monospace";
    Whack.ctx.fillText("Game Over", Whack.width / 2 - 70, Whack.height / 2 - 10);
    Whack.ctx.fillText("Score: " + Whack.score, Whack.width / 2 - 70, Whack.height / 2 + 28);
  }
}

function stopGame() {
  Whack.running = false;
  // remove canvas if desired - caller may remove overlay
  if (Whack.canvas && Whack.canvas.parentNode) {
    Whack.canvas.parentNode.removeChild(Whack.canvas);
  }
  Whack.canvas = null;
  Whack.ctx = null;
}

// PUBLIC: startWhackGame(overlayElement, basePath)
export default function startWhackGame(overlayElement, basePath = '/images/DBS2') {
  // reset state
  Whack.score = 0;
  Whack.timer = 45000;
  Whack.spawnInterval = 1000;
  Whack.entities = [];
  Whack.running = true;
  Whack.lastSpawn = 0;
  Whack.lastFrame = performance.now();

  // load assets
  loadAssets(basePath);

  // build canvas inside overlay
  const canvas = createCanvasInOverlay(overlayElement);
  Whack.canvas = canvas;
  Whack.ctx = canvas.getContext('2d');

  initGameListeners(canvas);

  // attach canvas to object for cleanup purpose
  Whack.canvas = canvas;

  requestAnimationFrame(loop);
}

export function stopWhackGame() {
  stopGame();
}
