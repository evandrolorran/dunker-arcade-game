// --------------------------------------------------------------------------------------------------------
//                                           GAME BLOCK
// --------------------------------------------------------------------------------------------------------


// Create "Game" object, to hold functions called against the overall game state
var Game = function () {
    // Initialize game variables
    this.paused = false;
    this.gameOn = false;
    this.score = 0;

    // Preload audio samples
    this.deniedSound = new Audio('audio/punch-block.mp3');
    this.dunkSound = new Audio('audio/dunk.m4a');
    this.buzzerSound = new Audio('audio/buzzer.m4a');
    this.countdownSound = new Audio('audio/countdown.m4a');
    this.refereeWhistleSound = new Audio('audio/referee-whistle.m4a');
};

// Initialize Game object
game = new Game();

// Timer Function
function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    var interval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = minutes + ":" + seconds;

        if (minutes == 0 && seconds == 3) {
            game.countdownSound.play();
        }

        if (--timer < 0 && game.gameOn == true) {
            timer = 0;
            game.buzzerSound.play();
            game.gameOn = false;
            allEnemies = [];
            clearInterval(interval);

            document.getElementById('game-over').style.visibility = 'visible';

            player.x = 202;
            player.y = 405;
        }
    }, 1000);
}

// Starts the elements on the game board, including the Timer.
function gameStart() {

    game.gameOn = true;
    game.score = 0;
    document.getElementById("score").innerHTML = game.score;
    document.getElementById('game-over').style.visibility = 'hidden';

    // Calls the function to load the enemies(Hands) on the board/court.
    loadEnemies();

    display = document.querySelector('#time');
    game.refereeWhistleSound.play();

    startTimer(84, display);
}


// --------------------------------------------------------------------------------------------------------
//                                           ENEMY BLOCK
// --------------------------------------------------------------------------------------------------------


// Enemies(Hands) the player must avoid
var Enemy = function (x, y, speed) {

    // The following variables are used to determine the x and y axis and speed of the enemy
    this.x = x;
    this.y = y;
    this.speed = speed;

    // The image of the enemy(Hand) that is added to the court 
    this.sprite = 'images/hand-block.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function (dt) {

    // Multiplies the speed by the dt parameter on the x axis
    this.x += this.speed * dt;

    // Once enemies are off the canvas, they reappear randomly with different speeds
    if (this.x > 510) {
        this.x = -50;
        this.speed = 100 + Math.floor(Math.random() * 300);
    };

    // Checks for collisions between the player and the enemies(hands)
    checkCollision(this);
};

// Renders the enemy into the game
Enemy.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// All enemies are placed in an array
var allEnemies = [];

// Function responsible to check collisions between the player and the enemies(hands)
function checkCollision(enemy) {
    if (player.x < enemy.x + 80 &&
        player.x + 80 > enemy.x &&
        player.y < enemy.y + 60 &&
        60 + player.y > enemy.y) {
        game.deniedSound.play();
        player.x = 202;
        player.y = 405;
    };
}

// // Function responsible to load the enemies(Hands) on the board/court.
function loadEnemies() {

    // Location of the 5 Hands on the court. Two before the basket to make it harder.
    var enemyLocation = [63, 63, 147, 230, 313];

    // For each enemy located on the y axis from 0 on the x axis move at a speed of 300 
    // Until randomly regenerated in the enemy update function above
    enemyLocation.forEach(function (locationY) {
        enemy = new Enemy(0, locationY, 300);
        allEnemies.push(enemy);
    });
}


// --------------------------------------------------------------------------------------------------------
//                                           PLAYER BLOCK
// --------------------------------------------------------------------------------------------------------


// Player class focusing on x and y axis
var Player = function (x, y) {

    // Variables for the player to move along x and y axis 
    this.x = x;
    this.y = y;
    this.lastPosition = 0;

    //The image of the player of horn-girl is added to the playing field 
    this.player = 'images/player-blue-ball.png';
};

// Initialize Player object
// The starting location of the player is located at x=202, y=405
var player = new Player(202, 405);

// Renders the image of the user into the game
Player.prototype.render = function () {
    ctx.drawImage(Resources.get(this.player), this.x, this.y);
};

// Allows the user to use the arrow keys 
// to jump from block to block until reach the basket.
Player.prototype.handleInput = function (keyPress) {

    this.bounceSound = new Audio('audio/bounce.m4a');

    // Controls when the game will star by pressing Space Bar
    if (keyPress == 'spacebar' && game.gameOn == false) {
        gameStart();
    };

    // Enables user on left arrow key to move left on the x axis by 102
    // Prevents the player from going off the court on the left side
    if (keyPress == 'left' && this.x > 0) {
        this.x -= 102;
        this.bounceSound.play();
    };

    // Enables user on right arrow key to move right on the x axis by 102
    // Prevents the player from going off the court on the right side
    if (keyPress == 'right' && this.x < 405) {
        this.x += 102;
        this.bounceSound.play();
    };

    // Enables user on up arrow key to move upwards on the y axis by 83
    if (keyPress == 'up' && this.y > 0) {
        this.y -= 83;
        this.bounceSound.play();
    };

    // Enables user on down arrow key to move downwards on the y axis by 83
    // Prevents the player from going off the court on the bottom
    if (keyPress == 'down' && this.y < 405) {
        this.y += 83;
        this.bounceSound.play();
    };

    // Once the player reaches the basket(Make the Dunk), the user is
    // reset to the starting position after 800 milliseconds / 0.8 second.
    if (this.y < 0) {
        this.player = 'images/player-blue.png';
        game.dunkSound.play();

        if (this.lastPosition != this.y) {
            game.score += 2;
            document.getElementById("score").innerHTML = game.score;
            this.lastPosition = this.y;
        }

        setTimeout(() => {
            this.x = 202;
            this.y = 405;
            this.player = 'images/player-blue-ball.png';
            this.lastPosition = 0;
        }, 800);
    };
};

// This listens for key presses and sends the keys to your
// Player.handleInput() method. 
document.addEventListener('keyup', function (e) {

    let allowedKeys;

    if (!game.gameOn) {
        allowedKeys = {
            32: 'spacebar'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    } else {
        allowedKeys = {
            32: 'spacebar',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };
        player.handleInput(allowedKeys[e.keyCode]);
    }
});




