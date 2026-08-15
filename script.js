// THREE-LANE BATTLE

// A beginner-friendly canvas game written with plain JavaScript.

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
const blueSpawnX = 112;
const redSpawnX = 818;
const unitWidth = 70;
const unitHeight = 70;
const startingGold = 180;
const towerStartingHealth = 1000;
const warriorCost = 40;
const warriorHealth = 140;
const warriorDamage = 20;
const warriorRange = 22;
const warriorAttackInterval = 55;
const warriorSpeed = 0.7;
const archerCost = 60;
const archerHealth = 80;
const archerDamage = 15;
const archerRange = 220;
const archerAttackInterval = 85;
const archerSpeed = 0.55;
const friendlyGap = 14;

// IMAGE LOADING
const assetFolder = "assets/Tiny Swords (Free Pack)/";

function createImage(filePath) {
  const image = new Image();
  image.src = assetFolder + filePath;
  return image;
}
const blueWarriorIdleImage = createImage(
  "Units/Blue Units/Warrior/Warrior_Idle.png"
);
const blueWarriorRunImage = createImage(
  "Units/Blue Units/Warrior/Warrior_Run.png"
);
const blueWarriorAttackImage = createImage(
  "Units/Blue Units/Warrior/Warrior_Attack1.png"
);
const blueArcherIdleImage = createImage(
  "Units/Blue Units/Archer/Archer_Idle.png"
);
const blueArcherRunImage = createImage(
  "Units/Blue Units/Archer/Archer_Run.png"
);
const blueArcherAttackImage = createImage(
  "Units/Blue Units/Archer/Archer_Shoot.png"
);
const redWarriorIdleImage = createImage(
  "Units/Red Units/Warrior/Warrior_Idle.png"
);
const redWarriorRunImage = createImage(
  "Units/Red Units/Warrior/Warrior_Run.png"
);
const redWarriorAttackImage = createImage(
  "Units/Red Units/Warrior/Warrior_Attack1.png"
);
const redArcherIdleImage = createImage(
  "Units/Red Units/Archer/Archer_Idle.png"
);
const redArcherRunImage = createImage(
  "Units/Red Units/Archer/Archer_Run.png"
);
const redArcherAttackImage = createImage(
  "Units/Red Units/Archer/Archer_Shoot.png"
);
const blueArrowImage = createImage(
  "Units/Blue Units/Archer/Arrow.png"
);
const blueTowerImage = createImage(
  "Buildings/Blue Buildings/Tower.png"
);
const redTowerImage = createImage(
  "Buildings/Red Buildings/Tower.png"
);

// DISPLAY AND DEBUG SETTINGS
let showGrid = true;
let showHitboxes = false;

// ACTIVE GAME OBJECTS
const gameGrid = [];
const units = [];
const arrows = [];
const floatingMessages = [];

// GAME STATE
let gameState = "playing";
let gameMode = "ai";
let winner = "";
let battleStarted = false;
let blueGold = startingGold;
let redGold = startingGold;
let selectedBlueType = warriorType;
let selectedRedType = warriorType;
let selectedRedLane = 1;
let aiTimer = 0;
let aiInterval = 180;
let incomeTimer = 0;
const incomeInterval = 240;

// MOUSE INPUT
const mouse = {
  x: undefined,
  y: undefined,
  width: 1,
  height: 1,
  clicked: false,
};
let canvasPosition = canvas.getBoundingClientRect();
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
window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});

// MENU AREAS
const blueWarriorCard = {
  x: 20,
  y: 12,
  width: 112,
  height: 76,
};
const blueArcherCard = {
  x: 142,
  y: 12,
  width: 112,
  height: 76,
};
const modeButton = {
  x: 425,
  y: 18,
  width: 150,
  height: 64,
};
const redWarriorCard = {
  x: 746,
  y: 12,
  width: 112,
  height: 76,
};
const redArcherCard = {
  x: 868,
  y: 12,
  width: 112,
  height: 76,
};
const restartButton = {
  x: 390,
  y: 390,
  width: 220,
  height: 58,
};

