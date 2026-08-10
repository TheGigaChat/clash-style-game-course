# Three-Lane Battle Game — 10-Episode JavaScript Course Plan

## 1. Course idea

We will build a small browser strategy game inspired by the lane combat of
*Plants vs. Zombies* and the two-sided tower objective of *Clash Royale*.

There are two teams:

- The blue team starts on the left and moves right.
- The red team starts on the right and moves left.
- The battlefield has exactly three horizontal lanes.
- Units move only forward and never change lanes after they spawn.
- Units can attack only an enemy in the same lane.
- Each team has one static tower. Towers do not attack.
- A unit that reaches the enemy tower attacks it.
- The first team to reduce the opponent tower's health to zero wins.

The finished game will have two unit types:

- **Warrior:** short range, more health, and direct melee damage.
- **Archer:** less health, longer range, and visible arrow projectiles.

The course begins with rectangles and simple colors. Art and sprite animation
are deliberately postponed until the game already works. This keeps the early
episodes focused on JavaScript rather than image coordinates.

## 2. Audience and teaching rules

The intended viewer has approximately 3–12 months of JavaScript experience.
Every episode must explain what the code does before adding the next mechanic.

### Required code style

- Use only `index.html`, `style.css`, and `script.js` for the game.
- Keep more than 90% of the implementation in `script.js`.
- Keep all JavaScript in one file. Do not use modules.
- Use plain classes, named functions, arrays, objects, `for` loops, and `if`
  statements.
- Use ordinary `for` loops when processing game arrays.
- Do not use ternary expressions.
- Do not use higher-order array methods such as `map`, `filter`, `reduce`,
  `forEach`, `find`, or `some`.
- Do not use a framework, package manager, build tool, physics library, or game
  engine.
- Repetition is acceptable when it makes the code easier for a beginner to
  trace.
- Prefer descriptive intermediate variables over compressed expressions.
- Introduce one new idea at a time and draw collision boxes while debugging.
- Keep magic numbers near the top of `script.js` as named constants when they
  affect the whole game.

### Scope limit

The final `script.js` should be roughly 1,000–1,500 readable lines, including
comments and whitespace. This is a guide, not a target to inflate artificially.

The course will not include:

- Online multiplayer or networking
- Mobile controls
- Pathfinding or lane switching
- Tower weapons
- More than two unit types
- Equipment, upgrades, levels, or a shop
- Sound, settings, save data, or a start menu
- Complex particle effects
- Responsive canvas scaling
- A general-purpose game engine or abstract entity-component system

## 3. Final game specification

### Canvas and board

Use a fixed-size canvas so every calculation stays visible and predictable.
Suggested starting values:

```js
const canvasWidth = 1000;
const canvasHeight = 640;
const menuHeight = 100;
const laneHeight = 180;
const laneCount = 3;
const columnWidth = 100;
```

The top 100 pixels are the menu bar. The remaining 540 pixels form three lanes
of 180 pixels each. Vertical grid columns help the viewer understand placement,
but units only need a lane number after spawning.

Each lane has a simple index:

- Lane `0`: top
- Lane `1`: middle
- Lane `2`: bottom

Create one helper function, `getLaneY(lane)`, to turn the lane number into a
screen position. This avoids scattering lane calculations through the file.

### Towers

There is one blue tower on the left and one red tower on the right. A tower has:

- `team`
- `x`, `y`, `width`, and `height`
- `health` and `maxHealth`
- `color` or image
- `draw()`

The logical tower hitbox is a vertical strip that covers all three lanes. The
tower artwork can be drawn in the visual center of that strip. This means a unit
from any lane can reach and damage the single tower without needing three
separate towers.

The tower is passive: it displays health and receives damage, but never searches
for a target and never creates a projectile.

### Units

Use one `Unit` class for both teams and both types. Give each unit explicit
properties so beginners can inspect its full state:

```js
class Unit {
  constructor(team, type, lane) {
    this.team = team;
    this.type = type;
    this.lane = lane;
    this.x = 0;
    this.y = 0;
    this.width = 70;
    this.height = 70;
    this.speed = 0;
    this.movement = 0;
    this.health = 0;
    this.maxHealth = 0;
    this.damage = 0;
    this.range = 0;
    this.attackInterval = 0;
    this.attackTimer = 0;
    this.target = null;
    this.state = "walking";
  }
}
```

