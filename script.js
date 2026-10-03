const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stageText = document.getElementById("stage");
const scoreText = document.getElementById("score");

let width;
let height;

function resize() {
    width = canvas.width = window.innerWidth * devicePixelRatio;
    height = canvas.height = window.innerHeight * devicePixelRatio;

    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";

    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
}

window.addEventListener("resize", resize);
resize();

/* اللاعب */
let playerLane = 1;
let playerX = 0;
let playerJump = 0;
let jumping = false;

/* اللعبة */
let score = 0;
let gameSpeed = 0.012;
let roadOffset = 0;
let gameRunning = true;

/* الأشياء القادمة من بعيد */
let objects = [];

const lanes = [-1, 0, 1];

/* تحريك اللاعب */
function moveLeft() {
    if (playerLane > 0) {
        playerLane--;
    }
}

function moveRight() {
    if (playerLane < 2) {
        playerLane++;
    }
}

function jump() {
    if (jumping) return;

    jumping = true;

    let start = performance.now();

    function jumpAnimation(time) {
        let progress = (time - start) / 650;

        if (progress >= 1) {
            playerJump = 0;
            jumping = false;
            return;
        }

        playerJump = Math.sin(progress * Math.PI) * 130;

        requestAnimationFrame(jumpAnimation);
    }

    requestAnimationFrame(jumpAnimation);
}

/* الكيبورد */
document.addEventListener("keydown", function (e) {

    if (e.key === "ArrowLeft") {
        moveLeft();
    }

    if (e.key === "ArrowRight") {
        moveRight();
    }

    if (e.key === "ArrowUp" || e.key === " ") {
        jump();
    }

});

/* الجوال */
document.getElementById("left").addEventListener("click", moveLeft);
document.getElementById("right").addEventListener("click", moveRight);
document.getElementById("jump").addEventListener("click", jump);


/* تحويل المسار إلى مكان على الشاشة */
function laneX(lane, depth) {

    const center = window.innerWidth / 2;

    const roadWidth = 70 + depth * 500;

    return center + lane * (roadWidth / 3);
}


/* رسم الطريق */
function drawRoad() {

    const center = window.innerWidth / 2;

    const horizon = window.innerHeight * 0.35;

    /* الأرض */
    ctx.fillStyle = "#72a84d";
    ctx.fillRect(0, horizon, window.innerWidth, window.innerHeight);

    /* الطريق */
    ctx.beginPath();

    ctx.moveTo(center - 55, horizon);
    ctx.lineTo(center + 55, horizon);

    ctx.lineTo(window.innerWidth, window.innerHeight);
    ctx.lineTo(0, window.innerHeight);

    ctx.closePath();

    ctx.fillStyle = "#3d3d3d";
    ctx.fill();

    /* خطوط المسارات */
    for (let lane = -1; lane <= 1; lane += 2) {

        ctx.beginPath();

        ctx.moveTo(center + lane * 18, horizon);

        ctx.lineTo(
            center + lane * window.innerWidth * 0.32,
            window.innerHeight
        );

        ctx.strokeStyle = "white";
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    /* خطوط الطريق المتحركة */
    for (let i = 0; i < 12; i++) {

        let depth = ((i / 12) + roadOffset) % 1;

        let y = horizon + Math.pow(depth, 2) *
            (window.innerHeight - horizon);

        let lineWidth = 20 + depth * 80;

        ctx.fillStyle = "white";

        ctx.fillRect(
            center - lineWidth / 2,
            y,
            lineWidth,
            5 + depth * 8
        );
    }
}


/* رسم اللاعب */
function drawPlayer() {

    const xPositions = [
        window.innerWidth * 0.35,
        window.innerWidth * 0.50,
        window.innerWidth * 0.65
    ];

    const x = xPositions[playerLane];

    const y = window.innerHeight - 150 - playerJump;

    /* ظل */
    ctx.beginPath();

    ctx.ellipse(
        x,
        window.innerHeight - 115,
        35,
        12,
        0,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fill();

    /* شخصية مؤقتة */
    ctx.font = "75px Arial";
    ctx.textAlign = "center";

    ctx.fillText("🏃", x, y);
}


/* رسم المطارد */
function drawChaser() {

    const x = window.innerWidth / 2;

    const y = window.innerHeight - 45;

    ctx.font = "55px Arial";
    ctx.textAlign = "center";

    ctx.fillText("👤", x, y);
}


/* إنشاء عملة أو عقبة */
function createObject() {

    const lane = Math.floor(Math.random() * 3);

    const type = Math.random() < 0.65
        ? "coin"
        : "obstacle";

    objects.push({
        lane: lane,
        depth: 0,
        type: type
    });
}


/* رسم الأشياء */
function drawObjects() {

    for (let i = objects.length - 1; i >= 0; i--) {

        const obj = objects[i];

        obj.depth += gameSpeed;

        const depth = obj.depth;

        const horizon = window.innerHeight * 0.35;

        const y =
            horizon +
            Math.pow(depth, 2) *
            (window.innerHeight - horizon);

        const xPositions = [
            window.innerWidth * 0.35,
            window.innerWidth * 0.50,
            window.innerWidth * 0.65
        ];

        const x = xPositions[obj.lane];

        const size = 15 + depth * 70;

        ctx.font = size + "px Arial";
        ctx.textAlign = "center";

        if (obj.type === "coin") {
            ctx.fillText("🪙", x, y);
        } else {
            ctx.fillText("🚧", x, y);
        }

        /* جمع العملة */
        if (
            obj.type === "coin" &&
            depth > 0.85 &&
            obj.lane === playerLane
        ) {

            score++;

            scoreText.textContent = "🪙 " + score;

            objects.splice(i, 1);

            continue;
        }

        /* اصطدام */
        if (
            obj.type === "obstacle" &&
            depth > 0.87 &&
            obj.lane === playerLane &&
            playerJump < 50
        ) {

            gameOver();

            return;
        }

        /* إزالة الشيء بعد تجاوزه */
        if (depth > 1.1) {
            objects.splice(i, 1);
        }
    }
}


/* نهاية اللعبة */
function gameOver() {

    gameRunning = false;

    setTimeout(() => {

        alert(
            "انتهت الجولة!\n\nالعملات: " +
            score
        );

        location.reload();

    }, 100);
}


/* الحلقة الرئيسية */
let lastObject = 0;

function gameLoop(time) {

    if (!gameRunning) return;

    ctx.clearRect(
        0,
        0,
        window.innerWidth,
        window.innerHeight
    );

    drawRoad();

    roadOffset += gameSpeed;

    if (roadOffset > 1) {
        roadOffset = 0;
    }

    if (time - lastObject > 900) {

        createObject();

        lastObject = time;
    }

    drawObjects();

    drawPlayer();

    drawChaser();

    requestAnimationFrame(gameLoop);
}

gameLoop(0);
