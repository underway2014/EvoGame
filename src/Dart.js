export default class Dart {
  constructor(x, y, angle, speed, lifetimeSec, radius = 4) {
    this.x = x;
    this.y = y;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = lifetimeSec;
    this.radius = radius;
  }
  update(dt) {
    this.life -= dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }
  isDead(world) {
    return this.life <= 0 || this.x < -this.radius || this.x > world.width + this.radius || this.y < -this.radius || this.y > world.height + this.radius;
  }
  render(ctx) {
    ctx.save();
    ctx.fillStyle = '#ffcc33';
    ctx.strokeStyle = '#cc9900';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}