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

export function drawFish(ctx, x, y, r, angle = 0, color, opts = {}) {
  const state = opts.state || 'idle';
  const t = opts.animTime || 0;
  const bodyLX = r * 1.25, bodyLY = r * 0.9; // 椭圆半径
  const tailLen = r * 1.0;
  const tailW = r * 0.9;
  const amp = state === 'devour' ? 0.8 : state === 'swim' ? 0.6 : 0.25;
  const swing = Math.sin(t * 10) * amp; // 尾摆
  const mouthOpen = state === 'devour' ? r * 0.35 : r * 0.12;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // 身体（椭圆）
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLX, bodyLY, 0, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(-bodyLX, -bodyLY, bodyLX, bodyLY);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255,255,255,0.08)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 尾巴（随摆动旋转）
  ctx.save();
  ctx.translate(-bodyLX, 0);
  ctx.rotate(swing * 0.4);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-tailLen, tailW * 0.5);
  ctx.lineTo(-tailLen, -tailW * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // 背鳍（上方小三角）
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, -bodyLY);
  ctx.lineTo(r * 0.2, -bodyLY);
  ctx.lineTo(0, -bodyLY - r * 0.5);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();

  // 眼睛（靠前）
  drawEyes(ctx, r * 0.6, -r * 0.1, 0, r, { sepFactor: 0.35, forward: 0.08 });

  // 嘴（楔形，吞噬时张大）
  ctx.beginPath();
  ctx.moveTo(bodyLX, 0);
  ctx.lineTo(bodyLX - mouthOpen, mouthOpen * 0.6);
  ctx.lineTo(bodyLX - mouthOpen, -mouthOpen * 0.6);
  ctx.closePath();
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fill();

  // 亮带
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.ellipse(-r * 0.2, -r * 0.2, r * 0.9, r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// 虾虎鱼（Goby）：贴底、圆头、暖色系，腹鳍明显
export function drawFishGoby(ctx, x, y, r, angle = 0, color = '#c58b4b', opts = {}) {
  const t = opts.animTime || 0;
  const bodyLX = r * 1.1, bodyLY = r * 0.85; // 更圆胖
  const tailLen = r * 0.9;
  const tailW = r * 0.8;
  const swing = Math.sin(t * 8) * 0.35;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // 身体（暖色渐变）
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLX, bodyLY, 0, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(-bodyLX, -bodyLY, bodyLX, bodyLY);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255,200,120,0.18)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // 尾巴
  ctx.save();
  ctx.translate(-bodyLX, 0);
  ctx.rotate(swing * 0.4);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-tailLen, tailW * 0.5);
  ctx.lineTo(-tailLen, -tailW * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  // 腹鳍（下方小鳍）
  ctx.beginPath();
  ctx.moveTo(-r * 0.2, bodyLY);
  ctx.lineTo(r * 0.3, bodyLY);
  ctx.lineTo(0, bodyLY + r * 0.4);
  ctx.closePath();
  ctx.fillStyle = 'rgba(200,150,100,0.6)';
  ctx.fill();
  // 眼睛
  drawEyes(ctx, r * 0.5, -r * 0.05, 0, r, { sepFactor: 0.32, forward: 0.1 });
  ctx.restore();
}

// 河鲈（Perch）：橄榄绿、背鳍棘刺明显、身体有深色竖条
export function drawFishPerch(ctx, x, y, r, angle = 0, color = '#7aa35a', opts = {}) {
  const t = opts.animTime || 0;
  const bodyLX = r * 1.25, bodyLY = r * 0.9; // 稍长
  const tailLen = r * 1.0;
  const tailW = r * 0.9;
  const swing = Math.sin(t * 9) * 0.4;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  // 身体（橄榄绿渐变）
  ctx.beginPath();
  ctx.ellipse(0, 0, bodyLX, bodyLY, 0, 0, Math.PI * 2);
  const grad = ctx.createLinearGradient(-bodyLX, -bodyLY, bodyLX, bodyLY);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(255,255,255,0.1)');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // 尾巴
  ctx.save();
  ctx.translate(-bodyLX, 0);
  ctx.rotate(swing * 0.35);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-tailLen, tailW * 0.5);
  ctx.lineTo(-tailLen, -tailW * 0.5);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
  // 背鳍（上方棘刺）
  ctx.beginPath();
  const spikes = 5;
  for (let i = 0; i < spikes; i++) {
    const px = -r * 0.3 + i * (r * 0.25);
    ctx.moveTo(px, -bodyLY);
    ctx.lineTo(px + r * 0.15, -bodyLY);
    ctx.lineTo(px + r * 0.075, -bodyLY - r * (0.4 + i * 0.03));
    ctx.closePath();
  }
  ctx.fillStyle = 'rgba(220,240,210,0.7)';
  ctx.fill();
  // 身体竖条纹
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#2f3b2f';
  for (let xbar = -bodyLX * 0.6; xbar <= bodyLX * 0.6; xbar += r * 0.35) {
    ctx.fillRect(xbar - r * 0.08, -bodyLY * 0.9, r * 0.16, bodyLY * 1.8);
  }
  ctx.restore();
  // 眼睛
  drawEyes(ctx, r * 0.55, -r * 0.08, 0, r, { sepFactor: 0.3, forward: 0.12 });
  ctx.restore();
}