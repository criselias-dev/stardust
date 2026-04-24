// src/Galaxy.js
import CONFIG from './config.js';
import { rand, clamp, hsl } from './math.js';

// A classe "Galaxy" representa uma galáxia individual no universo simulado,
// contendo propriedades como posição, velocidade, tamanho, cor e estado de fusão,
// além de métodos para atualizar sua posição e desenhá-la na tela.
export class Galaxy {
  constructor(initialFront = false) {
    this.reset(initialFront);
  }

  reset(initialFront = false) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spread = Math.min(vw, vh) * 0.9;

    this.x = rand(-spread, spread);
    this.y = rand(-spread * 0.65, spread * 0.65);

    this.z = initialFront
      ? rand(120, 650)
      : rand(CONFIG.DEPTH_NEAR + 80, CONFIG.DEPTH_FAR);

    this.vz = rand(CONFIG.FORWARD_SPEED * 0.7, CONFIG.FORWARD_SPEED * 1.3);
    this.driftX = rand(-0.08, 0.08);
    this.driftY = rand(-0.06, 0.06);

    this.baseSize = rand(5, 15);
    this.spin = rand(0, Math.PI * 2);

    const spinDir = Math.random() < 0.5 ? -1 : 1;
    this.spinSpeed = rand(0.006, 0.018) * spinDir;

    this.hueA = rand(180, 340);
    this.hueB = (this.hueA + rand(20, 90)) % 360;
    this.hueC = (this.hueA + rand(100, 180)) % 360;

    this.brightness = rand(0.8, 1.15);

    this.mass = rand(0.9, 1.4);
    this.coreRatio = rand(0.18, 0.28);

    this.passingThrough = false;
    this.passPhase = 0;
    this.merging = false;
    this.mergeCooldown = 0;

