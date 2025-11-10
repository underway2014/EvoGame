import Game from './Game.js';
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

// 音乐按钮绑定（移动端需要用户手势启用音频）
const btnMusic = document.getElementById('btnMusic');
const bgAudio = document.getElementById('bgAudio');
if (btnMusic) {
  const toggleMusic = async (e) => {
    e.preventDefault();
    if (!audio.running) { await audio.start(bgAudio); btnMusic.classList.add('on'); }
    else { audio.stop(); btnMusic.classList.remove('on'); }
  };
  btnMusic.addEventListener('pointerdown', toggleMusic, { passive: false });
  btnMusic.addEventListener('click', toggleMusic);
}
// 任意首次指针交互时尝试启动音乐（若用户允许）
const bootAudioOnce = async (e) => { if (!audio.running) { try { await audio.start(bgAudio); btnMusic && btnMusic.classList.add('on'); } catch {} } window.removeEventListener('pointerdown', bootAudioOnce); };
window.addEventListener('pointerdown', bootAudioOnce, { once: true });