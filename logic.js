// logic.js

// Utility functions and global variables

// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Function to check if the device is mobile
function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Resize canvas to fit the window or set fixed size for desktop
function resizeCanvas() {
    if (isMobileDevice()) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 375;
        canvas.height = 667;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Clear the canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Collision detection functions
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

// Helper function to get a random number between 1 and 3
function getRandomColorNumber() {
    return Math.floor(Math.random() * 3) + 1; // Returns 1, 2, or 3
}
