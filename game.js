// game.js

// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Function to check if the device is mobile
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Resize canvas to fit the window or set fixed size for desktop
function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}


resizeCanvas();
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Enhanced player object with separate input tracking
const player = {
    x: 0,
    y: 0,
    size: 30,
    speed: 4, // Base speed
    keyboard: {
        dx: 0,
        dy: 0
    },
    joystick: {
        dx: 0,
        dy: 0
    }
};

const gate = {
    x: 0,
    y: 0,
    radius: 25
};

const obstacles = [];
const enemies = [];

let level = 1;
let showingLevelCleared = false;
let levelClearedTimeout;
let randomNumberColor; // Global variable
let bat = null;


// Define the keys for movement
const KEY_CODES = {
    LEFT: ['ArrowLeft', 'a', 'A'],
    RIGHT: ['ArrowRight', 'd', 'D'],
    UP: ['ArrowUp', 'w', 'W'],
    DOWN: ['ArrowDown', 's', 'S']
};

// Object to keep track of pressed keys
const keysPressed = {
    left: false,
    right: false,
    up: false,
    down: false
};

// Handle keydown events
function handleKeyDown(event) {
    const key = event.key;
    if (KEY_CODES.LEFT.includes(key)) {
        keysPressed.left = true;
        event.preventDefault(); // Prevent default action like scrolling
    }
    if (KEY_CODES.RIGHT.includes(key)) {
        keysPressed.right = true;
        event.preventDefault();
    }
    if (KEY_CODES.UP.includes(key)) {
        keysPressed.up = true;
        event.preventDefault();
    }
    if (KEY_CODES.DOWN.includes(key)) {
        keysPressed.down = true;
        event.preventDefault();
    }
}

// Handle keyup events
function handleKeyUp(event) {
    const key = event.key;
    if (KEY_CODES.LEFT.includes(key)) {
        keysPressed.left = false;
        event.preventDefault();
    }
    if (KEY_CODES.RIGHT.includes(key)) {
        keysPressed.right = false;
        event.preventDefault();
    }
    if (KEY_CODES.UP.includes(key)) {
        keysPressed.up = false;
        event.preventDefault();
    }
    if (KEY_CODES.DOWN.includes(key)) {
        keysPressed.down = false;
        event.preventDefault();
    }
}

// Attach event listeners only if not on mobile
if (!isMobileDevice()) {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
}

// Helper function to get a random number between 1 and 3
function getRandomColorNumber() {
    return Math.floor(Math.random() * 3) + 1; // Returns 1, 2, or 3
}

// Array to hold flickering lights
let flickeringLights = [];

// Function to generate flickering lights
function generateFlickeringLights() {
    flickeringLights = []; // Reset the array for the new level
    const numberOfLights = 3; // Start with 3 lights

    for (let i = 0; i < numberOfLights; i++) {
        const light = {
            x: Math.random() * (canvas.width - 100) + 50, // Avoid edges
            y: Math.random() * (canvas.height - 100) + 50,
            radius: Math.random() * 50 + 50, // Radius between 50 and 100
            baseOpacity: 0.2, // Fixed base opacity
            flickerRange: 0.1 // Fixed flicker range
        };
        flickeringLights.push(light);
    }
}

startLevel();
gameLoop();

function startLevel() {
    player.x = Math.random() * (canvas.width - player.size);
    player.y = canvas.height - player.size - 10;
    player.keyboard.dx = 0;
    player.keyboard.dy = 0;
    player.joystick.dx = 0;
    player.joystick.dy = 0;

    gate.x = Math.random() * (canvas.width - gate.radius * 2) + gate.radius;
    gate.y = gate.radius + 10;

    initObstacles();
    initEnemies(level); // Initialize 'level' number of normal enemies
    initBat();          // Initialize the following bat

    generateFlickeringLights();

    randomNumberColor = getRandomColorNumber();
    console.log("New Round Color Number:", randomNumberColor);
}
function initBat() {
    const batSize = 30; // Match enemy size
    bat = {
        x: 0,
        y: 0,
        size: batSize,
        speed: 0.5
    };

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
        bat.x = Math.random() * (canvas.width - bat.size);
        bat.y = Math.random() * (canvas.height - bat.size);

        if (
            !isCollidingWithObstacles(bat.x, bat.y, bat.size) &&
            !isCollidingWithPlayer(bat) &&
            !isCollidingWithGate(bat) &&
            !enemies.some(existingEnemy => isColliding(bat, existingEnemy))
        ) {
            placed = true;
        }
        attempts++;
    }

    if (!placed) {
        console.warn('Could not place bat after 100 attempts.');
    }
}