Simple `if` statements inside the constructor assign warrior or archer stats.
Other `if` statements set the left or right spawn position and movement
direction. Do not create separate subclasses for every team/type in this course.

Suggested values to tune later:

| Unit | Cost | Health | Damage | Range | Attack delay | Speed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Warrior | 40 | 140 | 20 | 18 px | 45 frames | 0.7 px/frame |
| Archer | 60 | 80 | 15 | 220 px | 75 frames | 0.55 px/frame |

These are teaching defaults. Final balancing happens only after both modes work.

### Combat decision

Use two deliberately different attack systems:

1. **Warrior — direct hit:** when its attack timer is ready and the target is in
   melee range, subtract damage from the target immediately.
2. **Archer — projectile:** when its attack timer is ready, create an `Arrow`
   object. The arrow travels in the team's direction and damages the first valid
   enemy it touches in the same lane.

This is simpler than giving both units projectiles, but still teaches projectile
movement and collision. It also makes the unit types feel meaningfully different.

An arrow stores `team`, `lane`, position, size, speed, damage, and a `remove`
flag. It does not need homing behavior. Once fired, it travels straight ahead.

### Targeting and collision rules

- Never compare units from different lanes.
- Never let a unit target a teammate.
- A unit checks opponents in the same lane with a normal nested `for` loop.
- Select the closest opponent in front and inside the unit's attack range.
- If a target exists, stop moving and attack when the timer is ready.
- If no valid target exists, clear `target` and continue walking.
- Warriors should stop before rectangles overlap deeply.
- Allied units may queue behind each other instead of walking through one
  another. A simple same-lane spacing check is enough; no pathfinding is needed.
- Remove dead units after their update loop by walking arrays backward or by
  using `splice` followed by `i--`.
- Projectiles collide only with enemy units in their own lane.
- If no enemy absorbs a projectile, remove it when it leaves the battlefield.
- When no unit blocks the attacker and the enemy tower is within attack range,
  the tower becomes the target.

Use one readable rectangle helper:

```js
function isColliding(first, second) {
  if (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  ) {
    return true;
  }

  return false;
}
```

For attack range, use a separate `getDistanceInFront(unit, target)` helper. Do
not stretch the unit's visible collision rectangle to fake range.

### Resources

Both teams begin with a small amount of gold. Deploying a unit spends gold.
Defeating an enemy grants gold based on that enemy's maximum health:

```js
const reward = Math.floor(deadUnit.maxHealth / 5);
```

Only the team that dealt the killing hit receives the reward. Store the attacker's
team on direct hits and projectiles so the reward owner is unambiguous.

The AI follows the same resource rules as a human. It must not spawn free units.
No passive income is required for the first version. If playtesting causes a
stalemate, add a very small timed income in Episode 10 rather than complicating
the earlier lessons.

### Game modes and shared spawn function

Keep one game engine and switch only who requests red-team deployments:

```js
let gameMode = "ai";

function spawnUnit(team, type, lane) {
  // Check game state, lane, cost, and spawn space here.
  // If valid, spend that team's gold and push one Unit.
}
```

- In AI mode, the mouse controls blue and a simple timer controls red.
- In PvP mode, the mouse controls blue and the keyboard controls red.
- AI and keyboard code must both call `spawnUnit()`.
- Movement, combat, resources, towers, animation, and winning logic remain
  identical in both modes.

This small boundary makes the code extensible without introducing advanced
architecture.

### Controls

**Blue player:**

- Click the warrior or archer card in the top menu.
- Click one of the three lanes on the blue half of the board to deploy.

**Red player in local PvP:**

- Press `1` for warrior or `2` for archer.
- Press Arrow Up or Arrow Down to move the lane selector.
- Press Arrow Left to deploy from the right side into the selected lane.

Use arrows because they visually match the red team's direction. Draw a clear
outline around the currently selected card and lane for both players.

### Main JavaScript sections

Keep `script.js` in a stable top-to-bottom order throughout the course:

