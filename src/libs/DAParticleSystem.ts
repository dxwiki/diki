import { DAParticleType } from '@/components/particleCanvas/types/index';

export class Particle implements DAParticleType {
  x!: number;
  y!: number;
  z!: number;
  radius!: number;
  color!: string;
  speed!: number;
  static lineCount = 0;
  static readonly MAX_LINES = 300;
  private canvasWidth: number;
  private canvasHeight: number;
  private MAX_DEPTH: number;

  constructor(canvasWidth: number, canvasHeight: number, maxDepth: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.MAX_DEPTH = maxDepth;
    this.reset();
  }

  reset(): void {
    this.x = (Math.random() - 0.5) * this.canvasWidth * 2;
    this.y = (Math.random() - 0.5) * this.canvasHeight * 2;
    this.z = Math.random() * this.MAX_DEPTH;
    this.radius = 2;
    this.color = this.getRandomColor();
    this.speed = (0.2 + Math.random()) / 2;
  }

  private getRandomColor(): string {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const colors = isDark ? [
      'rgba(0, 255, 0, ',
      'rgba(50, 205, 50, ',
      'rgba(34, 139, 34, ',
      'rgba(144, 238, 144, ',
    ] : [
      'rgba(0, 100, 0, ',
      'rgba(0, 128, 0, ',
      'rgba(34, 139, 34, ',
      'rgba(0, 80, 0, ',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
    this.z -= this.speed;
    if (this.z < 1) {
      this.reset();
    }

    const scale = this.MAX_DEPTH / (this.MAX_DEPTH - this.z);
    const x2d = (this.x * scale) + (this.canvasWidth / 2);
    const y2d = (this.y * scale) + (this.canvasHeight / 2);
    const r = this.radius * scale;

    if (
      x2d < -50
      || x2d > this.canvasWidth + 50
      || y2d < -50
      || y2d > this.canvasHeight + 50
    ) {
      this.reset();
      return;
    }

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const alpha = isDark
      ? (1 - (this.z / this.MAX_DEPTH)) * 0.8
      : (1 - (this.z / this.MAX_DEPTH)) * 0.9;

    ctx.beginPath();
    ctx.arc(x2d, y2d, r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + alpha + ')';
    ctx.fill();

    if (this === particles[0]) {
      Particle.lineCount = 0;
    }

    if (Particle.lineCount < Particle.MAX_LINES) {
      this.drawConnections(ctx, particles, x2d, y2d);
    }
  }

  private drawConnections(
    ctx: CanvasRenderingContext2D,
    particles: Particle[],
    x2d: number,
    y2d: number
  ): void {
    particles.forEach((p) => {
      if (p === this) return;

      const pScale = this.MAX_DEPTH / (this.MAX_DEPTH - p.z);
      const px2d = (p.x * pScale) + (this.canvasWidth / 2);
      const py2d = (p.y * pScale) + (this.canvasHeight / 2);

      if (
        px2d >= 0
        && px2d <= this.canvasWidth
        && py2d >= 0
        && py2d <= this.canvasHeight
      ) {
        const distance = Math.hypot(px2d - x2d, py2d - y2d);

        if (distance < 50) {
          ctx.beginPath();
          ctx.moveTo(x2d, y2d);
          ctx.lineTo(px2d, py2d);
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          ctx.strokeStyle = `rgba(0, 100, 0, ${ isDark ? (1 - (distance / 50)) * 0.15 : (1 - (distance / 50)) * 0.25 })`;
          ctx.stroke();
          Particle.lineCount++;
        }
      }
    });
  }
}