function drawEnemy(enemy) {
    const centerX = enemy.x + enemy.size / 2;
    const centerY = enemy.y + enemy.size / 2;
    const bodyWidth = enemy.size * 0.6;
    const bodyHeight = enemy.size * 0.6;

    ctx.save();

    // Move to the center of the bat
    ctx.translate(centerX, centerY);

    // === Draw detailed bat wings (lifted higher) ===
    ctx.fillStyle = '#4B2E83';

    // Left wing
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, -bodyHeight * 0.3); // Lifted higher
    ctx.lineTo(-bodyWidth * 1.6, -bodyHeight * 0.6); // Adjusted upward
    ctx.lineTo(-bodyWidth * 1.3, bodyHeight * 0.1);
    ctx.lineTo(-bodyWidth * 1.6, bodyHeight * 0.7);
    ctx.lineTo(-bodyWidth / 2, bodyHeight * 0.5);
    ctx.quadraticCurveTo(-bodyWidth * 0.9, bodyHeight * 0.0, -bodyWidth / 2, -bodyHeight * 0.3);
    ctx.closePath();
    ctx.fill();

    // Right wing
    ctx.beginPath();
    ctx.moveTo(bodyWidth / 2, -bodyHeight * 0.3); // Lifted higher
    ctx.lineTo(bodyWidth * 1.6, -bodyHeight * 0.6); // Adjusted upward
    ctx.lineTo(bodyWidth * 1.3, bodyHeight * 0.1);
    ctx.lineTo(bodyWidth * 1.6, bodyHeight * 0.7);
    ctx.lineTo(bodyWidth / 2, bodyHeight * 0.5);
    ctx.quadraticCurveTo(bodyWidth * 0.9, bodyHeight * 0.0, bodyWidth / 2, -bodyHeight * 0.3);
    ctx.closePath();
    ctx.fill();

    // Draw wing membranes (details)
    ctx.strokeStyle = '#2E1A47'; // Darker shade for wing details
    ctx.lineWidth = 1;

    // Left wing details
    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, -bodyHeight * 0.3);
    ctx.lineTo(-bodyWidth * 1.3, bodyHeight * 0.1);
    ctx.moveTo(-bodyWidth / 2, -bodyHeight * 0.3);
    ctx.lineTo(-bodyWidth * 1.2, bodyHeight * 0.3);
    ctx.moveTo(-bodyWidth / 2, -bodyHeight * 0.3);
    ctx.lineTo(-bodyWidth * 1.1, bodyHeight * 0.5);
    ctx.stroke();

    // Right wing details
    ctx.beginPath();
    ctx.moveTo(bodyWidth / 2, -bodyHeight * 0.3);
    ctx.lineTo(bodyWidth * 1.3, bodyHeight * 0.1);
    ctx.moveTo(bodyWidth / 2, -bodyHeight * 0.3);
    ctx.lineTo(bodyWidth * 1.2, bodyHeight * 0.3);
    ctx.moveTo(bodyWidth / 2, -bodyHeight * 0.3);
    ctx.lineTo(bodyWidth * 1.1, bodyHeight * 0.5);
    ctx.stroke();

    // === Draw additional parts (arms) ===
    ctx.fillStyle = '#4B2E83';

    ctx.beginPath();
    ctx.moveTo(-bodyWidth / 2, -bodyHeight * 0.1);
    ctx.bezierCurveTo(
        -bodyWidth * 1.2, bodyHeight * 0.1,
        -bodyWidth * 1.2, bodyHeight * 0.9,
        -bodyWidth / 2, bodyHeight * 1.0
    );
    ctx.lineTo(-bodyWidth / 2, bodyHeight * 0.6);
    ctx.bezierCurveTo(
        -bodyWidth * 0.8, bodyHeight * 0.7,
        -bodyWidth * 0.8, bodyHeight * 0.3,
        -bodyWidth / 2, bodyHeight * 0.1
    );
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(bodyWidth / 2, -bodyHeight * 0.1);
    ctx.bezierCurveTo(
        bodyWidth * 1.2, bodyHeight * 0.1,
        bodyWidth * 1.2, bodyHeight * 0.9,
        bodyWidth / 2, bodyHeight * 1.0
    );
    ctx.lineTo(bodyWidth / 2, bodyHeight * 0.6);
    ctx.bezierCurveTo(
        bodyWidth * 0.8, bodyHeight * 0.7,
        bodyWidth * 0.8, bodyHeight * 0.3,
        bodyWidth / 2, bodyHeight * 0.1
    );
    ctx.closePath();
    ctx.fill();

    // === Draw bat body and facial features ===

    // Draw bat body (ellipse)
    ctx.fillStyle = '#4B2E83'; // Dark purple color for the bat body
    ctx.beginPath();
    ctx.ellipse(0, 0, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw bat head
    ctx.beginPath();
    ctx.ellipse(0, -bodyHeight * 0.6, bodyWidth * 0.4, bodyHeight * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw bat ears
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.2, -bodyHeight * 0.9);
    ctx.lineTo(-bodyWidth * 0.35, -bodyHeight * 1.2);
    ctx.lineTo(0, -bodyHeight * 1.0);
    ctx.lineTo(bodyWidth * 0.35, -bodyHeight * 1.2);
    ctx.lineTo(bodyWidth * 0.2, -bodyHeight * 0.9);
    ctx.closePath();
    ctx.fill();

    // Draw bat eyes
    ctx.fillStyle = '#FFFFFF';
    const eyeOffsetX = bodyWidth * 0.15;
    const eyeOffsetY = -bodyHeight * 0.6;
    const eyeRadius = bodyWidth * 0.08;
    ctx.beginPath();
    ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-eyeOffsetX, eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
    ctx.arc(eyeOffsetX, eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw bat mouth and fangs
    ctx.strokeStyle = '#FF0000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.05, -bodyHeight * 0.5);
    ctx.lineTo(0, -bodyHeight * 0.45);
    ctx.lineTo(bodyWidth * 0.05, -bodyHeight * 0.5);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-bodyWidth * 0.02, -bodyHeight * 0.45);
    ctx.lineTo(0, -bodyHeight * 0.4);
    ctx.lineTo(bodyWidth * 0.02, -bodyHeight * 0.45);
    ctx.fill();

    ctx.restore();
}











