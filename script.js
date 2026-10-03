const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W, H;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

window.addEventListener("resize", resize);
resize();

/* =========================
   اللاعب
========================= */

let playerX = 0;
let playerZ = 0;

let speed = 0.18;

let lane = 0;

const laneWidth = 3;

/* =========================
   العالم
========================= */

const obstacles = [
    { z: 25, lane: -1 },
    { z: 45, lane: 1 },
    { z: 70, lane: 0 },
    { z: 95, lane: -1 },
    { z: 125, lane: 1 },
    { z: 155, lane: 0 }
];

const coins = [
    { z: 15, lane: 0, collected: false },
    { z: 30, lane: -1, collected: false },
    { z: 55, lane: 1, collected: false },
    { z: 80, lane: 0, collected: false },
    { z: 110, lane: -1, collected: false },
    { z: 140, lane: 1, collected: false }
];

let score = 0;

/* =========================
   التحكم
========================= */

function moveLeft() {
    if (lane > -1) {
        lane--;
    }
}

function moveRight() {
    if (lane < 1) {
        lane++;
    }
}

document.addEventListener("keydown", (e) => {

    if (e.key === "ArrowLeft") {
        moveLeft();
    }

    if (e.key === "ArrowRight") {
        moveRight();
    }

});

document.getElementById("left").onclick = moveLeft;
document.getElementById("right").onclick = moveRight;

/* =========================
   رسم الطريق
========================= */

function drawRoad() {

    /* السماء */

    const sky = ctx.createLinearGradient(0, 0, 0, H);

    sky.addColorStop(0, "#61c9ff");
    sky.addColorStop(0.55, "#d8f5ff");
    sky.addColorStop(0.56, "#79b85c");
    sky.addColorStop(1, "#4f913e");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    /* أفق */

    const horizon = H * 0.38;

    /* الطريق */

    ctx.beginPath();

    ctx.moveTo(W * 0.44, horizon);
    ctx.lineTo(W * 0.56, horizon);

    ctx.lineTo(W * 0.90, H);
    ctx.lineTo(W * 0.10, H);

    ctx.closePath();

    ctx.fillStyle = "#383838";
    ctx.fill();

    /* أطراف الطريق */

    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(W * 0.44, horizon);
    ctx.lineTo(W * 0.10, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(W * 0.56, horizon);
    ctx.lineTo(W * 0.90, H);
    ctx.stroke();

    /* خطوط المسارات */

    drawLaneLine(-1);
    drawLaneLine(1);
}

/* =========================
   خطوط المسارات
========================= */

function drawLaneLine(side) {

    const horizon = H * 0.38;

    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.lineWidth = 3;

    ctx.beginPath();

    if (side === -1) {

        ctx.moveTo(W * 0.48, horizon);

        ctx.lineTo(W * 0.35, H);

    } else {

        ctx.moveTo(W * 0.52, horizon);

        ctx.lineTo(W * 0.65, H);
    }

    ctx.stroke();
}

/* =========================
   تحويل المسافة إلى الشاشة
========================= */

function project(z, laneValue) {

    const horizon = H * 0.38;

    const distance = z - playerZ;

    let depth = 1 - distance / 180;

    if (depth < 0) depth = 0;

    const perspective = Math.pow(depth, 2);

    const centerX = W / 2;

    const roadWidth =
        80 + perspective * W * 0.55;

    const x =
        centerX +
        (laneValue / 1.5) *
        (roadWidth / 2);

    const y =
        horizon +
        perspective *
        (H - horizon);

    return {
        x,
        y,
        scale: 0.2 + perspective * 1.8
    };
}

/* =========================
   رسم العقبات
========================= */

function drawObstacles() {

    obstacles.forEach(obstacle => {

        const p = project(
            obstacle.z,
            obstacle.lane
        );

        if (p.y < H * 0.35 || p.y > H) return;

        const size = 35 * p.scale;

        ctx.font = size + "px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "🚧",
            p.x,
            p.y
        );

    });
}

/* =========================
   رسم العملات
========================= */

function drawCoins() {

    coins.forEach(coin => {

        if (coin.collected) return;

        const p = project(
            coin.z,
            coin.lane
        );

        if (p.y < H * 0.35 || p.y > H) return;

        const size = 25 * p.scale;

        ctx.font = size + "px Arial";
        ctx.textAlign = "center";

        ctx.fillText(
            "🪙",
            p.x,
            p.y
        );

    });
}

/* =========================
   اللاعب
========================= */

function drawPlayer() {

    const xPositions = [
        W * 0.35,
        W * 0.50,
        W * 0.65
    ];

    const x =
        xPositions[lane + 1];

    const y = H - 120;

    ctx.font = "75px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "🏃",
        x,
        y
    );
}

/* =========================
   المطارد
========================= */

function drawChaser() {

    ctx.font = "50px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
        "👤",
        W / 2,
        H - 45
    );
}

/* =========================
   جمع العملات والاصطدام
========================= */

function checkObjects() {

    obstacles.forEach(obstacle => {

        if (
            obstacle.z - playerZ < 2 &&
            obstacle.z - playerZ > -1 &&
            obstacle.lane === lane
        ) {

            alert("اصطدمت بالعقبة!");

            location.reload();
        }

    });

    coins.forEach(coin => {

        if (coin.collected) return;

        if (
            coin.z - playerZ < 2 &&
            coin.z - playerZ > -1 &&
            coin.lane === lane
        ) {

            coin.collected = true;

            score++;

            document.getElementById("score").textContent =
                "🪙 " + score;
        }

    });
}

/* =========================
   اللعبة
========================= */

function gameLoop() {

    ctx.clearRect(0, 0, W, H);

    /* اللاعب يتقدم للأمام */

    playerZ += speed;

    drawRoad();

    drawObstacles();

    drawCoins();

    drawPlayer();

    drawChaser();

    checkObjects();

    requestAnimationFrame(gameLoop);
}

gameLoop();
