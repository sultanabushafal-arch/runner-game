const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// =========================
// دقة عالية
// =========================

let W = 0;
let H = 0;
let DPR = 1;

function resize() {
    W = window.innerWidth;
    H = window.innerHeight;

    DPR = Math.min(window.devicePixelRatio || 1, 5);

    canvas.width = W * DPR;
    canvas.height = H * DPR;

    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

resize();
window.addEventListener("resize", resize);


// =========================
// اللاعب
// =========================

const player = {
    lane: 1,
    targetLane: 1,

    jumping: false,
    jumpY: 0,
    jumpVelocity: 0,

    runTime: 0
};


// =========================
// التحكم
// =========================

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

function jump() {

    if (!player.jumping) {
        player.jumping = true;
        player.jumpY = 0;
        player.jumpVelocity = 18;
    }
}


// =========================
// الكيبورد
// =========================

document.addEventListener("keydown", function (e) {

    if (
        e.key === "ArrowLeft" ||
        e.key.toLowerCase() === "a"
    ) {
        e.preventDefault();
        moveLeft();
    }

    if (
        e.key === "ArrowRight" ||
        e.key.toLowerCase() === "d"
    ) {
        e.preventDefault();
        moveRight();
    }

    if (
        e.key === "ArrowUp" ||
        e.key.toLowerCase() === "w" ||
        e.code === "Space"
    ) {
        e.preventDefault();
        jump();
    }

});


// =========================
// أزرار الجوال
// =========================

const leftButton = document.getElementById("left");
const jumpButton = document.getElementById("jump");
const rightButton = document.getElementById("right");

if (leftButton) {
    leftButton.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        moveLeft();
    });
}

if (rightButton) {
    rightButton.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        moveRight();
    });
}

if (jumpButton) {
    jumpButton.addEventListener("pointerdown", function (e) {
        e.preventDefault();
        jump();
    });
}


// =========================
// عالم اللعبة
// =========================

let playerZ = 0;

let gameSpeed = 0.42;

// المرحلة أصبحت طويلة
const levelLength = 1200;


// =========================
// العقبات
// =========================

const obstacles = [];

for (let z = 80; z < levelLength; z += 55) {

    obstacles.push({
        lane: Math.floor(Math.random() * 3),
        z: z
    });
}


// =========================
// العملات
// =========================

const coins = [];

for (let z = 35; z < levelLength; z += 28) {

    coins.push({
        lane: Math.floor(Math.random() * 3),
        z: z,
        collected: false
    });
}


let score = 0;


// =========================
// المنظور
// =========================

function project(lane, z) {

    const horizon = H * 0.36;

    const distance = z - playerZ;

    if (distance < 0 || distance > 330) {
        return null;
    }

    const depth = 1 - distance / 330;

    const roadWidth =
        W * (0.08 + depth * 0.84);

    const laneOffset =
        (lane - 1) * roadWidth * 0.30;

    const x =
        W / 2 + laneOffset;

    const y =
        horizon +
        depth * (H - horizon);

    const scale =
        0.12 + depth * 1.8;

    return {
        x: x,
        y: y,
        scale: scale
    };
}


// =========================
// الخلفية
// =========================

function drawBackground() {

    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            H
        );

    sky.addColorStop(0, "#58bff0");
    sky.addColorStop(0.55, "#d9f5ff");
    sky.addColorStop(0.56, "#72b85b");
    sky.addColorStop(1, "#4b943f");

    ctx.fillStyle = sky;

    ctx.fillRect(
        0,
        0,
        W,
        H
    );
}


// =========================
// الشارع
// =========================