function levelCleared() {
    showingLevelCleared = true;

    levelClearedTimeout = setTimeout(() => {
        showingLevelCleared = false;
        levelUp();
    }, 2000);
}

function levelUp() {
    level++;
    startLevel();
}

function initObstacles() {
    let pathExists = false;
    let attempts = 0;

    while (!pathExists) {
        obstacles.length = 0;

        // Decide the number of obstacles based on the specified probabilities
        let numberOfObstacles;
        const randomChance = Math.random();

        if (randomChance < 0.8) {
            // 80% chance: Random number between 3 and 9
            numberOfObstacles = Math.floor(Math.random() * 7) + 3; // Generates 3 to 9 obstacles
        } else {
            // 20% chance: Exactly 15 obstacles
            numberOfObstacles = 15;
        }

        console.log(`Level ${level}, Attempt ${attempts + 1}: Generating ${numberOfObstacles} obstacles.`); // Debugging

        // Obstacle sizes are always the same
        const MIN_LENGTH = 100;
        const MAX_LENGTH = 200;
        const MIN_WIDTH = 20;
        const MAX_WIDTH = 30;

        const inflatedSize = player.size * 1.5;
        const clearance = (inflatedSize - player.size) / 2;

        for (let i = 0; i < numberOfObstacles; i++) {
            const obstacle = {
                width: 0,
                height: 0,
                x: 0,
                y: 0
            };

            const isHorizontal = Math.random() < 0.5;

            if (isHorizontal) {
                obstacle.width = MIN_LENGTH + Math.random() * (MAX_LENGTH - MIN_LENGTH);
                obstacle.height = MIN_WIDTH + Math.random() * (MAX_WIDTH - MIN_WIDTH);
            } else {
                obstacle.width = MIN_WIDTH + Math.random() * (MAX_WIDTH - MIN_WIDTH);
                obstacle.height = MIN_LENGTH + Math.random() * (MAX_LENGTH - MIN_LENGTH);
            }

            let placed = false;
            let obstacleAttempts = 0;
            while (!placed && obstacleAttempts < 100) {
                obstacle.x = Math.random() * (canvas.width - obstacle.width);
                obstacle.y = Math.random() * (canvas.height - obstacle.height);

                const inflatedObstacle = {
                    x: obstacle.x - clearance,
                    y: obstacle.y - clearance,
                    width: obstacle.width + 2 * clearance,
                    height: obstacle.height + 2 * clearance
                };

                if (
                    !isColliding(inflatedObstacle, {
                        x: player.x - clearance,
                        y: player.y - clearance,
                        width: player.size + 2 * clearance,
                        height: player.size + 2 * clearance
                    }) &&
                    !isRectCircleColliding(inflatedObstacle, {
                        x: gate.x,
                        y: gate.y,
                        radius: gate.radius + clearance
                    }) &&
                    !obstacles.some(existingObstacle => {
                        const inflatedExistingObstacle = {
                            x: existingObstacle.x - clearance,
                            y: existingObstacle.y - clearance,
                            width: existingObstacle.width + 2 * clearance,
                            height: existingObstacle.height + 2 * clearance
                        };
                        return isColliding(inflatedObstacle, inflatedExistingObstacle);
                    })
                ) {
                    placed = true;
                }
                obstacleAttempts++;
            }

            if (placed) {
                obstacles.push(obstacle);
            } else {
                console.warn('Could not place obstacle after 100 attempts.');
            }
        }

        pathExists = isPathAvailable();
        if (!pathExists) {
            console.warn(`Level ${level}, Attempt ${attempts + 1}: No valid path found with ${numberOfObstacles} obstacles.`);
        }
        attempts++;
    }

    console.log(`Level ${level}: Successfully generated a level with ${obstacles.length} obstacles after ${attempts} attempts.`);
}

