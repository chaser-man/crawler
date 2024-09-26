const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 200,
    y: 200,
    size: 20,
    speed: 5 // Reduced speed for smoother movement
};

const keys = {};

function drawPlayer() {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
}

function updatePlayerPosition() {
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
    if (keys['ArrowRight'] && player.x < canvas.width - player.size) player.x += player.speed;
}

window.addEventListener('keydown', function(e) {
    keys[e.code] = true; // Use e.code for consistent key values
});

window.addEventListener('keyup', function(e) {
    keys[e.code] = false;
});

function gameLoop() {
    clearCanvas();
    updatePlayerPosition();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Debug: Log player position
setInterval(() => {
    console.log(`Player position: (${player.x}, ${player.y})`);
}, 1000);
