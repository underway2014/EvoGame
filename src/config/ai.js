// 生物AI配置：高等级生物攻击玩家的概率与时长等
export const aggression = {
  probability: 0.003,       // 触发攻击的概率（默认50%）
  levelAdvantage: 1,      // 至少高出多少等级才有资格攻击
  durationSec: 1.6,       // 一次攻击持续时间
  cooldownSec: 5.0,       // 攻击冷却，避免频繁触发
  speedMultiplier: 1.25,  // 攻击时速度倍率
};