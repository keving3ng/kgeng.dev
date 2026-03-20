# Game ideas

Scratchpad for mini-games that could live on the site (e.g. under `/games`). Nothing here is committed to build order—just design notes.

---

## Cross tetris

**Pitch:** Tetris played along **four axes** at once (e.g. four boards arranged in a cross, or one shared well with gravity in four cardinal directions—exact topology TBD).

**Core loop:** Stack and clear lines (or the cross-shaped equivalent) under time or rising pressure, same spirit as guideline Tetris.

**Differentiators**

- **No hold piece.** Instead, **one “peek / advance” per order**: you can see what’s next in a fixed queue and **advance the queue once** (consume the privilege until the next lock or line clear—exact rule TBD). That replaces hold with a lighter, one-shot planning tool.
- **Four-way play:** Pieces or gravity interact with **four directions** so spatial reasoning isn’t just “down + horizontal.” Could mean four separate mini-wells, or one well where “down” rotates with the cross—needs a prototype to see what feels fair.

**Polish**

- **Rebindable controls** (move, rotate, soft drop, hard drop, advance-queue—whatever ships).
- **Scoring and leveling** aligned with **standard Tetris** conventions where possible (e.g. line clears, combos, level speed curve) so numbers feel familiar; document any deliberate deviations.

**Open questions**

- Single board vs four linked boards; how rotation and kicks work in “cross” space.
- Whether “advance once” resets per piece, per lock, or per level.

---

## Quick run (working title)

**Pitch:** A **dot** moves on a **grid maze**. You **plan** the full path of **up / down / left / right** in your head, then **execute** the sequence as fast as possible—execution skill + memory, not pathfinding during the run.

**Core loop**

1. See the maze and goal (and maybe a short preview time—optional).
2. Memorize the sequence of moves (e.g. `R R U L …`).
3. Input the sequence under a **timer**; finish when the dot reaches the exit cell.

**Modes (MVP shipped)**

- **Normal:** A move into a **wall does nothing**—you stay on the same cell; the run continues.
- **Hard:** The **first wall bump ends the run** (no score recorded on that attempt).

**Content**

- **MVP:** twenty **authored** levels under `/games/quick-run`; **frenzy** mode = 20 **random** mazes, one continuous clock, auto-advance on goal; **procedural** difficulty slider is a later pass.

**Shared tech**

- **`useGameTimer`** + **localStorage**: per-level top 5, overall top 10 per mode (overall only after all levels in order in one streak; retry previous level ok); **frenzy** top 10 total times for 20 procedural mazes.

**Resolved for MVP**

- **Hint:** UI shows **optimal path length** (BFS shortest move count) per level.
- **Input:** **Arrow keys** only, one move per keypress (keydown `repeat` ignored); no backspace / undo.

---

## Meta

- New games should follow the existing hub pattern (`src/games/registry.ts`, route `/games/:slug`) unless we outgrow it.
- Keep **semantic tokens** and **lowercase** copy in UI per site conventions.
