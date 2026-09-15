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
  let animationFrame = 0;
  let particles = [];
  let accent = { r: 0, g: 112, b: 181 };
  let foreground = { r: 11, g: 18, b: 32 };
  const pointer = { x: -1000, y: -1000, active: false };

  const parseColor = (value, fallback) => {
    const color = value.trim();
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
      const number = Number.parseInt(full, 16);
      if (!Number.isNaN(number)) {
        return {
          r: (number >> 16) & 255,
          g: (number >> 8) & 255,
          b: number & 255,
        };
      }
    }

    const match = color.match(/rgba?\(([^)]+)\)/i);
    if (match) {
      const values = match[1].split(',').map((part) => Number.parseFloat(part));
      if (values.length >= 3 && values.every((value) => Number.isFinite(value))) {
        return { r: values[0], g: values[1], b: values[2] };
      }
    }

    return fallback;
  };

  const syncTheme = () => {
    const styles = getComputedStyle(document.documentElement);
    accent = parseColor(styles.getPropertyValue('--dual-accent'), accent);
    foreground = parseColor(styles.getPropertyValue('--dual-fg'), foreground);
  };

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + Math.random() * 60;
      this.radius = 0.9 + Math.random() * 1.75;
      this.vx = (Math.random() - 0.5) * 0.16;
      this.vy = -(0.09 + Math.random() * 0.19);
      this.phase = Math.random() * Math.PI * 2;
      this.phaseSpeed = 0.003 + Math.random() * 0.004;
    }

    update() {
      this.phase += this.phaseSpeed;
      this.x += this.vx + Math.sin(this.phase) * 0.055;
      this.y += this.vy;

      if (pointer.active) {
        const dx = this.x - pointer.x;
        const dy = this.y - pointer.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 30000 && dist2 > 1) {
          const force = (1 - dist2 / 30000) * 0.13;
          const distance = Math.sqrt(dist2);
          this.x += (dx / distance) * force;
          this.y += (dy / distance) * force;
        }
      }

      if (this.y < -40 || this.x < -50 || this.x > width + 50) this.reset(false);
    }
  }

  const particleCount = () => {
    const area = width * height;
    const density = coarsePointer.matches ? 27000 : 18000;
    return Math.max(28, Math.min(coarsePointer.matches ? 52 : 90, Math.round(area / density)));
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 1.6);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = particleCount();
    if (particles.length > count) particles.length = count;
    while (particles.length < count) particles.push(new Particle());
  };

  const rgba = (color, alpha) => `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;

  const drawGlow = (time) => {
    const x = width * (0.7 + Math.sin(time * 0.00008) * 0.08);
    const y = height * (0.28 + Math.cos(time * 0.0001) * 0.07);
    const radius = Math.max(width, height) * 0.52;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, rgba(accent, 0.10));
    gradient.addColorStop(0.42, rgba(accent, 0.04));
    gradient.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const drawConnections = () => {
    const maxDistance = coarsePointer.matches ? 118 : 158;
    const maxDistance2 = maxDistance * maxDistance;

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance2 = dx * dx + dy * dy;
        if (distance2 > maxDistance2) continue;

        const opacity = (1 - distance2 / maxDistance2) * 0.17;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(accent, opacity);
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
    }
  };

  const drawParticles = () => {
    particles.forEach((particle) => {
      const pulse = 0.55 + Math.sin(particle.phase * 1.6) * 0.22;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(accent, 0.34 + pulse * 0.28);
      ctx.fill();

      if (particle.radius > 1.55) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 4.1, 0, Math.PI * 2);
        ctx.fillStyle = rgba(accent, 0.035);
        ctx.fill();
      }
    });
  };

  const drawFrame = (time = 0, animate = true) => {
    ctx.clearRect(0, 0, width, height);
    drawGlow(time);
    drawConnections();
    drawParticles();

    if (!animate) return;
    particles.forEach((particle) => particle.update());
    animationFrame = window.requestAnimationFrame((nextTime) => drawFrame(nextTime, true));
  };

  const start = () => {
    window.cancelAnimationFrame(animationFrame);
    if (reduceMotion.matches) {
      drawFrame(0, false);
      return;
    }
    animationFrame = window.requestAnimationFrame((time) => drawFrame(time, true));
  };

  const onResize = () => {
    resize();
    if (reduceMotion.matches) drawFrame(0, false);
  };

  window.addEventListener('resize', onResize, { passive: true });

  if (!coarsePointer.matches) {
    window.addEventListener('pointermove', (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      pointer.active = false;
    }, { passive: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) window.cancelAnimationFrame(animationFrame);
    else start();
  });

  const observer = new MutationObserver(() => {
    syncTheme();
    if (reduceMotion.matches) drawFrame(0, false);
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  const motionHandler = () => start();
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', motionHandler);
  else reduceMotion.addListener(motionHandler);

  syncTheme();
  resize();
  start();
})();