// SMALL HELPER FUNCTIONS

function getLaneY(lane) {
  return menuHeight + lane * laneHeight + (laneHeight - unitHeight) / 2;
}

function getLaneFromY(y) {
  if (y < menuHeight) {
    return -1;
  }
  const lane = Math.floor((y - menuHeight) / laneHeight);
  if (lane < 0 || lane >= laneCount) {
    return -1;
  }
  return lane;
}

function getUnitCost(type) {
  if (type === warriorType) {
    return warriorCost;
  }
  if (type === archerType) {
    return archerCost;
  }
  return 9999;
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

function clampHealth(health) {
  if (health < 0) {
    return 0;
  }
  return health;
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
    if (showGrid) {
      ctx.strokeStyle = "rgba(32, 68, 35, 0.22)";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
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
createGrid();

// BACKGROUND

function drawBackground() {
  ctx.fillStyle = "#91c968";
  ctx.fillRect(0, menuHeight, canvasWidth, laneHeight);
  ctx.fillStyle = "#84bd5f";
  ctx.fillRect(0, menuHeight + laneHeight, canvasWidth, laneHeight);
  ctx.fillStyle = "#91c968";
  ctx.fillRect(0, menuHeight + laneHeight * 2, canvasWidth, laneHeight);
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

// TOWERS

class Tower {
  constructor(team, x) {
    this.team = team;
    this.x = x;
    this.y = menuHeight;
    this.width = 100;
    this.height = canvasHeight - menuHeight;
    this.health = towerStartingHealth;
    this.maxHealth = towerStartingHealth;
    this.lastHitTeam = "";
    this.isTower = true;
  }
  draw() {
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
      const towerLineY = menuHeight + lane * laneHeight;
      ctx.strokeRect(this.x + 4, towerLineY + 4, this.width - 8, laneHeight - 8);
    }
    let towerImage = blueTowerImage;
    if (this.team === redTeam) {
      towerImage = redTowerImage;
    }
    const imageWidth = 128;
    const imageHeight = 256;
    const imageX = this.x + this.width / 2 - imageWidth / 2;
    const imageY = menuHeight + (canvasHeight - menuHeight) / 2 - imageHeight / 2;
    if (towerImage.complete) {
      ctx.drawImage(towerImage, imageX, imageY, imageWidth, imageHeight);
    }
    if (showHitboxes) {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}
const leftTower = new Tower(blueTeam, 0);
const rightTower = new Tower(redTeam, canvasWidth - 100);

function getEnemyTower(team) {
  if (team === blueTeam) {
    return rightTower;
  }
  return leftTower;
}

function handleTowers() {
  leftTower.draw();
  rightTower.draw();
}

// UNITS

class Unit {
  constructor(team, type, lane) {
    this.team = team;
    this.type = type;
    this.lane = lane;
    this.x = blueSpawnX;
    this.y = getLaneY(lane);
    this.width = unitWidth;
    this.height = unitHeight;
    this.direction = 1;
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
    this.lastHitTeam = "";
    this.remove = false;
    this.isTower = false;
    this.frameX = 0;
    this.maxFrame = 0;
    this.animationTimer = 0;
    this.animationInterval = 9;
    if (team === redTeam) {
      this.x = redSpawnX;
      this.direction = -1;
    }
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
    this.movement = this.speed * this.direction;
  }
  update() {
    if (gameState !== "playing") {
      return;
    }
    if (this.attackTimer > 0) {
      this.attackTimer--;
    }
    this.target = findTarget(this);
    if (this.target !== null) {
      this.state = "attacking";
      this.movement = 0;
      if (this.attackTimer <= 0) {
        this.attack();
        this.attackTimer = this.attackInterval;
      }
    } else {
      const blockedByFriend = isBlockedByFriendlyUnit(this);
      if (blockedByFriend) {
        this.state = "idle";
        this.movement = 0;
      } else {
        this.state = "walking";
        this.movement = this.speed * this.direction;
      }
    }
    this.x += this.movement;
    this.updateAnimation();
  }
  attack() {
    if (this.target === null) {
      return;
    }
    if (this.type === warriorType) {
      dealDamage(this.target, this.damage, this.team);
    }
    if (this.type === archerType) {
      const arrowX = this.x + this.width / 2;
      const arrowY = this.y + this.height / 2;
      arrows.push(new Arrow(this.team, this.lane, arrowX, arrowY, this.damage));
    }
  }
  updateAnimation() {
    if (this.state !== this.previousState) {
      this.frameX = 0;
      this.animationTimer = 0;
      this.previousState = this.state;
    }
    this.animationTimer++;
    if (this.animationTimer >= this.animationInterval) {
      this.animationTimer = 0;
      this.frameX++;
      if (this.frameX > this.maxFrame) {
        this.frameX = 0;
      }
    }
  }
  draw() {
    // drawUnitShadow(this);
    const imageInformation = getUnitImageInformation(this);
    if (imageInformation.image.complete) {
      drawUnitSprite(this, imageInformation);
    } else {
      drawUnitRectangle(this);
    }
    drawHealthBar(this, this.x + 7, this.y - 8, this.width - 14, 7);
    if (showHitboxes) {
      ctx.strokeStyle = "#ff00ff";
      ctx.lineWidth = 1;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

// PROJECTILES

class Arrow {
  constructor(team, lane, x, y, damage) {
    this.team = team;
    this.lane = lane;
    this.x = x;
    this.y = y - 5;
    this.width = 32;
    this.height = 10;
    this.damage = damage;
    this.speed = 6;
    this.direction = 1;
    this.remove = false;
    if (team === redTeam) {
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
    const arrowImage = blueArrowImage;
    if (arrowImage.complete) {
      ctx.save();
      if (this.team === redTeam) {
        ctx.translate(this.x * 2 + this.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(
        arrowImage,
        this.x - 5,
        this.y - 11,
        this.width + 10,
        this.height + 22
      );
      ctx.restore();
    } else {
      ctx.fillStyle = "#f5e3a1";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    if (showHitboxes) {
      ctx.strokeStyle = "#ff00ff";
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
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.value, this.x, this.y);
    ctx.restore();
  }
}

// TARGETING AND MOVEMENT HELPERS

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

function isTargetInFront(unit, target) {
  if (unit.team === blueTeam && target.x >= unit.x) {
    return true;
  }
  if (unit.team === redTeam && target.x <= unit.x) {
    return true;
  }
  return false;
}

function findTarget(unit) {
  let closestTarget = null;
  let closestDistance = 100000;
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
  const towerDistance = getDistanceInFront(unit, enemyTower);
  if (towerDistance <= unit.range) {
    return enemyTower;
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
    if (!isTargetInFront(unit, possibleBlocker)) {
      continue;
    }
    const distance = getDistanceInFront(unit, possibleBlocker);
    if (distance <= friendlyGap) {
      return true;
    }
  }
  return false;
}

function dealDamage(target, damage, attackingTeam) {
  if (target.health <= 0) {
    return;
  }
  target.health -= damage;
  target.lastHitTeam = attackingTeam;
  if (target.health < 0) {
    target.health = 0;
  }
}

function isSpawnBlocked(team, lane) {
  let spawnX = blueSpawnX;
  if (team === redTeam) {
    spawnX = redSpawnX;
  }
  const spawnBox = {
    x: spawnX - friendlyGap,
    y: getLaneY(lane),
    width: unitWidth + friendlyGap * 2,
    height: unitHeight,
  };
  for (let i = 0; i < units.length; i++) {
    if (units[i].team === team && units[i].lane === lane) {
      if (isColliding(spawnBox, units[i])) {
        return true;
      }
    }
  }
  return false;
}

function handleUnits() {
  for (let i = 0; i < units.length; i++) {
    units[i].update();
    units[i].draw();
  }
  for (let i = units.length - 1; i >= 0; i--) {
    if (units[i].health <= 0 || units[i].remove) {
      rewardUnitDefeat(units[i]);
      units.splice(i, 1);
    }
  }
}

function handleArrows() {
  for (let i = 0; i < arrows.length; i++) {
    const arrow = arrows[i];
    arrow.update();
    for (let j = 0; j < units.length; j++) {
      const possibleTarget = units[j];
      if (arrow.remove) {
        break;
      }
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
        dealDamage(possibleTarget, arrow.damage, arrow.team);
        arrow.remove = true;
      }
    }
    if (!arrow.remove) {
      const enemyTower = getEnemyTower(arrow.team);
      if (isColliding(arrow, enemyTower)) {
        dealDamage(enemyTower, arrow.damage, arrow.team);
        arrow.remove = true;
      }
    }
    if (arrow.x < -50 || arrow.x > canvasWidth + 50) {
      arrow.remove = true;
    }
    arrow.draw();
  }
  for (let i = arrows.length - 1; i >= 0; i--) {
    if (arrows[i].remove) {
      arrows.splice(i, 1);
    }
  }
}

function handleFloatingMessages() {
  for (let i = 0; i < floatingMessages.length; i++) {
    floatingMessages[i].update();
    floatingMessages[i].draw();
  }
  for (let i = floatingMessages.length - 1; i >= 0; i--) {
    if (floatingMessages[i].life > 85) {
      floatingMessages.splice(i, 1);
    }
  }
}

// UNIT CREATION AND RESOURCES

function getTeamGold(team) {
  if (team === blueTeam) {
    return blueGold;
  }
  return redGold;
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

function getTeamMessageX(team) {
  if (team === blueTeam) {
    return 180;
  }
  return canvasWidth - 180;
}

function getTeamColor(team) {
  if (team === blueTeam) {
    return "#7ec8ff";
  }
  return "#ff938d";
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
  const currentGold = getTeamGold(team);
  if (currentGold < cost) {
    floatingMessages.push(
      new FloatingMessage(
        "Not enough gold",
        getTeamMessageX(team),
        menuHeight + 30,
        "#ffe08a"
      )
    );
    return false;
  }
  if (isSpawnBlocked(team, lane)) {
    floatingMessages.push(
      new FloatingMessage(
        "Spawn is blocked",
        getTeamMessageX(team),
        getLaneY(lane),
        "#ffffff"
      )
    );
    return false;
  }
  spendTeamGold(team, cost);
  units.push(new Unit(team, type, lane));

  if (team === blueTeam || gameMode === "pvp") {
    battleStarted = true;
  }

  return true;
}

function rewardUnitDefeat(unit) {
  if (unit.lastHitTeam === "") {
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

// ART AND ANIMATION HELPERS

function getUnitImageInformation(unit) {
  let image = blueWarriorIdleImage;
  let maxFrame = 7;
  if (unit.team === blueTeam && unit.type === warriorType) {
    image = blueWarriorIdleImage;
    maxFrame = 7;
    if (unit.state === "walking") {
      image = blueWarriorRunImage;
      maxFrame = 5;
    }
    if (unit.state === "attacking") {
      image = blueWarriorAttackImage;
      maxFrame = 3;
    }
  }
  if (unit.team === blueTeam && unit.type === archerType) {
    image = blueArcherIdleImage;
    maxFrame = 5;
    if (unit.state === "walking") {
      image = blueArcherRunImage;
      maxFrame = 3;
    }
    if (unit.state === "attacking") {
      image = blueArcherAttackImage;
      maxFrame = 7;
    }
  }
  if (unit.team === redTeam && unit.type === warriorType) {
    image = redWarriorIdleImage;
    maxFrame = 7;
    if (unit.state === "walking") {
      image = redWarriorRunImage;
      maxFrame = 5;
    }
    if (unit.state === "attacking") {
      image = redWarriorAttackImage;
      maxFrame = 3;
    }
  }
  if (unit.team === redTeam && unit.type === archerType) {
    image = redArcherIdleImage;
    maxFrame = 5;
    if (unit.state === "walking") {
      image = redArcherRunImage;
      maxFrame = 3;
    }
    if (unit.state === "attacking") {
      image = redArcherAttackImage;
      maxFrame = 7;
    }
  }
  unit.maxFrame = maxFrame;
  if (unit.frameX > unit.maxFrame) {
    unit.frameX = 0;
  }
  return {
    image: image,
    maxFrame: maxFrame,
  };
}

function drawUnitShadow(unit) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
  ctx.beginPath();
  ctx.ellipse(
    unit.x + unit.width / 2,
    unit.y + unit.height - 5,
    unit.width / 2,
    11,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

function drawUnitSprite(unit, imageInformation) {
  const sourceSize = 192;
  const drawSize = 118;
  const drawX = unit.x + unit.width / 2 - drawSize / 2;
  const drawY = unit.y + unit.height - drawSize + 20;
  ctx.save();
  if (unit.team === redTeam) {
    ctx.translate(drawX * 2 + drawSize, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(
    imageInformation.image,
    unit.frameX * sourceSize,
    0,
    sourceSize,
    sourceSize,
    drawX,
    drawY,
    drawSize,
    drawSize
  );
  ctx.restore();
}

function drawUnitRectangle(unit) {
  ctx.fillStyle = getTeamColor(unit.team);
  ctx.fillRect(unit.x, unit.y, unit.width, unit.height);
  ctx.fillStyle = "#182130";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(unit.type, unit.x + unit.width / 2, unit.y + 39);
}

function drawHealthBar(object, x, y, width, height) {
  const safeHealth = clampHealth(object.health);
  let percentage = safeHealth / object.maxHealth;
  if (percentage > 1) {
    percentage = 1;
  }
  ctx.fillStyle = "rgba(40, 25, 28, 0.75)";
  ctx.fillRect(x, y, width, height);
  if (object.team === blueTeam) {
    ctx.fillStyle = "#5ed4ff";
  }
  if (object.team === redTeam) {
    ctx.fillStyle = "#ff6e68";
  }
  ctx.fillRect(x, y, width * percentage, height);
}

// SIMPLE OPPONENT AI

function chooseAiLane() {
  let selectedLane = Math.floor(Math.random() * laneCount);
  let mostAdvancedBlueX = -1;
  if (Math.random() < 0.55) {
    for (let i = 0; i < units.length; i++) {
      if (units[i].team === blueTeam && units[i].x > mostAdvancedBlueX) {
        mostAdvancedBlueX = units[i].x;
        selectedLane = units[i].lane;
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
  if (!battleStarted) {
    return;
  }
  aiTimer++;
  if (aiTimer < aiInterval) {
    return;
  }
  const aiType = chooseAiUnit();
  if (aiType === "") {
    aiTimer = aiInterval - 30;
    return;
  }
  const aiLane = chooseAiLane();
  const unitWasCreated = spawnUnit(redTeam, aiType, aiLane);
  if (unitWasCreated) {
    aiTimer = 0;
    aiInterval = 145 + Math.floor(Math.random() * 90);
  } else {
    aiTimer = aiInterval - 35;
  }
}

function handlePassiveIncome() {
  if (gameState !== "playing" || !battleStarted) {
    return;
  }
  incomeTimer++;
  if (incomeTimer >= incomeInterval) {
    blueGold += 5;
    redGold += 5;
    incomeTimer = 0;
  }
}

// MENU AND STATUS DRAWING

function drawCard(card, team, type, selected, keyboardLabel) {
  ctx.fillStyle = "rgba(12, 23, 38, 0.82)";
  ctx.fillRect(card.x, card.y, card.width, card.height);
  ctx.strokeStyle = "#71839b";
  ctx.lineWidth = 2;
  if (selected) {
    ctx.strokeStyle = "#ffd95c";
    ctx.lineWidth = 4;
  }
  ctx.strokeRect(card.x, card.y, card.width, card.height);
  let cardImage = blueWarriorIdleImage;
  if (team === blueTeam && type === archerType) {
    cardImage = blueArcherIdleImage;
  }
  if (team === redTeam && type === warriorType) {
    cardImage = redWarriorIdleImage;
  }
  if (team === redTeam && type === archerType) {
    cardImage = redArcherIdleImage;
  }
  if (cardImage.complete) {
    ctx.drawImage(
      cardImage,
      0,
      0,
      192,
      192,
      card.x + 2,
      card.y + 2,
      66,
      66
    );
  }
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.font = "bold 13px Arial";
  if (type === warriorType) {
    ctx.fillText("Warrior", card.x + 55, card.y + 24);
  }
  if (type === archerType) {
    ctx.fillText("Archer", card.x + 55, card.y + 24);
  }
  ctx.fillStyle = "#ffd95c";
  ctx.font = "bold 14px Arial";
  ctx.fillText(getUnitCost(type) + " gold", card.x + 55, card.y + 45);
  if (keyboardLabel !== "") {
    ctx.fillStyle = "#b8c8dc";
    ctx.font = "12px Arial";
    ctx.fillText(keyboardLabel, card.x + 55, card.y + 64);
  }
}

function drawModeButton() {
  ctx.fillStyle = "#16263b";
  ctx.fillRect(modeButton.x, modeButton.y, modeButton.width, modeButton.height);
  ctx.strokeStyle = "#9fb3ca";
  ctx.lineWidth = 2;
  ctx.strokeRect(modeButton.x, modeButton.y, modeButton.width, modeButton.height);
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 17px Arial";
  if (gameMode === "ai") {
    ctx.fillText("VS AI", modeButton.x + modeButton.width / 2, modeButton.y + 27);
  }
  if (gameMode === "pvp") {
    ctx.fillText(
      "2 PLAYERS",
      modeButton.x + modeButton.width / 2,
      modeButton.y + 27
    );
  }
  ctx.fillStyle = "#aebfd2";
  ctx.font = "12px Arial";
  ctx.fillText(
    "click before battle",
    modeButton.x + modeButton.width / 2,
    modeButton.y + 48
  );
}

function drawMenu() {
  drawCard(
    blueWarriorCard,
    blueTeam,
    warriorType,
    selectedBlueType === warriorType,
    "click"
  );
  drawCard(
    blueArcherCard,
    blueTeam,
    archerType,
    selectedBlueType === archerType,
    "click"
  );
  let redCardsAreActive = false;
  if (gameMode === "pvp") {
    redCardsAreActive = true;
  }
  drawCard(
    redWarriorCard,
    redTeam,
    warriorType,
    redCardsAreActive && selectedRedType === warriorType,
    "key 1"
  );
  drawCard(
    redArcherCard,
    redTeam,
    archerType,
    redCardsAreActive && selectedRedType === archerType,
    "key 2"
  );
  if (!redCardsAreActive) {
    ctx.fillStyle = "rgba(20, 30, 45, 0.48)";
    ctx.fillRect(redWarriorCard.x, redWarriorCard.y, redWarriorCard.width, redWarriorCard.height);
    ctx.fillRect(redArcherCard.x, redArcherCard.y, redArcherCard.width, redArcherCard.height);
  }
  drawModeButton();
  ctx.textAlign = "center";
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

function drawRedLaneSelector() {
  if (gameMode !== "pvp") {
    return;
  }
  if (gameState !== "playing") {
    return;
  }
  const selectorY = menuHeight + selectedRedLane * laneHeight;
  ctx.fillStyle = "rgba(255, 99, 93, 0.11)";
  ctx.fillRect(canvasWidth / 2, selectorY, canvasWidth / 2, laneHeight);
  ctx.strokeStyle = "rgba(255, 226, 115, 0.95)";
  ctx.lineWidth = 4;
  ctx.strokeRect(canvasWidth - 98, selectorY + 4, 92, laneHeight - 8);
  ctx.fillStyle = "#fff0b0";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "right";
  ctx.fillText("RED LANE " + (selectedRedLane + 1), canvasWidth - 112, selectorY + 28);
}

function drawGameOver() {
  if (gameState !== "gameOver") {
    return;
  }
  ctx.fillStyle = "rgba(8, 15, 27, 0.78)";
  ctx.fillRect(0, menuHeight, canvasWidth, canvasHeight - menuHeight);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 58px Arial";
  if (winner === blueTeam) {
    ctx.fillText("BLUE WINS!", canvasWidth / 2, 300);
  }
  if (winner === redTeam) {
    ctx.fillText("RED WINS!", canvasWidth / 2, 300);
  }
  ctx.fillStyle = "#ffd95c";
  ctx.font = "20px Arial";
  ctx.fillText("The enemy tower was destroyed", canvasWidth / 2, 340);
  ctx.fillStyle = "#263951";
  ctx.fillRect(
    restartButton.x,
    restartButton.y,
    restartButton.width,
    restartButton.height
  );
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.strokeRect(
    restartButton.x,
    restartButton.y,
    restartButton.width,
    restartButton.height
  );
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px Arial";
  ctx.fillText("RESTART", canvasWidth / 2, restartButton.y + 37);
}

// PLAYER INPUT

function handleCanvasClick() {
  if (mouse.x === undefined || mouse.y === undefined) {
    return;
  }
  if (gameState === "gameOver") {
    if (isPointInsideBox(mouse, restartButton)) {
      restartGame();
    }
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
  if (isPointInsideBox(mouse, modeButton)) {
    if (!battleStarted) {
      if (gameMode === "ai") {
        gameMode = "pvp";
      } else {
        gameMode = "ai";
      }
    } else {
      floatingMessages.push(
        new FloatingMessage(
          "Restart to change mode",
          canvasWidth / 2,
          menuHeight + 32,
          "#ffffff"
        )
      );
    }
    return;
  }
  if (mouse.y < menuHeight) {
    return;
  }
  if (mouse.x <= leftTower.width || mouse.x >= canvasWidth / 2) {
    return;
  }
  const lane = getLaneFromY(mouse.y);
  if (lane !== -1) {
    spawnUnit(blueTeam, selectedBlueType, lane);
  }
}
canvas.addEventListener("click", handleCanvasClick);
window.addEventListener("keydown", function (event) {
  if (gameMode !== "pvp") {
    return;
  }
  if (gameState !== "playing") {
    return;
  }
  if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "ArrowLeft") {
    event.preventDefault();
  }
  if (event.repeat) {
    return;
  }
  if (event.key === "1") {
    selectedRedType = warriorType;
  }
  if (event.key === "2") {
    selectedRedType = archerType;
  }
  if (event.key === "ArrowUp") {
    selectedRedLane--;
    if (selectedRedLane < 0) {
      selectedRedLane = 0;
    }
  }
  if (event.key === "ArrowDown") {
    selectedRedLane++;
    if (selectedRedLane >= laneCount) {
      selectedRedLane = laneCount - 1;
    }
  }
  if (event.key === "ArrowLeft") {
    spawnUnit(redTeam, selectedRedType, selectedRedLane);
  }
});

// GAME STATUS AND RESTART

function checkGameOver() {
  if (gameState !== "playing") {
    return;
  }
  if (leftTower.health <= 0) {
    leftTower.health = 0;
    winner = redTeam;
    gameState = "gameOver";
  }
  if (rightTower.health <= 0) {
    rightTower.health = 0;
    winner = blueTeam;
    gameState = "gameOver";
  }
}

function restartGame() {
  units.length = 0;
  arrows.length = 0;
  floatingMessages.length = 0;
  leftTower.health = leftTower.maxHealth;
  rightTower.health = rightTower.maxHealth;
  leftTower.lastHitTeam = "";
  rightTower.lastHitTeam = "";
  blueGold = startingGold;
  redGold = startingGold;
  selectedBlueType = warriorType;
  selectedRedType = warriorType;
  selectedRedLane = 1;
  aiTimer = 0;
  aiInterval = 180;
  incomeTimer = 0;
  battleStarted = false;
  winner = "";
  gameState = "playing";
}

// MAIN GAME LOOP

function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  handleGrid();
  drawRedLaneSelector();
  handleTowers();
  handlePassiveIncome();
  handleAi();
  handleUnits();
  handleArrows();
  handleFloatingMessages();
  checkGameOver();
  drawMenu();
  drawGameOver();
  requestAnimationFrame(animate);
}
animate();