    // EDGE-ON / FACE-ON RANDOMIZATION
    this.edgeOn = Math.random() < CONFIG.EDGE_ON_CHANCE;
    this.edgeTilt = rand(-0.22, 0.22);
    this.edgeThickness = rand(0.08, 0.18);
  }

  update() {
    this.spin += this.spinSpeed;

    if (this.merging) {
      this.spin += this.spinSpeed * 0.35;
      if (this.mergeCooldown > 0) this.mergeCooldown--;
      return;
    }

    if (this.mergeCooldown > 0) this.mergeCooldown--;

    this.x += this.driftX * (1 + (1000 - this.z) / 1000) * 0.6;
    this.y += this.driftY * (1 + (1000 - this.z) / 1000) * 0.5;

    this.x *= 0.9994;
    this.y *= 0.9995;

    this.z -= this.vz;

    if (!this.passingThrough && this.z < 55) {
      this.passingThrough = true;
      this.passPhase = 1;
    }

    if (this.passingThrough) {
      this.z -= this.vz * 1.7;

      if (this.z < -110) {
        this.reset(false);
        return;
      }
    }

    // Limites para evitar que as galáxias se afastem demais do centro
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const limitX = Math.min(vw, vh) * 1.6;
    const limitY = Math.min(vw, vh) * 1.2;

    if (Math.abs(this.x) > limitX) this.x *= -0.82;
    if (Math.abs(this.y) > limitY) this.y *= -0.82;
  }

  // Calcula posição projetada e tamanho aparente
  getScreenData(cx, cy, project) {
    const p = project(this.x, this.y, Math.max(this.z, 6));
    const size = this.baseSize * p.scale * 0.7 * this.brightness;
    return { ...p, size };
  }

  draw(ctx, cx, cy, project) {
    const zForRender = Math.max(this.z, 6);
    const p = project(this.x, this.y, zForRender);

    let size = this.baseSize * p.scale * 0.7 * this.brightness;
    size = clamp(size, 0.6, 180);

    if (this.passingThrough && this.z < 40) {
      const extra = clamp((40 - this.z) / 40, 0, 2.8);
      size *= 1 + extra * 0.65;
    }

    const depthAlpha = clamp(1 - zForRender / CONFIG.DEPTH_FAR, 0.18, 1);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(this.spin + (this.edgeOn ? this.edgeTilt : 0));

    // HALO EXTERNO
    for (let i = 0; i < 4; i++) {
      const haloR = size * (1.6 + i * 0.55);
      const alpha = 0.08 * depthAlpha * (1 - i * 0.18);

      const grad = ctx.createRadialGradient(0, 0, size * 0.08, 0, 0, haloR);
      grad.addColorStop(0, hsl(this.hueA, 85, 70, alpha * 0.65));
      grad.addColorStop(0.35, hsl(this.hueB, 75, 60, alpha * 0.45));
      grad.addColorStop(0.7, hsl(this.hueC, 65, 55, alpha * 0.18));
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.save();
      if (this.edgeOn) ctx.scale(1.0, 0.42);
      ctx.beginPath();
      ctx.fillStyle = grad;
      ctx.arc(0, 0, haloR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (this.edgeOn) {
      // EDGE-ON GALAXY
      ctx.save();
      ctx.scale(8.4, this.edgeThickness);

      const diskGrad = ctx.createRadialGradient(0, 0, size * 0.02, 0, 0, size * 1.45);
      diskGrad.addColorStop(0, hsl(this.hueB, 95, 82, 0.34 * depthAlpha));
      diskGrad.addColorStop(0.16, hsl(this.hueA, 92, 70, 0.26 * depthAlpha));
      diskGrad.addColorStop(0.52, hsl(this.hueC, 84, 58, 0.12 * depthAlpha));
      diskGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = diskGrad;
      ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const bandGrad = ctx.createLinearGradient(-size * 7, 0, size * 7, 0);
      bandGrad.addColorStop(0, 'rgba(0,0,0,0)');
      bandGrad.addColorStop(0.18, hsl(this.hueA, 90, 72, 0.08 * depthAlpha));
      bandGrad.addColorStop(0.5, hsl(this.hueB, 100, 88, 0.16 * depthAlpha));
      bandGrad.addColorStop(0.82, hsl(this.hueC, 90, 72, 0.08 * depthAlpha));
      bandGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = bandGrad;
      ctx.fillRect(-size * 7, -size * 0.22, size * 14, size * 0.44);

      for (let i = 0; i < 18; i++) {
        const t = i / 17;
        const side = (t - 0.5) * 2;
        const px = side * size * rand(1.5, 5.8);
        const py = rand(-size * 0.35, size * 0.35);

        const armHue = i % 2 === 0 ? this.hueA : this.hueC;
        const dustRadius = Math.max(0.4, size * rand(0.015, 0.04));
        const dustAlpha = rand(0.05, 0.12) * depthAlpha;

        const dustGrad = ctx.createRadialGradient(px, py, 0, px, py, dustRadius * 5.5);
        dustGrad.addColorStop(0, hsl(armHue, 100, 90, dustAlpha * 1.25));
        dustGrad.addColorStop(0.35, hsl(armHue, 90, 72, dustAlpha));
        dustGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.fillStyle = dustGrad;
        ctx.arc(px, py, dustRadius * 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = hsl(armHue, 100, 92, dustAlpha * 1.1);
        ctx.arc(px, py, dustRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      const bulgeR = Math.max(0.2, size * 0.45);
      const bulgeGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, bulgeR * 3.2);
      bulgeGrad.addColorStop(0, 'rgba(255,255,255,0.82)');
      bulgeGrad.addColorStop(0.12, hsl(this.hueB, 100, 86, 0.52 * depthAlpha));
      bulgeGrad.addColorStop(0.45, hsl(this.hueA, 92, 70, 0.22 * depthAlpha));
      bulgeGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = bulgeGrad;
      ctx.arc(0, 0, bulgeR * 3.2, 0, Math.PI * 2);
      ctx.fill();

      const coreR = Math.max(1.2, size * this.coreRatio * 1.2);

      const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 2.8);
      coreGlow.addColorStop(0, 'rgba(255,255,255,0.9)');
      coreGlow.addColorStop(0.12, hsl(this.hueB, 100, 86, 0.65 * depthAlpha));
      coreGlow.addColorStop(0.4, hsl(this.hueA, 95, 70, 0.28 * depthAlpha));
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = coreGlow;
      ctx.arc(0, 0, coreR * 4.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(4,4,8,0.9)';
      ctx.arc(0, 0, Math.max(0.8, coreR * 0.38), 0, Math.PI * 2);
      ctx.fill();
    } else {
      // FACE-ON GALAXY
      ctx.save();
      ctx.scale(5.0, 1.0);

      const diskGrad = ctx.createRadialGradient(0, 0, size * 0.04, 0, 0, size * 1.45);
      diskGrad.addColorStop(0, hsl(this.hueB, 95, 80, 0.30 * depthAlpha));
      diskGrad.addColorStop(0.18, hsl(this.hueA, 90, 68, 0.22 * depthAlpha));
      diskGrad.addColorStop(0.5, hsl(this.hueC, 85, 58, 0.12 * depthAlpha));
      diskGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = diskGrad;
      ctx.arc(0, 0, size * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      for (let i = 0; i < 42; i++) {
        const seed = i * 0.61803398875;

        const randA = Math.sin((seed + this.spin * 0.07) * 91.73);
        const randB = Math.sin((seed + this.spin * 0.11) * 127.41);
        const randC = Math.sin((seed + this.spin * 0.05) * 173.29);

        const n1 = randA - Math.floor(randA);
        const n2 = randB - Math.floor(randB);
        const n3 = randC - Math.floor(randC);

        const orbitT = n1;
        const ang = n2 * Math.PI * 2 + this.spin * (0.18 + orbitT * 0.35);

        const radialBias = Math.pow(orbitT, 0.92);
        const r = size * (0.14 + radialBias * 1.32);

        const px = Math.cos(ang) * r * 1.18;
        const py = Math.sin(ang) * r * 0.62;

        const pRadius = Math.max(0.35, size * (0.018 + (1 - orbitT) * 0.018));
        const pAlpha = (0.035 + (1 - orbitT) * 0.045) * depthAlpha;

        const pHue = n3 > 0.5 ? this.hueA : this.hueC;

        const pGlow = ctx.createRadialGradient(px, py, 0, px, py, pRadius * 4.2);
        pGlow.addColorStop(0, hsl(pHue, 95, 84, pAlpha * 1.25));
        pGlow.addColorStop(0.4, hsl(pHue, 90, 70, pAlpha));
        pGlow.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.beginPath();
        ctx.fillStyle = pGlow;
        ctx.arc(px, py, pRadius * 4.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = hsl(pHue, 100, 90, pAlpha * 1.15);
        ctx.arc(px, py, pRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.lineCap = 'round';

      for (let arm = 0; arm < 2; arm++) {
        ctx.beginPath();

        for (let t = 0; t <= 1; t += 0.08) {
          const ang = arm * Math.PI + t * 4.5 + this.spin * 0.4;
          const r = size * (0.25 + t * 1.05);
          const px = Math.cos(ang) * r * 1.35;
          const py = Math.sin(ang) * r * 0.55;

          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);

          const armHue = arm === 0 ? this.hueA : this.hueC;

          const seedA = Math.sin((t + arm * 0.37 + this.spin * 0.13) * 91.7);
          const seedB = Math.sin((t * 1.73 + arm * 0.61 + this.spin * 0.19) * 127.4);
          const seedC = Math.sin((t * 2.31 + arm * 0.83 + this.spin * 0.11) * 173.2);

          const n1 = seedA - Math.floor(seedA);
          const n2 = seedB - Math.floor(seedB);
          const n3 = seedC - Math.floor(seedC);

          const jitterX = (n1 - 0.5) * size * 0.08 * (0.4 + t);
          const jitterY = (n2 - 0.5) * size * 0.05 * (0.4 + t);

          const dustChance = 0.68 - t * 0.18;
          if (n1 < dustChance) {
            const dotX = px + jitterX;
            const dotY = py + jitterY;

            const dustRadius = Math.max(0.35, size * (0.018 + (1 - t) * 0.02));
            const dustAlpha = (0.07 + (1 - t) * 0.06) * depthAlpha;

            const dustGrad = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, dustRadius * 4.5);
            dustGrad.addColorStop(0, hsl(armHue, 95, 82, dustAlpha * 1.3));
            dustGrad.addColorStop(0.35, hsl(armHue, 90, 70, dustAlpha));
            dustGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.beginPath();
            ctx.fillStyle = dustGrad;
            ctx.arc(dotX, dotY, dustRadius * 4.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = hsl(armHue, 95, 88, dustAlpha * 1.15);
            ctx.arc(dotX, dotY, dustRadius, 0, Math.PI * 2);
            ctx.fill();
          }

          if (n3 > 0.78) {
            const clusterX = px + (n2 - 0.5) * size * 0.12;
            const clusterY = py + (n3 - 0.5) * size * 0.08;

            const clusterRadius = Math.max(0.6, size * (0.028 + (1 - t) * 0.03));
            const clusterAlpha = (0.09 + (1 - t) * 0.08) * depthAlpha;

            const clusterGrad = ctx.createRadialGradient(
              clusterX, clusterY, 0,
              clusterX, clusterY, clusterRadius * 6
            );
            clusterGrad.addColorStop(0, hsl(armHue, 100, 90, clusterAlpha * 1.5));
            clusterGrad.addColorStop(0.28, hsl(armHue, 95, 78, clusterAlpha));
            clusterGrad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.beginPath();
            ctx.fillStyle = clusterGrad;
            ctx.arc(clusterX, clusterY, clusterRadius * 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = hsl(armHue, 100, 92, clusterAlpha * 1.2);
            ctx.arc(clusterX, clusterY, clusterRadius, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.strokeStyle = hsl(
          arm === 0 ? this.hueA : this.hueC,
          90,
          72,
          0.14 * depthAlpha
        );
        ctx.lineWidth = Math.max(0.5, size * 0.5 * (0.15 - arm * 0.05));
        ctx.stroke();
      }

      const coreR = Math.max(1.2, size * this.coreRatio);

      const coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 2.2);
      coreGlow.addColorStop(0, 'rgba(255,255,255,0.85)');
      coreGlow.addColorStop(0.12, hsl(this.hueB, 100, 85, 0.6 * depthAlpha));
      coreGlow.addColorStop(0.4, hsl(this.hueA, 95, 70, 0.25 * depthAlpha));
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = coreGlow;
      ctx.arc(0, 0, coreR * 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(4,4,8,0.9)';
      ctx.arc(0, 0, coreR * 0.75, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.rotate(this.spin * 1.4);
      ctx.scale(1.5, 0.55);

      const accGrad = ctx.createRadialGradient(0, 0, coreR * 0.6, 0, 0, coreR * 2.4);
      accGrad.addColorStop(0, 'rgba(255,255,255,0)');
      accGrad.addColorStop(0.35, hsl(this.hueC, 100, 80, 0.30 * depthAlpha));
      accGrad.addColorStop(0.7, hsl(this.hueA, 90, 60, 0.12 * depthAlpha));
      accGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.fillStyle = accGrad;
      ctx.arc(0, 0, coreR * 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(4,4,8,0.9)';
      ctx.arc(0, 0, Math.max(0.8, coreR * 0.28), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}