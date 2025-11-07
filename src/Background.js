export default class Background {
  constructor(src) {
    this.img = null;
    this.loaded = false;
    this.src = src;
    const img = new Image();
    img.onload = () => { this.img = img; this.loaded = true; };
    img.src = src;
  }
  render(ctx, world, camera) {
    if (this.loaded) {
      // 将海底SVG缩放铺满整个世界区域（包含水体与底部沙地）
      ctx.drawImage(this.img, 0, 0, world.width, world.height);
    } else {
      // 资源未加载时的兜底：淡蓝海水渐变填充
      const water = ctx.createLinearGradient(0, 0, 0, world.height);
      water.addColorStop(0, '#bfe9ff');
      water.addColorStop(1, '#89cff0');
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, world.width, world.height);
    }

    // 顶端光线渐变叠加（轻微），提升水下层次
    const light = ctx.createLinearGradient(0, 0, 0, world.height);
    light.addColorStop(0, 'rgba(255,255,255,0.10)');
    light.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, world.width, world.height);
  }
}