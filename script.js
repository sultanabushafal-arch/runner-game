const player = document.getElementById("player");
const chaser = document.getElementById("chaser");

let lane = 1;
let jumping = false;

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
    if (jumping) return;

    jumping = true;

    player.style.bottom = "250px";

    setTimeout(() => {
        player.style.bottom = "130px";
        jumping = false;
    }, 500);
}

/* أزرار الجوال */
document.getElementById("left").addEventListener("click", moveLeft);
document.getElementById("right").addEventListener("click", moveRight);
document.getElementById("jump").addEventListener("click", jump);

/* الكيبورد */
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
        moveLeft();
    }

    if (event.key === "ArrowRight") {
        moveRight();
    }

    if (event.key === "ArrowUp" || event.key === " ") {
        jump();
    }
});

/* حركة بسيطة للمطارد */
let chaserPosition = 45;

function moveChaser() {
    chaserPosition += 0.03;

    if (chaserPosition > 55) {
        chaserPosition = 45;
    }

    chaser.style.bottom = chaserPosition + "px";

    requestAnimationFrame(moveChaser);
}

updatePlayer();
moveChaser();
