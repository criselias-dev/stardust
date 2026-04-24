// src/DarkMatter.js
import CONFIG from './config.js';
import { rand, project } from './math.js';

export class DarkMatter {
  constructor() {
    this.reset();
  }

  reset() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spread = Math.min(vw, vh) * 0.9;

    this.x = rand(-spread, spread);
    this.y = rand(-spread * 1.4, spread * 1.4);
    this.z = rand(80, CONFIG.DEPTH_FAR);
    this.vz = rand(CONFIG.FORWARD_SPEED * 0.55, CONFIG.FORWARD_SPEED * 1.05);
  }

  update() {
    this.z -= this.vz;

    if (this.z < 10) {
      this.reset();
    }
  }

  draw(ctx, cx, cy) {
    const p = project(this.x, this.y, Math.max(this.z, 12), cx, cy, CONFIG.PROJECTION);
    const r = Math.min(
      Math.max((CONFIG.PROJECTION / Math.max(this.z, 20)) * 20, 8),
      45
    );

    const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
    grad.addColorStop(0, 'rgba(120,100,255,0.02)');
    grad.addColorStop(0.5, 'rgba(40,20,80,0.01)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.beginPath();
    ctx.fillStyle = grad;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}