//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34 * 1.5;
let birdHeight = 24 * 1.5;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight,
};

//pipes
let pipeArray = [];
let pipeWidth = 75;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//egg
let eggArray = [];
let eggWidth = 30;
let eggHeight = 30;
let eggX = boardWidth;
let eggY = 0;

let eggImg;

//physics
let velocityX = -2;
let velocityY = 0;
let gravity = 0.3;

let originalVelocityX = velocityX;

//end screen
let gameOver = false;
let score = 0;
let highScore = 0; 

//start menu
let playButtonImg;
let instructionsImg;
let gameStarted = false;
let gameMusic;

//loading
window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    birdImg = new Image();
    birdImg.src = "./bird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./top.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottom.png";

    eggImg = new Image();
    eggImg.src = "./egg.png";

    playButtonImg = new Image();
    playButtonImg.src = "./play.png";

    titleImg = new Image();
    titleImg.src = "./title.png";

    playButtonImg.onload = function () {
        context.drawImage(titleImg, boardWidth / 2 - titleImg.width / 2, boardHeight / 4 - playButtonImg.height / 2  - 20);
        text = "Press Space to";
        context.fillStyle = "white";
        context.font = "30px sans-serif";

        const textWidth = context.measureText(text).width;
        const centerX = boardWidth / 2;
        const textX = centerX - textWidth / 2;

        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                context.fillText(text, textX + i,  boardHeight / 2 + 80 + j);
            }
        }

        context.fillStyle = "black";
        context.fillText(text, textX,  boardHeight / 2 + 80);
        context.drawImage(playButtonImg, boardWidth / 2 - playButtonImg.width / 2, boardHeight / 2 + 120);
    };

    gameMusic = new Audio("background_music.mp3");
    gameMusic.loop = true; 
    gameMusic.volume = 0.5;
    
    document.addEventListener("keydown", startGame);
};

let pipeInterval;
let eggInterval;
let speedInterval;
let resetSpeedInterval;

function startGame(event) {
    if (!gameStarted && (event.code === 'Space' || event.code === 'ArrowUp')) {
        gameStarted = true;
        document.removeEventListener("keydown", startGame);
        document.addEventListener("keydown", birdJump);
        requestAnimationFrame(update);

        if (!pipeInterval) {
            pipeInterval = setInterval(placePipes, 1500);
        }
        if (!eggInterval) {
            eggInterval = setInterval(placeEggs, 3000);
        }
        if (!speedInterval) {
            speedInterval = setInterval(increaseSpeed, 5000);
        }
        if (!resetSpeedInterval) {
            resetSpeedInterval = setInterval(resetSpeed, 15000);
        }
        playJumpSound();
    }
}

function playJumpSound() {
    const jumpSound = document.getElementById("jumpSound");
    if (jumpSound) {
        jumpSound.currentTime = 0; 
        jumpSound.volume = 0.3;
        jumpSound.play();
    }
}

function birdJump(event) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        if (gameOver) {
            initializeGame();
            return; 
        }
        velocityY = -7;
        playJumpSound();
        gameMusic.play();
    }
}

let lastResetTime = 0;
const resetCooldown = 1500; 

function initializeGame() {
    const currentTime = new Date().getTime();

    if (currentTime - lastResetTime >= resetCooldown) {
        gameOver = false;
        bird.y = birdY;
        velocityY = 0;

        if (score > highScore) {
            highScore = score;
        }

        score = 0;
        velocityX = originalVelocityX;

        clearInterval(pipeInterval);
        clearInterval(eggInterval);
        clearInterval(speedInterval);
        clearInterval(resetSpeedInterval);

        pipeInterval = setInterval(placePipes, 1500);
        eggInterval = setInterval(placeEggs, 3000);
        speedInterval = setInterval(increaseSpeed, 5000);
        resetSpeedInterval = setInterval(resetSpeed, 15000);

        pipeArray = [];
        eggArray = [];

        frame = 0;

        lastResetTime = currentTime;

        placePipes();
    }
}


function update() {
    requestAnimationFrame(update);

    if (!gameStarted) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    if (gameOver) {
        context.fillStyle = "rgba(255, 255, 255, 0.7)";
        context.fillRect(20, 150, boardWidth - 40, 200);

        context.fillStyle = "black";
        context.font = "35px sans-serif"; 
        const gameOverText = "GAME OVER";
        const gameOverTextWidth = context.measureText(gameOverText).width;
        context.fillText(gameOverText, boardWidth / 2 - gameOverTextWidth / 2, 200);

        context.font = "25px sans-serif"; 
        context.fillText("Your Score: " + score, boardWidth / 2 - 70, 250);

        if (score > highScore) {
            highScore = score;
            context.fillText("New High Score: " + highScore, boardWidth / 2 - 70, 300);
        } else {
            context.fillText("High Score: " + highScore, boardWidth / 2 - 70, 300);
        }

        drawPlayAgainButton();
    }


    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0);
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5;
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }


    updateEggs();

    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift();
    }

    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
}

function drawHighScore() {
    context.fillStyle = "black";
    context.font = "25px sans-serif";
    context.fillText("High Score: " + highScore, 45, 350);
}

function placePipes() {
    if (gameOver) {
        return;
    }

    pipeArray = [];

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = boardHeight / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false,
    };
    pipeArray.push(bottomPipe);
}

function placeEggs() {
    if (gameOver || Math.random() > 0.1) {
        return; 
    }

    for (let i = 0; i < pipeArray.length; i += 2) {
        let topPipe = pipeArray[i];
        let bottomPipe = pipeArray[i + 1];

        let gapCenterY = topPipe.y + topPipe.height + (bottomPipe.y - (topPipe.y + topPipe.height)) / 2;
        let gapCenterX = topPipe.x + pipeWidth / 2;

        let randomEggY = gapCenterY - eggHeight / 2;
        let randomEggX = gapCenterX - eggWidth / 2;

        let egg = {
            img: eggImg,
            x: randomEggX,
            y: randomEggY,
            width: eggWidth,
            height: eggHeight,
            collected: false,
        };

        eggArray.push(egg);
    }
}

function updateEggs() {
    for (let i = 0; i < eggArray.length; i++) {
        let egg = eggArray[i];
        egg.x += velocityX;
        context.drawImage(egg.img, egg.x, egg.y, egg.width, egg.height);

        if (!egg.collected && detectCollision(bird, egg)) {
            score += 2;
            egg.collected = true;
        }
    }

    eggArray = eggArray.filter((egg) => !egg.collected);
}

function increaseSpeed() {
    velocityX -= 0.3;
}

function resetSpeed() {
    velocityX = originalVelocityX;
}

function detectCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}
