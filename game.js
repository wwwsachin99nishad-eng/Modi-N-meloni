const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Load Images
const bg = new Image();
bg.src = "images/bg.jpeg";

const player = new Image();
player.src = "images/player.jpeg";

const pipeImg = new Image();
pipeImg.src = "images/obstacle.jpeg";

const popup = new Image();
popup.src = "images/popup.jpeg";

// Sounds
const startSound = new Audio("sounds/start.mp3");
const hitSound = new Audio("sounds/hit.mp3");
let startSoundPlayed = false;
let hitPlayed = false;

// Player Physics
let playerX = 80;
let playerY = 200;
let velocity = 0;
let gravity = 0.4;
let jumpPower = -10;
let forwardSpeed =0.3;

// Pipes
let pipes = [];
let pipeGap = 350;
let pipeWidth =120;
let pipeSpeed = 3;

// State
let gameOver = false;
let started = false;

// Spawn first pipe
function spawnPipe() {
    let topHeight = Math.random() * (canvas.height - pipeGap - 200) + 50;
    pipes.push({
        x: canvas.width,
        topHeight: topHeight
    });
}
spawnPipe();

// -------- INPUT HANDLERS --------

function handleStartIfNeeded() {
    if (!started) {
        started = true;
        if (!startSoundPlayed) {
            startSound.currentTime = 0;
            startSound.play();
            startSoundPlayed = true;
        }
    }
}

window.addEventListener("keydown", (e) => {
    if (gameOver) return resetGame();

    handleStartIfNeeded();

    if (e.code === "Space" || e.code === "ArrowUp") {
        velocity = jumpPower;
    }
});

window.addEventListener("mousedown", () => {
    if (gameOver) return resetGame();
    handleStartIfNeeded();
    velocity = jumpPower;
});

window.addEventListener("touchstart", () => {
    if (gameOver) return resetGame();
    handleStartIfNeeded();
    velocity = jumpPower;
});

// -------- GAME LOGIC --------

function update() {
    if (!gameOver) gameLoop();
    drawGame();
    requestAnimationFrame(update);
}

function gameLoop() {
    velocity += gravity;
    playerY += velocity;
    playerX += forwardSpeed;

    if (!started) return;

    for (let i = 0; i < pipes.length; i++) {
        let p = pipes[i];
        p.x -= pipeSpeed;

        // Respawn pipe
        if (p.x + pipeWidth < 0) {
            pipes.splice(i, 1);
            spawnPipe();
        }

        // Collision
        if (
            playerX + 120 > p.x &&
            playerX < p.x + pipeWidth &&
            (playerY < p.topHeight ||
             playerY + 120 > p.topHeight + pipeGap)
        ) {
            triggerGameOver();
        }
    }

    if (playerY + 120 >= canvas.height) triggerGameOver();
    if (playerY <= 0) triggerGameOver();
}

function triggerGameOver() {
    if (!hitPlayed) {
        hitSound.currentTime = 0;
        hitSound.play();
        hitPlayed = true;
    }

    startSound.pause();
    startSound.currentTime = 0;

    gameOver = true;
}

// -------- DRAW EVERYTHING --------

function drawGame() {
    // Background
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // PREMIUM WATERMARK (bottom-right)
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(canvas.width - 260, canvas.height - 60, 250, 45);

    ctx.font = "28px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText("coded by Sachin", canvas.width - 250, canvas.height - 28);

    // ⭐ CIRCULAR PLAYER ⭐
    ctx.save();
    ctx.beginPath();
    ctx.arc(playerX + 60, playerY + 60, 60, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(player, playerX, playerY, 120, 120);
    ctx.restore();

    // Pipes
    for (let p of pipes) {
        ctx.drawImage(pipeImg, p.x, 0, pipeWidth, p.topHeight);
        ctx.drawImage(
            pipeImg,
            p.x,
            p.topHeight + pipeGap,
            pipeWidth,
            canvas.height - (p.topHeight + pipeGap)
        );
    }

    // GAME OVER POPUP
    if (gameOver) {
        ctx.fillStyle = "#00000080";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
            popup,
            canvas.width / 2 - 150,
            canvas.height / 2 - 150,
            300,
            300
        );

        ctx.font = "40px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Tap to Restart", canvas.width / 2, canvas.height / 2 + 220);
    }
}

// -------- RESET --------

function resetGame() {
    playerX = 80;
    playerY = 200;
    velocity = 0;

    pipes = [];
    spawnPipe();

    gameOver = false;
    started = false;

    hitPlayed = false;
    startSoundPlayed = false;
}

update();
