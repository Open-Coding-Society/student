# Ash Trail (DBS2) — Component A: Program Code Requirements Evidence

This document maps each **AP CSP “Component A: Program Code Requirements”** item

## Instructions for input (user actions trigger events)

Ash Trail reads **keyboard input** (WASD / Arrow keys, Enter) to move and finish runs.

```1304:1345:DBS2-Frontend/assets/js/DBS2/AshTrailMinigame.js
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
  // ...
}
```

## Use of at least one list (collection type) to manage complexity

### List #1: `BOOKS` (3 levels)
Ash Trail uses an array of book objects to define each level (id, title, difficulty, requiredScore, and the path).

```103:137:DBS2-Frontend/assets/js/DBS2/AshTrailMinigame.js
const BOOKS = [
  { id: "defi_grimoire", title: "DeFi Grimoire", difficulty: 1, requiredScore: 60, path: buildWavePath() },
  { id: "lost_ledger", title: "Lost Ledger", difficulty: 2, requiredScore: 60, path: buildCrossPath() },
  { id: "proof_of_burn", title: "Proof‑of‑Burn Almanac", difficulty: 3, requiredScore: 60, path: buildHeartPath() },
];
```

### List #2: `playerPath` (sampled movement points)
The program collects player movement positions in a list while the run is active.

```161:166:DBS2-Frontend/assets/js/DBS2/AshTrailMinigame.js
let currentBook = null;
let truePath = [];      // array of logical grid points {x, y}
let playerPath = [];    // sampled player positions during run
let playerPos = null;   // current player position in grid space (floats)
let isRunPhase = false;
```

These lists make the code scalable (adding new books/paths or changing scoring doesn’t require rewriting the game loop).

## A student-developed procedure (name + parameters)

### Procedure: `computeScore(trueP, playerP)`
This procedure computes the **percentage alignment** between the true path and the player’s traced path.

```1249:1337:DBS2-Frontend/assets/js/DBS2/AshTrailMinigame.js
function computeScore(trueP, playerP) {
  if (!trueP || trueP.length === 0 || !playerP || playerP.length === 0) return 0;

  // ... compute totalDistanceTraveled, truePathLength ...
  // selection: return 0 if player didn't move enough
  if (totalDistanceTraveled < truePathLength * 0.1) return 0;

  // selection: apply penalties if the player draws way too much
  if (pathLengthRatio > 2.5) {
    excessPenalty = Math.max(0.1, 1.0 - (pathLengthRatio - 2.5) * 0.3);
  } else if (pathLengthRatio > 2.0) {
    excessPenalty = Math.max(0.5, 1.0 - (pathLengthRatio - 2.0) * 0.6);
  }

  // Tuned distance-weighted scoring
  const difficulty = currentBook?.difficulty ?? 2;
  const MAX_DIST = Math.max(0.75, 1.07 - 0.07 * difficulty);
  const weightFromDist = (d) => Math.pow(Math.max(0, 1 - d / MAX_DIST), 1.35);

  // iteration: compute proximity + coverage by looping over path points
  let proximitySum = 0;
  for (const p of playerP) proximitySum += weightFromDist(distanceToPath(p, trueP));
  const proximityFrac = proximitySum / playerP.length;

  let coverageSum = 0;
  for (const tp of trueP) coverageSum += weightFromDist(distanceToPath(tp, playerP));
  const coverageFrac = coverageSum / trueP.length;

  const rawScore = 0.55 * proximityFrac + 0.45 * coverageFrac;
  const score = Math.round(rawScore * excessPenalty * 100);
  return Math.max(0, Math.min(100, score));
}
```

## Algorithm includes sequencing, selection, and iteration 

The `computeScore(...)` procedure contains:
- **Sequencing**: compute distances → apply penalty → compute weighted proximity → compute weighted coverage → combine into final score.
- **Selection**: multiple `if/else if` decisions (early returns + penalties).
- **Iteration**: loops over `playerP` and `trueP` to compute proximity/coverage.

(See the full code block above.)

## Calls to student-developed procedure

The game calls `computeScore(truePath, playerPath)` when a run ends:

```1196:1208:DBS2-Frontend/assets/js/DBS2/AshTrailMinigame.js
function finishRun() {
  if (!isRunPhase) return;
  isRunPhase = false;
  cleanupRunInput();
  const score = computeScore(truePath, playerPath);
  // ...
  renderResultsScene(score);
}
```

## Instructions for output (visual/text output based on input + program functionality)

Ash Trail displays output visually and textually:
- The preview animation draws the path (visual output).
- The results scene shows a score and dialogue reaction (text output).

### Example: Preview animation (visual output)

```853:933:DBS2-Frontend/assets/js/DBS2/AshTrailMinigame.js
function playPathPreview(path, onComplete) {
  drawBackground();
  // ... draws glowing curve + ember head ...
  if (i < path.length) setTimeout(step, delay);
  else setTimeout(() => { drawBackground(); if (onComplete) onComplete(); }, 250);
}
```

## Online data stream (backend) + persistence of progress

Ash Trail saves and reads progress via the backend API:

### Save score to backend (scores are stored per user)
`StatsManager.updateScore(...)` calls the backend with `DBS2API.submitScore(game, score)`.

```203:238:DBS2-Frontend/assets/js/DBS2/StatsManager.js
export async function updateScore(game, score) {
  try {
    if (DBS2API && DBS2API.submitScore) {
      const result = await DBS2API.submitScore(game, score);
      return result.scores || {};
    }
  } catch (e) {
    console.log('API updateScore failed, using local:', e);
  }
  // local fallback...
}
```

### Backend endpoint that receives the score

```146:171:DBS2-Backend/api/dbs2_api.py
class _ScoresResource(Resource):
  @token_required()
  def put(self):
    data = request.get_json()
    game = data.get('game')
    score = data.get('score', 0)
    if game:
      player.update_score(game, score)
    return {'scores': player.scores}, 200
```

### Where the % is stored in the database
Scores are stored in the `DBS2Player` model’s `_scores` JSON string.

```7:64:DBS2-Backend/model/dbs2_player.py
class DBS2Player(db.Model):
  _scores = db.Column(db.Text, default='{}')

  @property
  def scores(self):
    try:
      return json.loads(self._scores)
    except:
      return {}

  @scores.setter
  def scores(self, score_dict):
    self._scores = json.dumps(score_dict) if isinstance(score_dict, dict) else '{}'
```

## Extra (leaderboards) — backend-driven ranking

The backend provides a minigame leaderboard endpoint used by the Ash Trail leaderboard widget/admin UI:

```239:290:DBS2-Backend/api/dbs2_api.py
class _MinigameLeaderboardResource(Resource):
  def get(self):
    game = (request.args.get('game') or '').strip()
    limit = min(int(request.args.get('limit', 10)), 100)
    players = DBS2Player.get_all_players()
    # filter + sort players by scores[game]
    # return ranked leaderboard entries
    return {'game': game, 'leaderboard': leaderboard}, 200
```

