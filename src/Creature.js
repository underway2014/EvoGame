import { drawBlob, drawCapsule, drawTriangle, drawEyes, drawFishGoby, drawFishPerch, drawFishBonito, drawFishMoray, drawFishPiranha, drawFishBarracuda, drawFishTuna, drawFishSailfish, drawFishReefShark, drawFishShark, drawStarfish, drawCrab, drawShrimp, drawTurtle, drawJellyfish } from './Renderer.js';
import { aggression } from './config/ai.js';

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
    // 记录默认行为，便于攻击结束后恢复
    this.defaultBehavior = this.behavior || 'wander';
    this.vx = (Math.random() * 2 - 1) * this.speed;
    this.vy = (Math.random() * 2 - 1) * this.speed;
    this.turnTimer = 0;
    this.attackTimer = 0;
    this.attackCooldown = 0;
  }
  update(dt, bounds, player = null, viewport = null) {
    this.turnTimer -= dt;
    this.attackCooldown = Math.max(0, this.attackCooldown - dt);
    this.attackTimer = Math.max(0, this.attackTimer - dt);

    // 仅在视野内才可能触发攻击
    const inViewport = viewport 
      ? (this.x + this.radius >= viewport.x0 && this.x - this.radius <= viewport.x1 &&
         this.y + this.radius >= viewport.y0 && this.y - this.radius <= viewport.y1)
      : true;

    // 攻击逻辑：高等级并满足概率与冷却时，进入攻击状态（且在视野内）
    if (player && inViewport && this.level >= player.level + (aggression.levelAdvantage || 1)) {
      if (this.attackCooldown <= 0 && this.attackTimer <= 0) {
        if (Math.random() < (aggression.probability ?? 0.5)) {
          this.attackTimer = aggression.durationSec ?? 1.5;
          this.attackCooldown = aggression.cooldownSec ?? 3.0;
          this.behavior = 'attack';
        }
      }
    }

    if (this.attackTimer > 0 && player) {
      // 向玩家追击
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = dx / len, ny = dy / len;
      const speed = (this.speed) * (aggression.speedMultiplier ?? 1.2);
      this.vx = nx * speed;
      this.vy = ny * speed;
    } else {
      // 游走逻辑
      if (this.turnTimer <= 0) {
        this.turnTimer = 0.5 + Math.random() * 2;
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * this.speed * 0.6;
        this.vy = Math.sin(angle) * this.speed * 0.6;
      }
      // 恢复默认行为标记
      if (this.behavior === 'attack' && this.attackTimer <= 0) {
        this.behavior = this.defaultBehavior;
      }
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
      case 'fish_bonito':
        drawFishBonito(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_moray':
        drawFishMoray(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_piranha':
        drawFishPiranha(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_barracuda':
        drawFishBarracuda(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_tuna':
        drawFishTuna(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_sailfish':
        drawFishSailfish(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_reef_shark':
        drawFishReefShark(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'fish_shark':
        drawFishShark(ctx, this.x, this.y, this.radius, angle, this.color, { animTime: performance.now() / 1000 });
        break;
      case 'starfish':
        drawStarfish(ctx, this.x, this.y, this.radius, angle, this.color);
        break;
      case 'crab':
        drawCrab(ctx, this.x, this.y, this.radius, angle, this.color);
        break;
      case 'shrimp':
        drawShrimp(ctx, this.x, this.y, this.radius, angle, this.color);
        break;
      case 'turtle':
        drawTurtle(ctx, this.x, this.y, this.radius, angle, this.color);
        break;
      case 'jellyfish':
        drawJellyfish(ctx, this.x, this.y, this.radius, angle, this.color);
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
