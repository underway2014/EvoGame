export default class TouchJoystick {
  constructor(container, stick) {
    this.container = container;
    this.stick = stick;
    this.active = false;
    this.origin = { x: 0, y: 0 };
    this.axis = { x: 0, y: 0 };
    this.max = Math.min(container.clientWidth, container.clientHeight) * 0.5;
    this._onDown = this.onDown.bind(this);
    this._onMove = this.onMove.bind(this);
    this._onUp = this.onUp.bind(this);
    container.addEventListener('pointerdown', this._onDown);
    window.addEventListener('pointermove', this._onMove);
    window.addEventListener('pointerup', this._onUp);
  }
  onDown(e) {
    const rect = this.container.getBoundingClientRect();
    this.active = true;
    this.origin.x = e.clientX - rect.left;
    this.origin.y = e.clientY - rect.top;
    this.updateStick(this.origin.x, this.origin.y);
  }
  onMove(e) {
    if (!this.active) return;
    const rect = this.container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x - this.origin.x;
    const dy = y - this.origin.y;
    const len = Math.hypot(dx, dy);
    const clamp = Math.min(this.max, len);
    const nx = len > 0 ? dx / len : 0;
    const ny = len > 0 ? dy / len : 0;
    const px = this.origin.x + nx * clamp;
    const py = this.origin.y + ny * clamp;
    this.updateStick(px, py);
    this.axis.x = nx;
    this.axis.y = ny;
  }
  onUp() {
    this.active = false;
    this.axis.x = 0; this.axis.y = 0;
    this.updateStick(this.container.clientWidth / 2, this.container.clientHeight / 2);
  }
  updateStick(x, y) {
    this.stick.style.left = x + 'px';
    this.stick.style.top = y + 'px';
    this.stick.style.transform = 'translate(-50%, -50%)';
  }
  getAxis() {
    return { x: this.axis.x, y: this.axis.y };
  }
}