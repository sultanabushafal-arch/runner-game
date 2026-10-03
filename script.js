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
let playerTargetX = 0;

let playerZ = 0;
let runTime = 0;

const speed = 0.08;

/* =========================
   التحكم
========================= */

function moveLeft() {
    playerTargetX -= 1;

    if (playerTargetX < -1) {
        playerTargetX = -1;
    }
}

function moveRight() {
    playerTargetX += 1;

    if (playerTargetX > 1) {
        playerTargetX = 1;
    }
}

document.addEventListener("keydown", (event) => {

    if (event.key === "ArrowLeft") {
        moveLeft();
    }

    if (event.key === "ArrowRight") {
        moveRight();
    }

});

document.getElementById("left").addEventListener("click", moveLeft);
document.getElementById("right").addEventListener("click", moveRight);

/* =========================
   رسم السماء والأرض
========================= */

function drawWorld() {

    /* السماء */

    const sky = ctx.createLinearGradient(0, 0, 0, H);

    sky.addColorStop(0, "#63c9ff");
    sky.addColorStop(0.55, "#d9f4ff");
    sky.addColorStop(0.56, "#77b85c");
    sky.addColorStop(1, "#4b913d");

    ctx.fillStyle = sky;

    ctx.fillRect(0, 0, W, H);

    /* الأفق */

    const horizon = H * 0.36;

    /* الشارع */

    ctx.beginPath();

    ctx.moveTo(W * 0.46, horizon);
    ctx.lineTo(W * 0.54, horizon);

    ctx.lineTo(W * 0.92, H);
    ctx.lineTo(W * 0.08, H);

    ctx.closePath();

    ctx.fillStyle = "#353535";

    ctx.fill();

    /* حواف الشارع */

    ctx.strokeStyle = "#eeeeee";
    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(W * 0.46, horizon);
    ctx.lineTo(W * 0.08, H);

    ctx.stroke();

    ctx.beginPath();

    ctx.moveTo(W * 0.54, horizon);
    ctx.lineTo(W * 0.92, H);

    ctx.stroke();

    /* خط منتصف الشارع */

    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 4;

    ctx.beginPath();

    ctx.moveTo(W * 0.50, horizon);
    ctx.lineTo(W * 0.50, H);

    ctx.stroke();
}

/* =========================
   حركة الجري
========================= */

function drawPlayer() {

    /* انتقال سلس يمين ويسار */

    playerX +=
        (playerTargetX - playerX) * 0.12;

    const centerX = W / 2;

    /*
       الشخصية تتحرك للأمام
       والكاميرا تتبعها.
    */

    const x =
        centerX + playerX * W * 0.20;

    const groundY = H - 100;

    /*
       حركة الجري:
       الرجلان يتحركان بالتبادل
    */

    runTime += speed;

    const leg =
        Math.sin(runTime * 12) * 12;

    /* ظل */

    ctx.beginPath();

    ctx.ellipse(
        x,
        groundY + 5,
        32,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "rgba(0,0,0,0.3)";

    ctx.fill();

    /* جسم الشخصية من الخلف */

    ctx.fillStyle = "#1d3557";

    ctx.fillRect(
        x - 22,
        groundY - 90,
        44,
        60
    );

    /* الرأس */

    ctx.beginPath();

    ctx.arc(
        x,
        groundY - 110,
        22,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#d6a27a";

    ctx.fill();

    /* الشعر */

    ctx.beginPath();

    ctx.arc(
        x,
        groundY - 120,
        23,
        Math.PI,
        Math.PI * 2
    );

    ctx.fillStyle = "#222";

    ctx.fill();

    /* الذراع اليسرى */

    ctx.beginPath();

    ctx.moveTo(x - 20, groundY - 75);

    ctx.lineTo(
        x - 42,
        groundY - 45 + leg
    );

    ctx.lineWidth = 12;
    ctx.strokeStyle = "#1d3557";

    ctx.stroke();

    /* الذراع اليمنى */

    ctx.beginPath();

    ctx.moveTo(x + 20, groundY - 75);

    ctx.lineTo(
        x + 42,
        groundY - 45 - leg
    );

    ctx.lineWidth = 12;
    ctx.strokeStyle = "#1d3557";

    ctx.stroke();

    /* الرجل اليسرى */

    ctx.beginPath();

    ctx.moveTo(x - 10, groundY - 30);

    ctx.lineTo(
        x - 18,
        groundY + leg
    );

    ctx.lineWidth = 14;
    ctx.strokeStyle = "#111";

    ctx.stroke();

    /* الرجل اليمنى */

    ctx.beginPath();

    ctx.moveTo(x + 10, groundY - 30);

    ctx.lineTo(
        x + 18,
        groundY - leg
    );

    ctx.lineWidth = 14;
    ctx.strokeStyle = "#111";

    ctx.stroke();
}

/* =========================
   المطارد
========================= */

function drawChaser() {

    const x = W / 2;
    const y = H - 35;

    ctx.beginPath();

    ctx.arc(
        x,
        y - 25,
        16,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#333";

    ctx.fill();

    ctx.fillRect(
        x - 15,
        y - 10,
        30,
        35
    );
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

    /* الشخصية تتقدم */

    playerZ += speed;

    drawWorld();

    drawPlayer();

    drawChaser();

    requestAnimationFrame(gameLoop);
}

gameLoop();
