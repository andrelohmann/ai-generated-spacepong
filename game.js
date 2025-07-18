
document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Game constants
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 10;
    const BALL_SIZE = 15;
    const INVADER_WIDTH = 40;
    const INVADER_HEIGHT = 30;
    const INVADER_ROWS = 3;
    const INVADER_COLS = 5;
    const INVADER_SPACING = 20;

    // Game variables
    let player1 = { x: canvas.width/2 - PADDLE_WIDTH/2, y: 50, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 };
    let player2 = { x: canvas.width/2 - PADDLE_WIDTH/2, y: canvas.height - 50 - PADDLE_HEIGHT, width: PADDLE_WIDTH, height: PADDLE_HEIGHT, score: 0 };
    let ball = { x: canvas.width/2, y: canvas.height/2, size: BALL_SIZE, vx: 3, vy: 3 };
    let invaders = [];
    let invaderBullets = [];
    let player1Health = 3;
    let player2Health = 3;
    let gameOver = false;
    let winner = null;
    let invaderDirection = 1; // 1 for right, -1 for left
    let invaderMoveTimer = 0;
    let invaderMoveInterval = 30; // frames between movements
    let gameOverTimer = 0;
    const GAME_OVER_DURATION = 120; // frames to show game over before restarting
    let stars = [];

    // Initialize invaders
    function initInvaders() {
        invaders = [];
        for (let row = 0; row < INVADER_ROWS; row++) {
            for (let col = 0; col < INVADER_COLS; col++) {
                invaders.push({
                    x: canvas.width/2 - (INVADER_COLS * (INVADER_WIDTH + INVADER_SPACING))/2 +
                        col * (INVADER_WIDTH + INVADER_SPACING),
                    y: canvas.height/2 - (INVADER_ROWS * (INVADER_HEIGHT + INVADER_SPACING))/2 +
                        row * (INVADER_HEIGHT + INVADER_SPACING),
                    width: INVADER_WIDTH,
                    height: INVADER_HEIGHT,
                    color: getInvaderColor(row)
                });
            }
        }
        initStars();
    }

    function initStars() {
        stars = [];
        const starCount = 50;
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1
            });
        }
    }

    function getInvaderColor(row) {
        switch(row) {
            case 0: return '#00FF00'; // Green
            case 1: return '#00FFFF'; // Cyan
            case 2: return '#FF00FF'; // Magenta
            default: return '#FFFFFF';
        }
    }

    // Draw game objects
    function drawPaddle(paddle) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    function drawBall() {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
    }

    function drawInvader(invader) {
        ctx.fillStyle = invader.color;
        ctx.fillRect(invader.x, invader.y, invader.width, invader.height);

        // Draw invader body
        ctx.fillStyle = '#000000';
        ctx.fillRect(invader.x + 5, invader.y + 5, invader.width - 10, invader.height - 10);

        // Draw invader eyes
        ctx.fillStyle = invader.color;
        ctx.fillRect(invader.x + 10, invader.y + 10, 5, 5);
        ctx.fillRect(invader.x + invader.width - 15, invader.y + 10, 5, 5);

        // Draw invader antenna
        ctx.fillRect(invader.x + invader.width/2 - 2.5, invader.y, 5, 5);
    }

    function drawInvaderBullet(bullet) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(bullet.x, bullet.y, 3, 8);
    }

    function drawStars() {
        ctx.fillStyle = '#FFFFFF';
        stars.forEach(star => {
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    function drawGameInfo() {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';

        // Player scores
        ctx.fillText('Player 1 Score: ' + player1.score, 20, 30);
        ctx.fillText('Player 2 Score: ' + player2.score, canvas.width - 200, 30);
        ctx.fillText('Player 1 Health: ' + player1Health, 20, 60);
        ctx.fillText('Player 2 Health: ' + player2Health, canvas.width - 200, 60);

        // Game over message
        if (gameOver) {
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '40px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(winner + ' Wins!', canvas.width/2, canvas.height/2 - 50);
            ctx.font = '20px Arial';
            ctx.fillText('Game will restart in a few seconds...', canvas.width/2, canvas.height/2 + 20);
            ctx.restore();
        }
    }

    // Update game objects
    function updatePaddle(paddle, leftKey, rightKey) {
        if (leftKey) {
            paddle.x -= 5;
            if (paddle.x < 0) paddle.x = 0;
        }
        if (rightKey) {
            paddle.x += 5;
            if (paddle.x > canvas.width - paddle.width) paddle.x = canvas.width - paddle.width;
        }
    }

    function updateBall() {
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Ball collision with walls
        if (ball.x <= 0 || ball.x >= canvas.width - ball.size) {
            ball.vx = -ball.vx;
        }

        // Ball collision with paddles
        if (ball.y <= player1.y + player1.height &&
            ball.y + ball.size >= player1.y &&
            ball.x + ball.size >= player1.x &&
            ball.x <= player1.x + player1.width) {
            ball.vy = -ball.vy;
            ball.y = player1.y + player1.height; // Prevent sticking
            paddleHitSound.currentTime = 0;
            paddleHitSound.play();
        }

        if (ball.y + ball.size >= player2.y &&
            ball.y <= player2.y + player2.height &&
            ball.x + ball.size >= player2.x &&
            ball.x <= player2.x + player2.width) {
            ball.vy = -ball.vy;
            ball.y = player2.y - ball.size; // Prevent sticking
            paddleHitSound.currentTime = 0;
            paddleHitSound.play();
        }

        // Ball collision with invaders
        for (let i = 0; i < invaders.length; i++) {
            let invader = invaders[i];
            if (ball.x + ball.size > invader.x &&
                ball.x < invader.x + invader.width &&
                ball.y + ball.size > invader.y &&
                ball.y < invader.y + invader.height) {

                // Ball bounces back
                ball.vy = -ball.vy;
                ball.y = invader.y + invader.height; // Prevent sticking

                // Remove invader (it explodes)
                invaders.splice(i, 1);
                i--;

                // Play explosion sound
                if (explosionSound) {
                    explosionSound.currentTime = 0;
                    explosionSound.play();
                }

                // Increase player scores
                player1.score++;
                player2.score++;
            }
        }

        // Ball goes out of bounds (player loses)
        if (ball.y < 0) {
            player2Health--;
            resetBall();
        } else if (ball.y > canvas.height) {
            player1Health--;
            resetBall();
        }

        // Check for game over
        if (player1Health <= 0 || player2Health <= 0) {
            if (!gameOver) { // Play sound only once when game over
                gameOverSound.currentTime = 0;
                gameOverSound.play();
            }
            gameOver = true;
            winner = player1Health > player2Health ? 'Player 1' : 'Player 2';
        }
    }

    function resetBall() {
        ball.x = canvas.width/2;
        ball.y = canvas.height/2;
        ball.vx = 3 * (Math.random() > 0.5 ? 1 : -1);
        ball.vy = 3 * (Math.random() > 0.5 ? 1 : -1);
    }

    function updateInvaders() {
        // Move invaders
        invaderMoveTimer++;
        if (invaderMoveTimer >= invaderMoveInterval) {
            invaderMoveTimer = 0;

            let moveAmount = 5;
            let canMove = true;

            // Check if invaders can move right
            if (invaderDirection === 1) {
                for (let invader of invaders) {
                    if (invader.x + invader.width + moveAmount > canvas.width) {
                        canMove = false;
                        break;
                    }
                }
            }
            // Check if invaders can move left
            else {
                for (let invader of invaders) {
                    if (invader.x - moveAmount < 0) {
                        canMove = false;
                        break;
                    }
                }
            }

            // Move invaders if possible, otherwise change direction and move down
            if (canMove) {
                for (let invader of invaders) {
                    invader.x += moveAmount * invaderDirection;
                }
            } else {
                invaderDirection *= -1;
                for (let invader of invaders) {
                    invader.y += 10; // Move down
                    invader.x += moveAmount * invaderDirection;
                }
            }
        }

        // Randomly shoot bullets
        if (Math.random() < 0.02 && invaderBullets.length < 3) {
            let invader = invaders[Math.floor(Math.random() * invaders.length)];
            invaderBullets.push({
                x: invader.x + invader.width/2 - 1.5,
                y: invader.y + invader.height,
                vy: 4
            });
            invaderShootSound.currentTime = 0;
            invaderShootSound.play();
        }

        // Update bullets
        for (let i = 0; i < invaderBullets.length; i++) {
            let bullet = invaderBullets[i];
            bullet.y += bullet.vy;

            // Check collision with player 1
            if (bullet.y + 8 >= player1.y &&
                bullet.y <= player1.y + player1.height &&
                bullet.x + 3 >= player1.x &&
                bullet.x <= player1.x + player1.width) {
                player1Health--;
                invaderBullets.splice(i, 1);
                i--;
            }

            // Check collision with player 2
            if (bullet.y <= player2.y + player2.height &&
                bullet.y + 8 >= player2.y &&
                bullet.x + 3 >= player2.x &&
                bullet.x <= player2.x + player2.width) {
                player2Health--;
                invaderBullets.splice(i, 1);
                i--;
            }

            // Remove bullets that go off screen
            if (bullet.y > canvas.height || bullet.y < 0) {
                invaderBullets.splice(i, 1);
                i--;
            }
        }
    }

    // Sound effects
    const paddleHitSound = document.getElementById('paddleHitSound');
    const invaderShootSound = document.getElementById('invaderShootSound');
    const gameOverSound = document.getElementById('gameOverSound');
    const explosionSound = document.getElementById('explosionSound');

    // Main game loop
    function gameLoop() {
        if (gameOver) {
            gameOverTimer++;
            if (gameOverTimer >= GAME_OVER_DURATION) {
                // Restart game
                player1Health = 3;
                player2Health = 3;
                gameOver = false;
                winner = null;
                gameOverTimer = 0;
                initInvaders();
                resetBall();
                return;
            }
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background stars
        drawStars();

        // Update and draw game objects
        updatePaddle(player1, keys.a, keys.d);
        updatePaddle(player2, keys.left, keys.right);
        updateBall();
        updateInvaders();

        drawPaddle(player1);
        drawPaddle(player2);
        drawBall();

        // Draw invaders
        invaders.forEach(drawInvader);
        invaderBullets.forEach(drawInvaderBullet);

        drawGameInfo();

        requestAnimationFrame(gameLoop);
    }

    // Keyboard input
    const keys = {
        a: false,
        d: false,
        left: false,
        right: false
    };

    document.addEventListener('keydown', function(e) {
        if (e.key === 'a') keys.a = true;
        if (e.key === 'd') keys.d = true;
        if (e.key === 'ArrowLeft') keys.left = true;
        if (e.key === 'ArrowRight') keys.right = true;
    });

    document.addEventListener('keyup', function(e) {
        if (e.key === 'a') keys.a = false;
        if (e.key === 'd') keys.d = false;
        if (e.key === 'ArrowLeft') keys.left = false;
        if (e.key === 'ArrowRight') keys.right = false;
    });

    // Initialize and start game
    initInvaders();
    gameLoop();
});
