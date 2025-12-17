// whackarat.js
// Whack-a-Rat minigame - clear the rat infestation to recover the security code page

import { updateCrypto, isMinigameCompleted, completeMinigame, addInventoryItem } from './StatsManager.js';

const Whack = {
    canvas: null,
    ctx: null,
    width: 700,
    height: 500,
    images: {},
    mouse: { x: 0, y: 0, down: false },
    score: 0,
    timer: 30000,
    spawnInterval: 800,
    lastSpawn: 0,
    entities: [],
    running: false,
    lastFrame: 0,
    isFirstCompletion: false,
    basePath: '',
    onGameEnd: null,
    overlay: null,
    root: null
};

function loadImage(name, src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ name, img });
        img.onerror = () => {
            console.warn('Failed to load ' + src);
            resolve({ name, img: null });
        };
        img.src = src;
    });
}

async function loadAssets(basePath) {
    const manifest = [
        ['rat', `${basePath}/movingrat.gif`],
        ['soda', `${basePath}/sodacan.png`]
    ];

    const promises = manifest.map(m => loadImage(m[0], m[1]));
    const assets = await Promise.all(promises);
    assets.forEach(a => {
        if (a.img) Whack.images[a.name] = a.img;
    });
}

function createUI(overlay) {
    // Remove existing
    const existing = overlay.querySelector('#whack-root');
    if (existing) existing.remove();

    const root = document.createElement('div');
    root.id = 'whack-root';
    root.style.cssText = `
        position: relative;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 2px solid #0a5;
        border-radius: 10px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-family: 'Courier New', monospace;
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-bottom: 10px;
        padding: 0 10px;
    `;

    const title = document.createElement('div');
    title.textContent = 'RAT INFESTATION';
    title.style.cssText = `
        color: #0a5;
        font-size: 18px;
        font-weight: bold;
        letter-spacing: 2px;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'EXIT';
    closeBtn.style.cssText = `
        background: #600;
        color: #ccc;
        border: 1px solid #800;
        padding: 6px 15px;
        cursor: pointer;
        font-family: 'Courier New', monospace;
        font-size: 12px;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.background = '#800';
    closeBtn.onmouseleave = () => closeBtn.style.background = '#600';
    closeBtn.onclick = () => cleanup();

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Stats bar
    const stats = document.createElement('div');
    stats.id = 'whack-stats';
    stats.style.cssText = `
        display: flex;
        justify-content: space-between;
        width: 100%;
        padding: 8px 15px;
        background: rgba(0, 40, 20, 0.5);
        border-radius: 5px;
        margin-bottom: 10px;
    `;
    stats.innerHTML = `
        <div style="color: #888;">TIME: <span id="whack-time" style="color: #0a5;">30</span></div>
        <div style="color: #888;">SCORE: <span id="whack-score" style="color: #0a5;">0</span></div>
    `;

    // Instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
        color: #666;
        font-size: 11px;
        margin-bottom: 8px;
    `;
    instructions.textContent = 'Click rats to score. Avoid the soda cans.';

    // Canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
        background: #111;
        border: 1px solid #333;
        border-radius: 5px;
        overflow: hidden;
    `;

    const canvas = document.createElement('canvas');
    canvas.id = 'whack-canvas';
    canvas.width = Whack.width;
    canvas.height = Whack.height;
    canvas.style.cssText = `
        display: block;
        cursor: crosshair;
    `;

    canvasContainer.appendChild(canvas);

    root.appendChild(header);
    root.appendChild(stats);
    root.appendChild(instructions);
    root.appendChild(canvasContainer);

    overlay.appendChild(root);
    Whack.root = root;

    return canvas;
}

function initGameListeners(canvas) {
    const rect = canvas.getBoundingClientRect.bind(canvas);

    canvas.addEventListener('mousemove', e => {
        const r = rect();
        Whack.mouse.x = e.clientX - r.left;
        Whack.mouse.y = e.clientY - r.top;
    });

    canvas.addEventListener('mousedown', () => Whack.mouse.down = true);
    canvas.addEventListener('mouseup', () => Whack.mouse.down = false);
    canvas.addEventListener('mouseleave', () => Whack.mouse.down = false);
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    
    // Touch support
    canvas.addEventListener('touchstart', e => {
        e.preventDefault();
        const touch = e.touches[0];
        const r = rect();
        Whack.mouse.x = touch.clientX - r.left;
        Whack.mouse.y = touch.clientY - r.top;
        Whack.mouse.down = true;
    });
    canvas.addEventListener('touchend', () => Whack.mouse.down = false);
}

