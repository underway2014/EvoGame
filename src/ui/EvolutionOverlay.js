import { drawFish, drawFishGoby, drawFishPerch } from '../Renderer.js';

function getCtx(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || 240;
  const cssH = canvas.clientHeight || 160;
  canvas.width = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

function renderPreview(ctx, form) {
  const w = ctx.canvas.width / (window.devicePixelRatio || 1);
  const h = ctx.canvas.height / (window.devicePixelRatio || 1);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0c1022';
  ctx.fillRect(0, 0, w, h);
  const x = w / 2;
  const y = h / 2 + 10;
  const r = Math.min(w, h) * 0.18 + 12;
  const angle = 0;
  if (form.shape === 'fish_goby') {
    drawFishGoby(ctx, x, y, r, angle, form.color, { animTime: performance.now() / 1000 });
  } else if (form.shape === 'fish_perch') {
    drawFishPerch(ctx, x, y, r, angle, form.color, { animTime: performance.now() / 1000 });
  } else {
    drawFish(ctx, x, y, r, angle, form.color, { state: 'idle', animTime: performance.now() / 1000 });
  }
}

export function showEvolutionOverlay(form, onConfirm) {
  const overlay = document.getElementById('evolutionOverlay');
  const title = document.getElementById('evoTitle');
  const desc = document.getElementById('evoDesc');
  const canvas = document.getElementById('evoPreview');
  const btn = document.getElementById('evoConfirm');
  const ctx = getCtx(canvas);

  title.textContent = `即将进化为：${form.name || form.id}`;
  desc.textContent = `形态：${form.shape}  配色：${form.color}`;
  overlay.classList.remove('hidden');

  const draw = () => {
    renderPreview(ctx, form);
    // 轻微动画
    if (!overlay.classList.contains('hidden')) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  const handler = () => {
    overlay.classList.add('hidden');
    btn.removeEventListener('click', handler);
    if (onConfirm) onConfirm();
  };
  btn.addEventListener('click', handler);
}