const player = document.getElementById("player");
const chaser = document.getElementById("chaser");
const obstacles = document.getElementById("obstacles");
const coins = document.getElementById("coins");
const scoreElement = document.getElementById("score");

let lane = 1;
let score = 0;
let jumping = false;
let gameRunning = true;

const lanes = [35, 50, 65];

function updatePlayer() {
    player.style.left = lanes[lane] + "%";
}

function moveLeft() {
    if (lane > 0) {
        lane--;
        updatePlayer();
    }
}

function moveRight() {
    if (lane < 2) {
        lane++;
        updatePlayer();
    }
}

function jump() {
    if (jumping || !gameRunning) return;

    jumping = true;
    player.style.bottom = "260px";

    setTimeout(() => {
        player.style.bottom = "125px";
        jumping = false;
    }, 550);
}

/* أزرار الجوال */
document.getElementById("left").addEventListener("click", moveLeft);
document.getElementById("right").addEventListener("click", moveRight);
document.getElementById("jump").addEventListener("click", jump);

/* الكيبورد */
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveLeft();
    if (event.key === "ArrowRight") moveRight();

    if (event.key === "ArrowUp" || event.key === " ") {
        jump();
    }
});

/* إنشاء عملة */
function createCoin() {

    const coin = document.createElement("div");

    coin.className = "coin";
    coin.textContent = "🪙";

    const randomLane = Math.floor(Math.random() * 3);

    coin.dataset.lane = randomLane;

    coin.style.left = lanes[randomLane] + "%";
    coin.style.top = "-50px";

    coins.appendChild(coin);

    moveObject(coin, "coin");
}

/* إنشاء عقبة */
function createObstacle() {

    const obstacle = document.createElement("div");

    obstacle.className = "obstacle";
    obstacle.textContent = "🚧";

    const randomLane = Math.floor(Math.random() * 3);

    obstacle.dataset.lane = randomLane;

    obstacle.style.left = lanes[randomLane] + "%";
    obstacle.style.top = "-60px";

    obstacles.appendChild(obstacle);

    moveObject(obstacle, "obstacle");
}

/* حركة الأشياء من بعيد نحو اللاعب */
function moveObject(object, type) {

    let position = -60;
    let size = 0.4;

    const speed = 4;

    function animate() {

        if (!gameRunning) return;

        position += speed;
        size += 0.025;

        object.style.top = position + "px";
        object.style.transform =
            `translateX(-50%) scale(${size})`;

        /* جمع العملة */
        if (
            type === "coin" &&
            position > window.innerHeight - 280 &&
            position < window.innerHeight - 100 &&
            Number(object.dataset.lane) === lane
        ) {
            score++;
            scoreElement.textContent = "🪙 " + score;
            object.remove();
            return;
        }

        /* اصطدام بالعقبة */
        if (
            type === "obstacle" &&
            position > window.innerHeight - 250 &&
            position < window.innerHeight - 100 &&
            Number(object.dataset.lane) === lane &&
            !jumping
        ) {
            gameOver();
            return;
        }

        if (position < window.innerHeight + 100) {
            requestAnimationFrame(animate);
        } else {
            object.remove();
        }
    }

    animate();
}

/* نهاية اللعبة */
function gameOver() {

    gameRunning = false;

    setTimeout(() => {
        alert("انتهت الجولة! العملات: " + score);
        location.reload();
    }, 100);
}

/* توليد العملات والعقبات */
setInterval(() => {

    if (gameRunning) {
        createCoin();
    }

}, 1300);

setInterval(() => {

    if (gameRunning) {
        createObstacle();
    }

}, 1800);

/* البداية */
updatePlayer();
