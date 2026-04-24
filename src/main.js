// src/main.js
import './style.css';
import CONFIG from './config.js';
import { Galaxy } from './Galaxy.js';
import { DarkMatter } from './DarkMatter.js';
import { Explosion } from './Explosion.js';
import { StarDust } from './StarDust.js';
import { drawFilaments, drawDepthFog } from './Filaments.js';
import { dist3Sq, project as mathProject } from './math.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector('#app');

  app.innerHTML = `
  <canvas id="universe"></canvas>

  <div class="overlay-ui">
    <div class="brand-block">
      <div class="brand-title">Stardust - String Theory</div>
      <div class="brand-subtitle">by Cris Elias</div>
    </div>

    <div class="action-block">
      <a href="https://github.com/criselias-dev" target="_blank" rel="noopener noreferrer" class="ui-button primary" id="githubBtn" aria-label="Visitar portfólio no GitHub">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      </a>
      <button class="ui-button secondary" id="fullscreenBtn" aria-label="Entrar em tela cheia">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h6v6"/>
          <path d="M9 21H3v-6"/>
          <path d="M21 3l-7 7"/>
          <path d="M3 21l7-7"/>
        </svg>
      </button>
    </div>
  </div>
`;

const canvas = document.querySelector('#universe');
const ctx = canvas.getContext('2d');
const fullscreenBtn = document.querySelector('#fullscreenBtn');
let w = 0;
let h = 0;
let cx = 0;
let cy = 0;

function resize() {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

  w = window.innerWidth;
  h = window.innerHeight;
  cx = w * 0.5;
  cy = h * 0.5;

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

resize();
window.addEventListener('resize', resize);

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen não suportado ou bloqueado:', err);
    }
  });
}

const galaxies = [];
const darkMatter = [];
const explosions = [];
const starDust = [];

for (let i = 0; i < CONFIG.GALAXY_COUNT; i++) {
  const g = new Galaxy(i < 12);
  g.index = i;
  galaxies.push(g);
}

for (let i = 0; i < CONFIG.DARK_MATTER_COUNT; i++) {
  darkMatter.push(new DarkMatter());
}

for (let i = 0; i < CONFIG.STAR_DUST_COUNT; i++) {
  starDust.push(new StarDust());
}

// Project function for StarDust (uses closure for cx, cy, PROJECTION)
function project(x, y, z) {
  return mathProject(x, y, z, cx, cy, CONFIG.PROJECTION);
}

function getNearestGalaxy(x, y) {
  let nearest = null;
  let bestDistSq = Infinity;

  for (const g of galaxies) {
    if (g.merging) continue;
    if (g.z < 8) continue;

    const dx = g.x - x;
    const dy = g.y - y;
    const d2 = dx * dx + dy * dy;

    if (d2 < bestDistSq) {
      bestDistSq = d2;
      nearest = g;
    }
  }

  return { galaxy: nearest, distSq: bestDistSq };
}

function getDarkMatterFlow(x, y) {
  let flowX = 0;
  let flowY = 0;
  let totalWeight = 0;

  const maxR = CONFIG.STAR_DUST_DARKMATTER_RADIUS;
  const maxRSq = maxR * maxR;

  for (let i = 0; i < darkMatter.length; i += 8) {
    const dm = darkMatter[i];

    const dx = dm.x - x;
    const dy = dm.y - y;
    const d2 = dx * dx + dy * dy;

    if (d2 > maxRSq) continue;

    const d = Math.sqrt(d2) || 0.0001;
    const weight = 1 - d / maxR;

    flowX += (dx / d) * weight;
    flowY += (dy / d) * weight;
    totalWeight += weight;
  }

  if (totalWeight > 0) {
    flowX /= totalWeight;
    flowY /= totalWeight;
  }

  return { x: flowX, y: flowY };
}

// Expose functions to window for StarDust to access
window.getNearestGalaxy = getNearestGalaxy;
window.getDarkMatterFlow = getDarkMatterFlow;

function handleGalaxyCollisions() {
  const len = galaxies.length;

  for (let i = 0; i < len; i++) {
    const a = galaxies[i];
    if (a.mergeCooldown > 0) continue;
    if (a.merging) continue;

    for (let j = i + 1; j < len; j++) {
      const b = galaxies[j];
      if (b.mergeCooldown > 0) continue;
      if (b.merging) continue;

      if (Math.abs(a.z - b.z) > 70) continue;

      const threshold = (a.baseSize + b.baseSize) * 3.0;
      const thresholdSq = threshold * threshold;
      const dSq = dist3Sq(a, b);

      if (dSq < thresholdSq) {
        if (explosions.length < CONFIG.MAX_ACTIVE_EXPLOSIONS) {
          a.merging = true;
          b.merging = true;
          explosions.push(new Explosion(a, b));
        }

        a.mergeCooldown = 90;
        b.mergeCooldown = 90;
        return;
      }
    }
  }
}

function update() {
  for (const g of galaxies) {
    g.update();
  }

  for (const dm of darkMatter) {
    dm.update();
  }

  for (const sd of starDust) {
    sd.update();
  }

  for (let i = explosions.length - 1; i >= 0; i--) {
    const ex = explosions[i];
    ex.update();

    // Handle merged galaxy creation and reset of the non-merged partner.
    if (ex.mergedGalaxy && ex.mergedGalaxy.index !== undefined) {
      galaxies[ex.mergedGalaxy.index] = ex.mergedGalaxy;
      if (ex.resetTarget) {
        ex.resetTarget.reset(false);
        ex.resetTarget.mergeCooldown = 50;
        ex.resetTarget = null;
      }
      ex.mergedGalaxy = null;
    }

    if (ex.dead) {
      explosions.splice(i, 1);
    }
  }
  handleGalaxyCollisions();
}

function renderBackground() {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#02040a');
  bg.addColorStop(0.45, '#040814');
  bg.addColorStop(1, '#010205');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
}

function draw() {
  renderBackground();

  ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.fillRect(0, 0, w, h);

  // Draw depth fog effect
  drawDepthFog(ctx, cx, cy);

  // Draw filaments connecting galaxies
  drawFilaments(ctx, galaxies, darkMatter, cx, cy, project);

  // Draw star dust particles
  starDust.sort((a, b) => b.z - a.z);
  for (const sd of starDust) {
    sd.draw(ctx, project);
  }

  // Draw galaxies
  galaxies.sort((a, b) => b.z - a.z);
  for (const g of galaxies) {
    g.draw(ctx, cx, cy, project);
  }

  // Draw explosions
  for (const ex of explosions) {
    ex.draw(ctx, cx, cy, project);
  }
}

function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

animate();

}); // Close DOMContentLoaded

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registrado:', registration.scope);
      })
      .catch((error) => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  });
}