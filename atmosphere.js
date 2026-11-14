export class Atmosphere {
  constructor(width, height, groundMargin = 40) {
    this.w = width;
    this.h = height;
    this.ground = height - groundMargin;
    this.t = 0;

    this.fireflies = Array.from({ length: 25 }, () => ({
      x: Math.random() * width,
      y: height * 0.45 + Math.random() * height * 0.45,
      r: 1.5 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.4,
    }));

    this.fog = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * width,
      y: this.ground - 60 - i * 40,
      w: 500 + Math.random() * 300,
      speed: 0.1 + Math.random() * 0.2,
    }));

    this.bats = [];
    this.batTimer = 0;
    this.star = null;
    this.starTimer = 0;

    this.grass = Array.from({ length: Math.ceil(width / 14) }, (_, i) => ({
      x: i * 14 + Math.random() * 8,
      h: 10 + Math.random() * 14,
      phase: Math.random() * 6,
    }));
  }

  update(dt) {
    const k = dt / 16;
    this.t += dt / 1000;

    this.fireflies.forEach((f) => {
      f.x += Math.sin(this.t * f.speed + f.phase) * 0.4 * k;
      f.y += Math.cos(this.t * f.speed * 1.3 + f.phase) * 0.3 * k;
    });

    this.fog.forEach((f) => {
      f.x += f.speed * k;
      if (f.x > this.w) f.x = -f.w;
    });

    // spawn a bat every few seconds
    this.batTimer -= dt;
    if (this.batTimer <= 0) {
      this.bats.push({ x: -30, y: 40 + Math.random() * 180, speed: 1.5 + Math.random() * 1.5, phase: Math.random() * 6 });
      this.batTimer = 4000 + Math.random() * 6000;
    }
    this.bats.forEach((b) => (b.x += b.speed * k));
    this.bats = this.bats.filter((b) => b.x < this.w + 40);

    // shooting star
    this.starTimer -= dt;
    if (this.starTimer <= 0 && !this.star) {
      this.star = { x: Math.random() * this.w * 0.6 + 100, y: 20 + Math.random() * 100, life: 0 };
      this.starTimer = 8000 + Math.random() * 10000;
    }
    if (this.star) {
      this.star.x += 8 * k;
      this.star.y += 4 * k;
      this.star.life += dt;
      if (this.star.life > 700) this.star = null;
    }
  }

  // call AFTER sky, BEFORE trees
  drawBack(ctx, moonX = this.w * 0.78, moonY = 105) {
    // moon glow
    const g = ctx.createRadialGradient(moonX, moonY, 20, moonX, moonY, 140);
    g.addColorStop(0, 'rgba(255,230,150,0.35)');
    g.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = g;
    ctx.fillRect(moonX - 140, moonY - 140, 280, 280);

    // shooting star
    if (this.star) {
      const s = this.star;
      ctx.strokeStyle = `rgba(255,255,255,${1 - s.life / 700})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - 40, s.y - 20);
      ctx.stroke();
    }

    // bats
    ctx.fillStyle = '#05080b';
    this.bats.forEach((b) => {
      const flap = Math.sin(this.t * 14 + b.phase) * 8;
      const y = b.y + Math.sin(this.t * 2 + b.phase) * 10;
      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.quadraticCurveTo(b.x - 10, y - flap - 6, b.x - 20, y + 2);
      ctx.quadraticCurveTo(b.x - 10, y + 2, b.x, y + 4);
      ctx.quadraticCurveTo(b.x + 10, y + 2, b.x + 20, y + 2);
      ctx.quadraticCurveTo(b.x + 10, y - flap - 6, b.x, y);
      ctx.fill();
    });
  }

  // call AFTER enemies/player (top layer)
  drawFront(ctx) {
    // fog
    this.fog.forEach((f) => {
      const g = ctx.createLinearGradient(f.x, 0, f.x + f.w, 0);
      g.addColorStop(0, 'rgba(180,210,200,0)');
      g.addColorStop(0.5, 'rgba(180,210,200,0.07)');
      g.addColorStop(1, 'rgba(180,210,200,0)');
      ctx.fillStyle = g;
      ctx.fillRect(f.x, f.y, f.w, 50);
    });

    // fireflies
    this.fireflies.forEach((f) => {
      const a = 0.4 + 0.6 * Math.abs(Math.sin(this.t * 1.5 + f.phase));
      ctx.fillStyle = `rgba(220,255,120,${a})`;
      ctx.shadowColor = '#d8ff70';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // swaying grass
    ctx.strokeStyle = '#0a1a10';
    ctx.lineWidth = 2;
    this.grass.forEach((b) => {
      const sway = Math.sin(this.t * 2 + b.phase) * 4;
      ctx.beginPath();
      ctx.moveTo(b.x, this.ground + 10);
      ctx.quadraticCurveTo(b.x + sway / 2, this.ground - b.h / 2, b.x + sway, this.ground - b.h + 10);
      ctx.stroke();
    });
  }
}