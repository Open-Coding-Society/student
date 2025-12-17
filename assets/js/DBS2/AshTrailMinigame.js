import { addInventoryItem, completeMinigame, updateCrypto, updateScore, isMinigameCompleted, getScores } from './StatsManager.js';
// Logical grid that everything lives on (player + path).
// Higher numbers = smoother curves and more room for complex shapes.
const GRID_COLS = 24;
const GRID_ROWS = 24;

// Utility to append evenly spaced points along a segment
function pushSegmentPoints(pts, ax, ay, bx, by, steps) {
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({
      x: ax + (bx - ax) * t,
      y: ay + (by - ay) * t,
    });
  }
}

// Utility to build a smooth sine‑wave style path that fills the arena
function buildWavePath() {
  const pts = [];
  const marginX = 2;
  const minX = marginX;
  const maxX = GRID_COLS - marginX;
  const midY = GRID_ROWS * 0.5;
  const amp = GRID_ROWS * 0.3;
  const steps = 72;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps; // 0 → 1
    const x = minX + (maxX - minX) * t;
    const y = midY + Math.sin(t * Math.PI * 2) * amp * 0.5;
    pts.push({ x, y });
  }
  return pts;
}

// Heart / petal‑like curve around the center (for romantic crypto lore)
function buildHeartPath() {
  const pts = [];
  const cx = GRID_COLS / 2;
  const cy = GRID_ROWS * 0.55;
  // Make the main heart larger so it fills more of the arena
  const scale = GRID_ROWS * 0.30;
  const steps = 220; // more samples = longer, smoother path

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    // classic heart parametric curve
    const xh = 16 * Math.pow(Math.sin(t), 3);
    const yh =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    const x = cx + (xh / 18) * scale;
    const y = cy - (yh / 18) * scale;
    pts.push({ x, y });
  }

  // Add an outer petal loop *outside* the heart to make it harder / longer
  const outerRadiusBase = GRID_ROWS * 0.40; // clearly outside main heart
  const outerSteps = 120;
  for (let i = 0; i <= outerSteps; i++) {
    const t = (i / outerSteps) * Math.PI * 2;
    const angle = t;
    // slightly wavy lotus‑petal ring around the heart
    const radius =
      outerRadiusBase *
      (0.9 + 0.2 * Math.sin(3 * t));
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    pts.push({ x, y });
  }

  return pts;
}

// Cross / star corridor shape — four arms from center, good for harder levels
function buildCrossPath() {
  const pts = [];
  const cx = GRID_COLS / 2;
  const cy = GRID_ROWS / 2;
  const arm = GRID_ROWS * 0.38;
  const stepsPerSeg = 18;

  // Start near bottom center, walk up into a cross, then around arms in a loop
  const startY = GRID_ROWS - 2;
  pushSegmentPoints(pts, cx, startY, cx, cy + arm * 0.4, stepsPerSeg); // approach
  pushSegmentPoints(pts, cx, cy + arm * 0.4, cx, cy - arm, stepsPerSeg); // up
  pushSegmentPoints(pts, cx, cy - arm, cx + arm, cy - arm * 0.1, stepsPerSeg); // top‑right
  pushSegmentPoints(pts, cx + arm, cy - arm * 0.1, cx + arm * 0.2, cy + arm, stepsPerSeg); // down‑right
  pushSegmentPoints(pts, cx + arm * 0.2, cy + arm, cx, cy + arm * 0.4, stepsPerSeg); // bottom‑right back to center line
  pushSegmentPoints(pts, cx, cy + arm * 0.4, cx - arm * 0.2, cy + arm, stepsPerSeg); // bottom‑left
  pushSegmentPoints(pts, cx - arm * 0.2, cy + arm, cx - arm, cy - arm * 0.1, stepsPerSeg); // up‑left
  pushSegmentPoints(pts, cx - arm, cy - arm * 0.1, cx, cy - arm, stepsPerSeg); // back to top
  pushSegmentPoints(pts, cx, cy - arm, cx, startY, stepsPerSeg); // exit down

  return pts;
}

// --- Fake book + path data (frontend‑only, no backend yet) -----------------

const BOOKS = [
  {
    id: "defi_grimoire",
    title: "DeFi Grimoire",
    difficulty: 1,
    rating: "3/10",
    requiredScore: 60,
    description:
      "A gentle warm‑up. The trail wiggles a bit, but you can mostly cruise and get used to how the game feels.",
    // Smooth wave across the whole arena
    path: buildWavePath(),
  },
  {
    id: "lost_ledger",
    title: "Lost Ledger",
    difficulty: 2,
    rating: "6/10",
    requiredScore: 60,
    description:
      "Now it starts to fight back. The path crosses over itself and turns more often, so you actually have to focus.",
    // Cross‑corridor, four‑arm shape
    path: buildCrossPath(),
  },
  {
    id: "proof_of_burn",
    title: "Proof‑of‑Burn Almanac",
    difficulty: 3,
    rating: "9.5/10",
    requiredScore: 60,
    description:
      "Full try‑hard mode. Long, curvy, and easy to lose track of. If you zone out for half a second, your score will show it.",
    // Heart / petal loop wrapped around the center
    path: buildHeartPath(),
  },
];

// --- DOM helpers -----------------------------------------------------------

function createEl(tag, props = {}, children = []) {
  const el = document.createElement(tag);
  Object.assign(el, props);
  if (props.style) {
    Object.assign(el.style, props.style);
  }
  for (const child of children) {
    if (typeof child === "string") el.appendChild(document.createTextNode(child));
    else if (child) el.appendChild(child);
  }
  return el;
}

// --- Progress / completion tracking ----------------------------------------
// Track completion per-book locally so the player can see 0/3, 1/3, ... 3/3.
// (This is separate from completeMinigame('ash_trail') which is for the overall minigame.)
const ASH_TRAIL_COMPLETION_KEY = "ash_trail_completed_books_v1";

