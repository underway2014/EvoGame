export function showPauseOverlay(stats, onResume) {
  const overlay = document.getElementById('pauseOverlay');
  const pStats = document.getElementById('pauseStats');
  const btn = document.getElementById('pauseResume');
  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const mm = String(m).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    return `${mm}:${ss}`;
  };
  pStats.innerHTML = `当前等级：<b>${stats.level}</b><br/>吞噬数量：<b>${stats.devoured}</b><br/>游戏时长：<b>${format(stats.time)}</b>`;
  overlay.classList.remove('hidden');
  const handler = () => {
    overlay.classList.add('hidden');
    btn.removeEventListener('click', handler);
    if (onResume) onResume();
  };
  btn.addEventListener('click', handler);
}
