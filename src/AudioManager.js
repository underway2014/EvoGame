import { audioConfig } from './config/audio.js';

export default class AudioManager {
  constructor() {
    this.ctx = null;
    this.running = false;
    this.gain = null;
    this.nodes = [];
    this.volume = audioConfig.volume ?? 0.6;
    this.audioEl = null;
    this.destination = null;
  }
  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
  }
  buildGraph() {
    const ctx = this.ctx;
    const master = ctx.createGain();
    master.gain.value = this.volume;
    master.connect(ctx.destination);
    this.gain = master;

    // 低频噪声 → 低通，模拟水下环境
    const bufferSize = 2 * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.35;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 600;
    noise.connect(lp);
    lp.connect(master);

    // 两个轻微的背景音垫（低音/中音）
    const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.value = 120;
    const g1 = ctx.createGain(); g1.gain.value = 0.06; osc1.connect(g1); g1.connect(master);
    const osc2 = ctx.createOscillator(); osc2.type = 'triangle'; osc2.frequency.value = 220;
    const g2 = ctx.createGain(); g2.gain.value = 0.05; osc2.connect(g2); g2.connect(master);

    // LFO 轻微摆动低通频率，制造水下波动
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.25;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 60; // 影响 cutoff 幅度
    lfo.connect(lfoGain); lfoGain.connect(lp.frequency);

    this.nodes = [noise, lp, master, osc1, g1, osc2, g2, lfo, lfoGain];
  }
  async start(audioEl = null) {
    this.init();
    if (!this.ctx || this.running) return false;
    if (this.ctx.state === 'suspended') { try { this.ctx.resume(); } catch {} }
    this.audioEl = audioEl || this.audioEl || document.getElementById('bgAudio');
    // 若提供mp3地址，优先使用文件播放；否则用WebAudio流
    if (this.audioEl) {
      if (audioConfig.bgmUrl && this.audioEl.src !== audioConfig.bgmUrl) {
        this.audioEl.src = audioConfig.bgmUrl;
        try { await this.audioEl.play(); this.running = true; return true; } catch { this.running = false; return false; }
      } else {
        // 构建WebAudio并将master输出到MediaStreamDestination
        this.buildGraph();
        this.destination = this.ctx.createMediaStreamDestination();
        this.gain.disconnect();
        this.gain.connect(this.destination);
        this.gain.connect(this.ctx.destination);
        for (const n of this.nodes) { if (n.start) try { n.start(); } catch {} }
        if (this.audioEl.srcObject !== this.destination.stream) {
          this.audioEl.srcObject = this.destination.stream;
        }
        try { await this.audioEl.play(); } catch {}
        this.running = true; return true;
      }
    } else {
      // 无audio元素时，直接走WebAudio（某些环境可行）
      this.buildGraph();
      for (const n of this.nodes) { if (n.start) try { n.start(); } catch {} }
      this.ping(440, 0.15, 0.2);
      this.running = true; return true;
    }
    this.running = true; return true;
  }
  stop() {
    if (!this.ctx || !this.running) return;
    for (const n of this.nodes) { if (n.stop) try { n.stop(); } catch {} }
    this.nodes = [];
    this.running = false;
    // 断开audio元素
    if (this.audioEl) {
      try { this.audioEl.pause(); } catch {}
      try { this.audioEl.srcObject = null; } catch {}
    }
  }
  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.gain) this.gain.gain.value = this.volume;
  }
  ping(freq = 440, durationSec = 0.1, gainVal = 0.25) {
    if (!this.ctx || !this.gain) return;
    const osc = this.ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
    const g = this.ctx.createGain(); g.gain.value = gainVal;
    osc.connect(g); g.connect(this.gain);
    const now = this.ctx.currentTime;
    g.gain.setValueAtTime(gainVal, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    try { osc.start(); } catch {}
    try { osc.stop(now + durationSec); } catch {}
  }
}