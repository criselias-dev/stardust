// src/Explosion.js
import CONFIG from './config.js';
import { rand, clamp, lerp, hsl } from './math.js';
import { Galaxy } from './Galaxy.js';
// A classe "Explosion" representa a explosão resultante da fusão de duas galáxias, contendo informações sobre as galáxias envolvidas, a posição e o estado da explosão, e métodos para atualizar seu comportamento e desenhá-la na tela.
export class Explosion {
  constructor(a, b) {
    this.a = a;
    this.b = b;

    this.x = (a.x + b.x) * 0.5;
    this.y = (a.y + b.y) * 0.5;
    this.z = (a.z + b.z) * 0.5;

    this.hue = ((a.hueA + b.hueB) * 0.5) % 360;

    this.life = 72;
    this.maxLife = 72;

    this.doneMerge = false;
  }
  // O método "update" é responsável por atualizar a posição e o estado da explosão a cada frame, incluindo a movimentação das galáxias envolvidas na fusão, a criação da nova galáxia resultante e a diminuição da vida da explosão até que ela se dissipe completamente.
  update() {
    this.z -= CONFIG.FORWARD_SPEED * 0.9;
    this.life--;

    const t = 1 - (this.life / this.maxLife);

    if (this.a && this.b && !this.doneMerge) {
      const pull = 0.14;

      this.a.x = lerp(this.a.x, this.x, pull);
      this.a.y = lerp(this.a.y, this.y, pull);
      this.a.z = lerp(this.a.z, this.z, pull * 0.8);

      this.b.x = lerp(this.b.x, this.x, pull);
      this.b.y = lerp(this.b.y, this.y, pull);
      this.b.z = lerp(this.b.z, this.z, pull * 0.8);

      this.a.spinSpeed *= 0.985;
      this.b.spinSpeed *= 0.985;
      this.a.driftX *= 0.96;
      this.a.driftY *= 0.96;
      this.b.driftX *= 0.96;
      this.b.driftY *= 0.96;
    }

    if (!this.doneMerge && t >= 0.55) {
      this.spawnMergedGalaxy();
      this.doneMerge = true;
    }
  }
  // O método "spawnMergedGalaxy" é responsável por criar a nova galáxia resultante da fusão das duas galáxias originais, combinando suas propriedades de forma equilibrada e realista, e preparando a nova galáxia para ser adicionada ao sistema.
  spawnMergedGalaxy() {
    const merged = new Galaxy(false);

    merged.x = this.x;
    merged.y = this.y;
    merged.z = this.z;

    merged.baseSize = clamp((this.a.baseSize + this.b.baseSize) * 0.62, 6, 18);
    merged.vz = clamp((this.a.vz + this.b.vz) * 0.5, CONFIG.FORWARD_SPEED * 0.8, CONFIG.FORWARD_SPEED * 1.35);

    merged.driftX = (this.a.driftX + this.b.driftX) * 0.25;
    merged.driftY = (this.a.driftY + this.b.driftY) * 0.25;

    // Restore fresh spin values instead of inheriting dampened ones from merge animation
    const spinDir = Math.random() < 0.5 ? -1 : 1;
    merged.spinSpeed = rand(0.006, 0.018) * spinDir;

    merged.hueA = this.a.hueA;
    merged.hueB = ((this.a.hueB + this.b.hueB) * 0.5) % 360;
    merged.hueC = this.b.hueC;

    merged.brightness = clamp((this.a.brightness + this.b.brightness) * 0.55, 0.85, 1.2);
    merged.mass = clamp((this.a.mass + this.b.mass) * 0.6, 1.0, 1.8);
    merged.coreRatio = clamp((this.a.coreRatio + this.b.coreRatio) * 0.65, 0.20, 0.34);

    merged.edgeOn = Math.random() < 0.5 ? this.a.edgeOn : this.b.edgeOn;
    if (Math.random() < 0.18) merged.edgeOn = !merged.edgeOn;
    merged.edgeTilt = rand(-0.18, 0.18);
    merged.edgeThickness = rand(0.09, 0.17);

    merged.mergeCooldown = 90;
    merged.index = this.a.index;

    // Keep galaxy count constant by replacing one galaxy, resetting the other.
    this.mergedGalaxy = merged;
    this.resetTarget = this.b;

    this.a = null;
    this.b = null;
  }
  // O método "dead" é usado para verificar se a explosão deve ser removida da lista de explosões ativas, seja porque sua vida acabou ou porque se afastou o suficiente (z < -120)
  draw(ctx, cx, cy, project) {
    if (this.life <= 0) return;

    const p = project(this.x, this.y, Math.max(this.z, 6));
    const t = this.life / this.maxLife;
    const progress = 1 - t;
    const scale = Math.max(0.25, p.scale);
    // O flash da explosão é mais intenso no início e depois se dissipa, com um tamanho que cresce rapidamente e depois desacelera
    const flashRadius = clamp((10 + progress * 28) * scale, 4, 120);
    const flashAlpha = Math.max(0, 0.55 * Math.pow(t, 0.7));
    // Gradiente de flash da explosão
    const flash = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, flashRadius);
    flash.addColorStop(0, `rgba(255,255,255,${0.75 * flashAlpha})`);
    flash.addColorStop(0.14, `rgba(220,245,255,${0.55 * flashAlpha})`);
    flash.addColorStop(0.4, hsl(this.hue, 100, 80, 0.22 * flashAlpha));
    flash.addColorStop(1, 'rgba(0,0,0,0)');
    // Flash central brilhante
    ctx.beginPath();
    ctx.fillStyle = flash;
    ctx.arc(p.x, p.y, flashRadius, 0, Math.PI * 2);
    ctx.fill();
    // Anéis de choque
    const ringProgress = Math.min(1, progress * 1.35);
    const ringRadius = clamp((14 + ringProgress * 90) * scale, 4, 260);
    const ringAlpha = Math.max(0, (1 - ringProgress) * 0.34);
    // Anel externo mais sutil, depois anel interno mais brilhante
    if (ringAlpha > 0.01) {
      ctx.beginPath();
      ctx.strokeStyle = `rgba(180,245,255,${ringAlpha})`;
      ctx.lineWidth = clamp(1.2 * scale, 0.8, 3.2);
      ctx.arc(p.x, p.y, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
      // Anel interno mais brilhante
      ctx.beginPath();
      ctx.strokeStyle = hsl((this.hue + 22) % 360, 100, 78, ringAlpha * 0.42);
      ctx.lineWidth = clamp(2.8 * scale, 1.0, 5.4);
      ctx.arc(p.x, p.y, ringRadius * 1.03, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Nascimento da nova galáxia
    if (progress > 0.45) {
      const birth = (progress - 0.45) / 0.55;
      const birthR = clamp((8 + birth * 34) * scale, 3, 90);
      const birthAlpha = (1 - birth) * 0.22;
      // Gradiente de nascimento da nova galáxia
      const birthGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, birthR);
      birthGrad.addColorStop(0, `rgba(255,255,255,${birthAlpha * 1.2})`);
      birthGrad.addColorStop(0.25, hsl(this.hue, 100, 84, birthAlpha));
      birthGrad.addColorStop(1, 'rgba(0,0,0,0)');
      // Círculo de nascimento da nova galáxia
      ctx.beginPath();
      ctx.fillStyle = birthGrad;
      ctx.arc(p.x, p.y, birthR, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // A explosão é considerada "morta" quando sua vida acaba ou quando se afasta o suficiente (z < -120)
  get dead() {
    return this.life <= 0 || this.z < -120;
  }
}