1. Canvas setup and global constants
2. Image loading
3. Global game state and arrays
4. Mouse and keyboard input
5. `Cell` class and grid functions
6. `Tower` class
7. `Unit` class
8. `Arrow` class
9. Optional `FloatingMessage` class
10. Creation and spawning functions
11. Grid, unit, projectile, tower, and UI handler functions
12. Collision and distance helpers
13. AI functions
14. Game status and restart functions
15. `animate()` game loop

Each episode should preserve this order instead of moving code around for style.

## 4. Ten-episode course

## Episode 1 — Canvas, game loop, and battlefield

### Result at the end

A browser displays a centered canvas with a top menu area and three colored
lanes. The canvas redraws through `requestAnimationFrame()`.

### JavaScript concepts

- Selecting an HTML element
- Getting the 2D drawing context
- Constants and coordinates
- Calling functions
- The browser animation loop
- Drawing and clearing rectangles

### Build steps

1. Create `index.html`, `style.css`, and `script.js`.
2. Add only a heading or wrapper and `<canvas id="gameCanvas">` to the HTML.
3. Center the canvas and give the page a simple background in CSS.
4. Get the canvas and context in JavaScript.
5. Set a fixed width and height from JavaScript.
6. Define `menuHeight`, `laneHeight`, and `laneCount`.
7. Write `drawBackground()`:
   - Draw the menu bar.
   - Draw three alternating green lane rectangles.
   - Draw horizontal lines between lanes.
   - Label the lanes temporarily for debugging.
8. Write `animate()`:
   - Clear the canvas.
   - Draw the background.
   - Request the next frame.
9. Explain that the canvas is redrawn like a flipbook and that later objects
   will be drawn in a deliberate order.

### Do not add yet

No units, images, mouse input, collisions, resources, or towers.

### Checkpoint

- Exactly three equal lanes fit below the menu.
- Repeated animation does not leave drawing trails.
- Resizing the browser does not change internal canvas coordinates.

## Episode 2 — Grid, menu cards, and mouse input

### Result at the end

The board has a JavaScript-generated placement grid. The viewer can hover cells,
select one of two unit cards, and click a lane on the blue half. Clicking only
prints the intended unit type and lane for now.

### JavaScript concepts

- Objects and arrays
- A first class with a constructor and `draw()` method
- Nested `for` loops
- Mouse event listeners
- Converting page coordinates to canvas coordinates
- Remainder `%` for snapping to a grid

### Build steps

1. Add a `mouse` object with `x`, `y`, `width`, `height`, and `clicked`.
2. Read `canvas.getBoundingClientRect()` and correct mouse coordinates.
3. Refresh the canvas rectangle on window resize.
4. Create a `Cell` class containing position, size, row, and column.
5. Write `createGrid()` with one loop for three rows and another for columns.
6. Do not create grid cells inside the menu bar.
7. Write `handleGrid()` to draw hover outlines and the center dividing line.
8. Create plain card objects for Warrior and Archer.
9. Draw card names, temporary colored icons, and costs in `drawMenu()`.
10. Add `selectedBlueType` and change it when a card is clicked.
11. Convert a battlefield click into lane `0`, `1`, or `2`.
12. Reject clicks in the menu, on the red half, and outside the canvas.
13. Temporarily log `{ team, type, lane }` to confirm input.

### Checkpoint

- Hovering does not select a cell by itself.
- A card click never counts as a battlefield click.
- Top, middle, and bottom clicks produce lane 0, 1, and 2.
- The selected card is visibly outlined.

## Episode 3 — Unit class, deployment, and movement

### Result at the end

Blue rectangles can be deployed into any lane. Red test rectangles can be
spawned with a temporary key. Both sides move toward the opposite side.

### JavaScript concepts

- Class instances
- Constructor arguments
- `this`
- Storing objects in arrays
- Updating every object with a `for` loop
- Direction represented by `1` and `-1`

### Build steps

1. Create the `units` array.
2. Create the `Unit(team, type, lane)` class.
3. Store common size, lane, team, type, and basic state.
4. Use `if` statements to set warrior and archer test stats.
5. Use `if` statements to set:
   - Blue spawn position and positive speed.
   - Red spawn position and negative speed.
