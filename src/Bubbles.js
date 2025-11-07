export default class Bubbles {
  constructor(world, background = null) {
    this.world = world;
    this.background = background;
    this.emitters = [];
    this.bubbles = [];
    this.linked = false;
    // 基础冒泡点（保证最低效果）
    const baseY = world.height - 20;
    const points = [world.width * 0.25, world.width * 0.75];
    for (const x of points) {
      this.emitters.push({ x, y: baseY, interval: 0.6 + Math.random() * 0.5, timer: 0 });
    }
  }
  linkToBackground() {
    if (!this.background) return;
    const decors = this.background.getDecors(this.world) || [];
    if (!decors.length) return;
    const baseY = this.world.height - 20;
    // 在海草附近增加高频冒泡点；岩石附近低频
    for (const d of decors) {
      // 约10%的概率为该装饰生成冒泡点
      if (Math.random() > 0.06) continue;
      let intervalMin, intervalMax;
      if (d.type === 'seaweed') {
        intervalMin = 0.25; intervalMax = 0.45;
      } else {
        intervalMin = 0.8; intervalMax = 1.2;
      }
      const interval = intervalMin + Math.random() * (intervalMax - intervalMin);
      const ex = d.x + (Math.random() * 16 - 8);
      const ey = Math.min(baseY, d.y + (Math.random() * 8 - 4));
      this.emitters.push({ x: ex, y: ey, interval, timer: Math.random() * interval });
      // 限制发射器数量以防过多
      if (this.emitters.length > 24) break;
    }
    this.linked = true;
  }
  spawnBubble(x, y) {
    const r = 3 + Math.random() * 4;
    const speed = 22 + Math.random() * 18; // 上升速度
    const life = 3.0 + Math.random() * 1.5;
    const drift = (Math.random() * 0.6) - 0.3; // 水平方向微弱漂移
    this.bubbles.push({ x, y, r, vy: -speed, vx: drift, life, t: 0, opacity: 1 });
  }
  update(dt) {
    // 背景装饰就绪后联动一次
    if (!this.linked && this.background && this.background.loaded) {
      this.linkToBackground();
    }
    // 产生新气泡
    for (const e of this.emitters) {
      e.timer -= dt;
      if (e.timer <= 0) {
        this.spawnBubble(e.x + (Math.random() * 20 - 10), e.y + (Math.random() * 10 - 5));
        e.timer = e.interval;
      }
    }
    // 更新现有气泡
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.t += dt;
      b.life -= dt;
      b.x += b.vx * dt;
      // 轻微左右摆动
      b.x += Math.sin(b.t * 4) * 0.4;
      b.y += b.vy * dt;
      // 随时间变小、变透明
      b.r *= (1 - dt * 0.08);
      b.opacity = Math.max(0, b.life / 3.0);
      // 到达水面或寿命结束移除
      if (b.life <= 0 || b.y < 20) this.bubbles.splice(i, 1);
    }
  }
  render(ctx) {
    // 在世界坐标内绘制气泡
    for (const b of this.bubbles) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.9, 0.3 + b.opacity * 0.7);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }
}