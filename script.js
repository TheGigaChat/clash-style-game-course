// CANVAS SETUP
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const canvasWidth = 1000;
const canvasHeight = 640;
const menuHeight = 100;
const laneHeight = 180;
const laneCount = 3;
const columnWidth = 100;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// GAME CONSTANTS
const blueTeam = "blue";
const redTeam = "red";
const warriorType = "warrior";
const archerType = "archer";
const warriorCost = 40;
const archerCost = 60;
const startingGold = 180;
const blueSpawnX = 112;
const redSpawnX = 818;
const unitWidth = 70;
const unitHeight = 70;
const warriorHealth = 140;
const warriorDamage = 20;
const warriorRange = 22;
const warriorAttackInterval = 36;
const warriorSpeed = 0.7;
const archerHealth = 80;
const archerDamage = 15;
const archerRange = 220;
const archerAttackInterval = 72;
const archerSpeed = 0.55;
const arrowSpeed = 6;
const arrowWidth = 32;
const arrowHeight = 10;
const friendlyGap = 14;
const towerHealth = 1000;
const towerWidth = 100;
const towerVisibleWidth = 128;
const towerVisibleHeight = 256;
const spriteFrameSize = 192;
const unitDrawSize = 118;
const animationInterval = 9;
const terrainTileSize = 64;

const cardY = 12;
const cardWidth = 112;
const cardHeight = 76;

// IMAGE LOADING
const assetFolder = "Tiny Swords (Free Pack)/";

function createImage(filePath) {
  const image = new Image();
  image.src = assetFolder + filePath;
  return image;
}
const unitImages = {
  blue: {
    warrior: {
      idle: createImage("Units/Blue Units/Warrior/Warrior_Idle.png"),
      walking: createImage("Units/Blue Units/Warrior/Warrior_Run.png"),
      attacking: createImage("Units/Blue Units/Warrior/Warrior_Attack1.png"),
    },
    archer: {
      idle: createImage("Units/Blue Units/Archer/Archer_Idle.png"),
      walking: createImage("Units/Blue Units/Archer/Archer_Run.png"),
      attacking: createImage("Units/Blue Units/Archer/Archer_Shoot.png"),
    },
  },
  red: {
    warrior: {
      idle: createImage("Units/Red Units/Warrior/Warrior_Idle.png"),
      walking: createImage("Units/Red Units/Warrior/Warrior_Run.png"),
      attacking: createImage("Units/Red Units/Warrior/Warrior_Attack1.png"),
    },
    archer: {
      idle: createImage("Units/Red Units/Archer/Archer_Idle.png"),
      walking: createImage("Units/Red Units/Archer/Archer_Run.png"),
      attacking: createImage("Units/Red Units/Archer/Archer_Shoot.png"),
    },
  },
};
const towerImages = {
  blue: createImage("Buildings/Blue Buildings/Tower.png"),
  red: createImage("Buildings/Red Buildings/Tower.png"),
};
const arrowImage = createImage("Units/Blue Units/Archer/Arrow.png");
const terrainImage = createImage("Terrain/Tileset/Tilemap_color1.png");

// ACTIVE GAME OBJECTS
const gameGrid = [];
const units = [];
const arrows = [];
const floatingMessages = [];

// GAME STATE
let gameState = "playing";
let gameMode = "ai";
let winner = "";
let blueGold = startingGold;
let redGold = startingGold;
let showHitboxes = false;
let selectedBlueType = warriorType;
let debugRedLane = 0;
let aiTimer = 0;
let aiInterval = 180;
let incomeTimer = 0;
const incomeInterval = 240;
let nextUnitId = 0;

// MOUSE INPUT
const mouse = {
  x: undefined,
  y: undefined,
  width: 1,
  height: 1,
  clicked: false,
};

let canvasPosition = canvas.getBoundingClientRect();
// {
//   left: 120,
//   top: 80,
//   width: 1000,
//   height: 640,
//   right: 1120,
//   bottom: 720
// }

canvas.addEventListener("mousemove", function (event) {
  canvasPosition = canvas.getBoundingClientRect();

  const scaleX = canvas.width / canvasPosition.width;
  const scaleY = canvas.height / canvasPosition.height;

  mouse.x = (event.clientX - canvasPosition.left) * scaleX;
  mouse.y = (event.clientY - canvasPosition.top) * scaleY;
});