function drawRoad() {

    const horizon = H * 0.36;

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

    ctx.fillStyle = "#353535";
    ctx.fill();


    // حواف الشارع

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


    // خط المسار الأول

    ctx.strokeStyle =
        "rgba(255,255,255,0.75)";

    ctx.lineWidth = 4;

    ctx.setLineDash([20, 25]);

    ctx.beginPath();

    ctx.moveTo(
        W * 0.487,
        horizon
    );

    ctx.lineTo(
        W * 0.33,
        H
    );

    ctx.stroke();


    // خط المسار الثاني

    ctx.beginPath();

    ctx.moveTo(
        W * 0.513,
        horizon
    );

    ctx.lineTo(
        W * 0.67,
        H
    );

    ctx.stroke();

    ctx.setLineDash([]);
}


// =========================
// البيوت والأشجار
// =========================

function drawEnvironment() {

    for (
        let z = 25;
        z < levelLength;
        z += 38
    ) {

        const p = project(1, z);

        if (!p) continue;

        const size =
            35 * p.scale;


        drawHouse(
            p.x - 150 * p.scale,
            p.y,
            size
        );


        drawHouse(
            p.x + 150 * p.scale,
            p.y,
            size
        );


        drawTree(
            p.x - 90 * p.scale,
            p.y,
            size * 0.8
        );


        drawTree(
            p.x + 90 * p.scale,
            p.y,
            size * 0.8
        );
    }
}


function drawHouse(x, y, size) {

    if (size < 5) return;

    ctx.fillStyle = "#d8b28c";

    ctx.fillRect(
        x - size,
        y - size * 1.4,
        size * 2,
        size * 1.4
    );


    ctx.fillStyle = "#9b493d";

    ctx.beginPath();

    ctx.moveTo(
        x - size * 1.2,
        y - size * 1.4
    );

    ctx.lineTo(
        x,
        y - size * 2.2
    );

    ctx.lineTo(
        x + size * 1.2,
        y - size * 1.4
    );

    ctx.closePath();

    ctx.fill();


    // الباب

    ctx.fillStyle = "#70452f";

    ctx.fillRect(
        x - size * 0.2,
        y - size * 0.7,
        size * 0.4,
        size * 0.7
    );


    // النافذة

    ctx.fillStyle = "#7ed0ed";

    ctx.fillRect(
        x + size * 0.35,
        y - size,
        size * 0.35,
        size * 0.35
    );
}