function spawnTarget() {
    // Grid positions for rats to appear
    const cols = 5;
    const rows = 3;
    const cellW = Whack.width / cols;
    const cellH = (Whack.height - 50) / rows;
    
    const col = Math.floor(Math.random() * cols);
    const row = Math.floor(Math.random() * rows);
    
    const x = col * cellW + cellW / 2 - 30;
    const y = row * cellH + cellH / 2 - 30 + 50;

    const isRat = Math.random() < 0.7;
    Whack.entities.push({
        type: isRat ? 'rat' : 'soda',
        x: x,
        y: y,
        w: 60,
        h: 60,
        alive: true,
        ttl: 600 + Math.random() * 600,
        hit: false
    });
}

function update(dt) {
    Whack.timer -= dt;
    if (Whack.timer <= 0) {
        Whack.running = false;
        return;
    }

    // Speed up spawning over time
    Whack.spawnInterval = Math.max(300, 800 - (30000 - Whack.timer) / 100);

    if (performance.now() - Whack.lastSpawn > Whack.spawnInterval) {
        spawnTarget();
        Whack.lastSpawn = performance.now();
    }

    Whack.entities = Whack.entities.filter(e => {
        e.ttl -= dt;
        
        if (Whack.mouse.down && !e.hit &&
            Whack.mouse.x > e.x &&
            Whack.mouse.x < e.x + e.w &&
            Whack.mouse.y > e.y &&
            Whack.mouse.y < e.y + e.h) {

            Whack.mouse.down = false;
            e.hit = true;
            
            if (e.type === 'rat') {
                Whack.score += 100;
            } else {
                Whack.score -= 50;
            }
            
            // Flash effect
            setTimeout(() => {
                const idx = Whack.entities.indexOf(e);
                if (idx > -1) Whack.entities.splice(idx, 1);
            }, 100);
            
            return true;
        }
        return e.ttl > 0;
    });

    // Update UI
    const timeEl = document.getElementById('whack-time');
    const scoreEl = document.getElementById('whack-score');
    if (timeEl) timeEl.textContent = Math.ceil(Whack.timer / 1000);
    if (scoreEl) scoreEl.textContent = Whack.score;
}

function draw() {
    const ctx = Whack.ctx;
    
    // Clear with dark background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, Whack.width, Whack.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * Whack.width / 5, 0);
        ctx.lineTo(i * Whack.width / 5, Whack.height);
        ctx.stroke();
    }
    for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * Whack.height / 3 + 50);
        ctx.lineTo(Whack.width, i * Whack.height / 3 + 50);
        ctx.stroke();
    }

    // Draw entities
    Whack.entities.forEach(e => {
        if (e.hit) {
            // Hit flash
            ctx.fillStyle = e.type === 'rat' ? 'rgba(0, 170, 85, 0.5)' : 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(e.x - 5, e.y - 5, e.w + 10, e.h + 10);
        }
        
        const img = Whack.images[e.type];
        if (img) {
            ctx.drawImage(img, e.x, e.y, e.w, e.h);
        } else {
            // Fallback shapes
            if (e.type === 'rat') {
                ctx.fillStyle = '#654321';
                ctx.beginPath();
                ctx.ellipse(e.x + e.w/2, e.y + e.h/2, e.w/2, e.h/3, 0, 0, Math.PI * 2);
                ctx.fill();
                // Ears
                ctx.beginPath();
                ctx.arc(e.x + 10, e.y + 10, 8, 0, Math.PI * 2);
                ctx.arc(e.x + e.w - 10, e.y + 10, 8, 0, Math.PI * 2);
                ctx.fill();
                // Eyes
                ctx.fillStyle = '#f00';
                ctx.beginPath();
                ctx.arc(e.x + 20, e.y + 25, 3, 0, Math.PI * 2);
                ctx.arc(e.x + e.w - 20, e.y + 25, 3, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#c41e3a';
                ctx.fillRect(e.x + 10, e.y, e.w - 20, e.h);
                ctx.fillStyle = '#aaa';
                ctx.fillRect(e.x + 15, e.y - 5, e.w - 30, 10);
            }
        }
        
        // TTL indicator (fading)
        if (e.ttl < 300) {
            ctx.globalAlpha = e.ttl / 300;
        }
        ctx.globalAlpha = 1;
    });

    // Crosshair cursor
    ctx.strokeStyle = '#0a5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Whack.mouse.x - 15, Whack.mouse.y);
    ctx.lineTo(Whack.mouse.x + 15, Whack.mouse.y);
    ctx.moveTo(Whack.mouse.x, Whack.mouse.y - 15);
    ctx.lineTo(Whack.mouse.x, Whack.mouse.y + 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(Whack.mouse.x, Whack.mouse.y, 10, 0, Math.PI * 2);
    ctx.stroke();
}

function loop(ts) {
    if (!Whack.running) {
        endGame();
        return;
    }
    
    const dt = ts - Whack.lastFrame;
    Whack.lastFrame = ts;

    update(dt);
    draw();

    requestAnimationFrame(loop);
}

async function endGame() {
    Whack.running = false;
    
    const ctx = Whack.ctx;
    const basePath = Whack.basePath;
    
    // Calculate crypto reward
    let cryptoReward = Math.floor(Whack.score / 50);
    if (cryptoReward < 0) cryptoReward = 0;
    
    // First completion bonus
    if (Whack.isFirstCompletion && Whack.score > 0) {
        cryptoReward += 15;
        
        try {
            await completeMinigame('whackarat');
            console.log('[Whack-a-Rat] Marked as complete');
            
            await addInventoryItem({
                name: 'Code Scrap: Whack-a-Rat',
                found_at: 'whackarat',
                timestamp: new Date().toISOString()
            });
            console.log('[Whack-a-Rat] Code scrap added to inventory');
        } catch (e) {
            console.log('[Whack-a-Rat] Could not save completion:', e);
        }
    }
    
    // Award crypto
    if (cryptoReward > 0) {
        try {
            await updateCrypto(cryptoReward);
        } catch(e) {
            console.log('[Whack-a-Rat] Could not award crypto:', e);
        }
    }
    
    // Draw end screen on canvas
    if (ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, Whack.width, Whack.height);
        
        ctx.textAlign = 'center';
        
        ctx.fillStyle = '#0a5';
        ctx.font = 'bold 28px monospace';
        ctx.fillText('INFESTATION CLEARED', Whack.width / 2, Whack.height / 2 - 80);
        
        ctx.fillStyle = '#888';
        ctx.font = '20px monospace';
        ctx.fillText('Final Score: ' + Whack.score, Whack.width / 2, Whack.height / 2 - 30);
        
        if (cryptoReward > 0) {
            ctx.fillStyle = '#0a5';
            ctx.font = '18px monospace';
            ctx.fillText('+' + cryptoReward + ' Crypto', Whack.width / 2, Whack.height / 2 + 10);
        }
        
        if (Whack.isFirstCompletion && Whack.score > 0) {
            ctx.fillStyle = '#a80';
            ctx.font = '14px monospace';
            ctx.fillText('Found a chewed page in the rat nest.', Whack.width / 2, Whack.height / 2 + 50);
            
            // Draw code scrap image
            const scrapImg = new Image();
            scrapImg.src = `${basePath}/codescrapRats.png`;
            scrapImg.onload = () => {
                ctx.drawImage(scrapImg, Whack.width / 2 - 40, Whack.height / 2 + 70, 80, 60);
            };
        }
        
        ctx.fillStyle = '#666';
        ctx.font = '12px monospace';
        ctx.fillText('Click anywhere to close', Whack.width / 2, Whack.height - 30);
        
        ctx.textAlign = 'left';
    }
    
    // Click to close
    if (Whack.canvas) {
        Whack.canvas.onclick = () => cleanup();
    }
    
    // Auto close after delay
    setTimeout(() => {
        cleanup();
    }, 5000);
}

