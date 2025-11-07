import Input from './Input.js';
import Player from './Player.js';
import Creature from './Creature.js';
import { species } from './config/species.js';
import { spawnRules, pickSpawnLevel, pickSpeciesByLevel } from './config/spawn.js';
import { computeDevourExp, computeContactPenalty, contactPenalty } from './config/progression.js';
import FloatingText from './FloatingText.js';

export default class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    // 使用CSS像素作为屏幕尺寸，避免与设备像素缩放混淆
    this.screen = { width: canvas.clientWidth || window.innerWidth, height: canvas.clientHeight || window.innerHeight };
    this.world = { width: 2400, height: 1800 };
    this.input = new Input();
    this.player = new Player(this.world.width / 2, this.world.height / 2);
    this.camera = { x: this.player.x, y: this.player.y };
    this.creatures = [];
    this.fxTexts = [];
    this.spawnInitial();
    this.spawnCooldown = 0;
  }
  resize() {
    const dpr = window.devicePixelRatio || 1;
    // 优先使用客户端CSS尺寸；无法获取时退化为设备像素除以DPR
    const cssW = this.canvas.clientWidth || Math.floor(this.canvas.width / dpr);
    const cssH = this.canvas.clientHeight || Math.floor(this.canvas.height / dpr);
    this.screen.width = cssW;
    this.screen.height = cssH;
  }
  spawnInitial() {
    for (let i = 0; i < 15; i++) this.spawnCreature();
  }
  spawnCreature() {
    const level = pickSpawnLevel(this.player.level);
    const speciesId = pickSpeciesByLevel(level);
    const spec = species.find(s => s.id === speciesId) || null;
    const x = Math.random() * this.world.width;
    const y = Math.random() * this.world.height;
    const c = new Creature(x, y, level, null, spec);
    this.creatures.push(c);
  }
  update(dt) {
    this.resize();
    this.player.update(dt, this.world, this.input);
    for (const c of this.creatures) c.update(dt, this.world);
    // 更新摄像机跟随与边界限制
    const halfW = this.screen.width / 2;
    const halfH = this.screen.height / 2;
    this.camera.x = Math.max(halfW, Math.min(this.world.width - halfW, this.player.x));
    this.camera.y = Math.max(halfH, Math.min(this.world.height - halfH, this.player.y));
    this.handleCollisions();
    // 更新浮动文本效果
    for (let i = this.fxTexts.length - 1; i >= 0; i--) {
      const ft = this.fxTexts[i];
      ft.update(dt);
      if (ft.isDead()) this.fxTexts.splice(i, 1);
    }
    // 定时生成新生物
    this.spawnCooldown -= dt;
    if (this.spawnCooldown <= 0 && this.creatures.length < spawnRules.maxCreatures) {
      this.spawnCreature();
      this.spawnCooldown = spawnRules.spawnIntervalSec;
    }
  }
  handleCollisions() {
    // 玩家吃掉更弱的生物
    for (let i = this.creatures.length - 1; i >= 0; i--) {
      const c = this.creatures[i];
      const dx = c.x - this.player.x;
      const dy = c.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < c.radius + this.player.radius) {
        const canDevourByLevel = c.level < this.player.level;
        const canDevourBySize = c.radius < this.player.radius * 0.95; // 体型明显更小可吞噬
        if (canDevourByLevel || canDevourBySize) {
          this.creatures.splice(i, 1);
          const gained = computeDevourExp(this.player.level, c.level);
          this.player.gainExp(gained);
          if (this.player.triggerDevour) this.player.triggerDevour();
          this.addExpText(gained);
        } else {
          // 更强时把玩家轻微弹开
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const push = 8 + Math.max(0, c.level - this.player.level) * 2;
          this.player.x -= nx * push;
          this.player.y -= ny * push;
          // 接触强者扣减经验（带冷却）
          if (c.level > this.player.level && this.player.contactPenaltyCooldown <= 0) {
            const penalty = computeContactPenalty(this.player.level, c.level);
            this.player.gainExp(-penalty);
            this.addExpText(-penalty);
            this.player.contactPenaltyCooldown = contactPenalty.cooldownSec;
          }
        }
      }
    }
  }
  addExpText(amount) {
    const sign = amount >= 0 ? '+' : '';
    const text = `${sign}${amount} 经验`;
    const color = amount >= 0 ? '#4caf50' : '#ff5252';
    this.fxTexts.push(new FloatingText(this.player.x, this.player.y - this.player.radius - 8, text, color));
  }
  render() {
    const ctx = this.ctx;
    // 清屏
    ctx.clearRect(0, 0, this.screen.width, this.screen.height);

    const halfW = this.screen.width / 2;
    const halfH = this.screen.height / 2;
    // 世界坐标渲染：平移到摄像机视野
    ctx.save();
    ctx.translate(-this.camera.x + halfW, -this.camera.y + halfH);

    // 世界背景（深色底 + 网格）
    ctx.fillStyle = '#0c1022';
    ctx.fillRect(0, 0, this.world.width, this.world.height);
    const grid = 120;
    const vx0 = this.camera.x - halfW;
    const vy0 = this.camera.y - halfH;
    const vx1 = this.camera.x + halfW;
    const vy1 = this.camera.y + halfH;
    const startX = Math.max(0, Math.floor(vx0 / grid) * grid);
    const endX = Math.min(this.world.width, Math.ceil(vx1 / grid) * grid);
    const startY = Math.max(0, Math.floor(vy0 / grid) * grid);
    const endY = Math.min(this.world.height, Math.ceil(vy1 / grid) * grid);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += grid) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += grid) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // 渲染生物与玩家（世界坐标）
    for (const c of this.creatures) c.render(ctx);
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;
    this.player.render(ctx);
    ctx.restore();
    // 渲染浮动文本（世界坐标）
    for (const ft of this.fxTexts) ft.render(ctx);
    ctx.restore(); // 退出世界坐标，回到屏幕坐标

    // HUD（屏幕坐标，响应式字体）
    ctx.fillStyle = '#ffffff';
    const hudSize = Math.max(12, Math.min(20, Math.floor(this.screen.width * 0.02)));
    ctx.font = `${hudSize}px system-ui`;
    const hud = `等级 ${this.player.level}  经验 ${this.player.exp}/${this.player.expToNext}  生物:${this.creatures.length}`;
    ctx.fillText(hud, 12, 22);
    const barW = 160, barH = 8;
    ctx.strokeStyle = '#aaa';
    ctx.strokeRect(12, 28, barW, barH);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(12, 28, barW * (this.player.exp / this.player.expToNext), barH);
  }
}