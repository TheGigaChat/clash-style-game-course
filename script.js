// CANVAS SETUP
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const canvasWidth = 1000;
const canvasHeight = 640;
const menuHeight = 100;
const laneHeight = 180;
const laneCount = 3;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

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
drawBackground()

function drawLaneLabels() {
  ctx.fillStyle = "rgba(22, 50, 28, 0.55)";
  ctx.font = "bold 20px Arial";
  ctx.textAlign = "center";

  for (let lane = 0; lane < laneCount; lane++) {
    const labelY = menuHeight + lane * laneHeight + laneHeight / 2;
    ctx.fillText("Lane " + (lane + 1), canvasWidth / 2, labelY);
  }
}
drawLaneLabels()