function cleanup() {
    Whack.running = false;
    window.minigameActive = false;
    
    if (Whack.root && Whack.root.parentNode) {
        Whack.root.parentNode.removeChild(Whack.root);
    }
    if (Whack.overlay && Whack.overlay.parentNode) {
        Whack.overlay.parentNode.removeChild(Whack.overlay);
    }
    
    Whack.canvas = null;
    Whack.ctx = null;
    Whack.root = null;
    Whack.overlay = null;
    
    // Refresh leaderboard
    try {
        if (window.Leaderboard && typeof window.Leaderboard.refresh === 'function') {
            window.Leaderboard.refresh();
        }
    } catch(e) { console.log('Could not refresh leaderboard'); }
    
    if (Whack.onGameEnd) {
        Whack.onGameEnd(Whack.score);
    }
}

// PUBLIC: startWhackGame(overlayElement, basePath, onComplete)
export default async function startWhackGame(overlayElement, basePath = '/images/DBS2', onComplete = null) {
    window.minigameActive = true;
    
    // Check if first completion
    let isFirst = false;
    try {
        isFirst = !(await isMinigameCompleted('whackarat'));
        console.log('[Whack-a-Rat] First completion:', isFirst);
    } catch (e) {
        console.log('[Whack-a-Rat] Could not check completion status:', e);
    }
    
    // Reset state
    Whack.score = 0;
    Whack.timer = 30000;
    Whack.spawnInterval = 800;
    Whack.entities = [];
    Whack.running = true;
    Whack.lastSpawn = 0;
    Whack.lastFrame = performance.now();
    Whack.isFirstCompletion = isFirst;
    Whack.basePath = basePath;
    Whack.onGameEnd = onComplete;
    Whack.images = {};
    Whack.overlay = overlayElement;

    // Load assets
    await loadAssets(basePath);

    // Build UI
    const canvas = createUI(overlayElement);
    Whack.canvas = canvas;
    Whack.ctx = canvas.getContext('2d');

    initGameListeners(canvas);

    requestAnimationFrame(loop);
}

export function stopWhackGame() {
    cleanup();
}