canvas.addEventListener("mouseleave", function () {
  mouse.x = undefined;
  mouse.y = undefined;
});

canvas.addEventListener("mousedown", function () {
  mouse.clicked = true;
});

canvas.addEventListener("mouseup", function () {
  mouse.clicked = false;
});

// MENU AREAS
const blueWarriorCard = {
  x: 20,
  y: cardY,
  width: cardWidth,
  height: cardHeight,
};

const blueArcherCard = {
  x: 142,
  y: cardY,
  width: cardWidth,
  height: cardHeight,
};

const redWarriorCard = {
  x: 746,
  y: cardY,
  width: cardWidth,
  height: cardHeight,
};

const redArcherCard = {
  x: 868,
  y: cardY,
  width: cardWidth,
  height: cardHeight,
};

const modeDisplay = {
  x: 425,
  y: 18,
  width: 150,
  height: 64,
};

// SMALL HELPER FUNCTIONS
function getYFromLane(lane) {
  return menuHeight + lane * laneHeight + (laneHeight - unitHeight) / 2;
}

function getLaneFromY(y) {
  if (y < menuHeight) {
    return -1;
  }

  const gridPositionY = y - ((y - menuHeight) % laneHeight);
  const lane = (gridPositionY - menuHeight) / laneHeight;

  if (lane < 0 || lane >= laneCount) {
    return -1;
  }

  return lane;
}

function isPointInsideBox(point, box) {
  if (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  ) {
    return true;
  }

  return false;
}

function getUnitCost(type) {
  if (type === warriorType) {
    return warriorCost;
  }

  if (type === archerType) {
    return archerCost;
  }

  return 0;
}

function getTeamGold(team) {
  if (team === blueTeam) {
    return blueGold;
  }
  if (team === redTeam) {
    return redGold;
  }
  return 0;
}

function spendTeamGold(team, amount) {
  if (team === blueTeam) {
    blueGold -= amount;
  }
  if (team === redTeam) {
    redGold -= amount;
  }
}

function addTeamGold(team, amount) {
  if (team === blueTeam) {
    blueGold += amount;
  }
  if (team === redTeam) {
    redGold += amount;
  }
}

function getTeamColor(team) {
  if (team === blueTeam) {
    return "#7ec8ff";
  }
  if (team === redTeam) {
    return "#ff938d";
  }
}

function isTargetInFront(unit, target) {
  if (unit.team === blueTeam && target.x >= unit.x) {
    return true;
  }

  if (unit.team === redTeam && target.x <= unit.x) {
    return true;
  }

  return false;
}

function getDistanceInFront(unit, target) {
  let distance = 0;

  if (unit.team === blueTeam) {
    distance = target.x - (unit.x + unit.width);
  }

  if (unit.team === redTeam) {
    distance = unit.x - (target.x + target.width);
  }

  if (distance < 0) {
    distance = 0;
  }

  return distance;
}

function clampHealth(health) {
  if (health < 0) {
    return 0;
  }

  return health;
}

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

// GRID
class Cell {
  constructor(x, y, row, column) {
    this.x = x;
    this.y = y;
    this.width = columnWidth;
    this.height = laneHeight;
    this.row = row;
    this.column = column;
  }

