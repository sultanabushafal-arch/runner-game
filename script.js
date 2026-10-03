const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resize();
window.addEventListener("resize", resize);

function draw() {
    const W = canvas.width;
    const H = canvas.height;

    // السماء
    ctx.fillStyle = "#62c8f5";
    ctx.fillRect(0, 0, W, H * 0.45);

    // الأرض
    ctx.fillStyle = "#68a94f";
    ctx.fillRect(0, H * 0.45, W, H * 0.55);

    // الشارع
    ctx.fillStyle = "#383838";

    ctx.beginPath();
    ctx.moveTo(W * 0.43, H * 0.45);
    ctx.lineTo(W * 0.57, H * 0.45);
    ctx.lineTo(W * 0.90, H);
    ctx.lineTo(W * 0.10, H);
    ctx.closePath();
    ctx.fill();

    // حواف الشارع
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(W * 0.43, H * 0.45);
    ctx.lineTo(W * 0.10, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(W * 0.57, H * 0.45);
    ctx.lineTo(W * 0.90, H);
    ctx.stroke();

    // خط منتصف الشارع
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(W * 0.50, H * 0.45);
    ctx.lineTo(W * 0.50, H);
    ctx.stroke();

    // ظل الشخصية
    ctx.fillStyle = "rgba(0,0,0,0.3)";

    ctx.beginPath();
    ctx.ellipse(
        W / 2,
        H - 85,
        35,
        10,
        0,
        0,
        Math.PI * 2
    );
    ctx.fill();

    // الرجل اليسرى
    ctx.strokeStyle = "#17202a";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(W / 2 - 10, H - 125);
    ctx.lineTo(W / 2 - 20, H - 75);
    ctx.stroke();

    // الرجل اليمنى
    ctx.beginPath();
    ctx.moveTo(W / 2 + 10, H - 125);
    ctx.lineTo(W / 2 + 20, H - 75);
    ctx.stroke();

    // الجسم
    ctx.fillStyle = "#2468a6";

    ctx.beginPath();
    ctx.roundRect(
        W / 2 - 27,
        H - 200,
        54,
        75,
        12
    );
    ctx.fill();

    // الرأس
    ctx.beginPath();
    ctx.arc(
        W / 2,
        H - 225,
        27,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = "#c98f68";
    ctx.fill();

    // الشعر من الخلف
    ctx.beginPath();
    ctx.arc(
        W / 2,
        H - 235,
        29,
        Math.PI,
        Math.PI * 2
    );
    ctx.fillStyle = "#202020";
    ctx.fill();

    // حقيبة الظهر
    ctx.fillStyle = "#173b5d";

    ctx.beginPath();
    ctx.roundRect(
        W / 2 - 21,
        H - 190,
        42,
        50,
        8
    );
    ctx.fill();

    // الذراع اليسرى
    ctx.strokeStyle = "#2468a6";
    ctx.lineWidth = 13;

    ctx.beginPath();
    ctx.moveTo(W / 2 - 25, H - 185);
    ctx.lineTo(W / 2 - 50, H - 140);
    ctx.stroke();

    // الذراع اليمنى
    ctx.beginPath();
    ctx.moveTo(W / 2 + 25, H - 185);
    ctx.lineTo(W / 2 + 50, H - 140);
    ctx.stroke();
}

function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
