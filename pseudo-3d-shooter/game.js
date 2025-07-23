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
let bossFight = false;
let boss = null;
let enemiesDefeated = 0;
let maxEnemies = 1;

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

const bgmNormal = new Audio('audio/normal.m4a');
bgmNormal.loop = true;
const bgmBoss = new Audio('audio/boss.m4a');
bgmBoss.loop = true;

let isBgmStarted = false;
let isGameOverSoundPlayed = false;

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
    if (gameOver || bossFight) return;

    if (enemiesDefeated >= 5 && !boss) {
        enemiesDefeated = 0;
        bossFight = true;
        boss = {
            x: 0,
            y: 0,
            z: 2000,
            size: 60,
            hp: 3,
            state: 'approaching',
            type: 'boss',
            trail: []
        };
        enemies.push(boss);
        playSound('audio/reach.m4a');
        playBGM(bgmBoss);
        return;
    }

    if (enemies.length < maxEnemies) {
        enemies.push({
            x: (Math.random() - 0.5) * 500,
            y: (Math.random() - 0.5) * 500,
            z: 2000,
            size: 30,
            trail: [],
            type: 'zaku2',
            state: 'approaching'
        });
        playSound('audio/reach.m4a');
    }
}
setInterval(spawnEnemy, 1000);

// --- Beams ---
const beams = [];
const enemyBeams = [];

// --- Explosions ---
const explosions = [];

// --- Sound ---
function playSound(src) {
    const sound = new Audio(src);
    sound.play();
}

function playBGM(bgm) {
    bgmNormal.pause();
    bgmBoss.pause();
    bgm.currentTime = 0;
    bgm.play();
}

