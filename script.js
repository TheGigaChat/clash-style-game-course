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

// ACTIVE GAME OBJECTS
const gameGrid = [];

// MOUSE INPUT
const mouse = {
  x: undefined,
  y: undefined,
  width: 1,
  height: 1,
  clicked: false,
};

// SMALL HELPER FUNCTIONS
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


// MAIN GAME LOOP
function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground()
  handleGrid()
  drawLaneLabels()
  requestAnimationFrame(animate);
}
createGrid()
animate()