export default class FloatingText {
  constructor(x, y, text, color = '#ffffff') {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.life = 1.0; // 秒
    this.vy = -30; // 向上速度（世界坐标）
    this.opacity = 1.0;
    this.scale = 1.0;
  }
  update(dt) {
    this.life -= dt;
    this.y += this.vy * dt;
    // 先放大再淡出
    const t = Math.max(0, Math.min(1, this.life));
    this.opacity = t;
    this.scale = 1 + (1 - t) * 0.1;
  }
  isDead() { return this.life <= 0; }
  render(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.opacity);
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.strokeText(this.text, 0, -12);
    ctx.fillStyle = this.color;
    ctx.fillText(this.text, 0, -12);
    ctx.restore();
  }
}