function update() {
    if (gameOver) {
        if (!isGameOverSoundPlayed) {
            bgmNormal.pause();
            bgmBoss.pause();
            playSound('audio/gameover.m4a');
            isGameOverSoundPlayed = true;
        }
        gameOverEl.style.display = 'block';
        finalScoreEl.textContent = score;
        return;
    }

    // Update enemy positions
    enemies.forEach((enemy, index) => {
        enemy.trail.push({ x: enemy.x, y: enemy.y, z: enemy.z });
        if (enemy.trail.length > 30) {
            enemy.trail.shift();
        }

        if (enemy.type === 'boss') {
            if (enemy.state === 'approaching') {
                enemy.z -= 15; // 3x speed
                if (enemy.z <= 100) {
                    enemy.state = 'fighting';
                }
            } else if (enemy.state === 'fighting') {
                enemy.x = Math.sin(Date.now() / 500) * 30;
                enemy.y = Math.cos(Date.now() / 600) * 30;
                if (Math.random() < 0.01 && enemyBeams.length < 1) {
                    enemyBeams.push({ x: enemy.x, y: enemy.y, z: enemy.z, size: 20 });
                }
            }
        } else { // Regular enemy logic
            if (enemy.state === 'approaching') {
                let speed = 5 * (2/3);
                if (enemy.z < 600) {
                    speed *= (enemy.z / 600);
                }
                enemy.z -= speed;
                if (enemy.z < 100 && Math.random() < 0.02) {
                    enemy.state = 'attacking';
                    enemyBeams.push({ x: enemy.x, y: enemy.y, z: enemy.z, size: 15 });
                }
                if (enemy.z <= 0) {
                    enemies.splice(index, 1);
                    damage++;
                    damageFlash = 1;
                    damageEl.textContent = `Damage: ${damage}`;
                    if (damage >= 3) {
                        gameOver = true;
                    }
                }
            } else if (enemy.state === 'attacking') {
                setTimeout(() => {
                    enemy.state = 'retreating';
                }, 200);
            } else if (enemy.state === 'retreating') {
                enemy.x += (enemy.retreatSpeed || 1);
                enemy.z += (enemy.retreatSpeed || 1) * 0.5;
                if (!enemy.retreatSpeed) {
                    enemy.retreatSpeed = 1;
                }
                enemy.retreatSpeed += 0.1;
                if (enemy.x > 1000) {
                    enemies.splice(index, 1);
                }
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

    // Update enemy beam positions
    enemyBeams.forEach((enemyBeam, index) => {
        enemyBeam.z -= 8;
        if (enemyBeam.z <= 0) {
            enemyBeams.splice(index, 1);
            damage++;
            damageFlash = 1;
            damageEl.textContent = `Damage: ${damage}`;
            if (damage >= 3) {
                gameOver = true;
            }
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
        // vs enemies
        enemies.forEach((enemy, enemyIndex) => {
            const screenX = (enemy.x - view.x) / enemy.z * canvas.width / 2 + canvas.width / 2;
            const screenY = (enemy.y - view.y) / enemy.z * canvas.height / 2 + canvas.height / 2;
            const screenSize = enemy.size / enemy.z * 100;
            const beamScreenX = canvas.width / 2;
            const beamScreenY = canvas.height / 2;
            const distance = Math.sqrt(Math.pow(screenX - beamScreenX, 2) + Math.pow(screenY - beamScreenY, 2));

            if (distance < screenSize) {
                if (enemy.type === 'boss') {
                    enemy.hp--;
                    explosions.push({ x: enemy.x, y: enemy.y, z: enemy.z, radius: 20, alpha: 1 });
                    playSound('audio/bomb.m4a');
                    beams.splice(beamIndex, 1);
                    if (enemy.hp <= 0) {
                        explosions.push({ x: enemy.x, y: enemy.y, z: enemy.z, radius: 80, alpha: 1 });
                        playSound('audio/bomb.m4a');
                        enemies.splice(enemyIndex, 1);
                        score += 500;
                        scoreEl.textContent = `Score: ${score}`;
                        bossFight = false;
                        boss = null;
                        maxEnemies++;
                        playBGM(bgmNormal);
                    }
                } else {
                    explosions.push({ x: enemy.x, y: enemy.y, z: enemy.z, radius: 10, alpha: 1 });
                    playSound('audio/bomb.m4a');
                    enemies.splice(enemyIndex, 1);
                    beams.splice(beamIndex, 1);
                    score += 100;
                    enemiesDefeated++;
                    scoreEl.textContent = `Score: ${score}`;
                }
            }
        });

        // vs enemy beams
        enemyBeams.forEach((enemyBeam, enemyBeamIndex) => {
            const screenX = (enemyBeam.x - view.x) / enemyBeam.z * canvas.width / 2 + canvas.width / 2;
            const screenY = (enemyBeam.y - view.y) / enemyBeam.z * canvas.height / 2 + canvas.height / 2;
            const screenSize = enemyBeam.size / enemyBeam.z * 100;
            const beamScreenX = canvas.width / 2;
            const beamScreenY = canvas.height / 2;
            const distance = Math.sqrt(Math.pow(screenX - beamScreenX, 2) + Math.pow(screenY - beamScreenY, 2));

            if (distance < screenSize) {
                explosions.push({ x: enemyBeam.x, y: enemyBeam.y, z: enemyBeam.z, radius: 10, alpha: 1 });
                playSound('audio/bomb.m4a');
                enemyBeams.splice(enemyBeamIndex, 1);
                beams.splice(beamIndex, 1);
                score += 50;
                scoreEl.textContent = `Score: ${score}`;
            }
        });
    });

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (damageFlash > 0) {
        damageFlash -= 0.05;
        ctx.fillStyle = `rgba(255, 0, 0, ${damageFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = '#fff';
    stars.forEach(star => {
        const x = (star.x - view.x) / star.z * canvas.width / 2 + canvas.width / 2;
        const y = (star.y - view.y) / star.z * canvas.height / 2 + canvas.height / 2;
        const size = Math.max(1, 1 / star.z * 100);
        ctx.fillRect(x, y, size, size);
    });

    enemies.sort((a, b) => b.z - a.z);
    enemies.forEach(enemy => {
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
            if (enemy.type === 'boss') {
                ctx.drawImage(zakuImage, x - size / 2, y - size / 2, size, size);
            } else {
                ctx.drawImage(zaku2Image, x - size / 2, y - size / 2, size, size);
            }
        }
    });
    
    explosions.sort((a, b) => b.z - a.z);
    explosions.forEach(explosion => {
        const x = (explosion.x - view.x) / explosion.z * canvas.width / 2 + canvas.width / 2;
        const y = (explosion.y - view.y) / explosion.z * canvas.height / 2 + canvas.height / 2;
        ctx.beginPath();
        ctx.arc(x, y, explosion.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 165, 0, ${explosion.alpha})`;
        ctx.fill();
    });

    ctx.fillStyle = 'magenta';
    enemyBeams.forEach(enemyBeam => {
        const x = (enemyBeam.x - view.x) / enemyBeam.z * canvas.width / 2 + canvas.width / 2;
        const y = (enemyBeam.y - view.y) / enemyBeam.z * canvas.height / 2 + canvas.height / 2;
        const size = enemyBeam.size / enemyBeam.z * 100;
        if (size > 0) {
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        }
    });

    ctx.fillStyle = 'yellow';
    beams.forEach(beam => {
        const bottomWidth = 20;
        const topWidth = 2;
        const beamLengthFactor = beam.lifetime / 25;
        const topY = canvas.height - (canvas.height / 2) * beamLengthFactor;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - bottomWidth / 2, canvas.height);
        ctx.lineTo(canvas.width / 2 + bottomWidth / 2, canvas.height);
        ctx.lineTo(canvas.width / 2 + topWidth / 2, topY);
        ctx.lineTo(canvas.width / 2 - topWidth / 2, topY);
        ctx.closePath();
        ctx.fill();
    });

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

// Event Listeners
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
    console.log('touchstart', e.touches[0].clientX, e.touches[0].clientY);
    isDragging = true;
    lastMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    e.preventDefault();
});
canvas.addEventListener('touchend', () => {
    console.log('touchend');
    isDragging = false;
});
canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
        const dx = e.touches[0].clientX - lastMousePosition.x;
        const dy = e.touches[0].clientY - lastMousePosition.y;
        view.x -= dx * 5;
        view.y -= dy * 5;
        lastMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        e.preventDefault();
        console.log('touchmove', view.x, view.y);
    }
});
canvas.addEventListener('click', () => {
    if (gameOver) return;

    if (!isBgmStarted) {
        playBGM(bgmNormal);
        isBgmStarted = true;
    }

    playSound('audio/shoot.m4a');
    beams.push({ lifetime: 25 });
    if (beams.length > 1) {
        beams.shift();
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

update();