6. Calculate `y` through `getLaneY(lane)`.
7. Add `update()` to move `x` by `movement`.
8. Add `draw()` with team color and unit-type label.
9. Write `spawnUnit(team, type, lane)` as the only function allowed to create a
   gameplay unit.
10. Connect blue mouse deployment to `spawnUnit()`.
11. Add a temporary red debug key that calls the same function.
12. Write `handleUnits()` to update and draw each object.
13. Draw simple health bars even though nothing deals damage yet.

### Checkpoint

- Both teams use the same class and array.
- Blue and red movement is mirrored correctly.
- All three lanes use identical movement logic.
- No code is copied into separate `BlueUnit` and `RedUnit` classes.

## Episode 4 — Same-lane detection, stopping, and melee combat

### Result at the end

Opposing warriors in the same lane stop and fight. Units in different lanes
pass at different vertical positions without interacting. Dead units disappear.

### JavaScript concepts

- Nested loops
- Comparing objects
- `null` targets
- Timers counted in animation frames
- Array removal with `splice`
- Separating collision from attack range

### Build steps

1. Add `target`, `state`, `attackTimer`, `attackInterval`, `damage`, and `range`.
2. Write a helper that answers whether another object is in front of a unit.
3. Write `findUnitTarget(unit)`:
   - Loop through every unit.
   - Skip the same object.
   - Skip teammates.
   - Skip other lanes.
   - Skip dead units.
   - Ignore enemies behind the attacker.
   - Remember the closest valid enemy in range.
4. If a target is found, set movement to zero and state to `"attacking"`.
5. If no target is found, restore movement and state to `"walking"`.
6. Increase the attack timer only while attacking.
7. For a warrior hit, subtract damage immediately when the timer reaches the
   attack interval, then reset the timer.
8. Store the attacker's team as `lastHitTeam` on the victim.
9. Remove units with health at or below zero.
10. Clear stale targets naturally by finding a target again on the next frame.
11. Add a simple friendly-spacing check so units from the same team queue rather
    than overlap.
12. Clamp health-bar width so it never becomes negative.

### Checkpoint

- Same-lane enemies stop at the intended distance.
- Different-lane enemies never damage each other.
- A unit resumes walking after its opponent dies.
- Several units can join a lane without freezing the other lanes.

## Episode 5 — Archers and arrow projectiles

### Result at the end

Archers stop at long range and fire visible arrows. Warriors still use direct
hits. Projectiles damage only enemy units in their own lane.

### JavaScript concepts

- A second class
- Creating objects during the game loop
- Independent movement speed
- Collision checks
- Removing off-screen objects

### Build steps

1. Create the `arrows` array.
2. Create `Arrow(team, lane, x, y, damage)`.
3. Set arrow direction and speed with explicit team `if` statements.
4. Give `Arrow` simple `update()` and `draw()` methods.
5. Give archers less health and a longer `range` than warriors.
6. Reuse `findUnitTarget()`; range is data on the unit, not separate targeting
   code.
7. In the unit attack function:
   - Apply immediate damage for a warrior.
   - Push an arrow for an archer.
8. Write `handleArrows()`.
9. For every arrow, loop over units and check team and lane before collision.
10. Damage the first matching enemy, set `lastHitTeam`, mark the arrow for
    removal, and stop checking that arrow.
11. Remove arrows after a hit or after leaving the board.
12. Draw a small circle/rectangle around projectile collision bounds while
    debugging, then disable it with `showHitboxes`.

### Checkpoint

- An arrow cannot hit its owner or a teammate.
- An arrow in lane 0 cannot hit a unit in lane 1.
- Only one enemy receives damage from one arrow.
- Arrows are removed and do not accumulate forever.

## Episode 6 — Static towers, tower attacks, and winning

### Result at the end

Both towers have health. Any surviving unit from any of the three lanes can
attack the opponent tower. Destroying one tower freezes the battle and displays
the winner.

### JavaScript concepts

- Reusing an interface-like shape without inheritance
- Game-state flags
- Guard clauses
- Drawing health as a percentage
- Resetting an object's timer

