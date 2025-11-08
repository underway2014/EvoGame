import Game from './Game.js';

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
// 绑定按钮事件（移动端/桌面）
const btnBoost = document.getElementById('btnBoost');
const btnDart = document.getElementById('btnDart');
if (btnBoost) {
  btnBoost.addEventListener('click', () => {
    game.useBoost();
  });
}
if (btnDart) {
  btnDart.addEventListener('click', () => {
    game.fireDart();
  });
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