const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 게임 변수
let player = { 
    x: 50, y: 400, width: 32, height: 48, 
    speed: 5, velY: 0, jumping: false, 
    isBig: false, lives: 3 
};
let keys = [];
let gravity = 0.6;
let friction = 0.8;
let score = 0;
let cameraX = 0;
let levelWidth = 2000;

// 플랫폼
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

// 버섯
let mushrooms = [
    { x: 400, y: 300, width: 20, height: 20 }
];

function update() {
    // 중력과 점프
    player.velY += gravity;
    player.y += player.velY;
    player.velY *= friction;

    // 키 입력 (스페이스바로 점프)
    if ((keys[32] || keys[38]) && !player.jumping) { 
        player.jumping = true; 
        player.velY = -15; 
    }
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

    // 적 처리
    ctx.fillStyle = 'brown';
    enemies.forEach(e => {
        e.x += 2 * e.direction;
        if (e.x < 0 || e.x > levelWidth) e.direction *= -1;
        
        // 적과 충돌 체크
        if (player.x < e.x + e.width && player.x + player.width > e.x &&
            player.y < e.y + e.height && player.y + player.height > e.y) {
            
            // 플레이어가 적 위에서 밟았는지 확인
            if (player.y + player.height < e.y + e.height/2 && player.velY > 0) {
                // 적을 밟으면 점프
                player.velY = -15;
                enemies = enemies.filter(enemy => enemy !== e);
                score += 100;
            } else {
                // 적과 충돌
                if (player.isBig) {
                    player.isBig = false;
                    player.height = 48;
                } else {
                    player.lives--;
                    if (player.lives <= 0) {
                        console.log('Game Over!');
                        player.lives = 3;
                        player.x = 50;
                        player.y = 400;
                    }
                }
            }
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
            ctx.fillStyle = 'gold';
            ctx.fillRect(c.x - cameraX, c.y, c.width, c.height);
        }
        return true;
    });

    // 버섯 수집 (커지기)
    mushrooms = mushrooms.filter(m => {
        if (player.x < m.x + m.width && player.x + player.width > m.x &&
            player.y < m.y + m.height && player.y + player.height > m.y) {
            player.isBig = true;
            player.height = 64;
            score += 50;
            return false;
        }
        if (m.x - cameraX > -m.width && m.x - cameraX < canvas.width) {
            ctx.fillStyle = 'red';
            ctx.fillRect(m.x - cameraX, m.y, m.width, m.height);
        }
        return true;
    });

    // 점수 및 목숨 표시
    ctx.fillStyle = 'black';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${player.lives}`, 10, 60);

    // 플랫폼 충돌
    platforms.forEach(p => {
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y) {
            player.velY = 0;
            player.jumping = false;
            player.y = p.y - player.height;
        }
    });

    // 땅에 떨어지면 죽음
    if (player.y > canvas.height) {
        player.lives--;
        if (player.lives <= 0) {
            console.log('Game Over!');
            player.lives = 3;
            player.x = 50;
            player.y = 400;
        } else {
            player.x = 50;
            player.y = 400;
        }
    }

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