### Build steps

1. Create a small `Tower` class and two tower instances.
2. Give the left and right tower full-height logical hitboxes covering all three
   lane ends.
3. Draw a smaller visible tower centered inside each logical hitbox.
4. Draw each tower's health bar and numeric health.
5. Add `getEnemyTower(team)` with ordinary `if` statements.
6. Let `findTarget(unit)` check enemy units first.
7. If no enemy unit blocks the lane and the tower is in range, return the enemy
   tower as the target.
8. Warriors apply direct tower damage.
9. Archer arrows can collide with the enemy tower after checking units first.
10. Add `gameState = "playing"` and `winner = ""`.
11. In `checkGameOver()`, set the winner when a tower reaches zero health.
12. Stop unit/projectile updates when the state is `"gameOver"`, but continue
    drawing the final frame and result overlay.
13. Keep both towers completely passive—no tower attack method or timer.

### Checkpoint

- A unit from each of the three lanes can damage the same enemy tower.
- Towers never create damage.
- Units still prefer an enemy unit in their lane over the tower behind it.
- Only one winner is declared and health never draws below zero.

## Episode 7 — Gold, costs, rewards, and complete HUD

### Result at the end

Both teams pay to deploy units. The killer's team earns a reward based on the
dead unit's maximum health. The top bar clearly shows tower health, gold, unit
costs, selected cards, and mode.

### JavaScript concepts

- Shared state objects
- Validating before changing state
- Returning `true` or `false` from a function
- Turning a formula into visible feedback

### Build steps

1. Add `blueGold` and `redGold` or one simple `teamGold` object.
2. Add `getUnitCost(type)` with `if` statements.
3. In `spawnUnit()`:
   - Stop if the game is over.
   - Validate team, type, and lane.
   - Get the cost.
   - Check the correct team's gold.
   - Check that the spawn area is not blocked.
   - Spend gold only after all checks pass.
   - Add the unit and return `true`.
4. Return `false` when a deployment fails.
5. Display a short floating message for insufficient gold or blocked spawn.
6. When a unit dies, calculate `Math.floor(maxHealth / 5)`.
7. Give the reward to `lastHitTeam` before removing the unit.
8. Show a `+gold` floating message in the defeated unit's team-opponent color.
9. Complete the menu cards with costs and stat hints.
10. Display both teams' gold and both tower health values.
11. Temporarily provide enough starting gold for rapid course testing.

### Checkpoint

- Failed deployments do not spend gold.
- One death produces exactly one reward.
- The reward uses maximum health, not remaining health.
- Blue and red balances never update the wrong side.

## Episode 8 — Simple opponent AI and reusable game modes

### Result at the end

AI mode is playable from start to finish. The red AI chooses affordable units
and lanes through the same deployment function the human player uses.

### JavaScript concepts

- Random numbers
- Small decision functions
- Reusing one public function
- Cooldowns
- Keeping input separate from game rules

### Build steps

1. Add `gameMode = "ai"` near the game state.
2. Add `aiTimer` and `aiInterval`.
3. Write `chooseAiLane()`:
   - Usually choose a random lane.
   - Occasionally inspect lane pressure with a simple loop.
   - Prefer a lane where blue has advanced units.
4. Write `chooseAiUnit()`:
   - Check what red can afford.
   - Use a random number to vary warriors and archers.
   - Fall back to warrior if archer is too expensive.
5. Write `handleAi()`:
   - Return immediately unless mode is AI and the game is playing.
   - Count frames until the cooldown is ready.
   - Call `spawnUnit("red", type, lane)`.
   - Reset or slightly vary the cooldown after a successful spawn.
   - Wait briefly and retry after a failed spawn.
6. Remove the temporary red debug-spawn key.
7. Make no AI-only unit, combat, resource, or tower code.
8. Draw `Mode: VS AI` in the menu.

### Extensibility rule

The AI is only another source of deployment requests. It must not update units
directly. This lets Episode 10 replace AI input with keyboard input without
rewriting the game.

### Checkpoint

- AI spends red gold normally.
- AI cannot spawn after game over.
- AI uses all three lanes and both unit types.
- Disabling `handleAi()` does not break any core game mechanic.

