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
const progress = document.getElementById('progress');
const loadingText = document.getElementById('loading-text');

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

async function boot() {
  // Yukleme animasyonu
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
    }
  } catch (err) {
    loadingText.textContent = 'Sunucuya baglanilamadi. Internet baglantinizi kontrol edin.';
    console.error(err);
  }
}

document.getElementById('google-login-btn').addEventListener('click', async () => {
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  try {
    await authManager.loginWithGoogle();
    hide(loginScreen);
    openMainMenu();
  } catch (err) {
    errEl.textContent = err.message;
  }
});

function openMainMenu() {
  const profile = authManager.getProfile();
  if (!profile) return;

  document.getElementById('display-name').textContent = profile.displayName;
  document.getElementById('trophies').textContent = profile.trophies || 0;
  document.getElementById('level').textContent = profile.level || 1;
  const photo = document.getElementById('profile-photo');
  if (profile.profilePhoto) photo.src = profile.profilePhoto;

  show(mainMenu);
}

document.getElementById('logout-btn').addEventListener('click', async () => {
  await authManager.logout();
  hide(mainMenu);
  show(loginScreen);
});

document.getElementById('play-btn').addEventListener('click', () => {
  hide(mainMenu);
  startGame();
});

function startGame() {
  show(gameUI);
  // Mobil kontrol goster
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
  // Simdilik direkt menuye don
  openMainMenu();
}

// Baslat
boot();
