import { chestConfig } from '../config/chest.js';

export function showChestOverlay(chest, onOpen) {
  const overlay = document.getElementById('chestOverlay');
  const img = document.getElementById('chestImg');
  const btn = document.getElementById('chestOpenBtn');
  img.src = './assets/objects/chest_closed.svg';
  overlay.classList.remove('hidden');

  const handler = () => {
    overlay.classList.add('hidden');
    btn.removeEventListener('click', handler);
    img.src = './assets/objects/chest_open.svg';
    if (onOpen) onOpen();
  };
  btn.addEventListener('click', handler);
}