## Episode 9 — Tiny Swords sprites and animation states

### Result at the end

Rectangles are replaced with animated blue and red warriors/archers, tower art,
arrows, and a simple Tiny Swords battlefield. Movement, attacks, and idle states
use sprite sheets.

### JavaScript concepts

- Creating `Image` objects
- Source and destination rectangles in `drawImage()`
- Sprite-sheet frame width
- Animation counters
- Connecting visual state to game state

### Asset choice

Use the **Tiny Swords (Free Pack)** as the primary pack because it already has
matching blue/red teams and separate action sheets. Relevant files include:

```text
assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Idle.png
assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Run.png
assets/Tiny Swords (Free Pack)/Units/Blue Units/Warrior/Warrior_Attack1.png
assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Idle.png
assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Run.png
assets/Tiny Swords (Free Pack)/Units/Blue Units/Archer/Archer_Shoot.png
assets/Tiny Swords (Free Pack)/Units/Red Units/...
assets/Tiny Swords (Free Pack)/Buildings/Blue Buildings/Castle.png
assets/Tiny Swords (Free Pack)/Buildings/Red Buildings/Castle.png
assets/Tiny Swords (Free Pack)/Terrain/Tileset/Tilemap_color1.png
```

The unit frames are 192 × 192 pixels. For example, the blue Warrior Idle sheet
is 1536 × 192, so it contains eight horizontal frames. Explain how image width
divided by frame width gives the number of frames.

### Build steps

1. Load only the images used by the finished game.
2. Group image references in readable plain objects by team, type, and action.
3. Add `frameX`, `maxFrame`, and `animationTimer` to units.
4. Choose a sheet with `if` statements based on:
   - Team
   - Unit type
   - `walking`, `attacking`, or `idle` state
5. Reset `frameX` when the action state changes.
6. Advance a frame only every fixed number of game frames.
7. Draw one 192 × 192 source frame into the unit's smaller destination rectangle.
8. Because source artwork faces a default direction, use `ctx.save()`,
   `ctx.scale(-1, 1)`, adjusted `x`, and `ctx.restore()` for the mirrored team if
   needed. Explain the coordinate change slowly.
9. Time direct warrior damage to one chosen attack-animation frame.
10. Time archer creation of an arrow to one chosen shoot-animation frame.
11. Keep the existing attack interval as the gameplay authority so animation
    cannot accidentally attack many times.
12. Replace arrow rectangles with the pack's Arrow image.
13. Draw blue/red castle sprites while preserving the full-height logical tower
    hitboxes created in Episode 6.
14. Add one grass/tile image or a few simple terrain decorations behind units.
15. Keep health bars, selection outlines, and debug hitboxes drawn after sprites.

### Important teaching note

Do not redesign mechanics while adding art. If a sprite is offset, fix its draw
coordinates—not its collision position. Logical rectangles and visible artwork
are related but do not have to be identical.

### Checkpoint

- Every unit has walking and attacking animation.
- Idle is shown when friendly spacing stops a unit without an enemy target.
- Damage occurs once per attack, not once per animation frame.
- Mirrored sprites and arrows face their travel direction.
- Tower collision still works in every lane.

## Episode 10 — Local PvP, restart, balance, and final cleanup

### Result at the end

The same finished game supports `VS AI` and local `2 Players`. Blue uses the
mouse; red uses numbers and arrow keys. Players can restart after a win.

### JavaScript concepts

- Keyboard events and `event.key`
- Switching behavior with a mode variable
- Resetting arrays and object state
- Preventing repeated input
- Final debugging and balancing

### Build steps

1. Add a simple mode button in the canvas menu.
2. Let a click switch between `"ai"` and `"pvp"` only before a match or after a
   restart.
3. Add `selectedRedType` and `selectedRedLane`.
4. Handle keyboard input with explicit `if` statements:
   - `1` selects the red warrior.
   - `2` selects the red archer.
   - Arrow Up moves the selector toward lane 0.
   - Arrow Down moves the selector toward lane 2.
   - Arrow Left calls `spawnUnit("red", selectedRedType, selectedRedLane)`.
