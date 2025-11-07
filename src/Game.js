import Input from './Input.js';
import Player from './Player.js';
import Creature from './Creature.js';
import { species } from './config/species.js';
import { spawnRules, pickSpawnLevel, pickSpeciesByLevel } from './config/spawn.js';

export default class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.bounds = { width: canvas.width, height: canvas.height };
    this.input = new Input();
    this.player = new Player(this.bounds.width / 2, this.bounds.height / 2);
    this.creatures = [];
    this.spawnInitial();
    this.spawnCooldown = 0;
  }
  resize() {
    this.bounds.width = this.canvas.width;
    this.bounds.height = this.canvas.height;
  }
  spawnInitial() {
    for (let i = 0; i < 15; i++) this.spawnCreature();
  }
  spawnCreature() {
    const level = pickSpawnLevel(this.player.level);
    const speciesId = pickSpeciesByLevel(level);
    const spec = species.find(s => s.id === speciesId) || null;
    const x = Math.random() * this.bounds.width;
    const y = Math.random() * this.bounds.height;
    const c = new Creature(x, y, level, null, spec);
    this.creatures.push(c);
  }
  update(dt) {
    this.resize();
    this.player.update(dt, this.bounds, this.input);
    for (const c of this.creatures) c.update(dt, this.bounds);
    this.handleCollisions();
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
          this.player.gainExp(1 + Math.max(0, this.player.level - c.level));
        } else {
          // 更强时把玩家轻微弹开
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const push = 8 + Math.max(0, c.level - this.player.level) * 2;
          this.player.x -= nx * push;
          this.player.y -= ny * push;
        }
      }
    }
  }
  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.bounds.width, this.bounds.height);
    // 背景
    ctx.fillStyle = '#0f1225';
    ctx.fillRect(0, 0, this.bounds.width, this.bounds.height);

    for (const c of this.creatures) c.render(ctx);
    // 玩家加一点高光
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;
    this.player.render(ctx);
    ctx.restore();

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px system-ui';
    const hud = `等级 ${this.player.level}  经验 ${this.player.exp}/${this.player.expToNext}  生物:${this.creatures.length}`;
    ctx.fillText(hud, 12, 22);
    const barW = 160, barH = 8;
    ctx.strokeStyle = '#aaa';
    ctx.strokeRect(12, 28, barW, barH);
    ctx.fillStyle = '#4caf50';
    ctx.fillRect(12, 28, barW * (this.player.exp / this.player.expToNext), barH);
  }
}