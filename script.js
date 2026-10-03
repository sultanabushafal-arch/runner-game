const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;
}

resize();
window.addEventListener("resize", resize);

/* =========================
   اللاعب
========================= */

const player = {
    lane: 1,
    targetLane: 1,
    z: 0,
    speed: 0.35,
    run: 0
};

function moveLeft() {
    if (player.targetLane > 0) {
        player.targetLane--;
    }
}

function moveRight() {
    if (player.targetLane < 2) {
        player.targetLane++;
    }
}

document.addEventListener("keydown", function (e) {

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        moveLeft();
    }

    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        moveRight();
    }

});

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

if (leftButton) {
    leftButton.addEventListener("click", moveLeft);
}

if (rightButton) {
    rightButton.addEventListener("click", moveRight);
}

/* =========================
   العالم
========================= */

const obstacles = [
    { lane: 0, z: 35 },
    { lane: 2, z: 55 },
    { lane: 1, z: 80 },
    { lane: 0, z: 110 },
    { lane: 2, z: 135 },
    { lane: 1, z: 165 },
    { lane: 0, z: 200 },
    { lane: 2, z: 230 }
];

const coins = [
    { lane: 1, z: 20, collected: false },
    { lane: 0, z: 45, collected: false },
    { lane: 1, z: 60, collected: false },
    { lane: 2, z: 75, collected: false },
    { lane: 1, z: 100, collected: false },
    { lane: 0, z: 125, collected: false },
    { lane: 2, z: 150, collected: false },
    { lane: 1, z: 180, collected: false },
    { lane: 0, z: 215, collected: false },
    { lane: 2, z: 245, collected: false }
];

let score = 0;

/* =========================
   المنظور
========================= */

function project(lane, z) {

    const horizon = H * 0.38;

    const distance = z - player.z + 8;

    if (distance <= 0) {
        return null;
    }

    const depth = Math.min(distance / 100, 1);

    const perspective = 1 - depth;

    const roadWidth =
        70 + perspective * W * 0.78;

    const lanePositions = [
        -1,
        0,
        1
    ];

    const laneX = lanePositions[lane];

    const x =
        W / 2 +
        laneX * roadWidth * 0.30;

    const y =
        horizon +
        Math.pow(perspective, 1.65) *
        (H - horizon);

    const scale =
        0.15 +
        perspective * 1.8;

    return {
        x,
        y,
        scale
    };
}

/* =========================
   السماء والأرض
========================= */

function drawBackground() {

    const sky = ctx.createLinearGradient(
        0,
        0,
        0,
        H
    );

    sky.addColorStop(0, "#5ec7f4");
    sky.addColorStop(0.55, "#d9f3ff");
    sky.addColorStop(0.56, "#71b45a");
    sky.addColorStop(1, "#4b913f");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);
}

/* =========================
   الشارع
========================= */

function drawRoad() {

    const horizon = H * 0.38;

    ctx.beginPath();

    ctx.moveTo(
        W * 0.46,
        horizon
    );

    ctx.lineTo(
        W * 0.54,
        horizon
    );

    ctx.lineTo(
        W * 0.94,
        H
    );

    ctx.lineTo(
        W * 0.06,
        H
    );

    ctx.closePath();

    ctx.fillStyle = "#343434";
    ctx.fill();

    /* حواف */

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(
        W * 0.46,
        horizon
    );

    ctx.lineTo(
        W * 0.06,
        H
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        W * 0.54,
        horizon
    );

    ctx.lineTo(
        W * 0.94,
        H
    );

    ctx.stroke();

    /* خطوط تقسيم المسارات */

    const roadLines = [
        [0.46, 0.33],
        [0.54, 0.67]
    ];

    roadLines.forEach(line => {

        ctx.strokeStyle =
            "rgba(255,255,255,0.75)";

        ctx.lineWidth = 4;

        ctx.beginPath();

        ctx.moveTo(
            W * 0.50,
            horizon
        );

        ctx.lineTo(
            W * line[1],
            H
        );

        ctx.stroke();
    });
}

