export default class Creature {
  constructor(x, y, level = 1, color = null, spec = null) {
    this.x = x; this.y = y;
    this.level = level;
    if (spec) {
      this.speciesId = spec.id;
      this.behavior = spec.behavior || 'wander';
      this.radius = (spec.radius ?? 10) + level * 2;
      this.speed = spec.speed ?? (50 + Math.max(0, 10 - level) * 2);
      this.color = spec.color || color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
    } else {
      this.radius = 10 + level * 3;
      this.speed = 50 + Math.max(0, 10 - level) * 2;
      this.color = color || `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
      this.behavior = 'wander';
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
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 等级标签
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