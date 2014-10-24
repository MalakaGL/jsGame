// colors to be used
var rowColors = ["#FF1C0A", "#FFFD0A", "#00A308", "#0008DB", "#EB0093"];
var paddleColor = "#FFFFFF";
var ballColor = "#FFFFFF";
var backColor = "#000000";          // background color of the canvas
// dimensions
var x, y;                           // initial position of the ball
var dx = 1.5, dy = -4;              // speed of the ball movement (displacement per drawing)
var ctx;                            // content of the canvas
var WIDTH = 512, HEIGHT = 480;      // dimensions of the canvas object
var ballRadius = 10;
var paddleX = WIDTH / 2;            //position of the paddle
var paddleH = 10, paddleW = 75;     // dimensions of paddle
var canvasMinX = 0, canvasMaxX;     // horizontal range of canvas/arena
var intervalId;                     // interval at which the canvas refresh
var bricks;                         // variable to keep track of bricks array
var numRows = 5, numCols = 10;      // brick array dimensions
var brickWidth, brickHeight = 15;   // dimensions of a brick width to be set on the fly
var PADDING = 1;                    // space between two bricks
var score = 0;
var started = 0;                    // boolean to store playing or paused
var level = 1;                      // variable to hold the level of playing

// Handle keyboard controls
var keysDown = {};                  // array of keys pressed at the moment

/*
 method to identify keys pressed.
 arg is an event "keysdown"
 output is adding the key code of the pressed key to the keysDown array
 */
addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

/*
 method to identify keys released
 arg is an event "keysup"
 output is deleting released key from keysDown array
 */
addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
}, false);

/*
 method to identify mouse movement
 arg is an event "mousemove"
 output is changing the location of the paddle following the movement
 */
addEventListener("mousemove", function (evt) {
    // if mouse is within the width of the canvas
    if (evt.clientX > canvasMinX && evt.clientX < canvasMaxX) {
        // calculate the relative position of the paddle
        paddleX = Math.max(evt.clientX - canvasMinX - (paddleW / 2), 0);
        paddleX = Math.min(WIDTH - paddleW, paddleX);
    }
}, false);

/*
 method to respond start button.
 just toggle the boolean and recall the draw function to call once per 10ms
 */
var start = function () {
    started = 1;
    clearInterval(intervalId);
    intervalId = setInterval(draw, 10);
}

/*
 method to pause the game.
 toggle the boolean and refresh the drawing function
 */
var stop = function () {
    started = 0;
    clearInterval(intervalId);
    intervalId = setInterval(draw, 10);
}

/*
 restart the game.
 */
var restart = function () {
    started = 0;
    score = 0;
    clearInterval(intervalId);
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    init();
    initBricks();
}

/*
 method to initialize the game
 */
var init = function () {
    // get the canvas object
    var canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    // set canvas width and height to get fine resolution
    canvas.width = 512;
    canvas.height = 480;
    brickWidth = (WIDTH / numCols) - 1;
    canvasMinX = canvas.offsetLeft;
    canvasMaxX = canvasMinX + WIDTH;
    // set initial position of the paddle
    x = paddleX + paddleW / 2;
    y = HEIGHT - paddleH - ballRadius;
    // call draw function once per 10ms
    intervalId = setInterval(draw, 10);
}

/*
 method to draw a circle
 */
var circle = function (x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
}

/*
 method to draw a rectangle
 */
var rect = function (x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.closePath();
    ctx.fill();
}

/*
 clear the rectangular object drawings
 */
var clear = function () {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    rect(0, 0, WIDTH, HEIGHT);
}

/*
 method to initialize brick array
 */
var initBricks = function () {
    bricks = new Array(numRows);
    for (i = 0; i < numRows; i++) {
        bricks[i] = new Array(numCols);
        for (j = 0; j < numCols; j++) {
            bricks[i][j] = 1;
        }
    }
}

/*
 method to draw bricks
 */
var drawBricks = function () {
    for (i = 0; i < numRows; i++) {
        // choose a color from color array
        ctx.fillStyle = rowColors[i % 5];
        for (j = 0; j < numCols; j++) {
            if (bricks[i][j] == 1) {
                rect((j * (brickWidth + PADDING)) + PADDING,
                    (i * (brickHeight + PADDING)) + PADDING,
                    brickWidth, brickHeight);
            }
        }
    }
}

/*
 method to draw the game arena
 */
var draw = function () {
    ctx.fillStyle = backColor;                          // set color of background
    clear();                                            // clear all in canvas
    ctx.fillStyle = ballColor;                          // choose ball color
    circle(x, y, ballRadius);                           // draw a ball in its current position

    // if arrow keys are pressed update position of paddle
    if (39 in keysDown && paddleX + paddleW < WIDTH)
        paddleX += 5;
    else if (37 in keysDown && paddleX > 0)
        paddleX -= 5;
    ctx.fillStyle = paddleColor;                        // choose paddle color
    rect(paddleX, HEIGHT - paddleH, paddleW, paddleH);  // draw paddle

    drawBricks();
    updateScore();

    // detect collisions
    var rowHeight = brickHeight + PADDING;
    var colWidth = brickWidth + PADDING;
    var row = Math.floor(y / rowHeight);
    var col = Math.floor(x / colWidth);

    //reverse the ball and mark the brick as broken
    if (y < numRows * rowHeight && row >= 0 && col >= 0 && bricks[row][col] == 1) {
        dy = -dy;
        bricks[row][col] = 0;
        score += ((numRows - row) * 10);
        // if all bricks broken
        if (finished()) {
            level += 1;
            won();
            clearInterval(intervalId);
            started = 0;
            dx += dx;
            dy += dy;
            if (numRows < 20)
                numRows += 5;
        }
    }

    // if the ball hit a side wall
    if (x + dx + ballRadius > WIDTH || x + dx - ballRadius < 0)
        dx = -dx;
    // if the ball hit the ceiling
    if (y + dy - ballRadius < 0)
        dy = -dy;
    // if the ball hit the floor
    else if (y + dy + ballRadius > HEIGHT - paddleH) {
        // if the paddle is at the collision place(if the ball hit the paddle)
        if (x > paddleX && x < paddleX + paddleW) {
            //move the ball differently based on where it hit the paddle
            dx = 8 * ((x - (paddleX + paddleW / 2)) / paddleW);
            dy = -dy;
        }
        // if the ball hit the floor directly
        else if (y + dy + ballRadius > HEIGHT) {
            // stop the game. it is over.
            clearInterval(intervalId);
            started = 0;
        }
    }
    // update/move ball only when player is playing
    if (started) {
        x += dx;
        y += dy;
    }
}

/*
 method to check all the tiles broken or not.
 */
var finished = function () {
    // just check the upper most row of tiles
    for (var i = 0; i < numCols; i++) {
        if (bricks[0][i] != 0) {
            return false;
        }
    }
    return true;
}

/*
 method to update score card
 */
var updateScore = function () {
    // get the canvas used to create score board
    var canvas = document.getElementById("score");
    canvas.width = 512;
    canvas.height = 30;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 500, 30);
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Score: " + score, 10, 0);
    ctx.fillText("Level: " + level, 250, 0);
}

/*
 method to handle a wining of a level
 */
var won = function () {
    // get the canvas
    var canvas = document.getElementById('canvas');

    // load congratulations image
    var img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0, 500, 500);
    }
    img.src = 'download.jpg';
}

// method to draw and show game board on the page
init();
initBricks();