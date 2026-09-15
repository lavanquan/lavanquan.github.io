(() => {
  const canvas = document.getElementById('dual-background-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(pointer: coarse)');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let particles = [];
  let accent = { r: 0, g: 112, b: 181 };
  let foreground = { r: 11, g: 18, b: 32 };
  let bg = { r: 255, g: 255, b: 255 };
  let time = 0;

  const parseColor = (value, fallback) => {
    const color = value.trim();
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const n = Number.parseInt(full, 16);
      if (!Number.isNaN(n)) return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    const match = color.match(/rgba?\(([^)]+)\)/i);
    if (match) {
      const values = match[1].split(',').map((part) => Number.parseFloat(part));
      if (values.length >= 3 && values.slice(0, 3).every(Number.isFinite)) {
        return { r: values[0], g: values[1], b: values[2] };
      }
    }
    return fallback;
  };

  const rgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
  const mix = (a, b, t) => ({
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  });

  const syncTheme = () => {
    const styles = getComputedStyle(document.documentElement);
    accent = parseColor(styles.getPropertyValue('--dual-accent'), accent);
    foreground = parseColor(styles.getPropertyValue('--dual-fg'), foreground);
    bg = parseColor(styles.getPropertyValue('--dual-bg'), bg);
  };

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.z = Math.random();
      this.depth = 0.28 + this.z * 0.72;
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -60 - Math.random() * 120;
      this.baseSize = 5 + Math.random() * 12;
      this.size = this.baseSize * (0.6 + this.depth * 1.15);
      this.vy = (0.32 + Math.random() * 0.56) * this.depth;
      this.vx = (-0.22 + Math.random() * 0.5) * this.depth;
      this.drift = 0.45 + Math.random() * 1.1;
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = 0.006 + Math.random() * 0.014;
      this.rotation = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.018;
      this.stretch = 0.55 + Math.random() * 0.6;
      this.blur = Math.max(0, (1 - this.depth) * 4.8);
      this.alpha = 0.12 + this.depth * 0.5;
      this.tint = Math.random();
    }

    update() {
      this.phase += this.phaseSpeed;
      this.rotation += this.spin;
      this.x += this.vx + Math.sin(this.phase) * this.drift * 0.32;
      this.y += this.vy + Math.cos(this.phase * 0.7) * 0.06;

      if (this.y > height + 90 || this.x < -120 || this.x > width + 120) {
        this.reset(false);
        this.x = Math.random() * width;
      }
    }
  }

  const targetCount = () => {
    const area = width * height;
    const density = coarsePointer.matches ? 24000 : 15000;
    return Math.max(32, Math.min(coarsePointer.matches ? 60 : 115, Math.round(area / density)));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, coarsePointer.matches ? 1.35 : 1.7);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = targetCount();
    if (particles.length > count) particles.length = count;
    while (particles.length < count) particles.push(new Petal());
  };

  const drawAtmosphere = (t) => {
    const cx = width * (0.66 + Math.sin(t * 0.00009) * 0.11);
    const cy = height * (0.28 + Math.cos(t * 0.00007) * 0.08);
    const radius = Math.max(width, height) * 0.68;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    glow.addColorStop(0, rgba(accent, 0.13));
    glow.addColorStop(0.35, rgba(accent, 0.055));
    glow.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const wash = ctx.createLinearGradient(0, 0, width, height);
    wash.addColorStop(0, rgba(mix(bg, accent, 0.18), 0.025));
    wash.addColorStop(0.55, rgba(accent, 0.01));
    wash.addColorStop(1, rgba(mix(bg, foreground, 0.05), 0.018));
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, width, height);
  };

  const drawPetal = (p) => {
    const color = mix(accent, bg, 0.24 + p.tint * 0.48);
    const glowColor = mix(accent, foreground, 0.08);

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.filter = p.blur > 0.25 ? `blur(${p.blur.toFixed(2)}px)` : 'none';

    if (p.depth > 0.68) {
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.9, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(glowColor, 0.045 * p.depth);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.88);
    ctx.bezierCurveTo(
      p.size * 0.78,
      -p.size * 0.4,
      p.size * 0.7,
      p.size * 0.58 * p.stretch,
      0,
      p.size * 0.95
    );
    ctx.bezierCurveTo(
      -p.size * 0.7,
      p.size * 0.58 * p.stretch,
      -p.size * 0.78,
      -p.size * 0.4,
      0,
      -p.size * 0.88
    );
    ctx.fillStyle = rgba(color, p.alpha);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, -p.size * 0.66);
    ctx.quadraticCurveTo(p.size * 0.08, 0, 0, p.size * 0.66);
    ctx.strokeStyle = rgba(accent, 0.14 * p.depth);
    ctx.lineWidth = 0.55 + p.depth * 0.55;
    ctx.stroke();

    ctx.restore();
  };

  const render = (t = 0, animate = true) => {
    time = t;
    ctx.clearRect(0, 0, width, height);
    drawAtmosphere(t);

    particles.sort((a, b) => a.depth - b.depth);
    particles.forEach(drawPetal);

    if (!animate) return;
    particles.forEach((p) => p.update());
    frame = requestAnimationFrame((next) => render(next, true));
  };

  const start = () => {
    cancelAnimationFrame(frame);
    if (reduceMotion.matches) {
      render(time || 0, false);
      return;
    }
    frame = requestAnimationFrame((t) => render(t, true));
  };

  const onResize = () => {
    resize();
    if (reduceMotion.matches) render(time || 0, false);
  };

  window.addEventListener('resize', onResize, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(frame);
    else start();
  });

  const observer = new MutationObserver(() => {
    syncTheme();
    if (reduceMotion.matches) render(time || 0, false);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const motionHandler = () => start();
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', motionHandler);
  else reduceMotion.addListener(motionHandler);

  syncTheme();
  resize();
  start();
})();
