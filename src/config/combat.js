export const combatConfig = {
  boost: {
    durationSec: 3.0,
    multiplier: 2,
    baseUsesOnStart: 2,
    addUsesPerLevel: (level) => (level % 3 === 0 ? 2 : 0), // 每5级+1次
  },
  darts: {
    baseAmmoOnStart: 13,
    addAmmoPerLevel: (level) => (level % 1 === 0 ? 1 : 0), // 每3级+1枚
    speed: 380,
    lifetimeSec: 3.0,
    radius: 4,
    fireCooldownSec: 0.25,
    expOnHit: (playerLevel, targetLevel) => 1, // 命中经验（可改为computeDevourExp）
    levelDiffCostFactor: 2,
  },
};