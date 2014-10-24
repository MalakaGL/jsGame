var ballRadius = 10;
var rowColors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
var paddleColor = "#FFFFFF";
var ballColor = "#FFFFFF";
var backColor = "#000000";
var x;
var y;
var dx = 1.5;
var dy = -4;
var ctx;
var WIDTH;
var HEIGHT;
var paddleX;
var paddleH = 10;
var paddleW = 75;
var canvasMinX = 0;
var canvasMaxX = 0;
var intervalId = 0;
var bricks;
var numRows = 5;
var numCols = 10;
var brickWidth;
var brickHeight = 15;
var PADDING = 1;
var score = 0;
var started = 0;
var level = 1;

// Handle keyboard controls
var keysDown = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

addEventListener("mousemove", function(evt) {
    if (evt.clientX > canvasMinX && evt.clientX < canvasMaxX) {
        paddleX = Math.max(evt.clientX - canvasMinX - (paddleW/2), 0);
        paddleX = Math.min(WIDTH - paddleW, paddleX);
    }}, false);

var start = function(){
    started = 1;
    clearInterval(intervalId);
    intervalId = setInterval(draw, 10);
}

var stop = function(){
    started = 0;
    clearInterval(intervalId);
    intervalId = setInterval(draw, 10);
}

var restart = function(){
    started = 0;
    score = 0;
    clearInterval(intervalId);
    ctx.clearRect(0,0,WIDTH,HEIGHT);
    init();
    initBricks();
}

var init = function() {
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = 512;
    canvas.height = 480;
    WIDTH = 500;
    HEIGHT = 480;
    paddleX = WIDTH / 2;
    brickWidth = (WIDTH/numCols) - 1;
    canvasMinX = canvas.offsetLeft;
    canvasMaxX = canvasMinX + WIDTH;
    x = paddleX + paddleW / 2;
    y = HEIGHT - paddleH - ballRadius;
    intervalId = setInterval(draw, 10);
}

var circle = function (x,y,r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

var rect = function(x,y,w,h) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
}

var clear = function() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    rect(0,0,WIDTH,HEIGHT);
}

var initBricks = function() {
    bricks = new Array(numRows);
    for (i=0; i < numRows; i++) {
        bricks[i] = new Array(numCols);
        for (j=0; j < numCols; j++) {
            bricks[i][j] = 1;
        }
    }
}

var drawBricks = function() {
    for (i=0; i < numRows; i++) {
        ctx.fillStyle = rowColors[i%5];
        for (j=0; j < numCols; j++) {
            if (bricks[i][j] == 1) {
                rect((j * (brickWidth + PADDING)) + PADDING,
                    (i * (brickHeight + PADDING)) + PADDING,
                    brickWidth, brickHeight);
            }
        }
    }
}

var draw = function() {
    ctx.fillStyle = backColor;
    clear();
    ctx.fillStyle = ballColor;
    circle(x, y, ballRadius);

    if (39 in keysDown && paddleX + paddleW < WIDTH)
        paddleX += 5;
    else if (37 in keysDown && paddleX > 0)
        paddleX -= 5;
    ctx.fillStyle = paddleColor;
    rect(paddleX, HEIGHT-paddleH, paddleW, paddleH);

    drawBricks();
    updateScore();

    var rowHeight = brickHeight + PADDING;
    var colWidth = brickWidth + PADDING;
    var row = Math.floor(y/rowHeight);
    var col = Math.floor(x/colWidth);

    //reverse the ball and mark the brick as broken
    if ( y < numRows * rowHeight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
        dy = -dy;
        bricks[row][col] = 0;
        score += ((numRows - row)*10);
        if(finished()){
            level += 1;
            won();
            clearInterval(intervalId);
            started = 0;
            dx += dx;
            dy += dy;
            if(numRows < 20)
                numRows += 5;
        }
    }

    if (x + dx + ballRadius > WIDTH || x + dx - ballRadius < 0)
        dx = -dx;

    if (y + dy - ballRadius < 0)
        dy = -dy;
    else if (y + dy + ballRadius > HEIGHT - paddleH) {
        if (x > paddleX && x < paddleX + paddleW) {
            //move the ball differently based on where it hit the paddle
            dx = 8 * ((x-(paddleX+paddleW/2))/paddleW);
            dy = -dy;
        }
        else if (y + dy + ballRadius > HEIGHT) {
            clearInterval(intervalId);
            started = 0;
        }
    }
    if(started){
        x += dx;
        y += dy;
    }
}

var finished = function(){
    for(var i = 0; i < numCols ; i++){
        if(bricks[0][i] != 0){
            return false;
        }
    }
    return true;
}

var updateScore = function(){
    var canvas = document.getElementById("score");
    canvas.width=500;
    canvas.height=30;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0,0, 500,30);
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 10, 0);
    ctx.fillText("Level: " + level, 250, 0);
}

var won = function(){
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    // load image from data url
    var img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0, 500, 500);
    }
    img.src = 'download.jpg';
}

init();
initBricks();