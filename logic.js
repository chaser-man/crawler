// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit the window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Player object
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 2, // Adjust speed as needed
    dx: 0,
    dy: 0
};

// Function to draw the player
function drawPlayer() {
    ctx.fillStyle = '#ff6600';
    ctx.fillRect(player.x, player.y, player.size, player.size);
}

// Function to clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Game loop
function gameLoop() {
    clearCanvas();
    updatePlayerPosition();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

gameLoop();

// Update player position
function updatePlayerPosition() {
    player.x += player.dx;
    player.y += player.dy;

    // Keep the player within the canvas boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
}

// Virtual joystick setup using nippleJS
const joystickOptions = {
    zone: document.getElementById('joystick-container'),
    mode: 'static',
    position: { left: '75px', bottom: '75px' }, // Position the joystick
    color: 'white',
    size: 100
};

const joystick = nipplejs.create(joystickOptions);

joystick.on('move', function(evt, data) {
    const angle = data.angle.degree;
    const distance = data.distance;

    // Calculate movement direction based on the joystick angle
    const radian = (angle * Math.PI) / 180;
    player.dx = Math.cos(radian) * player.speed * (distance / joystickOptions.size);
    player.dy = Math.sin(radian) * player.speed * (distance / joystickOptions.size);

    // Invert dy because canvas y-axis is inverted
    player.dy = -player.dy;
});

joystick.on('end', function() {
    // Stop the player when the joystick is released
    player.dx = 0;
    player.dy = 0;
});
