/// whackarat.js
// Ash-Trail style rewrite of Whack-a-rat game
// Exports: startWhackGame(overlayElement, basePath, onComplete)

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
  lastFrame: 0,
  onComplete: null
};

function loadImage(name, src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Loaded: ${name} from ${src}`);
      resolve({ name, img });
    };
    img.onerror = (e) => {
      console.error(`❌ Failed to load: ${name} from ${src}`);
      reject(new Error('Failed to load ' + src));
    };
    img.src = src;
  });
}

async function loadAssets(basePath) {
  console.log('Loading assets from:', basePath);
  
  const manifest = [
    ['basement', `${basePath}/basement.png`],
    ['pipes', `${basePath}/pipes.png`],
    ['hammer', `${basePath}/hammer.png`],
    ['rat', `${basePath}/movingrat.gif`],
    ['soda', `${basePath}/sodacan.png`]
  ];

  try {
    const promises = manifest.map(m => loadImage(m[0], m[1]));
    const assets = await Promise.all(promises);
    assets.forEach(a => Whack.images[a.name] = a.img);
    console.log('✅ All assets loaded successfully');
  } catch (error) {
    console.error('❌ Asset loading failed:', error);
    throw error;
  }
}

function createCanvasInOverlay(overlay) {
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
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
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
  canvas.addEventListener('contextmenu', e => e.preventDefault());
}

function spawnTarget() {
  const slotsX = [120, 290, 460, 630];
  const slotsY = [240, 340];
  const x = slotsX[Math.floor(Math.random() * slotsX.length)];
  const y = slotsY[Math.floor(Math.random() * slotsY.length)];

  const isRat = Math.random() < 0.6;
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

  Whack.spawnInterval = Math.max(400, Whack.spawnInterval - dt * 0.002);

  if (performance.now() - Whack.lastSpawn > Whack.spawnInterval) {
    spawnTarget();
    Whack.lastSpawn = performance.now();
  }

  Whack.entities = Whack.entities.filter(e => {
    e.ttl -= dt;
    if (Whack.mouse.down &&
        Whack.mouse.x > e.x &&
        Whack.mouse.x < e.x + e.w &&
        Whack.mouse.y > e.y &&
        Whack.mouse.y < e.y + e.h) {

      Whack.mouse.down = false;

      if (e.type === 'rat') Whack.score += 100;
      else Whack.score -= 50;

      return false;
    }
    return e.ttl > 0;
  });
}

function draw() {
  const ctx = Whack.ctx;
  ctx.clearRect(0, 0, Whack.width, Whack.height);

  const bg = Whack.images.basement;
  if (bg) ctx.drawImage(bg, 0, 0, Whack.width, Whack.height);

  const pipes = Whack.images.pipes;
  if (pipes) ctx.drawImage(pipes, (Whack.width - pipes.width)/2, 150);

  Whack.entities.forEach(e => {
    const img = Whack.images[e.type];
    if (img) ctx.drawImage(img, e.x, e.y, e.w, e.h);
    else {
      ctx.fillStyle = e.type === 'rat' ? 'brown' : 'cyan';
      ctx.fillRect(e.x, e.y, e.w, e.h);
    }
  });

  ctx.fillStyle = "#ffffff";
  ctx.font = "20px monospace";
  ctx.fillText("Score: " + Whack.score, Whack.width - 160, 36);
  ctx.fillText("Time: " + Math.ceil(Whack.timer / 1000), 20, 36);

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
  
  // Call completion callback with crypto earned
  if (Whack.onComplete) {
    const cryptoEarned = Math.floor(Whack.score / 100);
    Whack.onComplete(cryptoEarned);
  }
}

function stopGame() {
  Whack.running = false;
  if (Whack.canvas && Whack.canvas.parentNode) {
    Whack.canvas.parentNode.removeChild(Whack.canvas);
  }
  Whack.canvas = null;
  Whack.ctx = null;
}

// PUBLIC: startWhackGame(overlayElement, basePath, onComplete)
export default async function startWhackGame(overlayElement, basePath = '/images/DBS2', onComplete = null) {
  console.log('🎮 Starting Whack-a-Rat game...');
  console.log('Base path:', basePath);
  
  // Store completion callback
  Whack.onComplete = onComplete;
  
  // Reset state
  Whack.score = 0;
  Whack.timer = 45000;
  Whack.spawnInterval = 1000;
  Whack.entities = [];
  Whack.running = true;
  Whack.lastSpawn = 0;
  Whack.lastFrame = performance.now();

  // Build canvas
  const canvas = createCanvasInOverlay(overlayElement);
  Whack.canvas = canvas;
  Whack.ctx = canvas.getContext('2d');

  // Show loading message
  Whack.ctx.fillStyle = '#000';
  Whack.ctx.fillRect(0, 0, Whack.width, Whack.height);
  Whack.ctx.fillStyle = '#fff';
  Whack.ctx.font = '24px monospace';
  Whack.ctx.fillText('Loading...', Whack.width / 2 - 60, Whack.height / 2);

  try {
    await loadAssets(basePath);
    initGameListeners(canvas);
    requestAnimationFrame(loop);
  } catch (error) {
    console.error('Failed to load game assets:', error);
    Whack.ctx.fillStyle = '#f00';
    Whack.ctx.fillText('Error loading assets!', Whack.width / 2 - 100, Whack.height / 2);
    Whack.ctx.font = '14px monospace';
    Whack.ctx.fillText('Check console for details', Whack.width / 2 - 100, Whack.height / 2 + 30);
  }
}

export function stopWhackGame() {
  stopGame();
}