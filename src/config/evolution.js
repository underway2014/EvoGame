// 玩家进化配置：达到指定等级后变为下一类鱼
export const evolutionForms = [
  { level: 1, id: 'minnow', shape: 'fish', color: '#ffdd55', name: '小鱼' },
  { level: 2, id: 'goby',   shape: 'fish_goby', color: '#c58b4b', name: '虾虎鱼' },
  { level: 4, id: 'perch',  shape: 'fish_perch', color: '#7aa35a', name: '河鲈' },
  // 可继续追加更多形态，直到鲨鱼
];

export function getFormForLevel(level) {
  let form = evolutionForms[0];
  for (const f of evolutionForms) {
    if (level >= f.level) form = f;
    else break;
  }
  return form;
}