function loadCompletedBookIds() {
  try {
    const raw = localStorage.getItem(ASH_TRAIL_COMPLETION_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveCompletedBookIds(ids) {
  try {
    localStorage.setItem(ASH_TRAIL_COMPLETION_KEY, JSON.stringify(ids));
  } catch (e) {
    // ignore
  }
}

function isBookCompleted(bookId) {
  return loadCompletedBookIds().includes(bookId);
}

function markBookCompleted(bookId) {
  const ids = loadCompletedBookIds();
  if (!ids.includes(bookId)) {
    ids.push(bookId);
    saveCompletedBookIds(ids);
  }
  return ids;
}

function completionCount() {
  const ids = loadCompletedBookIds();
  return Math.min(BOOKS.length, ids.length);
}

function allBooksCompleted() {
  return completionCount() >= BOOKS.length;
}

function createProgressPill() {
  const done = completionCount();
  return createEl("div", {
    textContent: allBooksCompleted()
      ? `Progress: ${done}/${BOOKS.length} — ALL BOOKS CLEARED ✅`
      : `Progress: ${done}/${BOOKS.length} — Clear all ${BOOKS.length} to finish`,
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: "700",
      background: allBooksCompleted() ? "rgba(34,197,94,0.18)" : "rgba(148,163,184,0.12)",
      color: allBooksCompleted() ? "#86efac" : "#e5e7eb",
      border: allBooksCompleted()
        ? "1px solid rgba(34,197,94,0.55)"
        : "1px solid rgba(148,163,184,0.35)",
      marginTop: "10px",
    },
  });
}

// --- Core state ------------------------------------------------------------

let overlay = null;
let container = null;
let canvas = null;
let ctx = null;

let currentBook = null;
let truePath = [];      // array of logical grid points {x, y}
let playerPath = [];    // sampled player positions during run
let playerPos = null;   // current player position in grid space (floats)
let isRunPhase = false;

// Continuous movement state for run phase
let pressedDirs = { up: false, down: false, left: false, right: false };
let runAnimId = null;
let lastTimestamp = null;
let sampleAccumulator = 0;
let keyHandlerDown = null;
let keyHandlerUp = null;

// --- AshTrail-only "leaderboard" (your best %) ------------------------------
async function renderAshTrailBestPanel(mountEl) {
  if (!mountEl) return;
  mountEl.innerHTML = "";

  const wrapper = createEl("div", {
    style: {
      padding: "8px 10px",
      borderRadius: "12px",
      border: "1px solid rgba(148,163,184,0.25)",
      background: "rgba(148,163,184,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
  });

  wrapper.appendChild(
    createEl("div", {
      textContent: "Ash Trail — Best %",
      style: { fontSize: "12px", fontWeight: "900", color: "#e5e7eb" },
    })
  );

  let completed = false;
  try {
    completed = await isMinigameCompleted("ash_trail");
  } catch (_) {
    completed = false;
  }

  let best = null;
  if (completed) {
    try {
      const scores = (await getScores()) || {};
      best = scores["ash_trail"];
    } catch (_) {
      best = null;
    }
  }

  wrapper.appendChild(
    createEl("div", {
      textContent: completed ? `Best: ${Math.round(Number(best || 0))}%` : "Best: NA (finish all 3 books)",
      style: { fontSize: "12px", fontWeight: "800", color: completed ? "#86efac" : "#9ca3af" },
    })
  );

  wrapper.appendChild(
    createEl("div", {
      textContent: "This updates after each run. NA until the full Ash Trail set is completed.",
      style: { fontSize: "10px", color: "#9ca3af", lineHeight: "1.35" },
    })
  );

  mountEl.appendChild(wrapper);
}

// --- AshTrail global leaderboard (backend-powered) --------------------------
function getDbs2ApiBase() {
  // Match the main `Leaderboard.js` behavior
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  return isLocalhost ? "http://localhost:8587/api/dbs2" : "/api/dbs2";
}

/**
 * Expected backend contract (you said you'll add it):
 * GET `${apiBase}/leaderboard/minigame?game=ash_trail&limit=10`
 * Response shape (flexible):
 * {
 *   leaderboard: [
 *     { rank: 1, score: 97, user_info: { name: "Cyrus", uid: "..." } }
 *   ]
 * }
 */
async function fetchAshTrailLeaderboard(limit = 10) {
  const apiBase = getDbs2ApiBase();
  const url = `${apiBase}/leaderboard/minigame?game=ash_trail&limit=${limit}`;
  const res = await fetch(url, { method: "GET", credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const raw = data?.leaderboard;
  if (!Array.isArray(raw)) return [];
  return raw.map((entry, idx) => ({
    rank: entry?.rank ?? (idx + 1),
    name: entry?.user_info?.name || entry?.user_info?.uid || entry?.name || "Unknown",
    score: typeof entry?.score === "number" ? entry.score : Number(entry?.score ?? 0),
  }));
}

async function renderAshTrailLeaderboardPanel(mountEl) {
  if (!mountEl) return;
  mountEl.innerHTML = "";

  const wrapper = createEl("div", {
    style: {
      padding: "8px 10px",
      borderRadius: "12px",
      border: "1px solid rgba(148,163,184,0.25)",
      background: "rgba(148,163,184,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
  });

  const header = createEl("div", {
    style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" },
  });

  header.appendChild(
    createEl("div", {
      textContent: "Ash Trail Leaderboard",
      style: { fontSize: "12px", fontWeight: "900", color: "#e5e7eb" },
    })
  );

  const refreshBtn = createEl("button", {
    textContent: "Refresh",
    style: {
      padding: "4px 8px",
      borderRadius: "999px",
      border: "1px solid rgba(148,163,184,0.35)",
      background: "rgba(15,23,42,0.7)",
      color: "#e5e7eb",
      fontSize: "11px",
      cursor: "pointer",
    },
  });
  header.appendChild(refreshBtn);
  wrapper.appendChild(header);

  const list = createEl("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } });
  wrapper.appendChild(list);

  const load = async () => {
    list.innerHTML = "";
    list.appendChild(createEl("div", { textContent: "Loading…", style: { fontSize: "11px", color: "#9ca3af" } }));
    try {
      const rows = await fetchAshTrailLeaderboard(10);
      list.innerHTML = "";
      if (!rows.length) {
        list.appendChild(
          createEl("div", { textContent: "No scores yet.", style: { fontSize: "11px", color: "#9ca3af" } })
        );
      } else {
        rows.slice(0, 10).forEach((r) => {
          const row = createEl("div", { style: { display: "flex", justifyContent: "space-between", gap: "8px" } });
          row.appendChild(
            createEl("div", {
              textContent: `#${r.rank} ${r.name}`,
              style: { fontSize: "11px", color: "#e5e7eb", overflow: "hidden", textOverflow: "ellipsis" },
            })
          );
          row.appendChild(
            createEl("div", {
              textContent: `${Math.max(0, Math.min(100, Math.round(r.score)))}%`,
              style: { fontSize: "11px", fontWeight: "900", color: "#86efac" },
            })
          );
          list.appendChild(row);
        });
      }
    } catch (e) {
      list.innerHTML = "";
      list.appendChild(
        createEl("div", {
          textContent: "Leaderboard unavailable (backend endpoint not added yet).",
          style: { fontSize: "11px", color: "#fca5a5", lineHeight: "1.35" },
        })
      );
    }
  };

  refreshBtn.addEventListener("click", load);
  await load();

  mountEl.appendChild(wrapper);
}

// --- Overlay lifecycle -----------------------------------------------------

function openOverlay() {
  if (overlay) closeOverlay();

  overlay = createEl("div", {
    className: "ashtrail-overlay",
    style: {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.75)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "5000",
      backdropFilter: "blur(4px)",
    },
  });

  container = createEl("div", {
    className: "ashtrail-container",
    style: {
      width: "min(960px, 90vw)",
      height: "min(600px, 85vh)",
      background: "#111820",
      borderRadius: "16px",
      boxShadow: "0 18px 45px rgba(0,0,0,0.55)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#f3f4f6",
      display: "flex",
      flexDirection: "column",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflow: "hidden",
    },
  });

  const header = createHeader();
  const main = createEl("div", {
    className: "ashtrail-main",
    style: {
      flex: "1",
      display: "flex",
      padding: "12px 18px 18px",
      gap: "18px",
      boxSizing: "border-box",
    },
  });
  main.id = "ashtrail-main";

  container.appendChild(header);
  container.appendChild(main);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
}

function closeOverlay() {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay);
  }
  overlay = null;
  container = null;
  canvas = null;
  ctx = null;
  truePath = [];
  playerPath = [];
  playerPos = null;
  isRunPhase = false;
  cleanupRunInput();
  // Re-enable main game controls
  window.ashTrailActive = false;
}

function createHeader() {
  const title = createEl("div", {
    textContent: "Ash Trail Memory — Burnt Book Recovery",
    style: {
      fontSize: "18px",
      fontWeight: "600",
      letterSpacing: "0.03em",
    },
  });

  const subtitle = createEl("div", {
    textContent: "Follow the ash trail and restore Ishowgreen’s crypto scriptures.",
    style: {
      fontSize: "12px",
      color: "#9ca3af",
      marginTop: "2px",
    },
  });

  const textWrap = createEl("div", {
    style: { display: "flex", flexDirection: "column" },
  }, [title, subtitle]);

  const closeBtn = createEl("button", {
    textContent: "✕",
    ariaLabel: "Close",
    style: {
      border: "none",
      background: "transparent",
      color: "#9ca3af",
      fontSize: "18px",
      cursor: "pointer",
      padding: "4px 8px",
      borderRadius: "999px",
    },
  });
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "rgba(148,163,184,0.15)";
    closeBtn.style.color = "#e5e7eb";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "transparent";
    closeBtn.style.color = "#9ca3af";
  });
  closeBtn.addEventListener("click", () => {
    closeOverlay();
  });

  const header = createEl("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 18px 8px",
      borderBottom: "1px solid rgba(148,163,184,0.25)",
      background:
        "radial-gradient(circle at top left, rgba(56,189,248,0.18), transparent 55%), #020617",
    },
  }, [textWrap, closeBtn]);

  return header;
}

