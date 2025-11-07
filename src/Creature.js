import { drawBlob, drawCapsule, drawTriangle, drawEyes, drawFishGoby, drawFishPerch } from './Renderer.js';

export default class Creature {
  constructor(x, y, level = 1, color = null, spec = null) {
    this.x = x; this.y = y;
    this.level = level;
    if (spec) {
      this.speciesId = spec.id;
      this.behavior = spec.behavior || 'wander';
      this.shape = spec.shape || 'blob';
      this.hasEyes = !!spec.eye;
      this.radius = (spec.radius ?? 10) + level * 2;
      this.speed = spec.speed ?? (50 + Math.max(0, 10 - level) * 2);
      this.color = spec.color || color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    } else {
      this.radius = 10 + level * 3;
      this.speed = 50 + Math.max(0, 10 - level) * 2;
      this.color = color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
      this.behavior = 'wander';
      this.shape = 'blob';
      this.hasEyes = false;
    }
    this.vx = (Math.random() * 2 - 1) * this.speed;
    this.vy = (Math.random() * 2 - 1) * this.speed;
    this.turnTimer = 0;
  }
  update(dt, bounds) {
    this.turnTimer -= dt;
    if (this.turnTimer <= 0) {
      this.turnTimer = 0.5 + Math.random() * 2;
      const angle = Math.random() * Math.PI * 2;
      this.vx = Math.cos(angle) * this.speed * 0.6;
      this.vy = Math.sin(angle) * this.speed * 0.6;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    // 环绕屏幕
    if (this.x < -this.radius) this.x = bounds.width + this.radius;
    if (this.x > bounds.width + this.radius) this.x = -this.radius;
    if (this.y < -this.radius) this.y = bounds.height + this.radius;
    if (this.y > bounds.height + this.radius) this.y = -this.radius;
  }
  render(ctx) {
    const angle = Math.atan2(this.vy, this.vx);
    switch (this.shape) {
      case 'capsule':
        drawCapsule(ctx, this.x, this.y, this.radius, angle, this.color);
        break;
      case 'tri':
        drawTriangle(ctx, this.x, this.y, this.radius, angle, this.color);
        break;
      case 'fish_goby':
        drawFishGoby(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_perch':
        drawFishPerch(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'blob':
      default:
        drawBlob(ctx, this.x, this.y, this.radius, this.color, angle);
        break;
    }

    if (this.hasEyes) {
      drawEyes(ctx, this.x, this.y, angle, this.radius);
    }

    // 等级标签（置顶居中）
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = `L${this.level}`;
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(label, this.x, this.y);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, this.x, this.y);
  }
}