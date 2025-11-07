export const progression = {
  baseExp: 3,
  growth: 1.25,
};

export function expToNext(level, base = progression.baseExp, growth = progression.growth) {
  return Math.floor(base * Math.pow(growth, Math.max(0, level - 1)));
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
  perLevelDiff: 1,   // 每级差额外扣减（仅当目标等级高于玩家）
  cooldownSec: 0.6,  // 扣减冷却，避免持续碰撞秒光经验
};

export function computeContactPenalty(playerLevel, targetLevel) {
  const diff = Math.max(0, targetLevel - playerLevel);
  return contactPenalty.base + diff * contactPenalty.perLevelDiff;
}