function isPathAvailable() {
    const gridSize = 20;
    const cols = Math.ceil(canvas.width / gridSize);
    const rows = Math.ceil(canvas.height / gridSize);

    // Initialize the grid with zeros (walkable paths)
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Calculate the number of cells to inflate obstacles
    const inflatedSize = player.size * 1.5;
    const clearance = (inflatedSize - player.size) / 2;

    // Mark obstacles on the grid, inflated by clearance
    obstacles.forEach(obstacle => {
        const startX = Math.floor((obstacle.x - clearance) / gridSize);
        const startY = Math.floor((obstacle.y - clearance) / gridSize);
        const endX = Math.ceil((obstacle.x + obstacle.width + clearance) / gridSize);
        const endY = Math.ceil((obstacle.y + obstacle.height + clearance) / gridSize);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (x >= 0 && x < cols && y >= 0 && y < rows) {
                    grid[y][x] = 1; // Mark as an obstacle
                }
            }
        }
    });

    // Mark the canvas boundaries as obstacles with clearance
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (x * gridSize < clearance || x * gridSize > canvas.width - clearance ||
                y * gridSize < clearance || y * gridSize > canvas.height - clearance) {
                grid[y][x] = 1;
            }
        }
    }

    // Convert player and gate positions to grid coordinates
    const startX = Math.floor((player.x + player.size / 2) / gridSize);
    const startY = Math.floor((player.y + player.size / 2) / gridSize);
    const goalX = Math.floor(gate.x / gridSize);
    const goalY = Math.floor(gate.y / gridSize);

    // Check bounds and whether start or goal are on an obstacle
    if (
        startX < 0 || startX >= cols || startY < 0 || startY >= rows ||
        goalX < 0 || goalX >= cols || goalY < 0 || goalY >= rows ||
        grid[startY][startX] === 1 || grid[goalY][goalX] === 1
    ) {
        return false;
    }

    // Initialize BFS queue and visited set
    const queue = [{ x: startX, y: startY }];
    const visited = new Set([`${startX},${startY}`]);

    // Define possible movements (up, down, left, right)
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }  // Left
    ];

    // Perform BFS
    while (queue.length > 0) {
        const { x, y } = queue.shift();

        // Check if we've reached the goal
        if (x === goalX && y === goalY) {
            return true;
        }

        // Explore neighbors
        for (const dir of directions) {
            const nextX = x + dir.x;
            const nextY = y + dir.y;

            // Check bounds
            if (nextX >= 0 && nextX < cols && nextY >= 0 && nextY < rows) {
                const key = `${nextX},${nextY}`;
                if (!visited.has(key) && grid[nextY][nextX] === 0) {
                    visited.add(key);
                    queue.push({ x: nextX, y: nextY });
                }
            }
        }
    }

    // No path found
    return false;
}

