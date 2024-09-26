const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 200,
    y: 200,
    size: 20,
    speed: 3
};

function drawPlayer() {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function clearCanvas() {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updatePlayerPosition(key) {
    if (key === 'ArrowUp' && player.y > 0) player.y -= player.speed;
    if (key === 'ArrowDown' && player.y < canvas.height - player.size) player.y += player.speed;
    if (key === 'ArrowLeft' && player.x > 0) player.x -= player.speed;
    if (key === 'ArrowRight' && player.x < canvas.width - player.size) player.x += player.speed;
}

window.addEventListener('keypress', (e) => {
    updatePlayerPosition(e.key);
});

function gameLoop() {
    clearCanvas();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();
