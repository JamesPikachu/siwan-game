const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 변수
let player = { x: 50, y: 400, width: 32, height: 48, speed: 5, velY: 0, jumping: false };
let keys = [];
let gravity = 0.6;
let friction = 0.8;
let score = 0;
let cameraX = 0;
let levelWidth = 2000;

// 확장된 플랫폼
let platforms = [
    { x: 0, y: 450, width: 800, height: 30 },
    { x: 200, y: 350, width: 100, height: 10 },
    { x: 600, y: 400, width: 150, height: 10 },
    { x: 900, y: 300, width: 200, height: 10 },
    { x: 1200, y: 450, width: 800, height: 30 }
];

// 적
let enemies = [
    { x: 600, y: 400, width: 32, height: 32, direction: -1 },
    { x: 1000, y: 250, width: 32, height: 32, direction: 1 }
];

// 코인
let coins = [
    { x: 250, y: 300, width: 20, height: 20 },
    { x: 650, y: 350, width: 20, height: 20 },
    { x: 950, y: 250, width: 20, height: 20 }
];

function update() {
    // 중력과 점프
    player.velY += gravity;
    player.y += player.velY;
    player.velY *= friction;

    // 키 입력
    if (keys[38] && !player.jumping) { player.jumping = true; player.velY = -15; }
    if (keys[37]) { player.x -= player.speed; }
    if (keys[39]) { player.x += player.speed; }

    // 카메라 업데이트
    if (player.x > cameraX + canvas.width / 2) {
        cameraX = player.x - canvas.width / 2;
    }
    if (cameraX < 0) cameraX = 0;
    if (cameraX > levelWidth - canvas.width) cameraX = levelWidth - canvas.width;

    // 화면 클리어
    ctx.clearRect(0, 0, 800, 480);

    // 배경
    ctx.fillStyle = 'skyblue';
    ctx.fillRect(0, 0, 800, 480);

    // 플레이어 그리기
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x - cameraX, player.y, player.width, player.height);

    // 플랫폼 그리기
    ctx.fillStyle = 'green';
    platforms.forEach(p => {
        if (p.x - cameraX > -p.width && p.x - cameraX < canvas.width) {
            ctx.fillRect(p.x - cameraX, p.y, p.width, p.height);
        }
    });

    // 적 그리기
    ctx.fillStyle = 'brown';
    enemies.forEach(e => {
        e.x += 2 * e.direction;
        if (e.x < 0 || e.x > levelWidth) e.direction *= -1;
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            console.log('Game Over!');
        }
        if (e.x - cameraX > -e.width && e.x - cameraX < canvas.width) {
            ctx.fillRect(e.x - cameraX, e.y, e.width, e.height);
        }
    });

    // 코인 수집
    coins = coins.filter(c => {
        if (player.x < c.x + c.width && player.x + player.width > c.x &&
            player.y < c.y + c.height && player.y + player.height > c.y) {
            score += 10;
            return false;
        }
        if (c.x - cameraX > -c.width && c.x - cameraX < canvas.width) {
            ctx.fillRect(c.x - cameraX, c.y, c.width, c.height);
        }
        return true;
    });

    // 점수 표시
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // 플랫폼 충돌
    platforms.forEach(p => {
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y) {
            player.velY = 0;
            player.jumping = false;
            player.y = p.y - player.height;
        }
    });

    // 레벨 끝 도달 시
    if (player.x > levelWidth) {
        console.log('Level Clear! Score: ' + score);
    }

    requestAnimationFrame(update);
}

// 키 이벤트
window.addEventListener('keydown', e => keys[e.keyCode] = true);
window.addEventListener('keyup', e => keys[e.keyCode] = false);

update();