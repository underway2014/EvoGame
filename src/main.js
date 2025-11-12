import Game from './Game.js';
import { showPauseOverlay } from './ui/PauseOverlay.js';
import AudioManager from './AudioManager.js';
import { audioConfig } from './config/audio.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  canvas.style.width = window.innerWidth + 'px';
  canvas.style.height = window.innerHeight + 'px';
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
window.addEventListener('resize', resize);
resize();

const game = new Game(canvas, ctx);
const audio = new AudioManager();
// 绑定按钮事件（移动端/桌面）
const btnBoost = document.getElementById('btnBoost');
const btnDart = document.getElementById('btnDart');
if (btnBoost) {
  const onBoost = (e) => { e.preventDefault(); game.useBoost(); };
  btnBoost.addEventListener('pointerdown', onBoost, { passive: false });
  btnBoost.addEventListener('click', onBoost);
}
if (btnDart) {
  const onDart = (e) => { e.preventDefault(); game.fireDart(); };
  btnDart.addEventListener('pointerdown', onDart, { passive: false });
  btnDart.addEventListener('click', onDart);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  game.update(dt);
  game.render();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// 单个声音切换按钮（移动端需要用户手势启用音频）
const btnSound = document.getElementById('btnSound');
const bgAudio = document.getElementById('bgAudio');
const btnPause = document.getElementById('btnPause');

const toggleSound = async (e) => {
  if (e) e.preventDefault();
  if (!audio.running) {
    const ok = await audio.start(bgAudio);
    if (ok && btnSound) {
      btnSound.classList.add('on');
      btnSound.classList.remove('muted');
      btnSound.setAttribute('aria-pressed', 'true');
      btnSound.textContent = '🔊';
    }
  } else {
    audio.stop();
    if (btnSound) {
      btnSound.classList.remove('on');
      btnSound.classList.add('muted');
      btnSound.setAttribute('aria-pressed', 'false');
      btnSound.textContent = '🔇';
    }
  }
};

if (btnSound) {
  // 仅使用 click，避免 pointerdown+click 的双触发导致状态来回切换
  btnSound.addEventListener('click', toggleSound, { passive: false });
}

const updatePauseBtn = (paused) => {
  if (!btnPause) return;
  if (paused) {
    btnPause.classList.add('on');
    btnPause.setAttribute('aria-pressed', 'true');
    btnPause.textContent = '▶️';
  } else {
    btnPause.classList.remove('on');
    btnPause.setAttribute('aria-pressed', 'false');
    btnPause.textContent = '⏸️';
  }
};

if (btnPause) {
  btnPause.addEventListener('click', (e) => {
    e.preventDefault();
    if (!game.paused && !game.gameOver) {
      game.paused = true;
      updatePauseBtn(true);
      const stats = { devoured: game.devouredCount, time: game.elapsed, level: game.player.level };
      showPauseOverlay(stats, () => {
        game.paused = false;
        updatePauseBtn(false);
      });
    } else if (game.paused && !game.gameOver) {
      game.paused = false;
      updatePauseBtn(false);
      const overlay = document.getElementById('pauseOverlay');
      if (overlay) overlay.classList.add('hidden');
    }
  });
}

// 任意首次指针交互时尝试启动音乐（若用户允许）
const bootAudioOnce = async (e) => {
  // 若首次交互来源于声音按钮，则不自动启动，避免与点击逻辑冲突
  if (e && btnSound && (e.target === btnSound || btnSound.contains(e.target))) {
    window.removeEventListener('pointerdown', bootAudioOnce);
    return;
  }
  if (!audio.running) {
    try {
      const ok = await audio.start(bgAudio);
      if (ok && btnSound) {
        btnSound.classList.add('on');
        btnSound.classList.remove('muted');
        btnSound.setAttribute('aria-pressed', 'true');
        btnSound.textContent = '🔊';
      }
    } catch {}
  }
  window.removeEventListener('pointerdown', bootAudioOnce);
};
window.addEventListener('pointerdown', bootAudioOnce, { once: true });