function initEnemies(numEnemies) {
    enemies.length = 0;
    const minEnemySpeed = 0.75;
    const maxEnemySpeed = 3;

    for (let i = 0; i < numEnemies; i++) {
        const enemySize = 30;
        const enemy = {
            x: 0,
            y: 0,
            size: enemySize,
            dx: 0,
            dy: 0
        };

        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            enemy.x = Math.random() * (canvas.width - enemy.size);
            enemy.y = Math.random() * ((canvas.height / 2) - enemy.size);

            const speed = Math.random() * (maxEnemySpeed - minEnemySpeed) + minEnemySpeed;
            const angle = Math.random() * 2 * Math.PI;
            enemy.dx = Math.cos(angle) * speed;
            enemy.dy = Math.sin(angle) * speed;

            if (
                !isCollidingWithObstacles(enemy.x, enemy.y, enemy.size) &&
                !isCollidingWithPlayer(enemy) &&
                !isCollidingWithGate(enemy) &&
                !enemies.some(existingEnemy => isColliding(enemy, existingEnemy))
            ) {
                placed = true;
            }
            attempts++;
        }

        if (placed) {
            enemies.push(enemy);
        } else {
            console.warn('Could not place enemy after 100 attempts.');
        }
    }
}

function updateBat() {
    if (!bat) return;

    // Calculate direction vector from bat to player
    const dx = (player.x + player.size / 2) - (bat.x + bat.size / 2);
    const dy = (player.y + player.size / 2) - (bat.y + bat.size / 2);

    // Calculate the distance
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
        // Normalize the vector and multiply by speed
        const moveX = (dx / distance) * bat.speed;
        const moveY = (dy / distance) * bat.speed;

        // Calculate new position
        let newBatX = bat.x + moveX;
        let newBatY = bat.y + moveY;

        // Collision detection with obstacles
        if (!isCollidingWithObstacles(newBatX, bat.y, bat.size)) {
            bat.x = newBatX;
        }
        if (!isCollidingWithObstacles(bat.x, newBatY, bat.size)) {
            bat.y = newBatY;
        }
    }
}
function drawBat() {
    if (!bat) return;
    drawEnemy(bat);
}

