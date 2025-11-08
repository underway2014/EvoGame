import { chestConfig } from './config/chest.js';

let chestImages = null;
function loadChestImages() {
  if (chestImages) return chestImages;
  chestImages = { closed: new Image(), open: new Image(), loaded: false };
  let loadedCount = 0;
  const onload = () => { loadedCount += 1; if (loadedCount >= 2) chestImages.loaded = true; };
  chestImages.closed.onload = onload;
  chestImages.open.onload = onload;
  chestImages.closed.src = './assets/objects/chest_closed.svg';
  chestImages.open.src = './assets/objects/chest_open.svg';
  return chestImages;
}

export default class Chest {
  constructor(world) {
    this.world = world;
    this.state = 'closed';
    this.radius = 18;
    this.x = Math.random() * world.width;
    this.y = Math.random() * (world.height - 180) + 120; // 避开过近的水面与底部
    this.bobTime = Math.random() * 10;
    this.images = loadChestImages();
  }
  update(dt) {
    this.bobTime += dt;
    // 轻微上下摆动
    this.y += Math.sin(this.bobTime * 2) * 0.1;
  }
  render(ctx) {
    const img = this.state === 'open' ? this.images.open : this.images.closed;
    if (this.images.loaded) {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      const len = this.radius * 3; const hei = len * (h / w);
      ctx.save(); ctx.translate(this.x, this.y); ctx.drawImage(img, -len / 2, -hei / 2, len, hei); ctx.restore();
    } else {
      // 回退绘制
      ctx.save(); ctx.translate(this.x, this.y);
      ctx.fillStyle = '#8d5a2b'; ctx.fillRect(-20, -15, 40, 30);
      ctx.strokeStyle = '#654321'; ctx.strokeRect(-20, -15, 40, 30);
      ctx.restore();
    }
  }
  applyReward(player) {
    player.gainExp(chestConfig.expReward);
    player.speedBoostMultiplier = chestConfig.speedBoostMultiplier;
    player.speedBoostTimer = chestConfig.speedBoostDuration;
    if (typeof chestConfig.ammoReward === 'number') {
      player.dartAmmo = (player.dartAmmo || 0) + chestConfig.ammoReward;
    }
    this.state = 'open';
  }
}