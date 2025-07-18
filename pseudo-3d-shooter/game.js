
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const damageEl = document.getElementById('damage');
const gameOverEl = document.getElementById('game-over');
const finalScoreEl = document.getElementById('final-score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let damage = 0;
let gameOver = false;

const view = {
    x: 0,
    y: 0
};

let isDragging = false;
let lastMousePosition = { x: 0, y: 0 };

const zakuImage = new Image();
zakuImage.src = 'images/zaku.png';

const zaku2Image = new Image();
zaku2Image.src = 'images/zaku2.png';

let damageFlash = 0;

// --- Starfield ---
const stars = [];
for (let i = 0; i < 500; i++) {
    stars.push({
        x: (Math.random() - 0.5) * 2000,
        y: (Math.random() - 0.5) * 2000,
        z: Math.random() * 2000
    });
}

// --- Enemies ---
const enemies = [];
function spawnEnemy() {
    if (gameOver) return;

    let maxEnemies = 1;
    if (score >= 1000) {
        maxEnemies = 3;
    } else if (score >= 500) {
        maxEnemies = 2;
    }

    if (enemies.length < maxEnemies) {
        const enemyType = Math.random() < 0.2 ? 'zaku1' : 'zaku2'; // 20% Zaku1, 80% Zaku2
        enemies.push({
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
            z: 2000,
            size: 30,
            trail: [],
            type: enemyType
        });
    }
}
setInterval(spawnEnemy, 1000);

// --- Beams ---
const beams = [];

// --- Explosions ---
const explosions = [];

function update() {
    if (gameOver) {
        gameOverEl.style.display = 'block';
        finalScoreEl.textContent = score;
        return;
    }

    // Update enemy positions
    enemies.forEach((enemy, index) => {
        // Add current position to trail
        enemy.trail.push({ x: enemy.x, y: enemy.y, z: enemy.z });
        // Limit trail length
        if (enemy.trail.length > 30) { // 30 frames = 0.5 seconds at 60fps
            enemy.trail.shift();
        }

        let speed = 5;
        if (enemy.type === 'zaku2') {
            speed = 5 * (2/3);
        }
        enemy.z -= speed;
        if (enemy.z <= 0) {
            enemies.splice(index, 1);
            damage++;
            damageFlash = 1;
            damageEl.textContent = `Damage: ${damage}`;
            if (damage >= 3) {
                gameOver = true;
            }
        }
    });

    // Update beam positions
    beams.forEach((beam, index) => {
        beam.lifetime--;
        if (beam.lifetime <= 0) {
            beams.splice(index, 1);
        }
    });
    
    // Update explosions
    explosions.forEach((explosion, index) => {
        explosion.radius += 2;
        explosion.alpha -= 0.02;
        if (explosion.alpha <= 0) {
            explosions.splice(index, 1);
        }
    });


    // Collision detection
    beams.forEach((beam, beamIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            const screenX = (enemy.x - view.x) / enemy.z * canvas.width / 2 + canvas.width / 2;
            const screenY = (enemy.y - view.y) / enemy.z * canvas.height / 2 + canvas.height / 2;
            const screenSize = enemy.size / enemy.z * 100;

            const beamScreenX = canvas.width / 2;
            const beamScreenY = canvas.height / 2;

            const distance = Math.sqrt(Math.pow(screenX - beamScreenX, 2) + Math.pow(screenY - beamScreenY, 2));

            if (distance < screenSize) {
                // Hit!
                explosions.push({ x: enemy.x, y: enemy.y, z: enemy.z, radius: 10, alpha: 1 });
                enemies.splice(enemyIndex, 1);
                beams.splice(beamIndex, 1);
                score += 100;
                scoreEl.textContent = `Score: ${score}`;
            }
        });
    });


    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (damageFlash > 0) {
        damageFlash -= 0.05;
        ctx.fillStyle = `rgba(255, 0, 0, ${damageFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw stars
    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        const x = (star.x - view.x) / star.z * canvas.width / 2 + canvas.width / 2;
        const y = (star.y - view.y) / star.z * canvas.height / 2 + canvas.height / 2;
        const size = Math.max(1, 1 / star.z * 100);
        ctx.fillRect(x, y, size, size);
    });

    // Draw enemies
    enemies.sort((a, b) => b.z - a.z); // Draw distant enemies first
    enemies.forEach(enemy => {
        // Draw trail
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.beginPath();
        enemy.trail.forEach((p, index) => {
            const x = (p.x - view.x) / p.z * canvas.width / 2 + canvas.width / 2;
            const y = (p.y - view.y) / p.z * canvas.height / 2 + canvas.height / 2;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        const x = (enemy.x - view.x) / enemy.z * canvas.width / 2 + canvas.width / 2;
        const y = (enemy.y - view.y) / enemy.z * canvas.height / 2 + canvas.height / 2;
        const size = enemy.size / enemy.z * 100;
        if (size > 0) {
            if (enemy.type === 'zaku1') {
                ctx.drawImage(zakuImage, x - size / 2, y - size / 2, size, size);
            } else if (enemy.type === 'zaku2') {
                ctx.drawImage(zaku2Image, x - size / 2, y - size / 2, size, size);
            }
        }
    });
    
    // Draw explosions
    explosions.sort((a, b) => b.z - a.z);
    explosions.forEach(explosion => {
        const x = (explosion.x - view.x) / explosion.z * canvas.width / 2 + canvas.width / 2;
        const y = (explosion.y - view.y) / explosion.z * canvas.height / 2 + canvas.height / 2;
        ctx.beginPath();
        ctx.arc(x, y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`;
        ctx.fill();
    });


    // Draw beams
    ctx.fillStyle = 'yellow';
    beams.forEach(beam => {
        const bottomWidth = 20; // 幅の最大値
        const topWidth = 2;   // 幅の最小値
        const beamLengthFactor = beam.lifetime / 25; // 25はbeams.pushで設定したlifetimeの初期値
        const topY = canvas.height - (canvas.height / 2) * beamLengthFactor;

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - bottomWidth / 2, canvas.height);
        ctx.lineTo(canvas.width / 2 + bottomWidth / 2, canvas.height);
        ctx.lineTo(canvas.width / 2 + topWidth / 2, topY);
        ctx.lineTo(canvas.width / 2 - topWidth / 2, topY);
        ctx.closePath();
        ctx.fill();
    });


    // Draw crosshair
    ctx.strokeStyle = '#0f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
    ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
    ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10);
    ctx.stroke();
}

// --- Event Listeners ---
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMousePosition = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const dx = e.clientX - lastMousePosition.x;
        const dy = e.clientY - lastMousePosition.y;
        view.x -= dx * 2;
        view.y -= dy * 2;
        lastMousePosition = { x: e.clientX, y: e.clientY };
    }
});

canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    lastMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    e.preventDefault(); // Prevent scrolling
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const dx = e.touches[0].clientX - lastMousePosition.x;
        const dy = e.touches[0].clientY - lastMousePosition.y;
        view.x -= dx * 2;
        view.y -= dy * 2;
        lastMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault(); // Prevent scrolling
    }
});

canvas.addEventListener('click', () => {
    if (gameOver) return;
    // Create a beam that travels towards the center of the screen
    beams.push({ lifetime: 25 }); // Initial lifetime
    // Limit number of beams on screen
    if (beams.length > 1) {
        beams.shift();
    }
});



window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


update();
