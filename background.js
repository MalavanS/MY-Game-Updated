// Dark forest drawn with shapes (no images needed).
export class Background {
    constructor(game) {
        this.game = game;
        this.time = 0;
        this.sky = null;
        this.fog = null;

        this.layers = [
            { speed: 0.15, color: '#1f3d2c', trees: this.makeTrees(10, 170, 260, 90), offset: 0 },
            { speed: 0.4,  color: '#14291e', trees: this.makeTrees(9, 140, 230, 80), offset: 0 },
            { speed: 0.8,  color: '#0a160f', trees: this.makeTrees(7, 110, 190, 70), offset: 0 }
        ];

        this.stars = Array.from({ length: 60 }, () => ({
            x: Math.random() * game.width,
            y: Math.random() * game.height * 0.55,
            r: Math.random() * 1.4 + 0.4,
            phase: Math.random() * Math.PI * 2,
            rate: 0.8 + Math.random() * 1.5
        }));

        this.fireflies = Array.from({ length: 14 }, () => ({
            x: Math.random() * game.width,
            y: game.height * (0.55 + Math.random() * 0.4),
            phase: Math.random() * Math.PI * 2,
            drift: 0.2 + Math.random() * 0.4
        }));

        this.grass = Array.from({ length: Math.ceil(game.width / 6) }, (_, i) => ({
            x: i * 6,
            h: 4 + Math.random() * 8
        }));
    }

    makeTrees(count, minH, maxH, baseW) {
        const trees = [];
        for (let i = 0; i < count; i++) {
            trees.push({
                x: ((i + 0.5) / count) * this.game.width + (Math.random() - 0.5) * 30,
                h: minH + Math.random() * (maxH - minH),
                w: baseW + Math.random() * 30
            });
        }
        return trees;
    }

    update(step) {
        this.time += step * 0.016;
        for (const layer of this.layers) {
            layer.offset = (layer.offset + layer.speed * this.game.speed * step) % this.game.width;
        }
        for (const f of this.fireflies) {
            f.x -= f.drift * step;
            if (f.x < -10) f.x = this.game.width + 10;
        }
    }

    draw(ctx) {
        const { width, height } = this.game;

        // Sky (cached)
        if (!this.sky) {
            this.sky = ctx.createLinearGradient(0, 0, 0, height);
            this.sky.addColorStop(0, '#050b14');
            this.sky.addColorStop(0.5, '#10253a');
            this.sky.addColorStop(1, '#25503a');
        }
        ctx.fillStyle = this.sky;
        ctx.fillRect(0, 0, width, height);

        // Twinkling stars
        for (const s of this.stars) {
            const a = 0.4 + 0.5 * Math.sin(this.time * s.rate + s.phase);
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        }

        this.drawMoon(ctx, width - 110, 80, 36);

        // Tree layers with fog in between
        if (!this.fog) {
            this.fog = ctx.createLinearGradient(0, height * 0.45, 0, height);
            this.fog.addColorStop(0, 'rgba(160,210,190,0)');
            this.fog.addColorStop(1, 'rgba(160,210,190,0.18)');
        }
        for (const layer of this.layers) {
            ctx.fillStyle = layer.color;
            for (const t of layer.trees) {
                this.drawTree(ctx, t.x - layer.offset, t);
                this.drawTree(ctx, t.x - layer.offset + width, t);
            }
            ctx.fillStyle = this.fog;
            ctx.fillRect(0, height * 0.45, width, height * 0.55);
        }

        // Fireflies
        for (const f of this.fireflies) {
            const a = 0.5 + 0.5 * Math.sin(this.time * 2 + f.phase);
            const y = f.y + Math.sin(this.time + f.phase) * 8;
            const g = ctx.createRadialGradient(f.x, y, 0, f.x, y, 8);
            g.addColorStop(0, `rgba(220,255,140,${a})`);
            g.addColorStop(1, 'rgba(220,255,140,0)');
            ctx.fillStyle = g;
            ctx.fillRect(f.x - 8, y - 8, 16, 16);
        }

        // Ground + grass
        ctx.fillStyle = '#060d09';
        ctx.fillRect(0, height - 12, width, 12);
        ctx.fillStyle = '#0d1f14';
        for (const b of this.grass) {
            ctx.beginPath();
            ctx.moveTo(b.x, height - 12);
            ctx.lineTo(b.x + 3, height - 12 - b.h);
            ctx.lineTo(b.x + 6, height - 12);
            ctx.fill();
        }
    }

    drawMoon(ctx, x, y, r) {
        const glow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.2);
        glow.addColorStop(0, 'rgba(243,217,139,0.35)');
        glow.addColorStop(1, 'rgba(243,217,139,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);

        ctx.fillStyle = '#f6e3a1';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(190,160,90,0.35)';
        for (const [dx, dy, cr] of [[-10, -6, 7], [9, 8, 5], [4, -14, 4]]) {
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, cr, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Three stacked tiers + trunk, so it reads as a pine
    drawTree(ctx, x, t) {
        const base = this.game.height;
        const trunkH = t.h * 0.12;
        const tiers = 3;
        const tierH = (t.h - trunkH) / tiers * 1.4;

        ctx.fillRect(x + t.w * 0.45, base - trunkH, t.w * 0.1, trunkH);

        for (let i = 0; i < tiers; i++) {
            const w = t.w * (1 - i * 0.25);
            const cx = x + t.w / 2;
            const bottom = base - trunkH - i * (t.h - trunkH) / tiers * 0.85;
            ctx.beginPath();
            ctx.moveTo(cx - w / 2, bottom);
            ctx.lineTo(cx, bottom - tierH);
            ctx.lineTo(cx + w / 2, bottom);
            ctx.closePath();
            ctx.fill();
        }
    }
}