function drawTree(x, y, size) {

    if (size < 4) return;

    ctx.fillStyle = "#70452b";

    ctx.fillRect(
        x - size * 0.12,
        y - size * 1.5,
        size * 0.24,
        size * 1.5
    );


    ctx.fillStyle = "#287a3e";

    ctx.beginPath();

    ctx.arc(
        x,
        y - size * 1.7,
        size * 0.7,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// =========================
// العملات
// =========================

function drawCoins() {

    coins.forEach(coin => {

        if (coin.collected) return;

        const p =
            project(
                coin.lane,
                coin.z
            );

        if (!p) return;

        const radius =
            11 * p.scale;


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


        ctx.strokeStyle = "#c89400";
        ctx.lineWidth = 3;

        ctx.stroke();
    });
}


// =========================
// العقبات
// =========================

function drawObstacles() {

    obstacles.forEach(obstacle => {

        const p =
            project(
                obstacle.lane,
                obstacle.z
            );

        if (!p) return;

        const width =
            30 * p.scale;

        const height =
            28 * p.scale;


        ctx.fillStyle = "#ef7e22";

        ctx.fillRect(
            p.x - width,
            p.y - height,
            width * 2,
            height
        );


        ctx.strokeStyle = "#ffffff";

        ctx.lineWidth =
            Math.max(
                2,
                3 * p.scale
            );


        ctx.beginPath();

        ctx.moveTo(
            p.x - width,
            p.y - height
        );

        ctx.lineTo(
            p.x,
            p.y
        );


        ctx.moveTo(
            p.x,
            p.y - height
        );

        ctx.lineTo(
            p.x + width,
            p.y
        );

        ctx.stroke();
    });
}


// =========================
// اللاعب
// =========================

function drawPlayer() {

    // انتقال بين المسارات

    player.lane +=
        (
            player.targetLane -
            player.lane
        ) * 0.15;


    // حركة الجري

    player.runTime += 0.25;


    // القفز

    if (player.jumping) {

        player.jumpY +=
            player.jumpVelocity;

        player.jumpVelocity -= 0.8;


        if (player.jumpY <= 0) {

            player.jumpY = 0;

            player.jumpVelocity = 0;

            player.jumping = false;
        }
    }


    const laneOffset =
        (player.lane - 1) *
        W * 0.16;


    const x =
        W / 2 +
        laneOffset;


    const groundY =
        H - 105;


    const y =
        groundY -
        player.jumpY;


    const legMove =
        Math.sin(
            player.runTime
        ) * 18;


    // الظل

    ctx.beginPath();

    ctx.ellipse(
        x,
        groundY + 8,
        38,
        10,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "rgba(0,0,0,0.3)";

    ctx.fill();


    // الرجل اليسرى

    ctx.strokeStyle = "#172536";

    ctx.lineWidth = 15;

    ctx.lineCap = "round";

    ctx.beginPath();

    ctx.moveTo(
        x - 10,
        y - 30
    );

    ctx.lineTo(
        x - 18,
        y + legMove
    );

    ctx.stroke();


    // الرجل اليمنى

    ctx.beginPath();

    ctx.moveTo(
        x + 10,
        y - 30
    );

    ctx.lineTo(
        x + 18,
        y - legMove
    );

    ctx.stroke();


    // الجسم

    ctx.fillStyle = "#2670ad";

    ctx.beginPath();

    ctx.roundRect(
        x - 28,
        y - 105,
        56,
        75,
        12
    );

    ctx.fill();


    // الحقيبة

    ctx.fillStyle = "#173b5d";

    ctx.fillRect(
        x - 22,
        y - 98,
        44,
        50
    );


    // الرأس

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


    // الشعر من الخلف

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


    // الذراع اليسرى

    ctx.strokeStyle = "#2670ad";

    ctx.lineWidth = 13;

    ctx.beginPath();

    ctx.moveTo(
        x - 25,
        y - 90
    );

    ctx.lineTo(
        x - 48,
        y - 50 + legMove
    );

    ctx.stroke();


    // الذراع اليمنى

    ctx.beginPath();

    ctx.moveTo(
        x + 25,
        y - 90
    );

    ctx.lineTo(
        x + 48,
        y - 50 - legMove
    );

    ctx.stroke();
}


// =========================
// المطارد
// =========================

function drawChaser() {

    const x = W / 2;

    const y = H - 28;


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


// =========================
// الاصطدام
// =========================

function checkCollisions() {

    const currentLane =
        Math.round(player.lane);


    obstacles.forEach(obstacle => {

        if (
            obstacle.lane === currentLane &&
            Math.abs(
                obstacle.z - playerZ
            ) < 3 &&
            player.jumpY < 45
        ) {

            alert("اصطدمت بالعقبة!");

            location.reload();
        }
    });


    coins.forEach(coin => {

        if (coin.collected) return;


        if (
            coin.lane === currentLane &&
            Math.abs(
                coin.z - playerZ
            ) < 4
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


// =========================
// نهاية المرحلة
// =========================

function checkLevelEnd() {

    if (playerZ >= levelLength) {

        alert(
            "🎉 مبروك! أكملت المرحلة الأولى!"
        );

        playerZ = 0;

        score = 0;

        coins.forEach(
            coin => coin.collected = false
        );

        const stage =
            document.getElementById("stage");

        if (stage) {
            stage.textContent =
                "المرحلة 2";
        }
    }
}


// =========================
// تشغيل اللعبة
// =========================

function gameLoop() {

    ctx.clearRect(
        0,
        0,
        W,
        H
    );


    // الشخصية تتحرك للأمام

    playerZ += gameSpeed;


    drawBackground();

    drawEnvironment();

    drawRoad();

    drawObstacles();

    drawCoins();

    drawChaser();

    drawPlayer();


    checkCollisions();

    checkLevelEnd();


    requestAnimationFrame(
        gameLoop
    );
}


gameLoop();