// --- Scene rendering helpers -----------------------------------------------

function setScene(contentEl) {
  const main = document.getElementById("ashtrail-main");
  if (!main) return;
  main.innerHTML = "";
  main.appendChild(contentEl);
}

// Scene 0: Intro / connect to main quest

function renderIntroScene() {
  const left = createEl("div", {
    style: {
      flex: "1.2",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "12px 4px",
      gap: "12px",
    },
  });

  const introTitle = createEl("h2", {
    textContent: "Ishowgreen’s Burnt Library",
    style: {
      margin: "0",
      fontSize: "22px",
      fontWeight: "600",
    },
  });

  const introText = createEl("p", {
    textContent:
      "Ishowgreen torched his own crypto scriptures in a rage. Now he wants you to reconstruct them from ash trails.",
    style: {
      margin: "4px 0 0",
      fontSize: "14px",
      lineHeight: "1.5",
      color: "#e5e7eb",
    },
  });

  const flavor = createEl("p", {
    textContent:
      "Memorize the glowing paths, then walk them from memory. Restore enough books and maybe he’ll finally let you leave the basement.",
    style: {
      margin: "6px 0 0",
      fontSize: "13px",
      lineHeight: "1.5",
      color: "#9ca3af",
    },
  });

  const startBtn = createPrimaryButton("Start Ash Trail Challenge", () => {
    renderBookSelectScene();
  });

  left.appendChild(introTitle);
  left.appendChild(introText);
  left.appendChild(flavor);
  left.appendChild(startBtn);

  const right = createEl("div", {
    style: {
      flex: "1",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  });

  const previewCanvasWrap = createCanvasPanel("Preview", "Follow glowing ash once, then from memory.");
  right.appendChild(previewCanvasWrap);

  const layout = createEl("div", {
    style: {
      display: "flex",
      gap: "18px",
      width: "100%",
      height: "100%",
    },
  }, [left, right]);

  setScene(layout);
}

function createPrimaryButton(label, onClick) {
  const btn = createEl("button", {
    textContent: label,
    style: {
      marginTop: "8px",
      alignSelf: "flex-start",
      padding: "8px 16px",
      borderRadius: "999px",
      border: "none",
      fontSize: "14px",
      fontWeight: "600",
      cursor: "pointer",
      background:
        "linear-gradient(135deg, #22c55e, #16a34a)",
      color: "#f9fafb",
      boxShadow: "0 8px 20px rgba(34,197,94,0.35)",
    },
  });
  btn.addEventListener("mouseenter", () => {
    btn.style.filter = "brightness(1.05)";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.filter = "none";
  });
  btn.addEventListener("click", onClick);
  return btn;
}

function createCanvasPanel(title, subtitle) {
  const wrapper = createEl("div", {
    style: {
      width: "100%",
      height: "100%",
      background: "#020617",
      borderRadius: "14px",
      border: "1px solid rgba(148,163,184,0.35)",
      display: "flex",
      flexDirection: "column",
      padding: "10px",
      boxSizing: "border-box",
      gap: "6px",
    },
  });

  const heading = createEl("div", {
    textContent: title,
    style: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#e5e7eb",
    },
  });

  const sub = createEl("div", {
    textContent: subtitle,
    style: { fontSize: "11px", color: "#9ca3af" },
  });

  canvas = createEl("canvas", {
    width: 460,
    height: 360,
    style: {
      flex: "1",
      borderRadius: "10px",
      background: "#020617",
      border: "1px solid rgba(55,65,81,0.8)",
    },
  });
  ctx = canvas.getContext("2d");

  wrapper.appendChild(heading);
  wrapper.appendChild(sub);
  wrapper.appendChild(canvas);

  return wrapper;
}

