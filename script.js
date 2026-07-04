const player = document.getElementById('player');
const gameArea = document.getElementById('gameArea');
const scoreText = document.getElementById('score');
const highScoreText = document.getElementById('highScore');
const levelText = document.getElementById('level');
const gameOverText = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

let playerPos = 130;
let score = 0;
let level = 1;
let blockSpeed = 4;
let gameRunning = true;
let blockInterval;
let highScore = localStorage.getItem('avoidWahalaHighScore') || 0;
highScoreText.textContent = highScore;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(freq, duration, type) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  osc.type = type || 'sine';
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function moveLeft() {
  if (playerPos > 0 && gameRunning) {
    playerPos -= 40;
    player.style.left = playerPos + 'px';
    playSound(400, 0.05, 'square');
  }
}

function moveRight() {
  if (playerPos < 260 && gameRunning) {
    playerPos += 40;
    player.style.left = playerPos + 'px';
    playSound(400, 0.05, 'square');
  }
}

function createBlock() {
  if (!gameRunning) return;
  const block = document.createElement('div');
  block.classList.add('block');
  const positions = [10, 50, 90, 170, 210, 250, 290];
  const blockLeft = positions[Math.floor(Math.random() * positions.length)];
  block.style.left = blockLeft + 'px';
  gameArea.appendChild(block);
  
  let blockPos = 0;
  const fallInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(fallInterval);
      block.remove();
      return;
    }
    blockPos += blockSpeed;
    block.style.top = blockPos + 'px';
    
    if (blockPos > 440 && blockPos < 490) {
      if (Math.abs(blockLeft - playerPos) < 35) {
        endGame();
        clearInterval(fallInterval);
      }
    }
    
    if (blockPos > 500) {
      clearInterval(fallInterval);
      block.remove();
      score++;
      scoreText.textContent = score;
      playSound(600, 0.1, 'sine');
      createParticles(blockLeft + 20, 490);
      
      if (score % 10 === 0) {
        level++;
        levelText.textContent = level;
        blockSpeed += 0.5;
        playSound(800, 0.2, 'triangle');
      }
    }
  }, 20);
}

function createParticles(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.setProperty('--tx', (Math.random() - 0.5) * 100 + 'px');
    particle.style.setProperty('--ty', (Math.random() - 0.5) * 100 + 'px');
    gameArea.appendChild(particle);
    setTimeout(() => particle.remove(), 600);
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(blockInterval);
  gameArea.classList.add('shake');
  playSound(150, 0.5, 'sawtooth');
  setTimeout(() => gameArea.classList.remove('shake'), 300);
  
  if (window.AppInventor) {
    window.AppInventor.setWebViewString(JSON.stringify({
      gameId: 'avoid_wahala',
      score: score
    }));
  }
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('avoidWahalaHighScore', highScore);
    highScoreText.textContent = highScore;
    gameOverText.textContent = 'NO WAHALA! NEW BEST: ' + score;
    playSound(1000, 0.3, 'sine');
  } else {
    gameOverText.textContent = 'WAHALA! Score: ' + score;
  }
  
  restartBtn.style.display = 'inline-block';
}

function startGame() {
  score = 0;
  level = 1;
  blockSpeed = 4;
  playerPos = 130;
  player.style.left = playerPos + 'px';
  scoreText.textContent = score;
  levelText.textContent = level;
  gameOverText.textContent = '';
  restartBtn.style.display = 'none';
  gameRunning = true;
  
  const blocks = document.querySelectorAll('.block');
  blocks.forEach(block => block.remove());
  
  clearInterval(blockInterval);
  blockInterval = setInterval(createBlock, 1500);
}

leftBtn.addEventListener('click', moveLeft);
rightBtn.addEventListener('click', moveRight);
restartBtn.addEventListener('click', startGame);

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') moveLeft();
  if (e.key === 'ArrowRight') moveRight();
  if (e.key === ' ' &&!gameRunning) startGame();
});

let touchStartX = 0;
gameArea.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});
gameArea.addEventListener('touchend', e => {
  if (!gameRunning) return;
  let touchEndX = e.changedTouches[0].clientX;
  if (touchEndX < touchStartX - 30) moveLeft();
  if (touchEndX > touchStartX + 30) moveRight();
});

startGame();