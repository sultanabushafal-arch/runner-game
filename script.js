const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let W = 0;
let H = 0;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;

    canvas.width = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
    );
}

window.addEventListener("resize", resize);
resize();

/* =========================
   اللاعب
========================= */

const player = {
    x: 0,
    targetX: 0,
    z: 0,
    speed: 0.12,
    run: 0
};

/* =========================
   التحكم
========================= */

function moveLeft() {
    player.targetX -= 1;

    if (player.targetX < -1.2) {
        player.targetX = -1.2;
    }
}

function moveRight() {
    player.targetX += 1;

    if (player.targetX > 1.2) {
        player.targetX = 1.2;
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

/* أزرار الجوال */

const leftButton = document.getElementById("left");
const rightButton = document.getElementById("right");

if (leftButton) {
    leftButton.addEventListener("click", moveLeft);
}

if (rightButton) {
    rightButton.addEventListener("click", moveRight);
}

/* =========================
   منظور الشارع
========================= */

function project(worldX, worldZ) {

    const horizon = H * 0.36;

    const cameraZ = player.z - 8;

    const distance = worldZ - cameraZ;

    if (distance <= 0.5) {
        return null;
    }

    const depth = Math.min(
        distance / 100,
        1
    );

    const perspective = 1 - depth;

    const roadWidth =
        55 +
        perspective * W * 0.75;

    const x =
        W / 2 +
        (worldX / 4) * roadWidth;

    const y =
        horizon +
        Math.pow(perspective, 1.7) *
        (H - horizon);

    const scale =
        0.15 +
        perspective * 1.8;

    return {
        x: x,
        y: y,
        scale: scale
    };
}

/* =========================
   العالم
========================= */

function drawWorld() {

    /* السماء */

    const sky = ctx.createLinearGradient(
        0,
        0,
        0,
        H
    );

    sky.addColorStop(0, "#58bdf2");
    sky.addColorStop(0.55, "#d8f2ff");
    sky.addColorStop(0.56, "#75b65b");
    sky.addColorStop(1, "#4c923f");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    const horizon = H * 0.36;

    /* =====================
       الشارع
    ===================== */

    ctx.beginPath();

    ctx.moveTo(
        W * 0.47,
        horizon
    );

    ctx.lineTo(
        W * 0.53,
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

    /* حافة يسار */

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.moveTo(
        W * 0.47,
        horizon
    );

    ctx.lineTo(
        W * 0.06,
        H
    );

    ctx.stroke();

    /* حافة يمين */

    ctx.beginPath();

    ctx.moveTo(
        W * 0.53,
        horizon
    );

    ctx.lineTo(
        W * 0.94,
        H
    );

    ctx.stroke();

    /* خط متقطع في المنتصف */

    for (
        let z = Math.floor(player.z / 8) * 8 + 8;
        z < player.z + 100;
        z += 16
    ) {

        const p1 = project(0, z);
        const p2 = project(0, z + 7);

        if (!p1 || !p2) {
            continue;
        }

        ctx.strokeStyle = "#eeeeee";
        ctx.lineWidth =
            Math.max(2, p1.scale * 2);

        ctx.beginPath();

        ctx.moveTo(
            p1.x,
            p1.y
        );

        ctx.lineTo(
            p2.x,
            p2.y
        );

        ctx.stroke();
    }
}

/* =========================
   أشجار على الطريق
========================= */

function drawTree(x, z) {

    const p = project(x, z);

    if (!p) {
        return;
    }

    if (p.y < H * 0.35 || p.y > H) {
        return;
    }

    const size = 25 * p.scale;

    /* الجذع */

    ctx.fillStyle = "#70452b";

    ctx.fillRect(
        p.x - size * 0.12,
        p.y - size * 1.3,
        size * 0.24,
        size * 1.3
    );

    /* أوراق الشجرة */

    ctx.beginPath();

    ctx.arc(
        p.x,
        p.y - size * 1.6,
        size * 0.65,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#27733b";
    ctx.fill();
}

/* =========================
   اللاعب من الخلف
========================= */

function drawPlayer() {

    player.x +=
        (player.targetX - player.x) * 0.12;

    player.run += 0.22;

    const p = project(
        player.x,
        player.z
    );

    if (!p) {
        return;
    }

    const x = p.x;

    const baseY =
        H * 0.82;

    const jumpBob =
        Math.sin(player.run * 2) * 3;

    const y =
        baseY + jumpBob;

    const s = 1.35;

    /* حركة الأرجل */

    const legMove =
        Math.sin(player.run) * 18;

    /* ظل */

    ctx.beginPath();

    ctx.ellipse(
        x,
        y + 7,
        35,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,0.3)";

    ctx.fill();

    /* =====================
       الرجل اليسرى
    ===================== */

    ctx.strokeStyle = "#18202b";
    ctx.lineWidth = 15 * s;
    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(
        x - 9 * s,
        y - 30 * s
    );

    ctx.lineTo(
        x - 17 * s,
        y + legMove
    );

    ctx.stroke();

    /* =====================
       الرجل اليمنى
    ===================== */

    ctx.beginPath();

    ctx.moveTo(
        x + 9 * s,
        y - 30 * s
    );

    ctx.lineTo(
        x + 17 * s,
        y - legMove
    );

    ctx.stroke();

    /* =====================
       الجسم
    ===================== */

    ctx.fillStyle = "#2468a6";

    ctx.beginPath();

    ctx.roundRect(
        x - 25 * s,
        y - 105 * s,
        50 * s,
        75 * s,
        12 * s
    );

    ctx.fill();

    /* =====================
       حقيبة ظهر
    ===================== */

    ctx.fillStyle = "#173b5d";

    ctx.beginPath();

    ctx.roundRect(
        x - 19 * s,
        y - 98 * s,
        38 * s,
        50 * s,
        8 * s
    );

    ctx.fill();

    /* =====================
       الرأس
    ===================== */

    ctx.beginPath();

    ctx.arc(
        x,
        y - 125 * s,
        25 * s,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#c98f68";
    ctx.fill();

    /* الشعر من الخلف */

    ctx.beginPath();

    ctx.arc(
        x,
        y - 132 * s,
        27 * s,
        Math.PI,
        Math.PI * 2
    );

    ctx.fillStyle = "#202020";
    ctx.fill();

    /* =====================
       الذراع اليسرى
    ===================== */

    ctx.strokeStyle = "#2468a6";
    ctx.lineWidth = 13 * s;

    ctx.beginPath();

    ctx.moveTo(
        x - 23 * s,
        y - 90 * s
    );

    ctx.lineTo(
        x - 43 * s,
        y - 55 * s + legMove
    );

    ctx.stroke();

    /* =====================
       الذراع اليمنى
    ===================== */

    ctx.beginPath();

    ctx.moveTo(
        x + 23 * s,
        y - 90 * s
    );

    ctx.lineTo(
        x + 43 * s,
        y - 55 * s - legMove
    );

    ctx.stroke();
}

/* =========================
   المطارد
========================= */

function drawChaser() {

    const p = project(
        0,
        player.z - 3
    );

    if (!p) {
        return;
    }

    const x = p.x;

    const y = H * 0.93;

    /* الرأس */

    ctx.beginPath();

    ctx.arc(
        x,
        y - 45,
        15,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "#242424";
    ctx.fill();

    /* الجسم */

    ctx.fillStyle = "#242424";

    ctx.fillRect(
        x - 16,
        y - 30,
        32,
        45
    );
}

/* =========================
   حلقة اللعبة
========================= */

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );

    /* اللاعب نفسه يتقدم للأمام */

    player.z += player.speed;

    drawWorld();

    /* الأشجار ثابتة في العالم */

    for (
        let z =
            Math.floor(player.z / 20) * 20 + 20;
        z < player.z + 100;
        z += 20
    ) {

        drawTree(-5, z);
        drawTree(5, z + 8);
    }

    drawChaser();

    drawPlayer();

    requestAnimationFrame(gameLoop);
}

gameLoop();