5. Call `event.preventDefault()` for game arrow keys so the page does not scroll.
6. Ignore red deployment keys in AI mode.
7. Draw the red selected card and lane cursor clearly.
8. Ensure holding a key does not deploy an uncontrolled stream of units; use the
   browser keydown event once per press or ignore `event.repeat`.
9. Write `restartGame()` that:
   - Empties `units`, `arrows`, and floating messages with `.length = 0`.
   - Restores both tower health values.
   - Restores team gold and selection defaults.
   - Resets AI timers, winner, frame counters, and game state.
10. Add a clickable Restart button to the game-over overlay.
11. Play complete AI and PvP matches.
12. Tune unit costs, health, damage, range, speed, rewards, and AI delay.
13. Remove temporary console logs.
14. Set `showGrid` and `showHitboxes` to `false`, but keep the flags for teaching.
15. Add short comments above major sections and complicated coordinate code.

### Final test checklist

- Blue can deploy both unit types with the mouse in all three lanes.
- Red AI can complete a match and obeys its resource balance.
- Red human controls work only in PvP mode.
- Units never target another lane or their own team.
- Warriors deal one direct hit per attack interval.
- Archer arrows hit at most one valid target.
- Killing rewards go to the correct team exactly once.
- Friendly units do not pile into one unreadable rectangle.
- All three lanes can damage the one enemy tower.
- Towers remain static and never attack.
- No units or arrows update after game over.
- Restart produces a clean new match in the selected mode.
- A long match does not leave dead units or off-screen arrows in arrays.
- The final code uses no ternaries or higher-order array methods.

## 5. Suggested episode pacing

Each video should follow the same beginner-friendly rhythm:

1. Show the small playable result for this episode.
2. Draw the new data/flow on screen in plain language.
3. Add the smallest version with colored rectangles.
4. Log or draw intermediate values.
5. Test one normal case and one failure case.
6. Recap the new JavaScript concepts.
7. Preview only the next mechanic.

Avoid long refactors during recording. If repeated code becomes confusing, turn
only that repeated section into one named function and immediately demonstrate
the same behavior still working.

## 6. Lessons retained from the older Tower Defence project

The reference game uses the right overall beginner structure: one HTML file, one
CSS file, one large JavaScript file, classes for visible entities, global arrays,
handler functions, explicit loops, and one `animate()` function. This course
keeps that recognizable approach.

It also gives useful patterns to teach again:

- `Cell`, unit, projectile, resource/message-style classes
- `createGrid()` once, then `handleGrid()` every frame
- Arrays for active units and projectiles
- One handler per kind of object
- Frame-based animation and attack timing
- Removing objects with `splice()` and correcting the loop index
- A small reusable rectangle collision function
- Resource rewards derived from defeated maximum health

The new game should simplify several parts rather than copy them literally:

- One `Unit` class replaces unrelated defender/enemy combat branches.
- `team` and `lane` are explicit properties.
- Target selection is one named function instead of collision logic spread
  across several handlers.
- A `remove` flag or careful backward loop reduces accidental skipped elements.
- Tower health replaces score-based level completion.
- Direct melee and straight arrows replace explosions and special enemy cases.
- AI and PvP both enter through `spawnUnit()`.
- Art is introduced after mechanics, not at the beginning.

This preserves the approachable, manual style of the older 1,222-line JavaScript
game while giving the new course a cleaner learning path and a smaller mechanic
set.

## 7. Definition of course completion

The course is complete when a viewer can download the three code files plus the
selected assets, open `index.html` with a simple local server, and play a full
match in either mode without installing anything.

The final result must demonstrate these core JavaScript ideas clearly:

- Canvas drawing and animation
- Coordinates, grid rows, and mouse position
- Classes and object instances
- Arrays and manual loops
- State such as walking, attacking, game over, and selected unit
- Movement in opposite directions
- Same-lane targeting and rectangle collision
- Direct attacks and projectile attacks
- Timers, health, death, resource costs, and rewards
- Basic AI decisions
- Mouse and keyboard input sharing the same game rules
- Sprite-sheet animation

Anything that does not strengthen one of those ideas should remain outside this
10-episode version.
