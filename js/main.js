import { AuthManager } from './AuthManager.js';
import { GameScene } from './GameScene.js';

const authManager = new AuthManager();
let gameScene = null;
let animId = null;

const loadingScreen = document.getElementById('loading-screen');
const loginScreen = document.getElementById('login-screen');
const mainMenu = document.getElementById('main-menu');
const gameUI = document.getElementById('game-ui');
const resultScreen = document.getElementById('result-screen');
const rotateWarning = document.getElementById('rotate-warning');
const progress = document.getElementById('progress');
const loadingText = document.getElementById('loading-text');
const nameInput = document.getElementById('player-name');

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

// Yatay kontrol
function checkOrientation() {
  const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!isMobile) {
    hide(rotateWarning);
    return true;
  }
  const isLandscape = window.innerWidth > window.innerHeight;
  if (isLandscape) {
    hide(rotateWarning);
    return true;
  } else {
    show(rotateWarning);
    return false;
  }
}
window.addEventListener('resize', checkOrientation);
window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 100));

async function boot() {
  let p = 0;
  const interval = setInterval(() => {
    p += 10;
    progress.style.width = p + '%';
    if (p >= 100) clearInterval(interval);
  }, 80);

  loadingText.textContent = 'Firebase baglantisi...';
  try {
    const user = await authManager.init();
    progress.style.width = '100%';
    hide(loadingScreen);

    if (user) {
      openMainMenu();
    } else {
      show(loginScreen);
      nameInput.focus();
    }
    checkOrientation();
  } catch (err) {
    loadingText.textContent = 'Sunucuya baglanilamadi. Internet baglantinizi kontrol edin.';
    console.error(err);
  }
}

document.getElementById('anon-login-btn').addEventListener('click', doLogin);
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});

async function doLogin() {
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  const name = nameInput.value.trim();
  if (!name || name.length < 2) {
    errEl.textContent = 'En az 2 harf yaz lan';
    return;
  }
  try {
    await authManager.loginWithName(name);
    hide(loginScreen);
    openMainMenu();
  } catch (err) {
    errEl.textContent = err.message;
  }
}

function openMainMenu() {
  const profile = authManager.getProfile();
  if (!profile) return;

  document.getElementById('display-name').textContent = profile.displayName;
  document.getElementById('trophies').textContent = profile.trophies || 0;
  document.getElementById('level').textContent = profile.level || 1;

  show(mainMenu);
  checkOrientation();
}

document.getElementById('logout-btn').addEventListener('click', async () => {
  await authManager.logout();
  hide(mainMenu);
  show(loginScreen);
  nameInput.value = '';
  nameInput.focus();
});

document.getElementById('play-btn').addEventListener('click', () => {
  if (!checkOrientation()) return; // dikeyse oynatma
  hide(mainMenu);
  startGame();
});

function startGame() {
  show(gameUI);
  if ('ontouchstart' in window) {
    document.getElementById('mobile-controls').classList.remove('hidden');
  }

  gameScene = new GameScene(document.body);
  let last = performance.now();

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    gameScene.update(dt);
    animId = requestAnimationFrame(loop);
  }
  animId = requestAnimationFrame(loop);
}

document.getElementById('btn-menu').addEventListener('click', () => {
  endGame(false);
});

function endGame(won) {
  if (animId) cancelAnimationFrame(animId);
  if (gameScene) {
    gameScene.destroy();
    gameScene = null;
  }
  hide(gameUI);
  openMainMenu();
}

boot();
