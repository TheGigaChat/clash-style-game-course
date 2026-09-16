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
const blueSpawnX = 112;
const redSpawnX = 818;
const unitWidth = 70;
const unitHeight = 70;
const warriorHealth = 140;
const warriorSpeed = 0.7;
const archerHealth = 80;
const archerSpeed = 0.55;

const cardY = 12;
const cardWidth = 112;
const cardHeight = 76;

// ACTIVE GAME OBJECTS
const gameGrid = [];
const units = [];

// GAME STATE
let selectedBlueType = warriorType;
let debugRedLane = 0;

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

// UNITS
class Unit {
  constructor(team, type, lane) {
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
    this.state = "walking";

    if (type === warriorType) {
      this.speed = warriorSpeed;
      this.health = warriorHealth;
      this.maxHealth = warriorHealth;
    }

    if (type === archerType) {
      this.speed = archerSpeed;
      this.health = archerHealth;
      this.maxHealth = archerHealth;
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
    this.x += this.movement;
  }

  draw() {
    if (this.team === blueTeam) {
      ctx.fillStyle = "#5f91d8";
    }

    if (this.team === redTeam) {
      ctx.fillStyle = "#d8655f";
    }

    ctx.fillRect(this.x, this.y, this.width, this.height);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(this.type, this.x + this.width / 2, this.y + this.height / 2 + 5);

    const healthBarWidth = this.width;
    const healthBarHeight = 7;
    const healthPercentage = this.health / this.maxHealth;

    ctx.fillStyle = "rgba(31, 42, 58, 0.82)";
    ctx.fillRect(this.x, this.y - 12, healthBarWidth, healthBarHeight);

    ctx.fillStyle = "#7ee081";
    ctx.fillRect(
      this.x,
      this.y - 12,
      healthBarWidth * healthPercentage,
      healthBarHeight
    );
  }
}

function spawnUnit(team, type, lane) {
  if (team !== blueTeam && team !== redTeam) {
    return;
  }

  if (type !== warriorType && type !== archerType) {
    return;
  }

  if (lane < 0 || lane >= laneCount) {
    return;
  }

  const unit = new Unit(team, type, lane);
  units.push(unit);
}

function handleUnits() {
  for (let i = 0; i < units.length; i++) {
    units[i].update();
    units[i].draw();
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
function drawCard(card, type, selected) {
  ctx.fillStyle = "rgba(12, 23, 38, 0.82)";
  ctx.fillRect(card.x, card.y, card.width, card.height);

  ctx.strokeStyle = "#71839b";
  ctx.lineWidth = 2;

  if (selected) {
    ctx.strokeStyle = "#ffd95c";
    ctx.lineWidth = 4;
  }
  
  ctx.strokeRect(card.x, card.y, card.width, card.height);

  if (type === warriorType) {
    ctx.fillStyle = "#5f91d8";
    ctx.fillRect(card.x + 10, card.y + 15, 38, 46);
  }

  if (type === archerType) {
    ctx.fillStyle = "#75b86d";
    ctx.beginPath();
    ctx.arc(card.x + 29, card.y + 38, 21, 0, Math.PI * 2);
    ctx.fill();
  }

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
    warriorType,
    selectedBlueType === warriorType
  );

  drawCard(
    blueArcherCard,
    archerType,
    selectedBlueType === archerType
  );
}

// PLAYER INPUT
function handleCanvasClick() {
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

window.addEventListener("keydown", function (event) {
  if (event.key === "r" || event.key === "R") {
    spawnUnit(redTeam, warriorType, debugRedLane);

    debugRedLane++;
    if (debugRedLane >= laneCount) {
      debugRedLane = 0;
    }
  }
});

// MAIN GAME LOOP
function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  handleGrid();
  drawMenu();
  drawLaneLabels();
  handleUnits();
  requestAnimationFrame(animate);
}
createGrid();
animate();
