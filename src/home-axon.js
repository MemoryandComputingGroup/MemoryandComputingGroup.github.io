(() => {
  const canvas = document.querySelector('#synaptic-particles');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;
  const art = canvas.parentElement;
  const image = new Image();
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const cursorRadius = 180 / Math.SQRT2;
  const pointer = { x: -10000, y: -10000, lastX: -10000, lastY: -10000, vx: 0, vy: 0 };
  let points = [], width = 0, height = 0, frame = 0, previous = 0, source = null, mapping = null;

  function sample() {
    const buffer = document.createElement('canvas');
    buffer.width = 960; buffer.height = Math.round(buffer.width * image.naturalHeight / image.naturalWidth);
    const brush = buffer.getContext('2d', { willReadFrequently: true });
    brush.drawImage(image, 0, 0, buffer.width, buffer.height);
    try { source = { pixels: brush.getImageData(0, 0, buffer.width, buffer.height).data, width: buffer.width, height: buffer.height }; }
    catch { art.classList.add('image-fallback'); return; }
    resize();
  }
  function resize() {
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    previous = 0;
    const box = canvas.getBoundingClientRect(); width = box.width; height = box.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!source) return;
    const mobile = width < 736;
    const scale = mobile ? height * .7 / source.height : Math.max(width / source.width, height / source.height);
    const ox = mobile ? (width - source.width * scale) * .37 : (width - source.width * scale) / 2;
    const oy = mobile ? 0 : (height - source.height * scale) / 2;
    mapping = { ox, oy, imageWidth: source.width * scale, imageHeight: source.height * scale };
    points = [];
    const step = 2;
    for (let y = 0; y < source.height; y += step) for (let x = 0; x < source.width; x += step) {
      const pos = (y * source.width + x) * 4;
      const brightness = (source.pixels[pos] + source.pixels[pos + 1] + source.pixels[pos + 2]) / 3;
      const nx = x / source.width, ny = y / source.height;
      const centerDistance = Math.hypot((nx - .365) / .095, (ny - .46) / .13);
      const inCenter = centerDistance < 1;
      if (brightness < (inCenter ? 18 : 27) || Math.random() > Math.min(.96, .24 + brightness / 170)) continue;
      const px = ox + (x + (Math.random() - .5) * step) * scale;
      const py = oy + (y + (Math.random() - .5) * step) * scale;
      if (px < -10 || px > width + 10 || py < -10 || py > height + 10) continue;
      const radialX = nx - .365;
      const radialY = (ny - .46) * source.height / source.width;
      const distance = Math.hypot(radialX, radialY);
      const directionX = distance ? radialX / distance : 0;
      const directionY = distance ? radialY / distance : 0;
      const makeParticle = (jitterX = 0, jitterY = 0) => ({
        homeX:px + jitterX, homeY:py + jitterY, x:px + jitterX, y:py + jitterY,
        vx:0, vy:0, radius:.32 + brightness / 330, alpha:Math.min(.86, .18 + brightness / 310),
        phase:Math.random()*6.28, distance, directionX, directionY, inCenter
      });
      points.push(makeParticle());
      // Fill the soma more densely while keeping the same sampled neuron shape.
      if (inCenter && brightness > 25 && Math.random() < .8) {
        points.push(makeParticle((Math.random() - .5) * step * scale, (Math.random() - .5) * step * scale));
      }
    }
    draw(0);
  }
  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const dt = previous ? Math.min((time - previous) / 16.67, 2) : 1; previous = time;
    for (const p of points) {
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (!motion.matches && d2 < cursorRadius * cursorRadius && d2 > .01) {
        const d = Math.sqrt(d2), strength = (1 - d / cursorRadius) * 1.35;
        p.vx += (dx / d * strength + pointer.vx * .07) * dt;
        p.vy += (dy / d * strength + pointer.vy * .07) * dt;
      }
      p.vx += (p.homeX - p.x) * .035 * dt; p.vy += (p.homeY - p.y) * .035 * dt;
      p.vx *= Math.pow(.87, dt); p.vy *= Math.pow(.87, dt);
      p.x += p.vx * dt; p.y += p.vy * dt;
      // A continuous outward wave modulates the existing particles on every branch.
      // It is an abstract visual analogy, not a biological simulation.
      let signal = 0;
      if (!motion.matches) {
        const waveFront = (time * .0001275) % .88;
        const gap = (p.distance - waveFront + .88) % .88;
        const signedGap = gap > .44 ? gap - .88 : gap;
        signal = Math.exp(-((signedGap / .045) ** 2));
      }
      const twinkle = motion.matches ? 1 : .84 + .16 * Math.sin(time * .0012 + p.phase);
      // A small, slow movement follows the same outward direction as the wave.
      const drift = motion.matches ? 0 : 6 * (.5 + .5 * Math.sin(time * .00065 + p.phase));
      const shift = signal * 3.5 + drift;
      ctx.fillStyle = `rgba(${Math.round(108 + signal * 82)}, ${Math.round(193 + signal * 45)}, 255, ${Math.min(1, p.alpha * twinkle + signal * .38)})`;
      ctx.beginPath(); ctx.arc(p.x + p.directionX * shift, p.y + p.directionY * shift, p.radius, 0, Math.PI * 2); ctx.fill();
    }
    pointer.vx *= .8; pointer.vy *= .8;
    if (!motion.matches && !document.hidden) frame = requestAnimationFrame(draw); else frame = 0;
  }
  function start() { if (!frame && !motion.matches && !document.hidden && points.length) { previous = 0; frame = requestAnimationFrame(draw); } }
  window.addEventListener('pointermove', e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    pointer.vx = Math.max(-30, Math.min(30, x - pointer.lastX));
    pointer.vy = Math.max(-30, Math.min(30, y - pointer.lastY));
    pointer.x = pointer.lastX = x; pointer.y = pointer.lastY = y;
  }, { passive:true });
  window.addEventListener('pointerout', e => { if (!e.relatedTarget) { pointer.x = pointer.y = pointer.lastX = pointer.lastY = -10000; } });
  window.addEventListener('resize', resize, { passive:true });
  document.addEventListener('visibilitychange', start);
  motion.addEventListener('change', () => { if (frame) cancelAnimationFrame(frame); frame = 0; previous = 0; draw(0); });
  image.addEventListener('load', () => { sample(); if (!motion.matches && !frame) start(); });
  image.src = 'assets/images/home/synaptic-field-v3.png';
  const labels = document.querySelectorAll('[data-home-research] a');
  const titles = {
    en:['Emerging Memory and Integration','Hardware–Algorithm Co-Design for Neuromorphic Computing','Neuromorphic Chips Based on Emerging Memory'],
    'zh-CN':['新型存储器及集成','神经形态计算的算法与硬件协同设计','基于新型存储器的类脑芯片']
  };
  const update = () => {
    const chinese = document.documentElement.lang === 'zh-CN';
    labels.forEach((link, i) => { link.firstChild.textContent = titles[chinese ? 'zh-CN' : 'en'][i] + ' '; });
    const heading = document.querySelector('[data-hero-title]');
    if (chinese && heading?.textContent === '面向高效人工智能的新型硬件。') {
      const first = document.createElement('span');
      const second = document.createElement('span');
      first.textContent = '面向高效人工智能的';
      second.textContent = '新型硬件。';
      heading.replaceChildren(first, second);
    }
  };
  new MutationObserver(update).observe(document.documentElement, { attributes:true, attributeFilter:['lang'] }); update();
})();
