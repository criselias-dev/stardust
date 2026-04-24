// src/Filaments.js
import CONFIG from './config.js';
import { clamp, hsl } from './math.js';

export function drawFilaments(ctx, galaxies, darkMatter, cx, cy, project) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const visible = [];

  for (const g of galaxies) {
    const p = g.getScreenData(cx, cy, project);

    if (
      p.x > -220 && p.x < w + 220 &&
      p.y > -220 && p.y < h + 220 &&
      g.z > 8
    ) {
      visible.push({ g, p });
    }
  }

  // conexões entre galáxias visíveis
  const maxDistSq = CONFIG.FILAMENT_LINKS_MAX_DIST * CONFIG.FILAMENT_LINKS_MAX_DIST;

  for (let i = 0; i < visible.length; i++) {
    const a = visible[i];

    for (let j = i + 1; j < visible.length; j++) {
      const b = visible[j];

      const dx = a.p.x - b.p.x;
      const dy = a.p.y - b.p.y;
      const dsSq = dx * dx + dy * dy;

      if (dsSq >= maxDistSq) continue;

      const zGap = Math.abs(a.g.z - b.g.z);
      if (zGap > 220) continue;

      const ds = Math.sqrt(dsSq);
      const alpha = (1 - ds / CONFIG.FILAMENT_LINKS_MAX_DIST) * 0.18;
      const width = clamp((a.p.scale + b.p.scale) * 2.2, 1.4, 8.8);

      const grad = ctx.createLinearGradient(a.p.x, a.p.y, b.p.x, b.p.y);
      grad.addColorStop(0, hsl(a.g.hueA, 90, 70, alpha * 0.65));
      grad.addColorStop(0.5, `rgba(220,255,255,${alpha * 0.9})`);
      grad.addColorStop(1, hsl(b.g.hueC, 90, 70, alpha * 0.65));

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = width;
      ctx.moveTo(a.p.x, a.p.y);

      const mx = (a.p.x + b.p.x) * 0.5 + (a.p.y - b.p.y) * 0.03;
      const my = (a.p.y + b.p.y) * 0.5 + (b.p.x - a.p.x) * 0.03;

      ctx.quadraticCurveTo(mx, my, b.p.x, b.p.y);
      ctx.stroke();
    }
  }

  // névoa / perturbação sutil do dark matter
  if (darkMatter && darkMatter.length > 0) {
    for (let i = 0; i < 24; i++) {
      const dm = darkMatter[(Math.random() * darkMatter.length) | 0];
      if (!dm) continue;

      const p = project(dm.x, dm.y, Math.max(dm.z, 12));
      const r = clamp((CONFIG.PROJECTION / Math.max(dm.z, 30)) * 30, 10, 50);

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
}

export function drawDepthFog(ctx, cx, cy) {
  const w = window.innerWidth;
  const h = window.innerHeight;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.75);
  grad.addColorStop(0, 'rgba(12,18,36,0.05)');
  grad.addColorStop(0.45, 'rgba(5,8,18,0.03)');
  grad.addColorStop(1, 'rgba(0,0,0,0.10)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}