function checkCollisionWithBat() {
    if (!bat) return;

    const playerRect = {
        x: player.x,
        y: player.y,
        width: player.size,
        height: player.size
    };

    const batRect = {
        x: bat.x,
        y: bat.y,
        width: bat.size,
        height: bat.size
    };

    if (isColliding(playerRect, batRect)) {
        gameOver();
    }
}


function gameLoop() {
    clearCanvas();

    if (showingLevelCleared) {
        drawLevelClearedScreen();
    } else {
        drawBackground();
        updatePlayerPosition();
        updateEnemies();
        updateBat();     // Add this line
        drawOutline();
        drawObstacles();
        drawEnemies();
        drawBat();       // Add this line
        drawGate();
        drawPlayer();
        drawHUD();
        drawFlickeringLights();
    }

    requestAnimationFrame(gameLoop);
}


function drawOutline() {
    if (!isMobileDevice()) {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawLevelClearedScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Level Cleared!', canvas.width / 2, canvas.height / 2);
}

function drawGate() {
    ctx.save();

    ctx.shadowColor = 'rgba(150, 44, 150, 0.7)'; // Adjusted for better visibility
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    ctx.arc(gate.x, gate.y, gate.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#800080';
    ctx.fill();

    ctx.restore();
}

function drawBackground() {
    // Create a linear gradient for the background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

    // Define the starting color stop (you can customize this)
    gradient.addColorStop(0, '#000000'); // Black or any other base color

    // Use randomNumberColor to set the second color stop
    if (randomNumberColor === 1) {
        gradient.addColorStop(1, '#4f0000'); // Dark red
        console.log("Background Color: Dark Red");
    } else if (randomNumberColor === 2) {
        gradient.addColorStop(1, '#2f3626'); // Dark green
        console.log("Background Color: Dark Green");
    } else {
        gradient.addColorStop(1, '#291045'); // Dark purple
        console.log("Background Color: Dark Purple");
    }

    // Apply the gradient as the fill style and draw the background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawFlickeringLights() {
    flickeringLights.forEach((light, index) => {
        // Calculate flickering opacity
        const flicker = light.baseOpacity + (Math.random() * 2 - 1) * light.flickerRange;
        const clampedFlicker = Math.min(Math.max(flicker, 0), 1); // Ensure opacity is between 0 and 1

        // Create radial gradient
        const gradient = ctx.createRadialGradient(
            light.x,
            light.y,
            0,
            light.x,
            light.y,
            light.radius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${clampedFlicker})`); // Bright center
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`); // Transparent edges

        // Draw the gradient
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawPlayer() {
    const centerX = player.x + player.size / 2;
    const centerY = player.y + player.size / 2;
    const radius = player.size / 2;

    ctx.fillStyle = '#808080';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 2;

    // Draw legs or other features
    for (let i = 0; i < 4; i++) {
        const angle = Math.PI + (i - 1.5) * (Math.PI / 8);
        const legLength = radius + 10;
        const startX = centerX + Math.cos(angle) * radius;
        const startY = centerY + Math.sin(angle) * radius;
        const controlX = centerX + Math.cos(angle) * (radius + 5) + Math.sin(angle) * 5;
        const controlY = centerY + Math.sin(angle) * (radius + 5) - Math.cos(angle) * 5;
        const endX = centerX + Math.cos(angle) * legLength;
        const endY = centerY + Math.sin(angle) * legLength;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.stroke();
    }

    for (let i = 0; i < 4; i++) {
        const angle = (i - 1.5) * (Math.PI / 8);
        const legLength = radius + 10;
        const startX = centerX + Math.cos(angle) * radius;
        const startY = centerY + Math.sin(angle) * radius;
        const controlX = centerX + Math.cos(angle) * (radius + 5) + Math.sin(angle) * -5;
        const controlY = centerY + Math.sin(angle) * (radius + 5) - Math.cos(angle) * -5;
        const endX = centerX + Math.cos(angle) * legLength;
        const endY = centerY + Math.sin(angle) * legLength;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        ctx.stroke();
    }

    // Draw eyes
    ctx.fillStyle = '#FFFFFF';
    const eyeOffsetX = radius / 2.5;
    const eyeOffsetY = radius / 4;
    const eyeRadius = radius / 5;
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, centerY - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetX, centerY - eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
    ctx.arc(centerX + eyeOffsetX, centerY - eyeOffsetY, eyeRadius / 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        drawEnemy(enemy);
    });
}


function drawObstacles() {
    obstacles.forEach(obstacle => {
        // Move to obstacle position
        ctx.save();
        ctx.translate(obstacle.x, obstacle.y);

        // Flickering effect for the glow
        const flicker = Math.random() * 0.3 + 0.7; // Opacity between 0.7 and 1

        // **First, draw the glow behind the shape**

        // Save context before applying glow settings
        ctx.save();

        // Set glow properties
        ctx.shadowColor = `rgba(255, 223, 0, ${flicker * 0.5})`; // Yellow glow with variable opacity
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // Draw a transparent rectangle to create the glow effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Transparent fill
        ctx.fillRect(0, 0, obstacle.width, obstacle.height);

        // Restore context to remove glow settings
        ctx.restore();

        // **Then, draw the obstacle shape on top without glow**

        // Create a vertical gradient for the obstacle
        const gradient = ctx.createLinearGradient(0, 0, 0, obstacle.height);
        gradient.addColorStop(0, '#444444'); // Dark gray at the top
        gradient.addColorStop(1, '#222222'); // Even darker at the bottom

        ctx.fillStyle = gradient;

        // Draw rectangle shape
        ctx.beginPath();
        ctx.rect(0, 0, obstacle.width, obstacle.height);
        ctx.fill();

        // Restore context to original state
        ctx.restore();
    });
}






function drawHUD() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Level: ' + level, 10, 30);
}


function updatePlayerPosition() {
    // Reset keyboard directional vectors
    player.keyboard.dx = 0;
    player.keyboard.dy = 0;

    // Update keyboard directional vectors based on pressed keys
    if (keysPressed.left) {
        player.keyboard.dx -= 1;
    }
    if (keysPressed.right) {
        player.keyboard.dx += 1;
    }
    if (keysPressed.up) {
        player.keyboard.dy -= 1;
    }
    if (keysPressed.down) {
        player.keyboard.dy += 1;
    }

    // Calculate the sum of keyboard and joystick inputs
    let moveX = player.keyboard.dx + player.joystick.dx;
    let moveY = player.keyboard.dy + player.joystick.dy;

    // Calculate the length of the movement vector
    const length = Math.sqrt(moveX * moveX + moveY * moveY);

    if (length > 0) {
        // Normalize the movement vector and scale by player's speed
        moveX = (moveX / length) * player.speed;
        moveY = (moveY / length) * player.speed;

        // Calculate potential new positions
        let newX = player.x + moveX;
        let newY = player.y + moveY;

        // Collision Detection
        if (!isCollidingWithObstacles(newX, player.y, player.size)) {
            player.x = newX;
        }
        if (!isCollidingWithObstacles(player.x, newY, player.size)) {
            player.y = newY;
        }

        // Boundary Constraints
        if (player.x < 0) player.x = 0;
        if (player.x > canvas.width - player.size) player.x = canvas.width - player.size;
        if (player.y < 0) player.y = 0;
        if (player.y > canvas.height - player.size) player.y = canvas.height - player.size;
    }

    // Check for collisions
    checkCollisionWithEnemies();
    checkCollisionWithBat();
    checkCollisionWithGate();
}

function updateEnemies() {
    enemies.forEach(enemy => {
        let newEnemyX = enemy.x + enemy.dx;
        let newEnemyY = enemy.y + enemy.dy;

        if (newEnemyX <= 0 || newEnemyX >= canvas.width - enemy.size) {
            enemy.dx *= -1;
            newEnemyX = enemy.x + enemy.dx;
        }
        if (newEnemyY <= 0 || newEnemyY >= canvas.height - enemy.size) {
            enemy.dy *= -1;
            newEnemyY = enemy.y + enemy.dy;
        }

        if (!isCollidingWithObstacles(newEnemyX, enemy.y, enemy.size)) {
            enemy.x = newEnemyX;
        } else {
            enemy.dx *= -1;
        }
        if (!isCollidingWithObstacles(enemy.x, newEnemyY, enemy.size)) {
            enemy.y = newEnemyY;
        } else {
            enemy.dy *= -1;
        }
    });
}

function isCollidingWithObstacles(x, y, size) {
    const rect = {
        x: x,
        y: y,
        width: size,
        height: size
    };

    return obstacles.some(obstacle => {
        return isColliding(rect, obstacle);
    });
}

function isCollidingWithPlayer(enemy) {
    const enemyRect = {
        x: enemy.x,
        y: enemy.y,
        width: enemy.size,
        height: enemy.size
    };

    const playerRect = {
        x: player.x,
        y: player.y,
        width: player.size,
        height: player.size
    };

    return isColliding(enemyRect, playerRect);
}

function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function isCircleColliding(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < circle1.radius + circle2.radius;
}

function isRectCircleColliding(rect, circle) {
    const distX = Math.abs(circle.x - rect.x - rect.width / 2);
    const distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) { return false; }
    if (distY > (rect.height / 2 + circle.radius)) { return false; }

    if (distX <= (rect.width / 2)) { return true; }
    if (distY <= (rect.height / 2)) { return true; }

    const dx = distX - rect.width / 2;
    const dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
}

function checkCollisionWithEnemies() {
    const playerRect = {
        x: player.x,
        y: player.y,
        width: player.size,
        height: player.size
    };

    enemies.forEach(enemy => {
        const enemyRect = {
            x: enemy.x,
            y: enemy.y,
            width: enemy.size,
            height: enemy.size
        };

        if (isColliding(playerRect, enemyRect)) {
            gameOver();
        }
    });
}

function checkCollisionWithGate() {
    const playerCircle = {
        x: player.x + player.size / 2,
        y: player.y + player.size / 2,
        radius: player.size / 2
    };

    const gateCircle = {
        x: gate.x,
        y: gate.y,
        radius: gate.radius
    };

    if (isCircleColliding(playerCircle, gateCircle)) {
        levelCleared();
    }
}

function isCollidingWithGate(enemy) {
    const enemyCircle = {
        x: enemy.x + enemy.size / 2,
        y: enemy.y + enemy.size / 2,
        radius: enemy.size / 2
    };

    const gateCircle = {
        x: gate.x,
        y: gate.y,
        radius: gate.radius
    };

    return isCircleColliding(enemyCircle, gateCircle);
}

function gameOver() {
    if (levelClearedTimeout) {
        clearTimeout(levelClearedTimeout);
    }
    alert('Game Over! You reached Level ' + level);
    resetGame();
}

function resetGame() {
    level = 1;
    showingLevelCleared = false;
    startLevel();
}

// Virtual joystick setup using nippleJS
// Virtual joystick setup using nippleJS
const joystickOptions = {
    zone: document.getElementById('joystick-container'),
    mode: 'static',
    position: { right: '50px', bottom: '50px' },
    color: 'white',
    size: 80  // Slightly smaller size to fit better in phone layout
};

const joystick = nipplejs.create(joystickOptions);

// Update joystick position based on device type
function updateJoystickPosition() {
    const container = document.getElementById('joystick-container');
    if (!isMobileDevice()) {
        container.style.position = 'absolute';
        container.style.right = '20px';
        container.style.bottom = '20px';
    } else {
        container.style.position = 'fixed';
        container.style.right = '20px';
        container.style.bottom = '20px';
    }
}

// Call this after creating the joystick
updateJoystickPosition();

// Also update on window resize
window.addEventListener('resize', updateJoystickPosition);
