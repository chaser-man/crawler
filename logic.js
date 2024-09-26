const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const player = {
    x: 200,
    y: 200,
    size: 20,
    speed: 5
};

function drawPlayer() {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function updatePlayerPosition(direction) {
    switch(direction) {
        case 'up':
            if (player.y > 0) player.y -= player.speed;
            break;
        case 'down':
            if (player.y < canvas.height - player.size) player.y += player.speed;
            break;
        case 'left':
            if (player.x > 0) player.x -= player.speed;
            break;
        case 'right':
            if (player.x < canvas.width - player.size) player.x += player.speed;
            break;
    }
}

function gameLoop() {
    clearCanvas();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Add event listeners for touch controls
document.getElementById('up').addEventListener('touchstart', () => {
    updatePlayerPosition('up');
});

document.getElementById('down').addEventListener('touchstart', () => {
    updatePlayerPosition('down');
});

document.getElementById('left').addEventListener('touchstart', () => {
    updatePlayerPosition('left');
});

document.getElementById('right').addEventListener('touchstart', () => {
    updatePlayerPosition('right');
});

// Optionally, add mouse event listeners for testing on desktop
document.getElementById('up').addEventListener('mousedown', () => {
    updatePlayerPosition('up');
});

document.getElementById('down').addEventListener('mousedown', () => {
    updatePlayerPosition('down');
});

document.getElementById('left').addEventListener('mousedown', () => {
    updatePlayerPosition('left');
});

document.getElementById('right').addEventListener('mousedown', () => {
    updatePlayerPosition('right');
});

// Prevent default scrolling behavior on touch devices
document.querySelectorAll('.control-button').forEach(button => {
    button.addEventListener('touchstart', (e) => {
        e.preventDefault();
    });
});
