import { species } from './species.js';

export const spawnRules = {
  maxCreatures: 30,
  biasAroundPlayerLevel: { min: -1, max: 2 },
  spawnIntervalSec: 0.5,
  aggressiveRatioTarget: 0.5,
};

function clampLevel(level) { return Math.max(1, level); }

export function pickSpawnLevel(playerLevel) {
  const { min, max } = spawnRules.biasAroundPlayerLevel;
  const delta = Math.floor(min + Math.random() * (max - min + 1));
  return clampLevel(playerLevel + delta);
}

export function pickSpeciesByLevel(level) {
  // 根据物种的基础等级与目标等级距离来加权抽样
  const candidates = species.map((s) => {
    const diff = Math.abs((s.baseLevel || 1) - level);
    const weight = 1 / (1 + diff);
    return { id: s.id, weight };
  });
  const total = candidates.reduce((a, c) => a + c.weight, 0);
  let r = Math.random() * total;
  for (const c of candidates) {
    if (r < c.weight) return c.id;
    r -= c.weight;
  }
  return candidates[0].id;
}

function isAggressive(spec) {
  return (spec.behavior || '') === 'chase';
}

export function shouldSpawnAggressive(currentAggressiveCount, totalCount, targetRatio = spawnRules.aggressiveRatioTarget) {
  if (totalCount <= 0) return false;
  const currentRatio = currentAggressiveCount / totalCount;
  return currentRatio < targetRatio;
}

export function pickSpeciesByLevelWithAggression(level, needAggressive) {
  const pool = species.filter((s) => needAggressive ? isAggressive(s) : !isAggressive(s));
  const base = pool.length ? pool : species;
  const candidates = base.map((s) => {
    const diff = Math.abs((s.baseLevel || 1) - level);
    const weight = 1 / (1 + diff);
    return { id: s.id, weight };
  });
  const total = candidates.reduce((a, c) => a + c.weight, 0);
  let r = Math.random() * total;
  for (const c of candidates) {
    if (r < c.weight) return c.id;
    r -= c.weight;
  }
  return candidates[0]?.id || species[0].id;
}