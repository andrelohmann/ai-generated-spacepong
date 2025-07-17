

# Space Pong Game

A unique web-based game that combines elements from Space Invaders and Pong.

![Game Screenshot](https://raw.githubusercontent.com/andrelohmann/ai-generated-spacepong/main/screenshots/screenshot_20250717_180918_744821.png)

## Features

- **Two-player action**: Players control paddles at the top and bottom of the screen
- **Space Invaders elements**: Invaders shoot at players from the center of the screen
- **Pong gameplay**: Bounce the ball back and forth while avoiding invader bullets
- **Health system**: Players lose health when hit by invader bullets
- **Retro graphics**: Starfield background and colorful invaders
- **Sound effects**: Paddle hits, invader shots, and game over music

## Controls

- **Player 1**: A (left) and D (right) keys
- **Player 2**: Left and Right arrow keys

## How to Play

1. The goal is to be the last player standing
2. Avoid getting hit by invader bullets (3 hits = game over)
3. Avoid letting the ball pass your paddle
4. Send the ball to your opponent's side to score points

## Screenshots

![Gameplay](https://raw.githubusercontent.com/andrelohmann/ai-generated-spacepong/main/screenshots/screenshot_20250717_180125_444656.png)
*Gameplay showing invaders, paddles, and ball*

![Game Over](https://raw.githubusercontent.com/andrelohmann/ai-generated-spacepong/main/screenshots/screenshot_20250717_174317_880346.png)
*Game over screen with winner announcement*

## Installation

### Using Docker Compose (Recommended)

1. Clone this repository
2. Navigate to the project directory
3. Run `docker-compose up -d`
4. Open your browser to `http://localhost:8080`

### Manual Setup

1. Clone this repository
2. Install Node.js (if not already installed)
3. Run `node server.js`
4. Open your browser to `http://localhost:54977`

## Development

The game is built using HTML5 Canvas, CSS, and JavaScript. The server is a simple Node.js HTTP server.

### File Structure

- `index.html`: Main HTML file with game canvas and sound effects
- `game.js`: Game logic and JavaScript
- `server.js`: Simple Node.js HTTP server
- `docker-compose.yml`: Docker Compose configuration for Nginx

## License

This project is open source and available under the MIT License.

## Credits

- Sound effects from [Mixkit](https://mixkit.co/free-sound-effects/)
- Font from [Google Fonts](https://fonts.google.com/)

