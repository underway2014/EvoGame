export default class Background {
  constructor() {
    this.imgWater = null;
    this.imgSand = null;
    this.imgRock = null;
    this.imgSeaweed = null;
    this.imgRockSmall = null;
    this.loaded = false;
    this.decors = [];
    this.decorsInit = false;
    this._load();
  }
  _load() {
    const load = (src) => new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    Promise.all([
      load('./assets/backgrounds/water.svg'),
      load('./assets/backgrounds/sand_tile.svg'),
      load('./assets/backgrounds/rock_tile.svg'),
      load('./assets/decors/seaweed.svg'),
      load('./assets/decors/rock_small.svg'),
    ]).then(([water, sand, rock, seaweed, rockSmall]) => {
      this.imgWater = water; this.imgSand = sand; this.imgRock = rock; this.imgSeaweed = seaweed; this.imgRockSmall = rockSmall;
      this.loaded = true;
    }).catch(() => { this.loaded = false; });
  }
  _ensureDecors(world, tileH) {
    if (this.decorsInit) return;
    // 固定种子以保证装饰位置稳定
    let seed = 1337;
    const rand = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed % 1000) / 1000; };
    const count = Math.floor(world.width / 60);
    for (let i = 0; i < count; i++) {
      const isLeft = i < count * 0.5;
      const type = isLeft ? 'seaweed' : (rand() < 0.7 ? 'rock' : 'seaweed');
      const x = Math.floor(rand() * world.width);
      const y = world.height - tileH + Math.floor(rand() * 20) - 5;
      const scale = 0.8 + rand() * 0.6;
      this.decors.push({ type, x, y, scale });
    }
    this.decorsInit = true;
  }
  getDecors(world) {
    // 公开方法：确保装饰已生成并返回列表
    const tileH = (this.imgSand ? (this.imgSand.naturalHeight || this.imgSand.height) : 160);
    this._ensureDecors(world, tileH);
    return this.decors;
  }
  render(ctx, world, camera) {
    // 水体铺满（图片优先，未加载用渐变）
    if (this.imgWater) {
      ctx.drawImage(this.imgWater, 0, 0, world.width, world.height);
    } else {
      const water = ctx.createLinearGradient(0, 0, 0, world.height);
      water.addColorStop(0, '#bfe9ff');
      water.addColorStop(1, '#89cff0');
      ctx.fillStyle = water;
      ctx.fillRect(0, 0, world.width, world.height);
    }
    // 底部分段：左侧沙地，右侧岩石地形
    if (this.imgSand && this.imgRock) {
      const tileW = this.imgSand.naturalWidth || this.imgSand.width;
      const tileH = this.imgSand.naturalHeight || this.imgSand.height;
      const y = world.height - tileH;
      const splitX = Math.floor(world.width * 0.55);
      for (let x = 0; x < world.width; x += tileW) {
        const img = x + tileW <= splitX ? this.imgSand : this.imgRock;
        ctx.drawImage(img, x, y, tileW, tileH);
      }
      // 装饰
      this._ensureDecors(world, tileH);
      for (const d of this.decors) {
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.scale(d.scale, d.scale);
        if (d.type === 'seaweed' && this.imgSeaweed) {
          ctx.drawImage(this.imgSeaweed, -32, -100, 64, 120);
        } else if (this.imgRockSmall) {
          ctx.drawImage(this.imgRockSmall, -40, -30, 80, 60);
        }
        ctx.restore();
      }
    }
    // 顶端光线渐变（轻微）
    const light = ctx.createLinearGradient(0, 0, 0, world.height);
    light.addColorStop(0, 'rgba(255,255,255,0.06)');
    light.addColorStop(1, 'rgba(255,255,255,0.02)');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, world.width, world.height);

    // 顶部动态光束（模拟水下光斑，极轻量）
    const t = performance.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ffffff';
    const beams = 6;
    for (let i = 0; i < beams; i++) {
      const bx = (i / beams) * world.width + Math.sin(t * 0.6 + i) * 60;
      const bw = 80 + Math.sin(t * 0.9 + i * 1.7) * 20;
      ctx.beginPath();
      ctx.moveTo(bx - bw / 2, 0);
      ctx.lineTo(bx + bw / 2, 0);
      ctx.lineTo(bx + bw * 0.3, world.height * 0.5);
      ctx.lineTo(bx - bw * 0.3, world.height * 0.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}