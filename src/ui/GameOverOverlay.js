export function showGameOverOverlay(stats, onRestart) {
  const overlay = document.getElementById('gameOverOverlay');
  const goStats = document.getElementById('goStats');
  const btn = document.getElementById('goRestart');
  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    const mm = String(m).padStart(2, '0');
    const ss = String(sec).padStart(2, '0');
    return `${mm}:${ss}`;
  };
  goStats.innerHTML = `吞噬数量：<b>${stats.devoured}</b><br/>持续时间：<b>${format(stats.time)}</b><br/>当前等级：<b>${stats.level}</b>`;
  overlay.classList.remove('hidden');
  const handler = () => {
    overlay.classList.add('hidden');
    btn.removeEventListener('click', handler);
    if (onRestart) onRestart();
  };
  btn.addEventListener('click', handler);
}