/* =========================
   البيوت
========================= */

function drawHouse(side, z) {

    const p = project(
        1,
        z
    );

    if (!p) return;

    const sideX =
        side === -1
            ? p.x - 150 * p.scale
            : p.x + 150 * p.scale;

    const size =
        45 * p.scale;

    if (p.y < H * 0.38 || p.y > H) {
        return;
    }

    /* جسم البيت */

    ctx.fillStyle =
        side === -1
            ? "#d8b28c"
            : "#d6c18d";

    ctx.fillRect(
        sideX - size,
        p.y - size * 1.4,
        size * 2,
        size * 1.4
    );

    /* السقف */

    ctx.fillStyle = "#9b493d";

    ctx.beginPath();

    ctx.moveTo(
        sideX - size * 1.25,
        p.y - size * 1.4
    );

    ctx.lineTo(
        sideX,
        p.y - size * 2.2
    );

    ctx.lineTo(
        sideX + size * 1.25,
        p.y - size * 1.4
    );

    ctx.closePath();

    ctx.fill();

    /* الباب */

    ctx.fillStyle = "#70452f";

    ctx.fillRect(
        sideX - size * 0.18,
        p.y - size * 0.75,
        size * 0.36,
        size * 0.75
    );

    /* النافذة */

    ctx.fillStyle = "#79c9e8";

    ctx.fillRect(
        sideX + size * 0.35,
        p.y - size * 0.95,
        size * 0.35,
        size * 0.35
    );
}

/* =========================
   الأشجار
========================= */

