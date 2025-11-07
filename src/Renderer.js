// 轻量渲染工具：支持不同形状与简单细节

export function drawBlob(ctx, x, y, r, color, angle = 0) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  // 轮廓
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // 高光（朝着角度的反方向）
  const hx = x - Math.cos(angle) * r * 0.4;
  const hy = y - Math.sin(angle) * r * 0.4;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.arc(hx, hy, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

export function drawCapsule(ctx, x, y, r, angle = 0, color) {
  const len = r * 2.2; // 胶囊长度
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(-len / 2, -r);
  ctx.lineTo(len / 2, -r);
  ctx.arc(len / 2, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(-len / 2, r);
  ctx.arc(-len / 2, 0, r, Math.PI / 2, -Math.PI / 2);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // 顶部亮带
  const grad = ctx.createLinearGradient(-len / 2, -r, len / 2, -r);
  grad.addColorStop(0, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0.02)');
  ctx.fillStyle = grad;
  ctx.fillRect(-len / 2, -r, len, r * 0.6);
  ctx.restore();
}

export function drawTriangle(ctx, x, y, r, angle = 0, color) {
  const a = angle;
  const p1 = { x: x + Math.cos(a) * r * 1.2, y: y + Math.sin(a) * r * 1.2 };
  const p2 = { x: x + Math.cos(a + 2.4) * r, y: y + Math.sin(a + 2.4) * r };
  const p3 = { x: x + Math.cos(a - 2.4) * r, y: y + Math.sin(a - 2.4) * r };
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // 前端高光
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.arc(p1.x, p1.y, r * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEyes(ctx, x, y, angle, r, opts = {}) {
  const sep = r * (opts.sepFactor ?? 0.45);
  const off = r * (opts.forward ?? 0.15);
  const nx = Math.cos(angle), ny = Math.sin(angle);
  const px = -ny, py = nx; // 垂直方向
  const cx = x + nx * off, cy = y + ny * off;
  const left = { x: cx + px * sep, y: cy + py * sep };
  const right = { x: cx - px * sep, y: cy - py * sep };
  const eyeR = Math.max(2, r * 0.18);
  const pupilR = Math.max(1, eyeR * 0.5);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.beginPath(); ctx.arc(left.x, left.y, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(right.x, right.y, eyeR, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.beginPath(); ctx.arc(left.x + nx * eyeR * 0.2, left.y + ny * eyeR * 0.2, pupilR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(right.x + nx * eyeR * 0.2, right.y + ny * eyeR * 0.2, pupilR, 0, Math.PI * 2); ctx.fill();
}