// Scene 1: Book selection ---------------------------------------------------

function renderBookSelectScene() {
  const sidebar = createEl("div", {
    style: {
      width: "260px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
  });

  const title = createEl("h2", {
    textContent: "Choose a Burnt Book",
    style: {
      margin: "0",
      fontSize: "18px",
    },
  });

  const subtitle = createEl("p", {
    textContent:
      "Each book is a different route. Start with the chill one and work your way up to the sweaty 9.5/10 run.",
    style: {
      margin: "4px 0 0",
      fontSize: "12px",
      color: "#9ca3af",
      lineHeight: "1.5",
    },
  });

  sidebar.appendChild(title);
  sidebar.appendChild(subtitle);

  // AshTrail-only best % (NA until full minigame completed)
  const bestMount = createEl("div", { id: "ashtrail-best-mount" });
  sidebar.appendChild(bestMount);
  // fire-and-forget
  renderAshTrailBestPanel(bestMount);

  // Clear, explicit checklist so players know they must clear all 3
  const checklist = createEl("div", {
    style: {
      padding: "8px 10px",
      borderRadius: "12px",
      border: "1px solid rgba(148,163,184,0.25)",
      background: "rgba(148,163,184,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
  });
  checklist.appendChild(
    createEl("div", {
      textContent: `Completion Checklist (${completionCount()}/${BOOKS.length})`,
      style: { fontSize: "12px", fontWeight: "800", color: "#e5e7eb" },
    })
  );
  BOOKS.forEach((b) => {
    const done = isBookCompleted(b.id);
    checklist.appendChild(
      createEl("div", {
        textContent: `${done ? "✅" : "⬜"} ${b.title}`,
        style: { fontSize: "11px", color: done ? "#86efac" : "#9ca3af" },
      })
    );
  });
  if (allBooksCompleted()) {
    checklist.appendChild(
      createEl("div", {
        textContent: "ALL THREE BOOKS CLEARED — set complete!",
        style: {
          marginTop: "4px",
          fontSize: "11px",
          fontWeight: "900",
          color: "#bbf7d0",
        },
      })
    );
  }
  sidebar.appendChild(checklist);

  const bookList = createEl("div", {
    style: {
      marginTop: "6px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      overflowY: "auto",
    },
  });

  let firstBook = null;

  BOOKS.forEach((book, index) => {
    const ratingLabel = book.rating || "—/10";
    const card = createEl("button", {
      type: "button",
      style: {
        width: "100%",
        textAlign: "left",
        padding: "8px 10px",
        borderRadius: "10px",
        border: "1px solid rgba(75,85,99,0.8)",
        background: "rgba(15,23,42,0.9)",
        color: "#e5e7eb",
        cursor: "pointer",
        fontSize: "13px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      },
    });

    const titleRow = createEl("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      },
    });
    const t = createEl("span", { textContent: book.title });
    const d = createEl("span", {
      textContent: ratingLabel,
      style: { fontSize: "13px" },
    });
    titleRow.appendChild(t);
    titleRow.appendChild(d);

    const completed = isBookCompleted(book.id);
    const status = createEl("span", {
      textContent: completed ? "Status: COMPLETED ✅" : "Status: Not completed",
      style: { fontSize: "11px", color: completed ? "#86efac" : "#9ca3af" },
    });

    card.appendChild(titleRow);
    card.appendChild(status);

    card.addEventListener("click", () => {
      renderBookDetailScene(book);
    });

    if (index === 0) firstBook = book;

    bookList.appendChild(card);
  });

  sidebar.appendChild(bookList);
  sidebar.appendChild(createProgressPill());

  const mainPanel = createEl("div", {
    style: {
      flex: "1",
      display: "flex",
    },
  });

  const layout = createEl("div", {
    style: {
      display: "flex",
      gap: "18px",
      width: "100%",
      height: "100%",
    },
  }, [sidebar, mainPanel]);

  setScene(layout);

  // Show details for first book by default
  if (firstBook) {
    renderBookDetailScene(firstBook);
  }
}

function renderBookDetailScene(book) {
  currentBook = book;
  truePath = book.path;

  const main = document.getElementById("ashtrail-main");
  if (!main || !main.firstChild) return;

  const layout = main.firstChild; // sidebar + mainPanel
  const mainPanel = layout.lastChild;
  mainPanel.innerHTML = "";

  const detail = createEl("div", {
    style: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
  });

  const heading = createEl("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    },
  });

  const t = createEl("h3", {
    textContent: book.title,
    style: { margin: "0", fontSize: "18px" },
  });
  const meta = createEl("div", {
    textContent: `Difficulty: ${book.rating || "—/10"} · Required score: ${book.requiredScore}%`,
    style: { fontSize: "12px", color: "#9ca3af" },
  });
  const desc = createEl("p", {
    textContent: book.description,
    style: {
      fontSize: "13px",
      color: "#e5e7eb",
      lineHeight: "1.5",
      margin: "4px 0 0",
    },
  });

  heading.appendChild(t);
  heading.appendChild(meta);
  heading.appendChild(desc);

  const warn = createEl("p", {
    textContent:
      "You’ll see the burning pages trace the path once. After that, the trail disappears and you must walk it from memory.",
    style: {
      fontSize: "12px",
      color: "#f97316",
      margin: "0",
    },
  });

  const buttonsRow = createEl("div", {
    style: {
      display: "flex",
      gap: "8px",
      marginTop: "8px",
      alignItems: "center",
    },
  });

  const beginBtn = createPrimaryButton("Begin Memory Run", () => {
    renderPreviewScene();
  });

  const backBtn = createEl("button", {
    textContent: "Back to Shelf",
    style: {
      padding: "7px 14px",
      borderRadius: "999px",
      border: "1px solid rgba(148,163,184,0.8)",
      background: "transparent",
      color: "#e5e7eb",
      fontSize: "13px",
      cursor: "pointer",
    },
  });
  backBtn.addEventListener("mouseenter", () => {
    backBtn.style.background = "rgba(148,163,184,0.12)";
  });
  backBtn.addEventListener("mouseleave", () => {
    backBtn.style.background = "transparent";
  });
  backBtn.addEventListener("click", () => {
    renderBookSelectScene();
  });

  buttonsRow.appendChild(beginBtn);
  buttonsRow.appendChild(backBtn);

  const previewWrap = createCanvasPanel("Book Arena", "The ash trail will appear once, then vanish.");

  detail.appendChild(heading);
  detail.appendChild(warn);
  detail.appendChild(buttonsRow);
  detail.appendChild(previewWrap);

  mainPanel.appendChild(detail);
}

// Scene 2: Preview (path plays once) ---------------------------------------

function renderPreviewScene() {
  if (!currentBook) return;
  const layout = createEl("div", {
    style: {
      display: "flex",
      width: "100%",
      height: "100%",
      gap: "18px",
    },
  });

  const left = createEl("div", {
    style: {
      width: "260px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
  });

  const title = createEl("h2", {
    textContent: currentBook.title,
    style: { margin: "0", fontSize: "18px" },
  });

  const text = createEl("p", {
    textContent:
      "Watch closely. The burning pages will trace the correct path once. When the glow fades, it’s your turn.",
    style: {
      fontSize: "13px",
      color: "#e5e7eb",
      lineHeight: "1.5",
      margin: "6px 0 0",
    },
  });

  const hint = createEl("p", {
    textContent:
      "Tip: count the turns, landmarks, and pattern shape. Imagine how you’ll walk it with W/A/S/D.",
    style: {
      fontSize: "12px",
      color: "#9ca3af",
      margin: "4px 0 0",
    },
  });

  const controls = createEl("p", {
    textContent: "Controls in run phase: W/A/S/D or Arrow Keys · Enter to finish early.",
    style: {
      fontSize: "11px",
      color: "#9ca3af",
      margin: "10px 0 0",
      fontStyle: "italic",
    },
  });

  left.appendChild(title);
  left.appendChild(text);
  left.appendChild(hint);
  left.appendChild(controls);

  const right = createEl("div", {
    style: {
      flex: "1",
      display: "flex",
    },
  });
  const panel = createCanvasPanel("Ash Trail Preview", "Memorize this glowing path. It plays only once.");
  right.appendChild(panel);

  layout.appendChild(left);
  layout.appendChild(right);

  setScene(layout);

  // draw grid + animate path once
  drawBackground();
  playPathPreview(truePath, () => {
    // After preview, show a subtle hint + Start button overlay
    const footer = createEl("div", {
      style: {
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        padding: "8px 14px",
        borderRadius: "999px",
        background: "rgba(15,23,42,0.92)",
        border: "1px solid rgba(148,163,184,0.6)",
        fontSize: "12px",
        color: "#e5e7eb",
        display: "flex",
        gap: "10px",
        alignItems: "center",
      },
    });
    footer.textContent = "Ready? The trail is gone. Walk it from memory.";

    const btn = createPrimaryButton("Start Memory Run", () => {
      footer.remove();
      renderRunScene();
    });
    btn.style.marginTop = "0";
    footer.appendChild(btn);

    if (overlay) overlay.appendChild(footer);
  });
}

// Draws a neutral stone‑like background with subtle radial patterns,
// but no visible grid lines (we still keep a hidden logical grid).
function drawBackground() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Base stone / ink gradient
  const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bgGrad.addColorStop(0, "#020617");
  bgGrad.addColorStop(1, "#0b1120");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Concentric rings to hint at magical circles / memory arena
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  for (let r = 40; r < Math.min(canvas.width, canvas.height) / 1.1; r += 40) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148,163,184,0.25)";
    ctx.lineWidth = 1;
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function playPathPreview(path, onComplete) {
  if (!ctx || !canvas || !path || path.length === 0) {
    if (onComplete) onComplete();
    return;
  }

  drawBackground();

  const cellW = canvas.width / GRID_COLS;
  const cellH = canvas.height / GRID_ROWS;
  let i = 0;

  // Dynamic speed: longer paths draw faster per‑point so total time stays reasonable
  // Faster demo (requested)
  const baseDelay = 70;
  const minDelay = 16;
  const speedMult = 0.5; // lower = faster
  const delay =
    Math.max(minDelay, baseDelay - Math.min(90, (path.length - 80) * 0.45)) * speedMult;

  const step = () => {
    if (!ctx) return;

    drawBackground();

    // Smooth glowing curve up to i (speeded up)
    ctx.save();
    ctx.lineWidth = cellW * 0.55;
    ctx.lineCap = "round";
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgba(250,250,250,0.25)");
    gradient.addColorStop(0.5, "rgba(251,191,36,0.75)");
    gradient.addColorStop(1, "rgba(248,250,252,0.25)");
    ctx.strokeStyle = gradient;

    ctx.beginPath();
    path.forEach((p, idx) => {
      if (idx > i) return;
      const cx = (p.x + 0.5) * cellW;
      const cy = (p.y + 0.5) * cellH;
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
    ctx.restore();

    // bright leading ember
    const head = path[i];
    if (head) {
      const hx = (head.x + 0.5) * cellW;
      const hy = (head.y + 0.5) * cellH;
      const radius = cellW * 0.32;
      const gradient = ctx.createRadialGradient(
        hx,
        hy,
        1,
        hx,
        hy,
        radius
      );
      gradient.addColorStop(0, "rgba(251,191,36,0.95)");
      gradient.addColorStop(0.4, "rgba(249,115,22,0.9)");
      gradient.addColorStop(1, "rgba(248,250,252,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(hx, hy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    i++;
    if (i < path.length) {
      setTimeout(step, delay);
    } else {
      // brief linger then clear (faster)
      setTimeout(() => {
        drawBackground();
        if (onComplete) onComplete();
      }, 250);
    }
  };

  step();
}

// Scene 3: Player run phase -------------------------------------------------

function renderRunScene() {
  if (!currentBook) return;
  isRunPhase = true;
  playerPath = [];
  playerPos = { ...truePath[0] }; // start at first cell
  pressedDirs = { up: false, down: false, left: false, right: false };
  lastTimestamp = null;
  sampleAccumulator = 0;

  const layout = createEl("div", {
    style: {
      display: "flex",
      width: "100%",
      height: "100%",
      gap: "18px",
    },
  });

  const sidebar = createEl("div", {
    style: {
      width: "260px",
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
  });

  const title = createEl("h2", {
    textContent: "Walk the Ash Trail",
    style: { margin: "0", fontSize: "18px" },
  });

  const desc = createEl("p", {
    textContent:
      "Use W/A/S/D or Arrow Keys to follow the invisible path. Ash particles will flicker when you’re roughly over the right tiles.",
    style: {
      fontSize: "13px",
      color: "#e5e7eb",
      lineHeight: "1.5",
      margin: "4px 0 0",
    },
  });

  const info = createEl("p", {
    textContent:
      "Press Enter at any time to finish your run and see Ishowgreen’s reaction.",
    style: {
      fontSize: "12px",
      color: "#9ca3af",
      margin: "6px 0 0",
    },
  });

  sidebar.appendChild(title);
  sidebar.appendChild(desc);
  sidebar.appendChild(info);

  const right = createEl("div", {
    style: {
      flex: "1",
      display: "flex",
    },
  });

  const panel = createCanvasPanel("Memory Run", "Trail is gone. Trust your recall.");
  right.appendChild(panel);

  layout.appendChild(sidebar);
  layout.appendChild(right);
  setScene(layout);

  drawRunState();
  setupRunInput();
  startRunLoop();
}

function setupRunInput() {
  cleanupRunInput();
  keyHandlerDown = (e) => {
    if (!isRunPhase) return;
    const key = e.key.toLowerCase();
    if (key === "enter") {
      e.preventDefault();
      finishRun();
      return;
    }
    if (key === "w" || e.key === "ArrowUp") {
      pressedDirs.up = true;
      e.preventDefault();
    } else if (key === "s" || e.key === "ArrowDown") {
      pressedDirs.down = true;
      e.preventDefault();
    } else if (key === "a" || e.key === "ArrowLeft") {
      pressedDirs.left = true;
      e.preventDefault();
    } else if (key === "d" || e.key === "ArrowRight") {
      pressedDirs.right = true;
      e.preventDefault();
    }
  };

  keyHandlerUp = (e) => {
    if (!isRunPhase) return;
    const key = e.key.toLowerCase();
    if (key === "w" || e.key === "ArrowUp") {
      pressedDirs.up = false;
    } else if (key === "s" || e.key === "ArrowDown") {
      pressedDirs.down = false;
    } else if (key === "a" || e.key === "ArrowLeft") {
      pressedDirs.left = false;
    } else if (key === "d" || e.key === "ArrowRight") {
      pressedDirs.right = false;
    }
  };

  window.addEventListener("keydown", keyHandlerDown);
  window.addEventListener("keyup", keyHandlerUp);
}

function cleanupRunInput() {
  if (keyHandlerDown) {
    window.removeEventListener("keydown", keyHandlerDown);
    keyHandlerDown = null;
  }
  if (keyHandlerUp) {
    window.removeEventListener("keyup", keyHandlerUp);
    keyHandlerUp = null;
  }
  if (runAnimId !== null) {
    cancelAnimationFrame(runAnimId);
    runAnimId = null;
  }
}

function startRunLoop() {
  const SPEED = 6; // cells per second across the hidden grid

  const step = (timestamp) => {
    if (!isRunPhase || !playerPos) return;

    if (lastTimestamp == null) {
      lastTimestamp = timestamp;
      runAnimId = requestAnimationFrame(step);
      return;
    }
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    // derive velocity from pressed directions
    let vx = 0;
    let vy = 0;
    if (pressedDirs.up) vy -= 1;
    if (pressedDirs.down) vy += 1;
    if (pressedDirs.left) vx -= 1;
    if (pressedDirs.right) vx += 1;

    const mag = Math.hypot(vx, vy);
    if (mag > 0) {
      vx = (vx / mag) * SPEED;
      vy = (vy / mag) * SPEED;
    }

    // integrate continuous position in grid space (floats)
    if (mag > 0) {
      playerPos.x += vx * dt;
      playerPos.y += vy * dt;
    }

    // clamp inside arena - use margin to account for player marker radius (0.2 * cellW)
    // Player marker is drawn at (playerPos.x + 0.5) * cellW with radius cellW * 0.2
    // To keep marker fully visible, we need: (playerPos.x + 0.5) * cellW ± 0.2 * cellW to stay within bounds
    // This means: playerPos.x should be between 0.2 and GRID_COLS - 0.7
    const MARGIN = 0.7; // Accounts for marker radius (0.2) + some padding
    playerPos.x = Math.max(MARGIN, Math.min(GRID_COLS - MARGIN, playerPos.x));
    playerPos.y = Math.max(MARGIN, Math.min(GRID_ROWS - MARGIN, playerPos.y));

    // sample path for scoring at ~20 Hz
    sampleAccumulator += dt;
    if (sampleAccumulator >= 1 / 20) {
      playerPath.push({ x: playerPos.x, y: playerPos.y });
      sampleAccumulator = 0;
    }

    drawRunState();
    runAnimId = requestAnimationFrame(step);
  };

  runAnimId = requestAnimationFrame(step);
}

function drawRunState() {
  if (!ctx || !canvas || !playerPos) return;
  drawBackground();

  const cellW = canvas.width / GRID_COLS;
  const cellH = canvas.height / GRID_ROWS;

  // Subtle hint: only show a small glowing segment around the closest point
  // on the true path, instead of lighting the whole trail.
  if (truePath.length > 1) {
    // find index of closest path point to current player position
    let closestIdx = 0;
    let minDist = Infinity;
    truePath.forEach((p, idx) => {
      const dx = p.x - playerPos.x;
      const dy = p.y - playerPos.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) {
        minDist = d;
        closestIdx = idx;
      }
    });

    const windowSize = 4; // how many points before/after to softly hint
    for (
      let i = Math.max(0, closestIdx - windowSize);
      i <= Math.min(truePath.length - 1, closestIdx + windowSize);
      i++
    ) {
      const p = truePath[i];
      const cx = (p.x + 0.5) * cellW;
      const cy = (p.y + 0.5) * cellH;
      const r = cellW * 0.35;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, "rgba(250,250,250,0.12)");
      g.addColorStop(1, "rgba(250,250,250,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // draw player's traversed path
  if (playerPath.length > 0) {
    ctx.strokeStyle = "rgba(96,165,250,0.8)";
    ctx.lineWidth = cellW * 0.25;
    ctx.lineCap = "round";
    ctx.beginPath();
    playerPath.forEach((p, idx) => {
      const cx = (p.x + 0.5) * cellW;
      const cy = (p.y + 0.5) * cellH;
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();
  }

  // draw player marker
  const px = (playerPos.x + 0.5) * cellW;
  const py = (playerPos.y + 0.5) * cellH;
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(px, py, cellW * 0.2, 0, Math.PI * 2);
  ctx.fill();
}

// Scene 4: Results ----------------------------------------------------------

function finishRun() {
  if (!isRunPhase) return;
  isRunPhase = false;

  cleanupRunInput();

  const score = computeScore(truePath, playerPath);
  // Store best % for Ash Trail (always keep highest)
  // Store best % for Ash Trail overall + per-book leaderboards (backend-backed via /api/dbs2/scores)
  try { updateScore("ash_trail", score); } catch (_) {}
  try {
    if (currentBook?.id) {
      updateScore(`ash_trail_${currentBook.id}`, score);
    }
  } catch (_) {}
  renderResultsScene(score);
}

function computeScore(trueP, playerP) {
  if (!trueP || trueP.length === 0 || !playerP || playerP.length === 0) {
    return 0;
  }

  // Check if player didn't move at all (very few points or no distance traveled)
  if (playerP.length < 5) {
    // Less than 5 samples means they barely moved
    return 0;
  }

  // Calculate total distance traveled by player
  let totalDistanceTraveled = 0;
  for (let i = 1; i < playerP.length; i++) {
    const dx = playerP[i].x - playerP[i-1].x;
    const dy = playerP[i].y - playerP[i-1].y;
    totalDistanceTraveled += Math.sqrt(dx * dx + dy * dy);
  }

  // Calculate approximate length of true path
  let truePathLength = 0;
  for (let i = 1; i < trueP.length; i++) {
    const dx = trueP[i].x - trueP[i-1].x;
    const dy = trueP[i].y - trueP[i-1].y;
    truePathLength += Math.sqrt(dx * dx + dy * dy);
  }

  // If player traveled less than 10% of the true path length, they didn't move enough
  if (totalDistanceTraveled < truePathLength * 0.1) {
    return 0;
  }

  // Penalty for drawing way too much (coloring entire screen)
  // If player path is more than 2.5x longer than true path, penalize heavily
  const pathLengthRatio = totalDistanceTraveled / truePathLength;
  let excessPenalty = 1.0;
  if (pathLengthRatio > 2.5) {
    // Heavy penalty: if you draw 3x the path, you can't get more than 50%
    // If you draw 4x the path, you can't get more than 25%
    excessPenalty = Math.max(0.1, 1.0 - (pathLengthRatio - 2.5) * 0.3);
  } else if (pathLengthRatio > 2.0) {
    // Moderate penalty: if you draw 2x the path, cap at 80%
    excessPenalty = Math.max(0.5, 1.0 - (pathLengthRatio - 2.0) * 0.6);
  }

  // Harder scoring: require closer alignment to earn higher %.
  // Use a distance-weighted score instead of a simple "within radius = good" check.
  //
  // MAX_DIST is in grid units. Smaller = stricter.
  const difficulty = currentBook?.difficulty ?? 2;
  // Tuned difficulty: still stricter than the original (1.2), but less punishing than the first pass.
  // diff1=1.00, diff2=0.93, diff3=0.86
  const MAX_DIST = Math.max(0.75, 1.07 - 0.07 * difficulty);

  const weightFromDist = (d) => {
    // 1.0 at d=0, smoothly drops to 0 at d>=MAX_DIST.
    // Slightly harsh, but not as punishing as squaring.
    const t = Math.max(0, 1 - d / MAX_DIST);
    return Math.pow(t, 1.35);
  };

  // 1) Proximity accuracy: average weight of player samples to the true trail
  let proximitySum = 0;
  for (const p of playerP) {
    const d = distanceToPath(p, trueP);
    proximitySum += weightFromDist(d);
  }
  const proximityFrac = proximitySum / playerP.length;

  // 2) Coverage: how much of the true trail was "touched", also distance-weighted
  let coverageSum = 0;
  for (const tp of trueP) {
    const d = distanceToPath(tp, playerP);
    coverageSum += weightFromDist(d);
  }
  const coverageFrac = coverageSum / trueP.length;

  // Combine both: you only get 100% if you stay very close AND cover most of the path.
  const rawScore = 0.55 * proximityFrac + 0.45 * coverageFrac;

  // Apply excess penalty to prevent coloring entire screen from getting 100%
  const penalizedScore = rawScore * excessPenalty;

  const score = Math.round(penalizedScore * 100);
  return Math.max(0, Math.min(100, score));
}

// Minimum distance from a point to a polyline in grid space
function distanceToPath(point, path) {
  let min = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const d = distancePointToSegment(point, path[i], path[i + 1]);
    if (d < min) min = d;
  }
  return min;
}

function distancePointToSegment(p, a, b) {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const abLenSq = abx * abx + aby * aby || 1;
  let t = (apx * abx + apy * aby) / abLenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = a.x + abx * t;
  const closestY = a.y + aby * t;
  const dx = p.x - closestX;
  const dy = p.y - closestY;
  return Math.sqrt(dx * dx + dy * dy);
}

function reactionForScore(score) {
  if (score < 50) {
    return {
      label: "Not enough pages collected",
      text:
        'Ishowgreen squints at the half‑burnt pages: "The rat burns down and tape? That doesn’t even make sense. Try again."',
      tone: "error",
    };
  }
  if (score < 80) {
    return {
      label: "Somewhat collected",
      text:
        'Ishowgreen mutters: "The rat escapes and the house burns down? You’re close, but I’m missing way too many details."',
      tone: "warn",
    };
  }
  return {
    label: "Enough collected",
    text:
      'Ishowgreen actually smiles: "Impressive. I can finally read my precious possession again. Maybe there’s hope for you."',
    tone: "success",
  };
}

function renderResultsScene(score) {
  const reaction = reactionForScore(score);

  // Determine pass/fail for this specific book
  const required = currentBook?.requiredScore ?? 80;
  const passed = score >= required;
  const alreadyCompleted = currentBook?.id ? isBookCompleted(currentBook.id) : false;
  if (currentBook?.id && passed) {
    markBookCompleted(currentBook.id);
  }

  const layout = createEl("div", {
    style: {
      display: "flex",
      width: "100%",
      height: "100%",
      gap: "18px",
    },
  });

  const left = createEl("div", {
    style: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "10px",
    },
  });

  const scoreLabel = createEl("div", {
    textContent: "Path Alignment",
    style: {
      fontSize: "13px",
      color: "#9ca3af",
    },
  });

  const scoreValue = createEl("div", {
    textContent: `${score}%`,
    style: {
      fontSize: "42px",
      fontWeight: "800",
    },
  });

  const badge = createEl("div", {
    textContent: reaction.label,
    style: {
      display: "inline-flex",
      alignItems: "center",
      padding: "4px 10px",
      borderRadius: "999px",
      fontSize: "11px",
    },
  });

  if (reaction.tone === "error") {
    badge.style.background = "rgba(248,113,113,0.15)";
    badge.style.color = "#fecaca";
    badge.style.border = "1px solid rgba(248,113,113,0.6)";
  } else if (reaction.tone === "warn") {
    badge.style.background = "rgba(250,204,21,0.12)";
    badge.style.color = "#facc15";
    badge.style.border = "1px solid rgba(250,204,21,0.6)";
  } else {
    badge.style.background = "rgba(52,211,153,0.12)";
    badge.style.color = "#6ee7b7";
    badge.style.border = "1px solid rgba(52,211,153,0.6)";
  }

  const reactionText = createEl("p", {
    textContent: reaction.text,
    style: {
      fontSize: "13px",
      color: "#e5e7eb",
      lineHeight: "1.5",
      margin: "6px 0 0",
    },
  });

  // Clear completion marking so the player knows what they finished
  const progressBlock = createEl("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      marginTop: "6px",
    },
  });

  const completionLine = createEl("div", {
    textContent: passed
      ? `✅ Book cleared: ${currentBook?.title || "Unknown"} (${completionCount()}/${BOOKS.length})`
      : `❌ Not cleared (need ${required}% to clear this book)`,
    style: {
      fontSize: "12px",
      color: passed ? "#86efac" : "#fca5a5",
    },
  });
  progressBlock.appendChild(completionLine);
  progressBlock.appendChild(createProgressPill());

  // Reward (non-blocking) on first clear of this book
  if (passed && currentBook?.id && !alreadyCompleted) {
    addInventoryItem({
      name: `Code Scrap: ${currentBook?.title || "Ash Trail"}`,
      found_at: "ash_trail",
      timestamp: new Date().toISOString(),
    }).catch(() => {});
  }

  // When all three books are cleared, mark minigame complete and give a bonus
  if (allBooksCompleted()) {
    const allDone = createEl("div", {
      textContent: "ALL THREE BOOKS RECOVERED! You completed the Ash Trail set.",
      style: {
        marginTop: "6px",
        padding: "8px 10px",
        borderRadius: "12px",
        background: "rgba(34,197,94,0.12)",
        border: "1px solid rgba(34,197,94,0.55)",
        color: "#bbf7d0",
        fontSize: "12px",
        fontWeight: "800",
      },
    });
    progressBlock.appendChild(allDone);
    completeMinigame("ash_trail").catch(() => {});
    updateCrypto(25).catch(() => {});
  }

  const buttons = createEl("div", {
    style: {
      display: "flex",
      gap: "8px",
      marginTop: "10px",
    },
  });

  const retryBtn = createPrimaryButton("Retry Book", () => {
    renderPreviewScene();
  });

  const shelfBtn = createEl("button", {
    textContent: "Return to Bookshelf",
    style: {
      padding: "7px 14px",
      borderRadius: "999px",
      border: "1px solid rgba(148,163,184,0.8)",
      background: "transparent",
      color: "#e5e7eb",
      fontSize: "13px",
      cursor: "pointer",
    },
  });
  shelfBtn.addEventListener("mouseenter", () => {
    shelfBtn.style.background = "rgba(148,163,184,0.12)";
  });
  shelfBtn.addEventListener("mouseleave", () => {
    shelfBtn.style.background = "transparent";
  });
  shelfBtn.addEventListener("click", () => {
    renderBookSelectScene();
  });

  const exitBtn = createEl("button", {
    textContent: "Continue Basement Quest",
    style: {
      padding: "7px 14px",
      borderRadius: "999px",
      border: "none",
      background: "rgba(59,130,246,0.15)",
      color: "#bfdbfe",
      fontSize: "13px",
      cursor: "pointer",
    },
  });
  exitBtn.addEventListener("mouseenter", () => {
    exitBtn.style.background = "rgba(59,130,246,0.25)";
  });
  exitBtn.addEventListener("mouseleave", () => {
    exitBtn.style.background = "rgba(59,130,246,0.15)";
  });
  exitBtn.addEventListener("click", () => {
    closeOverlay();
  });

  buttons.appendChild(retryBtn);
  buttons.appendChild(shelfBtn);
  buttons.appendChild(exitBtn);

  left.appendChild(scoreLabel);
  left.appendChild(scoreValue);
  left.appendChild(badge);
  left.appendChild(reactionText);
  left.appendChild(progressBlock);
  left.appendChild(buttons);

  const right = createEl("div", {
    style: {
      flex: "1",
      display: "flex",
    },
  });

  const panel = createCanvasPanel("Your Attempt vs. True Path (Preview Only)", "");
  right.appendChild(panel);

  // visualize both true and player paths for storytelling
  drawBackground();
  if (ctx && canvas) {
    const cellW = canvas.width / GRID_COLS;
    const cellH = canvas.height / GRID_ROWS;

    // true path
    ctx.strokeStyle = "rgba(52,211,153,0.9)";
    ctx.lineWidth = cellW * 0.25;
    ctx.beginPath();
    truePath.forEach((p, idx) => {
      const cx = (p.x + 0.5) * cellW;
      const cy = (p.y + 0.5) * cellH;
      if (idx === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    });
    ctx.stroke();

    // player path
    if (playerPath.length > 0) {
      ctx.strokeStyle = "rgba(59,130,246,0.9)";
      ctx.beginPath();
      playerPath.forEach((p, idx) => {
        const cx = (p.x + 0.5) * cellW;
        const cy = (p.y + 0.5) * cellH;
        if (idx === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
    }
  }

  layout.appendChild(left);
  layout.appendChild(right);
  setScene(layout);
}

// --- Public entry point ----------------------------------------------------
export function showAshTrailMinigame() {
  window.ashTrailActive = true;
  openOverlay();
  renderIntroScene();
}

// Also expose globally so it’s easy to call from HTML/other scripts if needed
window.showAshTrailMinigame = showAshTrailMinigame;


