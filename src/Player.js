import Creature from './Creature.js';
import { progression, expToNext } from './config/progression.js';
import { drawFish } from './Renderer.js';

export default class Player extends Creature {
  constructor(x, y) {
    super(x, y, 1, '#ffdd55');
    this.exp = 0;
    this.expToNext = expToNext(1);
    this.speed = 120;
    this.speciesId = 'player';
    this.shape = 'fish';
    this.hasEyes = true;
    this.state = 'idle'; // idle | swim | devour
    this.devourTimer = 0;
    this.animTime = 0;
    this.contactPenaltyCooldown = 0;
  }
  update(dt, bounds, input) {
    const axis = input.getAxis();
    this.vx = axis.x * this.speed;
    this.vy = axis.y * this.speed;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    // 保持在边界内
    this.x = Math.max(this.radius, Math.min(bounds.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(bounds.height - this.radius, this.y));
    // 动画时间与状态机
    this.animTime += dt;
    this.contactPenaltyCooldown = Math.max(0, this.contactPenaltyCooldown - dt);
    if (this.devourTimer > 0) {
      this.devourTimer -= dt;
      this.state = 'devour';
    } else {
      const moving = Math.hypot(this.vx, this.vy) > 5;
      this.state = moving ? 'swim' : 'idle';
    }
  }
  gainExp(amount) {
    this.exp = Math.max(0, this.exp + amount);
    if (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.level += 1;
      this.radius = 10 + this.level * 3;
      this.speed = Math.max(80, 140 - this.level * 5);
      this.expToNext = expToNext(this.level);
    }
  }
  triggerDevour() {
    this.devourTimer = 0.25; // 吞噬动画时长
  }
  render(ctx) {
    const angle = Math.atan2(this.vy, this.vx) || 0;
    // 使用鱼形渲染
    drawFish(ctx, this.x, this.y, this.radius, angle, this.color || '#ffdd55', {
      state: this.state,
      animTime: this.animTime,
    });
    // 等级标签与HUD风格一致
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