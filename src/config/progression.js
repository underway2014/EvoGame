export const progression = {
  baseExp: 2,
  growth: 1.25,
  // 全局倍增系数：提高升级所需经验。可根据需要调整。
  expMultiplier: 2,
  // 分段倍增：到达某等级后继续提高曲线（可选）。
  // 示例：到达10级后×1.2、到达20级后×1.4。
  tierMultipliers: [
    // { level: 10, multiplier: 1.2 },
    // { level: 20, multiplier: 1.4 },
  ],
};

export function expToNext(level, base = progression.baseExp, growth = progression.growth) {
  const baseCurve = base * Math.pow(growth, Math.max(0, level - 1));
  let mul = progression.expMultiplier || 1;
  if (Array.isArray(progression.tierMultipliers)) {
    for (const t of progression.tierMultipliers) {
      if (t && typeof t.level === 'number' && typeof t.multiplier === 'number' && level >= t.level) {
        mul *= t.multiplier;
      }
    }
  }
  return Math.floor(baseCurve * mul);
}

// 吞噬经验配置：可在运行时调整
export const devourExp = {
  base: 1,           // 基础获得经验
  perLevelDiff: 1,   // 每级差额外经验（仅当玩家等级高于目标时）
  // 预留：体型加成系数（目前不使用，留作扩展）
  sizeBonusFactor: 0,
};

export function computeDevourExp(playerLevel, targetLevel) {
  const diff = Math.max(0, playerLevel - targetLevel);
  return devourExp.base + diff * devourExp.perLevelDiff;
}

// 接触强者经验扣减配置
export const contactPenalty = {
  base: 1,           // 基础扣减
  perLevelDiff: 3,   // 每级差额外扣减（仅当目标等级高于玩家）
  cooldownSec: 0.6,  // 扣减冷却，避免持续碰撞秒光经验
};

export function computeContactPenalty(playerLevel, targetLevel) {
  const diff = Math.max(0, targetLevel - playerLevel);
  return contactPenalty.base + diff * contactPenalty.perLevelDiff;
}