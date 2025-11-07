import TouchJoystick from './TouchJoystick.js';

export default class Input {
  constructor() {
    this.keys = new Set();
    this.joystick = null;
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    // 初始化摇杆（在触控设备显示）
    const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const container = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    if (container && stick && isCoarse) {
      this.joystick = new TouchJoystick(container, stick);
    }
  }
  isDown(code) {
    return this.keys.has(code);
  }
  getAxis() {
    let x = 0, y = 0;
    if (this.isDown('ArrowLeft') || this.isDown('KeyA')) x -= 1;
    if (this.isDown('ArrowRight') || this.isDown('KeyD')) x += 1;
    if (this.isDown('ArrowUp') || this.isDown('KeyW')) y -= 1;
    if (this.isDown('ArrowDown') || this.isDown('KeyS')) y += 1;
    const kbLen = Math.hypot(x, y);
    if (this.joystick) {
      const j = this.joystick.getAxis();
      // 优先使用摇杆（移动端），若键盘存在则合并并归一化
      if (kbLen === 0) { x = j.x; y = j.y; }
      else { x += j.x; y += j.y; }
    }
    const len = Math.hypot(x, y);
    if (len > 0) { x /= len; y /= len; }
    return { x, y };
  }
}