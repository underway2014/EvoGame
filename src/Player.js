import Creature from './Creature.js';
import { progression, expToNext } from './config/progression.js';

export default class Player extends Creature {
  constructor(x, y) {
    super(x, y, 1, '#ffdd55');
    this.exp = 0;
    this.expToNext = expToNext(1);
    this.speed = 120;
  }
  update(dt, bounds, input) {
    const axis = input.getAxis();
    this.vx = axis.x * this.speed;
    this.vy = axis.y * this.speed;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    // 保持在边界内
    this.x = Math.max(this.radius, Math.min(bounds.width - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(bounds.height - this.radius, this.y));
  }
  gainExp(amount) {
    this.exp += amount;
    if (this.exp >= this.expToNext) {
      this.exp -= this.expToNext;
      this.level += 1;
      this.radius = 10 + this.level * 3;
      this.speed = Math.max(80, 140 - this.level * 5);
      this.expToNext = expToNext(this.level);
    }
  }
}