export const progression = {
  baseExp: 3,
  growth: 1.25,
};

export function expToNext(level, base = progression.baseExp, growth = progression.growth) {
  return Math.floor(base * Math.pow(growth, Math.max(0, level - 1)));
}