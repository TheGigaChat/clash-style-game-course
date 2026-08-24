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
// const blueTeam = "blue";
// const warriorType = "warrior";
// const archerType = "archer";
// const warriorCost = 40;
// const archerCost = 60;

// ACTIVE GAME OBJECTS
const gameGrid = [];

// GAME STATE
// let selectedBlueType = warriorType;

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

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});

// MENU AREAS
// REBEILD no hardcode so much, because it will be difficult to add new cards
// const blueWarriorCard = {
//   x: 20,
//   y: 12,
//   width: 112,
//   height: 76,
// };

// const blueArcherCard = {
//   x: 142,
//   y: 12,
//   width: 112,
//   height: 76,
// };

// SMALL HELPER FUNCTIONS
// function getLaneFromY(y) {
//   if (y < menuHeight) {
//     return -1;
//   }

//   const gridPositionY = y - ((y - menuHeight) % laneHeight);
//   const lane = (gridPositionY - menuHeight) / laneHeight;

//   if (lane < 0 || lane >= laneCount) {
//     return -1;
//   }

//   return lane;
// }

// function getUnitCost(type) {
//   if (type === warriorType) {
//     return warriorCost;
//   }

//   if (type === archerType) {
//     return archerCost;
//   }

//   return 0;
// }

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
// function drawCard(card, type, selected) {
//   ctx.fillStyle = "rgba(12, 23, 38, 0.82)";
//   ctx.fillRect(card.x, card.y, card.width, card.height);

//   ctx.strokeStyle = "#71839b";
//   ctx.lineWidth = 2;

//   if (selected) {
//     ctx.strokeStyle = "#ffd95c";
//     ctx.lineWidth = 4;
//   }

//   ctx.strokeRect(card.x, card.y, card.width, card.height);

//   if (type === warriorType) {
//     ctx.fillStyle = "#5f91d8";
//     ctx.fillRect(card.x + 10, card.y + 15, 38, 46);
//   }

//   if (type === archerType) {
//     ctx.fillStyle = "#75b86d";
//     ctx.beginPath();
//     ctx.arc(card.x + 29, card.y + 38, 21, 0, Math.PI * 2);
//     ctx.fill();
//   }

//   ctx.fillStyle = "#ffffff";
//   ctx.textAlign = "left";
//   ctx.font = "bold 13px Arial";

//   if (type === warriorType) {
//     ctx.fillText("Warrior", card.x + 55, card.y + 28);
//   }

//   if (type === archerType) {
//     ctx.fillText("Archer", card.x + 55, card.y + 28);
//   }

//   ctx.fillStyle = "#ffd95c";
//   ctx.font = "bold 14px Arial";
//   ctx.fillText(getUnitCost(type) + " gold", card.x + 55, card.y + 50);
// }

// function drawMenu() {
//   drawCard(
//     blueWarriorCard,
//     warriorType,
//     selectedBlueType === warriorType
//   );

//   drawCard(
//     blueArcherCard,
//     archerType,
//     selectedBlueType === archerType
//   );
// }

// PLAYER INPUT
// function handleCanvasClick() {
//   if (mouse.x === undefined || mouse.y === undefined) {
//     return;
//   }

//   if (isPointInsideBox(mouse, blueWarriorCard)) {
//     selectedBlueType = warriorType;
//     return;
//   }

//   if (isPointInsideBox(mouse, blueArcherCard)) {
//     selectedBlueType = archerType;
//     return;
//   }

//   if (mouse.y < menuHeight) {
//     return;
//   }

//   if (mouse.x < 0 || mouse.x >= canvasWidth / 2) {
//     return;
//   }

//   const gridPositionX = mouse.x - (mouse.x % columnWidth);
//   const lane = getLaneFromY(mouse.y);

//   if (lane !== -1) {
//     console.log({
//       team: blueTeam,
//       type: selectedBlueType,
//       lane: lane,
//       column: gridPositionX / columnWidth,
//     });
//   }
// }

// canvas.addEventListener("click", handleCanvasClick);

// MAIN GAME LOOP
function animate() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBackground();
  handleGrid();
  // drawMenu();
  drawLaneLabels()
  requestAnimationFrame(animate);
}

animate();
