
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let hue = 0;
const stars = [];

// Canvas sizing
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Random number generator
function random(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
}

// Vector class
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
    }

    mult(number) {
        this.x *= number;
        this.y *= number;
        return this;
    }

    static random2D() {
        const angle = Math.random() * Math.PI * 2;

        return new Vector(
            Math.cos(angle),
            Math.sin(angle)
        );
    }
}

// Star particle class
class Star {
    constructor(x, y, vx, vy) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(vx, vy);
        this.acceleration = new Vector(0, 0);

        this.rotation = random(0, Math.PI * 2);
        this.size = random(1, 10);

        this.life = 255;
        this.done = false;
        this.hasRandomAcceleration = Math.random() > 0.5;
    }

    update() {
        this.life -= 5;

        if (this.life <= 0) {
            this.done = true;
            return;
        }

        if (this.hasRandomAcceleration) {
            this.acceleration = Vector.random2D().mult(0.05);
        }

        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
    }

    draw() {
        ctx.save();

        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(this.rotation);

        const color = `hsl(${hue}, 100%, 50%)`;

        ctx.fillStyle = color;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;

        // Draw four-pointed star
        ctx.beginPath();
        ctx.moveTo(0, -this.size);

        ctx.quadraticCurveTo(0, 0, this.size, 0);
        ctx.quadraticCurveTo(0, 0, 0, this.size);
        ctx.quadraticCurveTo(0, 0, -this.size, 0);
        ctx.quadraticCurveTo(0, 0, 0, -this.size);

        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// Get mouse position relative to canvas
function getCanvasMousePosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

// Reusable star generation function
function createStarBurst(
    x, y,
    minCount, maxCount,
    minSpeed, maxSpeed
) {
    const count = Math.floor(random(minCount, maxCount));

    for (let i = 0; i < count; i++) {
        const velocity = Vector.random2D()
            .mult(random(minSpeed, maxSpeed));

        stars.push(
            new Star(
                x, y,
                velocity.x,
                velocity.y
            )
        );
    }
}

// Mouse movement effect
let lastMoveSpawn = 0;

canvas.addEventListener("mousemove", (event) => {
    const now = performance.now();

    if (now - lastMoveSpawn < 60) return; //(1000/60 bursts per sec)

    lastMoveSpawn = now;

    const { x, y } = getCanvasMousePosition(event);

    createStarBurst(x, y, 20, 50, 2, 5);
});

// Mouse click explosion
canvas.addEventListener("click", (event) => {
    const { x, y } = getCanvasMousePosition(event);

    createStarBurst(x, y, 60, 100, 3, 10);   //play 
});

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];

        star.update();
        star.draw();

        if (star.done) {
            stars.splice(i, 1);
        }
    }

    hue = (hue + 1) % 360;

    requestAnimationFrame(animate);
}

animate();
