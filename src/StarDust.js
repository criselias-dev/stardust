// src/StarDust.js
import CONFIG from './config.js';
import { rand, clamp, lerp } from './math.js';

export class StarDust {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spread = Math.min(vw, vh) * 1.05;

    this.x = rand(-spread, spread);
    this.y = rand(-spread * 0.8, spread * 0.8);

    this.z = initial
      ? rand(120, CONFIG.DEPTH_FAR)
      : rand(CONFIG.DEPTH_NEAR + 40, CONFIG.DEPTH_FAR);

    this.vz = rand(
      CONFIG.FORWARD_SPEED * CONFIG.STAR_DUST_BASE_SPEED * 0.8,
      CONFIG.FORWARD_SPEED * CONFIG.STAR_DUST_BASE_SPEED * 1.25
    );

    this.size = rand(0.22, 0.52);
    this.alpha = rand(0.025, 0.085);

    this.driftX = rand(-0.015, 0.015);
    this.driftY = rand(-0.012, 0.012);
  }

  update() {
    this.z -= this.vz;

    // fluxo herdado do campo de dark matter
    const dmFlow = window.getDarkMatterFlow
      ? window.getDarkMatterFlow(this.x, this.y)
      : { x: 0, y: 0 };

    this.x += dmFlow.x * 0.35 + this.driftX;
    this.y += dmFlow.y * 0.28 + this.driftY;

    // leve amortecimento para não virar "nuvem maluca"
    this.driftX *= 0.998;
    this.driftY *= 0.998;

    // atração pela galáxia mais próxima
    const nearest = window.getNearestGalaxy
      ? window.getNearestGalaxy(this.x, this.y)
      : { galaxy: null, distSq: Infinity };

    if (nearest.galaxy) {
      const radius = CONFIG.STAR_DUST_ATTRACTION_RADIUS;
      const radiusSq = radius * radius;

      if (nearest.distSq < radiusSq) {
        const dx = nearest.galaxy.x - this.x;
        const dy = nearest.galaxy.y - this.y;
        const d = Math.sqrt(nearest.distSq) || 0.0001;

        const t = 1 - d / radius;
        const pull = CONFIG.STAR_DUST_PULL * t;

        this.x += (dx / d) * pull * 10;
        this.y += (dy / d) * pull * 8;

        if (d < CONFIG.STAR_DUST_CAPTURE_RADIUS) {
          this.reset(false);
          return;
        }
      }
    }

    // bounds
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const limitX = Math.min(vw, vh) * 1.9;
    const limitY = Math.min(vw, vh) * 1.5;

    if (Math.abs(this.x) > limitX || Math.abs(this.y) > limitY || this.z < 10) {
      this.reset(false);
    }
  }

  draw(ctx, project) {
    const zSafe = Math.max(this.z, 10);
    const p = project(this.x, this.y, zSafe);

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (p.x < -30 || p.x > vw + 30 || p.y < -30 || p.y > vh + 30) {
      return;
    }

    const depth = clamp(1 - zSafe / CONFIG.DEPTH_FAR, 0, 1);
    const r = Math.max(0.12, this.size * p.scale * lerp(0.65, 1.1, depth));
    const a = this.alpha * lerp(0.45, 1.0, depth);

    ctx.beginPath();
    ctx.fillStyle = `rgba(185, 235, 255, ${a})`;
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}