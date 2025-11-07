// 玩家进化配置：达到指定等级后变为下一类鱼
export const evolutionForms = [
  { level: 1, id: 'minnow', shape: 'fish', color: '#ffdd55', name: '小鱼' },
  { level: 4, id: 'goby',   shape: 'fish_goby', color: '#c58b4b', name: '虾虎鱼' },
  { level: 7, id: 'perch',  shape: 'fish_perch', color: '#7aa35a', name: '河鲈' },
  { level: 10, id: 'bonitoJ', shape: 'fish_bonito', color: '#2a75c7', name: '鲣鱼幼体' },
  { level: 13, id: 'moray',   shape: 'fish_moray', color: '#3a7a59', name: '海鳗' },
  { level: 16, id: 'piranha', shape: 'fish_piranha', color: '#c94040', name: '食人鱼' },
  { level: 19, id: 'barracuda', shape: 'fish_barracuda', color: '#4f8bd6', name: '梭鱼' },
  { level: 22, id: 'tuna',    shape: 'fish_tuna', color: '#1f4c8f', name: '金枪鱼' },
  { level: 25, id: 'sailfish', shape: 'fish_sailfish', color: '#173a78', name: '旗鱼' },
  { level: 28, id: 'reefSharkJ', shape: 'fish_reef_shark', color: '#7b8a99', name: '礁鲨幼体' },
  { level: 31, id: 'shark',  shape: 'fish_shark', color: '#6c7c8c', name: '鲨鱼' },
];

export function getFormForLevel(level) {
  let form = evolutionForms[0];
  for (const f of evolutionForms) {
    if (level >= f.level) form = f;
    else break;
  }
  return form;
}