function drawTree(side, z) {

    const p = project(
        1,
        z
    );

    if (!p) return;

    const x =
        side === -1
            ? p.x - 100 * p.scale
            : p.x + 100 * p.scale;

    const size =
        28 * p.scale;

    if (p.y < H * 0.38 || p.y > H) {
        return;
    }

    /* جذع */

    ctx.fillStyle = "#70452b";

    ctx.fillRect(
        x - size * 0.15,
        p.y - size * 1.4,
        size * 0.3,
        size * 1.4
    );

    /* أوراق */

    ctx.beginPath();

    ctx.arc(
        x,
        p.y - size * 1.65,
        size * 0.7,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#27753d";
    ctx.fill();
}

/* =========================
   العقبات
========================= */

function drawObstacles() {

    obstacles.forEach(obstacle => {

        const p = project(
            obstacle.lane,
            obstacle.z
        );

        if (!p) return;

        if (
            p.y < H * 0.38 ||
            p.y > H
        ) {
            return;
        }

        const size =
            32 * p.scale;

        /* حاجز */

        ctx.fillStyle = "#f08a24";

        ctx.fillRect(
            p.x - size,
            p.y - size,
            size * 2,
            size
        );

        /* خطوط التحذير */

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth =
            Math.max(2, 3 * p.scale);

        for (
            let i = -1;
            i <= 1;
            i++
        ) {

            ctx.beginPath();

            ctx.moveTo(
                p.x + i * size,
                p.y
            );

            ctx.lineTo(
                p.x + (i + 0.5) * size,
                p.y - size
            );

            ctx.stroke();
        }
    });
}

/* =========================
   العملات
========================= */

function drawCoins() {

    coins.forEach(coin => {

        if (coin.collected) return;

        const p = project(
            coin.lane,
            coin.z
        );

        if (!p) return;

        if (
            p.y < H * 0.38 ||
            p.y > H
        ) {
            return;
        }

        const radius =
            12 * p.scale;

        ctx.beginPath();

        ctx.arc(
            p.x,
            p.y - radius * 2,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#ffd43b";
        ctx.fill();

        ctx.strokeStyle = "#d49b00";
        ctx.lineWidth = 3;

        ctx.stroke();

        ctx.fillStyle = "#fff2a3";

        ctx.beginPath();

        ctx.arc(
            p.x - radius * 0.3,
            p.y - radius * 2.3,
            radius * 0.25,
            0,
            Math.PI * 2
        );

        ctx.fill();
    });
}

/* =========================
   اللاعب
========================= */

function drawPlayer() {

    player.lane +=
        (player.targetLane - player.lane) * 0.12;

    player.run += 0.25;

    const laneX = [
        -1,
        0,
        1
    ];

    const x =
        W / 2 +
        laneX[Math.round(player.lane)] *
        W * 0.16;

    const y =
        H - 105;

    const leg =
        Math.sin(player.run) * 18;

    /* الظل */

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 8,
        35,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,0.3)";

    ctx.fill();

    /* الأرجل */

    ctx.strokeStyle = "#18202b";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(
        x - 10,
        y - 30
    );

    ctx.lineTo(
        x - 18,
        y + leg
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        x + 10,
        y - 30
    );

    ctx.lineTo(
        x + 18,
        y - leg
    );

    ctx.stroke();

    /* الجسم */

    ctx.fillStyle = "#2468a6";

    ctx.beginPath();

    ctx.roundRect(
        x - 27,
        y - 105,
        54,
        75,
        12
    );

    ctx.fill();

    /* الحقيبة */

    ctx.fillStyle = "#173b5d";

    ctx.fillRect(
        x - 21,
        y - 98,
        42,
        50
    );

    /* الرأس */

    ctx.beginPath();

    ctx.arc(
        x,
        y - 130,
        27,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#c98f68";
    ctx.fill();

    /* الشعر */

    ctx.beginPath();

    ctx.arc(
        x,
        y - 138,
        29,
        Math.PI,
        Math.PI * 2
    );

    ctx.fillStyle = "#202020";
    ctx.fill();

    /* الذراعين */

    ctx.strokeStyle = "#2468a6";
    ctx.lineWidth = 13;

    ctx.beginPath();

    ctx.moveTo(
        x - 25,
        y - 90
    );

    ctx.lineTo(
        x - 48,
        y - 50 + leg
    );

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(
        x + 25,
        y - 90
    );

    ctx.lineTo(
        x + 48,
        y - 50 - leg
    );

    ctx.stroke();
}

/* =========================
   المطارد
========================= */

function drawChaser() {

    const x = W / 2;
    const y = H - 30;

    ctx.fillStyle = "#292929";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 35,
        17,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillRect(
        x - 18,
        y - 20,
        36,
        45
    );
}

/* =========================
   الاصطدام والعملات
========================= */

function checkCollisions() {

    obstacles.forEach(obstacle => {

        if (
            obstacle.lane === Math.round(player.lane) &&
            Math.abs(
                obstacle.z - player.z
            ) < 1.5
        ) {

            alert("اصطدمت بالعقبة!");

            location.reload();
        }
    });

    coins.forEach(coin => {

        if (coin.collected) return;

        if (
            coin.lane === Math.round(player.lane) &&
            Math.abs(
                coin.z - player.z
            ) < 1.5
        ) {

            coin.collected = true;

            score++;

            const scoreElement =
                document.getElementById("score");

            if (scoreElement) {
                scoreElement.textContent =
                    "🪙 " + score;
            }
        }
    });
}

/* =========================
   اللعبة
========================= */

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    player.z += player.speed;

    drawBackground();

    /* البيوت */

    for (
        let z = 20;
        z < 300;
        z += 35
    ) {

        drawHouse(-1, z);
        drawHouse(1, z + 15);

        drawTree(-1, z + 10);
        drawTree(1, z + 25);
    }

    drawRoad();

    drawObstacles();

    drawCoins();

    drawChaser();

    drawPlayer();

    checkCollisions();

    requestAnimationFrame(gameLoop);
}

gameLoop();
