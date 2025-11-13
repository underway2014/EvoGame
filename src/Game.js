import Input from './Input.js';
import Player from './Player.js';
import Creature from './Creature.js';
import { species } from './config/species.js';
import { spawnRules, pickSpawnLevel, pickSpeciesByLevel, pickSpeciesByLevelWithAggression, shouldSpawnAggressive } from './config/spawn.js';
import { computeDevourExp, computeContactPenalty, contactPenalty } from './config/progression.js';
import { showEvolutionOverlay } from './ui/EvolutionOverlay.js';
import { showGameOverOverlay } from './ui/GameOverOverlay.js';
import Background from './Background.js';
import FloatingText from './FloatingText.js';
import Bubbles from './Bubbles.js';
import WaterParticles from './WaterParticles.js';
import Chest from './Chest.js';
import { chestConfig } from './config/chest.js';
import { showChestOverlay } from './ui/ChestOverlay.js';
import Dart from './Dart.js';
import { combatConfig } from './config/combat.js';

export default class Game {
  constructor(canvas, ctx, audio) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.audio = audio || null;
    // 使用CSS像素作为屏幕尺寸，避免与设备像素缩放混淆
    this.screen = { width: canvas.clientWidth || window.innerWidth, height: canvas.clientHeight || window.innerHeight };
    this.world = { width: 2400, height: 1800 };
    this.input = new Input();
    this.player = new Player(this.world.width / 2, this.world.height * 3 / 4);
    this.camera = { x: this.player.x, y: this.player.y };
    this.creatures = [];
    this.fxTexts = [];
    this.spawnInitial();
    this.spawnCooldown = 0;
    this.paused = false;
    this.gameOver = false;
    this.devouredCount = 0;
    this.elapsed = 0;
    this.fxTexts = this.fxTexts || [];
    this.background = new Background();
    this.bubbles = new Bubbles(this.world, this.background);
    this.waterParticles = new WaterParticles(this.world, 140);
    this.chests = [];
    this.chestSpawnCooldown = 0;
    this.darts = [];
    this.updateActionButtons();
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
    const aggressiveCount = this.creatures.reduce((acc, c) => acc + (c.behavior === 'chase' ? 1 : 0), 0);
    const needAggressive = shouldSpawnAggressive(aggressiveCount, this.creatures.length, spawnRules.aggressiveRatioTarget);
    const speciesId = pickSpeciesByLevelWithAggression(level, needAggressive);
    const spec = species.find(s => s.id === speciesId) || null;
    const x = Math.random() * this.world.width;
    const y = Math.random() * this.world.height;
    const c = new Creature(x, y, level, null, spec);
    this.creatures.push(c);
  }
  update(dt) {
    this.resize();
    // 若暂停，仅更新必要的屏幕数据与摄像机居中，无逻辑推进
    if (this.paused || this.gameOver) {
      const halfW = this.screen.width / 2;
      const halfH = this.screen.height / 2;
      this.camera.x = Math.max(halfW, Math.min(this.world.width - halfW, this.player.x));
      this.camera.y = Math.max(halfH, Math.min(this.world.height - halfH, this.player.y));
      return;
    }

    // 计时
    this.elapsed += dt;

    this.player.update(dt, this.world, this.input);
    this.updateActionButtons();
    const halfW = this.screen.width / 2;
    const halfH = this.screen.height / 2;
    const viewport = {
      x0: this.camera.x - halfW,
      y0: this.camera.y - halfH,
      x1: this.camera.x + halfW,
      y1: this.camera.y + halfH,
    };
    for (const c of this.creatures) c.update(dt, this.world, this.player, viewport);
    // 更新摄像机跟随与边界限制
    
    this.camera.x = Math.max(halfW, Math.min(this.world.width - halfW, this.player.x));
    this.camera.y = Math.max(halfH, Math.min(this.world.height - halfH, this.player.y));
    this.handleCollisions();
    this.maybeTriggerGameOver();
    this.bubbles.update(dt);
    this.waterParticles.update(dt);
    // 更新飞镖
    for (let i = this.darts.length - 1; i >= 0; i--) {
      const d = this.darts[i];
      d.update(dt);
      if (d.isDead(this.world)) this.darts.splice(i, 1);
    }
    // 玩家操作：加速与发射
    this.handlePlayerActions();
    // 宝箱生成
    this.chestSpawnCooldown -= dt;
    if (!this.paused && !this.gameOver && this.chestSpawnCooldown <= 0) {
      if (this.chests.length < chestConfig.maxCount && Math.random() < chestConfig.spawnProbability) {
        this.chests.push(new Chest(this.world));
      }
      this.chestSpawnCooldown = chestConfig.spawnIntervalSec;
    }
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
    // 玩家与宝箱交互
    if (this.chests) {
      for (let i = this.chests.length - 1; i >= 0; i--) {
        const chest = this.chests[i];
        const dx = chest.x - this.player.x;
        const dy = chest.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        if (dist < chest.radius + this.player.radius && chest.state === 'closed' && !this.paused && !this.gameOver) {
          this.paused = true;
          showChestOverlay(chest, () => {
            chest.applyReward(this.player);
            this.addExpText(chestConfig.expReward);
            this.chests.splice(i, 1);
            this.paused = false;
          });
        }
      }
    }
  }
  updateActionButtons() {
    const boostEl = document.getElementById('boostCount');
    const dartEl = document.getElementById('dartCount');
    if (boostEl) boostEl.textContent = String(this.player.boostUses || 0);
    if (dartEl) dartEl.textContent = String(this.player.dartAmmo || 0);
  }
  handlePlayerActions() {
    // 加速（Shift/Space）
    if (this.input.consumePress('ShiftLeft') || this.input.consumePress('Space')) {
      this.useBoost();
    }
    // 飞镖（KeyE）
    if (this.input.consumePress('KeyE')) {
      this.fireDart();
    }
    // 冷却递减（按dt）
    if (this.player.fireCooldown && this.player.fireCooldown > 0) this.player.fireCooldown = Math.max(0, this.player.fireCooldown - (1 / 60));
  }
  useBoost() {
    if (this.player.boostUses > 0 && (!this.player.boostActiveTimer || this.player.boostActiveTimer <= 0)) {
      this.player.boostActiveTimer = combatConfig.boost.durationSec;
      this.player.boostMultiplier = combatConfig.boost.multiplier;
      this.player.boostUses -= 1;
      this.updateActionButtons();
      return true;
    }
    return false;
  }
  fireDart() {
    if ((this.player.dartAmmo || 0) > 0 && (this.player.fireCooldown || 0) <= 0) {
      const angle = (this.player.facingAngle || 0);
      const d = new Dart(this.player.x, this.player.y, angle, combatConfig.darts.speed, combatConfig.darts.lifetimeSec, combatConfig.darts.radius);
      this.darts.push(d);
      this.player.dartAmmo -= 1;
      this.player.fireCooldown = combatConfig.darts.fireCooldownSec;
      this.updateActionButtons();
      return true;
    }
    return false;
  }
  maybeTriggerEvolution() {
    const form = this.player.pendingEvolutionForm;
    if (form && !this.paused) {
      this.paused = true;
      showEvolutionOverlay(form, () => {
        this.player.applyForm(form);
        this.paused = false;
      });
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
          this.devouredCount += 1;
          this.maybeTriggerEvolution();
        } else {
          // 更强时把玩家轻微弹开
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          const push = 8 + Math.max(0, c.level - this.player.level) * 2;
          this.player.x -= nx * push;
          this.player.y -= ny * push;
          // 接触强者扣减经验（带冷却）
          if (c.level > this.player.level && this.player.contactPenaltyCooldown <= 0) {
            const prevLevel = this.player.level;
            const penalty = computeContactPenalty(this.player.level, c.level);
            this.player.gainExp(-penalty);
            this.addExpText(-penalty);
            this.player.contactPenaltyCooldown = contactPenalty.cooldownSec;
            // 如果发生掉级，给出提示
            if (this.player.level < prevLevel) {
              this.addLevelDownText(this.player.level);
            }
          }
        }
      }
    }
    // 飞镖与生物碰撞
    for (let di = this.darts.length - 1; di >= 0; di--) {
      const d = this.darts[di];
      for (let ci = this.creatures.length - 1; ci >= 0; ci--) {
        const c = this.creatures[ci];
        const dx = c.x - d.x;
        const dy = c.y - d.y;
        const dist = Math.hypot(dx, dy);
        if (dist < c.radius + d.radius) {
          // 等级差消耗规则
          const levelDiff = Math.max(0, c.level - this.player.level);
          let requiredAmmo = 0;
          if (levelDiff > 0) {
            requiredAmmo = Math.ceil(levelDiff * (combatConfig.darts.levelDiffCostFactor || 1));
          }
          if ((this.player.dartAmmo || 0) >= requiredAmmo) {
            // 消耗额外弹药并命中
            this.player.dartAmmo -= requiredAmmo;
            this.updateActionButtons();
            this.creatures.splice(ci, 1);
            const gained = combatConfig.darts.expOnHit(this.player.level, c.level);
            this.player.gainExp(gained);
            this.addExpText(gained);
            if (this.audio) this.audio.ping(1100, 0.08, 0.25);
          } else {
            // 弹药不足，反馈提示
            const missing = requiredAmmo - (this.player.dartAmmo || 0);
            const text = `需要飞镖:${requiredAmmo}`;
            this.fxTexts.push(new FloatingText(this.player.x, this.player.y - this.player.radius - 18, text, '#ff5252'));
          }
          // 命中后移除该飞镖
          this.darts.splice(di, 1);
          break;
        }
      }
    }
  }
  maybeTriggerGameOver() {
    if (this.player.level === 1 && this.player.exp < 0 && !this.gameOver) {
      this.gameOver = true;
      this.paused = true;
      const stats = { devoured: this.devouredCount, time: this.elapsed, level: this.player.level };
      showGameOverOverlay(stats, () => this.restart());
    }
  }
  restart() {
    // 重置核心状态
    this.player = new Player(this.world.width / 2, this.world.height / 2);
    this.creatures = [];
    this.fxTexts = [];
    this.devouredCount = 0;
    this.elapsed = 0;
    this.spawnCooldown = 0;
    this.gameOver = false;
    this.paused = false;
    this.camera = { x: this.player.x, y: this.player.y };
    this.spawnInitial();
  }
  addExpText(amount) {
    const sign = amount >= 0 ? '+' : '';
    const text = `${sign}${amount} 经验`;
    const color = amount >= 0 ? '#4caf50' : '#ff5252';
    this.fxTexts.push(new FloatingText(this.player.x, this.player.y - this.player.radius - 8, text, color));
  }
  addLevelDownText(newLevel) {
    const text = `掉级至 L${newLevel}`;
    const color = '#ff5252';
    this.fxTexts.push(new FloatingText(this.player.x, this.player.y - this.player.radius - 18, text, color));
  }
  render() {
    const ctx = this.ctx;
    // 清屏
    ctx.clearRect(0, 0, this.screen.width, this.screen.height);
    // 屏幕层不再填充纯色/渐变，背景由世界层的SVG全覆盖

    const halfW = this.screen.width / 2;
    const halfH = this.screen.height / 2;
    // 世界坐标渲染：平移到摄像机视野
    ctx.save();
    ctx.translate(-this.camera.x + halfW, -this.camera.y + halfH);

    // 世界背景（海底SVG缩放铺满 + 顶端光线渐变）
    this.background.render(ctx, this.world, this.camera);
    // 水体微粒与水泡（在背景之上、网格之下）
    const grid = 120;
    const vx0 = this.camera.x - halfW;
    const vy0 = this.camera.y - halfH;
    const vx1 = this.camera.x + halfW;
    const vy1 = this.camera.y + halfH;
    const viewport = { x0: vx0, y0: vy0, x1: vx1, y1: vy1 };
    // 宝箱渲染（裁剪屏幕外）
    for (const chest of this.chests) {
      const inViewChest = (chest.x + chest.radius >= vx0 && chest.x - chest.radius <= vx1 && chest.y + chest.radius >= vy0 && chest.y - chest.radius <= vy1);
      if (!inViewChest) continue;
      chest.render(ctx);
    }
    this.waterParticles.render(ctx, viewport);
    this.bubbles.render(ctx, viewport);
    
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

    // 渲染生物与玩家（世界坐标，裁剪屏幕外）
    for (const c of this.creatures) {
      const inView = (c.x + c.radius >= vx0 && c.x - c.radius <= vx1 && c.y + c.radius >= vy0 && c.y - c.radius <= vy1);
      if (!inView) continue;
      c.render(ctx);
    }
    // 渲染飞镖
    for (let i = this.darts.length - 1; i >= 0; i--) {
      const d = this.darts[i];
      if (d.isDead(this.world)) { this.darts.splice(i, 1); continue; }
      const inViewD = (d.x + d.radius >= vx0 && d.x - d.radius <= vx1 && d.y + d.radius >= vy0 && d.y - d.radius <= vy1);
      if (!inViewD) continue;
      d.render(ctx);
    }
    ctx.save();
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 12;
    this.player.render(ctx);
    ctx.restore();
    // 渲染浮动文本（世界坐标，裁剪屏幕外）
    for (const ft of this.fxTexts) {
      const inView = (ft.x >= vx0 && ft.x <= vx1 && ft.y >= vy0 && ft.y <= vy1);
      if (!inView) continue;
      ft.render(ctx);
    }
    ctx.restore(); // 退出世界坐标，回到屏幕坐标

    const hudSize = Math.max(12, Math.min(20, Math.floor(this.screen.width * 0.02)));
    const ratio = Math.max(0, Math.min(1, this.player.exp / this.player.expToNext));
    const mm = String(Math.floor(this.elapsed / 60)).padStart(2, '0');
    const ss = String(Math.floor(this.elapsed % 60)).padStart(2, '0');
    const px = 12;
    const py = 12;
    const pw = Math.max(260, Math.min(360, Math.floor(this.screen.width * 0.3)));
    const barH = 10;
    const ph = hudSize * 2 + 12 + barH + 24;
    ctx.save();
    ctx.beginPath();
    const r = 10;
    ctx.moveTo(px + r, py);
    ctx.lineTo(px + pw - r, py);
    ctx.quadraticCurveTo(px + pw, py, px + pw, py + r);
    ctx.lineTo(px + pw, py + ph - r);
    ctx.quadraticCurveTo(px + pw, py + ph, px + pw - r, py + ph);
    ctx.lineTo(px + r, py + ph);
    ctx.quadraticCurveTo(px, py + ph, px, py + ph - r);
    ctx.lineTo(px, py + r);
    ctx.quadraticCurveTo(px, py, px + r, py);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = `600 ${hudSize}px system-ui`;
    const line1Y = py + hudSize + 8;
    ctx.fillText(`等级 ${this.player.level}`, px + 16, line1Y);
    ctx.font = `500 ${Math.max(10, hudSize - 2)}px system-ui`;
    const line2Y = line1Y + hudSize + 8;
    ctx.fillText(`吞噬 ${this.devouredCount}`, px + 16, line2Y);
    const timeText = `时间 ${mm}:${ss}`;
    const tWidth = ctx.measureText(timeText).width;
    ctx.fillText(timeText, px + pw - 16 - tWidth, line2Y);
    const barX = px + 16;
    const barY = line2Y + 10;
    const barW = pw - 32;
    ctx.beginPath();
    const br = barH / 2;
    ctx.moveTo(barX + br, barY);
    ctx.lineTo(barX + barW - br, barY);
    ctx.quadraticCurveTo(barX + barW, barY, barX + barW, barY + br);
    ctx.lineTo(barX + barW, barY + barH - br);
    ctx.quadraticCurveTo(barX + barW, barY + barH, barX + barW - br, barY + barH);
    ctx.lineTo(barX + br, barY + barH);
    ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barH - br);
    ctx.lineTo(barX, barY + br);
    ctx.quadraticCurveTo(barX, barY, barX + br, barY);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.stroke();
    const fillW = Math.max(0, Math.floor(barW * ratio));
    if (fillW > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(barX + br, barY);
      const fEnd = barX + fillW;
      const right = Math.min(fEnd, barX + barW);
      if (fillW <= br) {
        ctx.arc(barX + br, barY + br, br, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(barX + br, barY);
      } else {
        ctx.lineTo(right - br, barY);
        ctx.quadraticCurveTo(right, barY, right, barY + br);
        ctx.lineTo(right, barY + barH - br);
        ctx.quadraticCurveTo(right, barY + barH, right - br, barY + barH);
        ctx.lineTo(barX + br, barY + barH);
        ctx.quadraticCurveTo(barX, barY + barH, barX, barY + barH - br);
        ctx.lineTo(barX, barY + br);
        ctx.quadraticCurveTo(barX, barY, barX + br, barY);
      }
      const grad = ctx.createLinearGradient(barX, barY, barX + barW, barY);
      grad.addColorStop(0, '#4caf50');
      grad.addColorStop(1, '#00bcd4');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    }
    ctx.font = `600 ${Math.max(10, hudSize - 3)}px system-ui`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const expText = `经验 ${Math.max(0, this.player.exp)}/${this.player.expToNext}`;
    ctx.fillText(expText, barX + barW / 2, barY + barH / 2);
    ctx.restore();
  }
}