  draw() {
    ctx.strokeStyle = "rgba(32, 68, 35, 0.22)";
    ctx.lineWidth = 1;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    if (mouse.x !== undefined && isPointInsideBox(mouse, this)) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

function createGrid() {
  for (let row = 0; row < laneCount; row++) {
    for (let x = 0; x < canvasWidth; x += columnWidth) {
      const y = menuHeight + row * laneHeight;
      const column = x / columnWidth;
      gameGrid.push(new Cell(x, y, row, column));
    }
  }
}

function handleGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

// TOWERS
class Tower {
  constructor(team, x) {
    this.team = team;
    this.x = x;
    this.y = menuHeight;
    this.width = towerWidth;
    this.height = canvasHeight - menuHeight;
    this.health = towerHealth;
    this.maxHealth = towerHealth;
    this.lastHitTeam = "";
  }

  draw() {
    // The visible tower is smaller than its hitbox, which covers all three lanes.
    const visibleX = this.x + (this.width - towerVisibleWidth) / 2;
    const visibleY = this.y + (this.height - towerVisibleHeight) / 2;

    if (this.team === blueTeam) {
      ctx.fillStyle = "rgba(53, 111, 177, 0.72)";
    }
    if (this.team === redTeam) {
      ctx.fillStyle = "rgba(180, 70, 64, 0.72)";
    }

    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2;
    for (let lane = 0; lane < laneCount; lane++) {
      const lineY = menuHeight + lane * laneHeight;
      ctx.strokeRect(this.x + 4, lineY + 4, this.width - 8, laneHeight - 8);
    }

    const image = towerImages[this.team];
    ctx.drawImage(image, visibleX, visibleY, towerVisibleWidth, towerVisibleHeight);

    if (showHitboxes) {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

const leftTower = new Tower(blueTeam, 0);
const rightTower = new Tower(redTeam, canvasWidth - towerWidth);

function getEnemyTower(team) {
  if (team === blueTeam) {
    return rightTower;
  }
  if (team === redTeam) {
    return leftTower;
  }
  return null;
}

function handleTowers() {
  leftTower.draw();
  rightTower.draw();
}

// UNITS
class Unit {
  constructor(team, type, lane) {
    this.id = nextUnitId;
    nextUnitId++;
    this.team = team;
    this.type = type;
    this.lane = lane;
    this.x = blueSpawnX;
    this.y = getYFromLane(lane);
    this.width = unitWidth;
    this.height = unitHeight;
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
    this.previousState = "walking";
    this.frameX = 0;
    this.maxFrame = 0;
    this.animationTimer = 0;
    this.lastHitTeam = "";

    if (type === warriorType) {
      this.speed = warriorSpeed;
      this.health = warriorHealth;
      this.maxHealth = warriorHealth;
      this.damage = warriorDamage;
      this.range = warriorRange;
      this.attackInterval = warriorAttackInterval;
    }

    if (type === archerType) {
      this.speed = archerSpeed;
      this.health = archerHealth;
      this.maxHealth = archerHealth;
      this.damage = archerDamage;
      this.range = archerRange;
      this.attackInterval = archerAttackInterval;
    }

    if (team === blueTeam) {
      this.x = blueSpawnX;
      this.movement = this.speed;
    }

    if (team === redTeam) {
      this.x = redSpawnX;
      this.movement = -this.speed;
    }
  }

  update() {
    if (gameState !== "playing") {
      return;
    }

    this.target = findTarget(this);

    if (this.target !== null) {
      this.state = "attacking";
      this.movement = 0;
      this.attackTimer++;

      if (this.attackTimer >= this.attackInterval) {
        this.attack()
        this.attackTimer = 0;
      }
    } else {
      this.state = "walking";
      this.attackTimer = 0;

      if (this.team === blueTeam) {
        this.movement = this.speed;
      }

      if (this.team === redTeam) {
        this.movement = -this.speed;
      }

      if (isBlockedByFriendlyUnit(this)) {
        this.state = "idle";
        this.movement = 0;
      }
    }

    this.x += this.movement;
    this.updateAnimation();
  }

  updateAnimation() {
    const image = getUnitImage(this);
    this.maxFrame = image.naturalWidth / spriteFrameSize - 1;

    if (this.state !== this.previousState) {
      this.frameX = 0;
      this.animationTimer = 0;
      this.previousState = this.state;
    }

    this.animationTimer++;
    if (this.animationTimer >= animationInterval) {
      this.animationTimer = 0;
      this.frameX++;
      if (this.frameX > this.maxFrame) {
        this.frameX = 0;
      }
    }
  }

  attack() {
    if (gameState !== "playing") {
      return;
    }

    // melee combat unit types
    if (this.type === warriorType) {
      this.target.health -= this.damage;
      this.target.lastHitTeam = this.team;
    }

    // distance combat unit types
    if (this.type === archerType) {
      const arrowX = this.x + this.width / 2;
      const arrowY = this.y + this.height / 2;
      const arrow = new Arrow(
        this.team,
        this.lane,
        arrowX,
        arrowY,
        this.damage
      );
      arrows.push(arrow);
    }
  }

  draw() {
    const image = getUnitImage(this);
    drawUnitSprite(this, image);

    const healthBarWidth = this.width - 14;
    const healthBarHeight = 7;
    const safeHealth = clampHealth(this.health);
    let healthPercentage = safeHealth / this.maxHealth;

    ctx.fillStyle = "rgba(40, 25, 28, 0.75)";
    ctx.fillRect(this.x + 7, this.y - 8, healthBarWidth, healthBarHeight);

    if (this.team === blueTeam) {
      ctx.fillStyle = "#5ed4ff";
    }
    if (this.team === redTeam) {
      ctx.fillStyle = "#ff6e68";
    }

    ctx.fillRect(
      this.x + 7,
      this.y - 8,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );

    if (showHitboxes) {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

function getUnitImage(unit) {
  const images = unitImages[unit.team][unit.type];
  let image = images.idle;
  if (unit.state === "walking") {
    image = images.walking;
  }
  if (unit.state === "attacking") {
    image = images.attacking;
  }
  return image;
}

function drawUnitSprite(unit, image) {
  const unitCenterX = unit.x + unit.width / 2;
  const unitBottomY = unit.y + unit.height;

  const spriteLeft = unitCenterX - unitDrawSize / 2;  // show figma example
  const spriteRight = unitCenterX + unitDrawSize / 2;
  const spriteTop = unitBottomY - unitDrawSize + 20;

  const sourceX = unit.frameX * spriteFrameSize;

  if (unit.team === redTeam) {
    ctx.translate(spriteRight, spriteTop);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(spriteLeft, spriteTop);
  }

  ctx.drawImage(
    image,
    sourceX, 0, spriteFrameSize, spriteFrameSize,  // Rectangle to copy FROM the sprite sheet
    0, 0, unitDrawSize, unitDrawSize  // Rectangle to draw TO on the canvas
  );

  ctx.resetTransform();
}

// PROJECTILES
class Arrow {
  constructor(team, lane, x, y, damage) {
    this.team = team;
    this.lane = lane;
    this.x = x;
    this.y = y - arrowHeight / 2;
    this.width = arrowWidth;
    this.height = arrowHeight;
    this.damage = damage;
    this.speed = 0;
    this.direction = 0;
    this.remove = false;

    if (team === blueTeam) {
      this.speed = arrowSpeed;
      this.direction = 1;
    }

    if (team === redTeam) {
      this.speed = arrowSpeed;
      this.direction = -1;
      this.x -= this.width;
    }
  }

  update() {
    if (gameState !== "playing") {
      return;
    }

    this.x += this.speed * this.direction;
  }

  draw() {
    if (this.team === redTeam) {
      ctx.translate(this.x * 2 + this.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(arrowImage, this.x - 5, this.y - 11, this.width + 10, this.height + 22);
    ctx.resetTransform();

    if (showHitboxes) {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

// FLOATING MESSAGES
class FloatingMessage {
  constructor(value, x, y, color) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 0;
    this.opacity = 1;
  }
  
  update() {
    this.y -= 0.35;
    this.life++;
    this.opacity -= 0.012;
    if (this.opacity < 0) {
      this.opacity = 0;
    }
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.value, this.x, this.y);
    ctx.globalAlpha = 1;
  }
}

function findTarget(unit) {
  let closestTarget = null;
  let closestDistance = 999999;

  for (let i = 0; i < units.length; i++) {
    const possibleTarget = units[i];

    if (possibleTarget === unit) {
      continue;
    }

    if (possibleTarget.team === unit.team) {
      continue;
    }

    if (possibleTarget.lane !== unit.lane) {
      continue;
    }

    if (possibleTarget.health <= 0) {
      continue;
    }

    if (!isTargetInFront(unit, possibleTarget)) {
      continue;
    }

    const distance = getDistanceInFront(unit, possibleTarget);

    if (distance <= unit.range && distance < closestDistance) {
      closestTarget = possibleTarget;
      closestDistance = distance;
    }
  }

  if (closestTarget !== null) {
    return closestTarget;
  }

  const enemyTower = getEnemyTower(unit.team);
  if (enemyTower.health > 0 && isTargetInFront(unit, enemyTower)) {
    const towerDistance = getDistanceInFront(unit, enemyTower);
    if (towerDistance <= unit.range) {
      return enemyTower;
    }
  }

  return null;
}

function isBlockedByFriendlyUnit(unit) {
  for (let i = 0; i < units.length; i++) {
    const possibleBlocker = units[i];

    if (possibleBlocker === unit) {
      continue;
    }

    if (possibleBlocker.team !== unit.team) {
      continue;
    }

    if (possibleBlocker.lane !== unit.lane) {
      continue;
    }

    let blockerIsInFront = false;

    if (unit.team === blueTeam && possibleBlocker.x > unit.x) {
      blockerIsInFront = true;
    }

    if (unit.team === redTeam && possibleBlocker.x < unit.x) {
      blockerIsInFront = true;
    }

    if (possibleBlocker.x === unit.x && possibleBlocker.id < unit.id) {
      blockerIsInFront = true;
    }

    if (!blockerIsInFront) {
      continue;
    }

    const distance = getDistanceInFront(unit, possibleBlocker);

    if (distance <= friendlyGap) {
      return true;
    }
  }

  return false;
}

function isSpawnBlocked(team, lane) {
  let spawnX = blueSpawnX;
  if (team === redTeam) {
    spawnX = redSpawnX;
  }
  const spawnBox = {
    x: spawnX - friendlyGap,
    y: getYFromLane(lane),
    width: unitWidth + friendlyGap * 2,
    height: unitHeight,
  };

  for (let i = 0; i < units.length; i++) {
    const unit = units[i];
    if (unit.health <= 0) {
      continue;
    }
    if (unit.team === team &&
        unit.lane === lane &&
        isColliding(spawnBox, unit)
      ) {
      return true;
    }
  }
  return false;
}

function showDeploymentMessage(team, lane, value) {
  let messageX = 220;
  if (team === redTeam) {
    messageX = canvasWidth - 220;
  }
  floatingMessages.push(
    new FloatingMessage(value, messageX, getYFromLane(lane) - 20, "#ffe08a")
  );
}

function spawnUnit(team, type, lane) {
  if (gameState !== "playing") {
    return false;
  }

  if (team !== blueTeam && team !== redTeam) {
    return false;
  }

  if (type !== warriorType && type !== archerType) {
    return false;
  }

  if (lane < 0 || lane >= laneCount) {
    return false;
  }

  const cost = getUnitCost(type);
  if (getTeamGold(team) < cost) {
    showDeploymentMessage(team, lane, "Not enough gold");
    return false;
  }
  if (isSpawnBlocked(team, lane)) {
    showDeploymentMessage(team, lane, "Spawn is blocked");
    return false;
  }

  spendTeamGold(team, cost);

  const unit = new Unit(team, type, lane);
  units.push(unit);
  return true;
}

function rewardUnitDefeat(unit) {
  if (unit.lastHitTeam !== blueTeam && unit.lastHitTeam !== redTeam) {
    return;
  }
  const reward = Math.floor(unit.maxHealth / 5);
  addTeamGold(unit.lastHitTeam, reward);
  floatingMessages.push(
    new FloatingMessage(
      "+" + reward + " gold",
      unit.x + unit.width / 2,
      unit.y,
      getTeamColor(unit.lastHitTeam)
    )
  );
  unit.lastHitTeam = "";
}

function handleUnits() {
  for (let i = 0; i < units.length; i++) {
    if (units[i].health > 0) {
      units[i].update();
      units[i].draw();
    } else {
      rewardUnitDefeat(units[i]);
      units.splice(i, 1);
      i--;
    }
  }
}

function handleArrows() {
  for (let i = 0; i < arrows.length; i++) {
    const arrow = arrows[i];
    if (gameState !== "playing") {
      arrow.draw();
      continue;
    }
    arrow.update();

    for (let j = 0; j < units.length; j++) {
      const possibleTarget = units[j];

      if (possibleTarget.team === arrow.team) {
        continue;
      }

      if (possibleTarget.lane !== arrow.lane) {
        continue;
      }

      if (possibleTarget.health <= 0) {
        continue;
      }

      if (isColliding(arrow, possibleTarget)) {
        possibleTarget.health -= arrow.damage;
        possibleTarget.lastHitTeam = arrow.team;
        arrow.remove = true;
        break;
      }
    }

    if (!arrow.remove) {
      const enemyTower = getEnemyTower(arrow.team);
      if (isColliding(arrow, enemyTower)) {
        enemyTower.health -= arrow.damage;
        enemyTower.lastHitTeam = arrow.team;
        arrow.remove = true;
      }
    }

    if (arrow.x + arrow.width < 0 || arrow.x > canvasWidth) {
      arrow.remove = true;
    }

    if (!arrow.remove) {
      arrow.draw();
    }
  }

  for (let i = arrows.length - 1; i >= 0; i--) {
    if (arrows[i].remove) {
      arrows.splice(i, 1);
    }
  }
}

function handleFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    const message = floatingMessages[i];
    message.update();
    message.draw();
    if (message.life >= 85) {
      floatingMessages.splice(i, 1);
      i--;
    }
  }
}

// BACKGROUND
function drawBackground() {
  ctx.fillStyle = "#91c968";
  ctx.fillRect(0, menuHeight, canvasWidth, laneHeight);
  
  ctx.fillStyle = "#84bd5f";
  ctx.fillRect(0, menuHeight + laneHeight, canvasWidth, laneHeight);

  ctx.fillStyle = "#91c968";
  ctx.fillRect(0, menuHeight + laneHeight * 2, canvasWidth, laneHeight);

  for (let y = menuHeight; y < canvasHeight; y += terrainTileSize) {
    for (let x = 0; x < canvasWidth; x += terrainTileSize) {
      const width = Math.min(terrainTileSize, canvasWidth - x);
      const height = Math.min(terrainTileSize, canvasHeight - y);
      ctx.drawImage(terrainImage, 64, 64, width, height, x, y, width, height);
    }
  }

  ctx.strokeStyle = "rgba(34, 75, 38, 0.5)";
  ctx.lineWidth = 3;
  for (let lane = 1; lane < laneCount; lane++) {
    const lineY = menuHeight + lane * laneHeight;
    ctx.beginPath();
    ctx.moveTo(0, lineY);
    ctx.lineTo(canvasWidth, lineY);
    ctx.stroke();
  }

  ctx.fillStyle = "rgba(255, 255, 255, 0.09)";
  ctx.fillRect(canvasWidth / 2 - 3, menuHeight, 6, canvasHeight - menuHeight);

  ctx.fillStyle = "#263951";
  ctx.fillRect(0, 0, canvasWidth, menuHeight);
}

function drawLaneLabels() {
  ctx.fillStyle = "rgba(22, 50, 28, 0.55)";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";

  for (let lane = 0; lane < laneCount; lane++) {
    const labelY = menuHeight + lane * laneHeight + laneHeight / 2;
    ctx.fillText("Lane " + (lane + 1), canvasWidth / 2, labelY);
  }
}

// MENU
function drawCard(card, team, type, selected) {
  ctx.fillStyle = "rgba(12, 23, 38, 0.82)";
  ctx.fillRect(card.x, card.y, card.width, card.height);

  ctx.strokeStyle = "#71839b";
  ctx.lineWidth = 2;

  if (selected) {
    ctx.strokeStyle = "#ffd95c";
    ctx.lineWidth = 4;
  }
  
  const image = unitImages[team][type].idle;
  ctx.drawImage(image, 0, 0, spriteFrameSize, spriteFrameSize, card.x + 2, card.y + 2, 66, 66);
  ctx.strokeRect(card.x, card.y, card.width, card.height);

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 13px Arial";

  if (type === warriorType) {
    ctx.fillText("Warrior", card.x + 55, card.y + 28);
  }

  if (type === archerType) {
    ctx.fillText("Archer", card.x + 55, card.y + 28);
  }

  ctx.fillStyle = "#ffd95c";
  ctx.font = "bold 14px Arial";
  ctx.fillText(getUnitCost(type) + " gold", card.x + 55, card.y + 50);
}

function drawMenu() {
  drawCard(
    blueWarriorCard,
    blueTeam,
    warriorType,
    selectedBlueType === warriorType
  );

  drawCard(
    blueArcherCard,
    blueTeam,
    archerType,
    selectedBlueType === archerType
  );

  drawCard(redWarriorCard, redTeam, warriorType, false);
  drawCard(redArcherCard, redTeam, archerType, false);

  ctx.fillStyle = "#16263b";
  ctx.fillRect(modeDisplay.x, modeDisplay.y, modeDisplay.width, modeDisplay.height);
  ctx.strokeStyle = "#9fb3ca";
  ctx.lineWidth = 2;
  ctx.strokeRect(modeDisplay.x, modeDisplay.y, modeDisplay.width, modeDisplay.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 17px Arial";
  ctx.fillText("TEST", modeDisplay.x + modeDisplay.width / 2, modeDisplay.y + 27);

  ctx.fillStyle = "#7ec8ff";
  ctx.font = "bold 17px Arial";
  ctx.fillText("Blue: " + blueGold, 330, 34);
  ctx.fillStyle = "#ff938d";
  ctx.fillText("Red: " + redGold, 670, 34);
  ctx.fillStyle = "#dce8f6";
  ctx.font = "13px Arial";
  ctx.fillText("Tower " + clampHealth(leftTower.health), 330, 62);
  ctx.fillText("Tower " + clampHealth(rightTower.health), 670, 62);
}

// PLAYER INPUT
function handleCanvasClick() {
  if (gameState !== "playing") {
    return;
  }

  if (mouse.x === undefined || mouse.y === undefined) {
    return;
  }

  if (isPointInsideBox(mouse, blueWarriorCard)) {
    selectedBlueType = warriorType;
    return;
  }

  if (isPointInsideBox(mouse, blueArcherCard)) {
    selectedBlueType = archerType;
    return;
  }

  if (mouse.y < menuHeight) {
    return;
  }

  if (mouse.x < 0 || mouse.x >= canvasWidth / 2) {
    return;
  }

  const lane = getLaneFromY(mouse.y);

  if (lane !== -1) {
    spawnUnit(blueTeam, selectedBlueType, lane);
  }
}

canvas.addEventListener("click", handleCanvasClick);

// window.addEventListener("keydown", function (event) {
//   if (gameState !== "playing") {
//     return;
//   }

//   if (event.key === "r" || event.key === "R") {
//     spawnUnit(redTeam, warriorType, debugRedLane);

//     debugRedLane++;
//     if (debugRedLane >= laneCount) {
//       debugRedLane = 0;
//     }
//   }

//   if (event.key === "a" || event.key === "A") {
//     spawnUnit(redTeam, archerType, debugRedLane);

//     debugRedLane++;
//     if (debugRedLane >= laneCount) {
//       debugRedLane = 0;
//     }
//   }
// });

// OPPONENT AI

function chooseAiLane() {
  let selectedLane = Math.floor(Math.random() * laneCount);
  let closestBlueUnitToRedTowerX = -1;

  if (Math.random() < 0.55) {
    for (let i = 0; i < units.length; i++) {
      const unit = units[i];
      if (unit.team === blueTeam && unit.health > 0 && unit.x > closestBlueUnitToRedTowerX) {
        closestBlueUnitToRedTowerX = unit.x;
        selectedLane = unit.lane;
      }
    }
  }
  return selectedLane;
}

function chooseAiUnit() {
  if (redGold < warriorCost) {
    return "";
  }
  if (redGold >= archerCost && Math.random() < 0.45) {
    return archerType;
  }
  return warriorType;
}

function handleAi() {
  if (gameMode !== "ai") {
    return;
  }
  if (gameState !== "playing") {
    return;
  }

  aiTimer++;
  if (aiTimer < aiInterval) {
    return;
  }

  const aiUnitType = chooseAiUnit();
  if (aiUnitType === "") {
    aiTimer = aiInterval - 30;
    return;
  }
  const aiLane = chooseAiLane();
  const unitWasCreated = spawnUnit(redTeam, aiUnitType, aiLane);

  if (unitWasCreated) {
    aiTimer = 0;
    aiInterval = 145 + Math.floor(Math.random() * 90);  // 145 - 235
  } else {
    aiTimer = aiInterval - 35;
  }
}

function handlePassiveIncome() {
  if (gameState !== "playing") {
    return;
  }

  incomeTimer++;
  if (incomeTimer >= incomeInterval) {
    blueGold += 5;
    redGold += 5;
    incomeTimer = 0;
  }
}

// GAME STATUS
function checkGameOver() {
  if (gameState !== "playing") {
    return;
  }

  if (leftTower.health <= 0) {
    leftTower.health = 0;
    winner = redTeam;
    gameState = "gameOver";
  } else if (rightTower.health <= 0) {
    rightTower.health = 0;
    winner = blueTeam;
    gameState = "gameOver";
  }
}

function drawGameOver() {
  if (gameState !== "gameOver") {
    return;
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
  ctx.fillRect(0, menuHeight, canvasWidth, canvasHeight - menuHeight);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 36px Arial";
  ctx.textAlign = "center";
  let resultText = "Blue wins!";
  if (winner === redTeam) {
    resultText = "Red wins!";
  }
  ctx.fillText(resultText, canvasWidth / 2, menuHeight + (canvasHeight - menuHeight) / 2);
}

// MAIN GAME LOOP
function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  handleGrid();
  handlePassiveIncome();
  drawMenu();
  drawLaneLabels();
  handleAi();
  handleUnits();
  handleArrows();
  checkGameOver();
  handleTowers();
  handleFloatingMessages();
  drawGameOver();
  requestAnimationFrame(animate);
}
createGrid();
animate();
