export default class WaterParticles {
  constructor(world, count = 120) {
    this.world = world;
    this.count = count;
    this.particles = [];
    for (let i = 0; i < count; i++) this.spawn();
  }
  spawn() {
    const x = Math.random() * this.world.width;
    const y = Math.random() * (this.world.height - 200) + 40;
    const size = 1 + Math.random() * 2.2;
    const vx = (Math.random() * 10 - 5) * 0.25;
    const vy = (Math.random() * 8 - 4) * 0.25 - 2; // 轻微上浮
    const life = 8 + Math.random() * 6;
    const opacity = 0.15 + Math.random() * 0.25;
    this.particles.push({ x, y, vx, vy, size, life, opacity });
  }
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      // 轻微漂移与边界循环
      if (p.x < 0) p.x += this.world.width;
      if (p.x > this.world.width) p.x -= this.world.width;
      if (p.y < 20) p.y = this.world.height - 40;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        this.spawn();
      }
    }
    // 保持数量
    while (this.particles.length < this.count) this.spawn();
  }
  render(ctx, viewport = null) {
    ctx.save();
    for (const p of this.particles) {
      if (viewport) {
        const inView = (p.x + 4 >= viewport.x0 && p.x - 4 <= viewport.x1 && p.y + 4 >= viewport.y0 && p.y - 4 <= viewport.y1);
        if (!inView) continue;
      }
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}