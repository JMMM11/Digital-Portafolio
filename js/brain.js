/*
 * CEREBRO DE TRIANGULOS (solo se carga en index.html).
 * Dibuja el canvas #constellation: una esfera de triangulos que se convierte en cerebro.
 * Todo lo editable esta en el HTML:
 *   - canvas: data-count, data-mobile-count, data-reveal-duration, data-orbit-count
 *   - body:   data-triangle-colors, data-accent-ratio
 * Corre siempre; solo se detiene fuera de pantalla, con la pestana oculta y con "movimiento reducido".
 */
(() => {
  "use strict";
function startParticles() {
  const brainCanvas = document.getElementById("constellation");
  if (!brainCanvas) return;
  const brainContext = brainCanvas.getContext("2d");
  if (!brainContext) return;

  // All visual settings that you may want to change are HTML data attributes.
  function readPalette() {
    return document.body.dataset.triangleColors.split(",").map((hex) => {
      const color = hex.trim().replace("#", "");
      return /^[0-9a-f]{6}$/i.test(color)
        ? [0, 2, 4].map((index) => parseInt(color.slice(index, index + 2), 16)).join(",")
        : "96,108,100";
    });
  }
  let palette = readPalette();
  const configuredRatio = Number(document.body.dataset.accentRatio);
  const accentRatio = Number.isFinite(configuredRatio) ? Math.max(0, Math.min(1, configuredRatio)) : .12;
  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const pointerQuery = matchMedia("(pointer: fine)");
  let reducedMotion = motionQuery.matches;
  let manuallyPaused = false;
  let heroVisible = true;
  let frame = 0;
  let lastTime = 0;
  let lastDraw = 0;
  let elapsed = 0;
  let entranceElapsed = 0;
  let heroTop = 0;
  let heroHeight = 1;
  let scrollDepth = 0;
  let orbitPoints = [];
  const requestedDuration = Number(brainCanvas.dataset.revealDuration);
  const entranceDuration = Number.isFinite(requestedDuration) && requestedDuration > 0
    ? Math.max(800, Math.min(5000, requestedDuration)) : 2600;
  let scrollOffset = window.scrollY;
  let brainWidth = 0;
  let brainHeight = 0;
  let brainPoints = [];
  const pointer = { x: 0, y: 0 };
  const smoothed = { x: 0, y: 0 };
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const projected = [];

  function seededRandom(seed) {
    return () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }
  function configuredCount(canvas, max) {
    const value = Number(window.innerWidth <= 760 ? canvas.dataset.mobileCount : canvas.dataset.count);
    return Math.max(0, Math.min(max, Number.isFinite(value) ? Math.round(value) : 0));
  }

  function buildBrain() {
    const count = configuredCount(brainCanvas, 2500);
    const random = seededRandom(83);
    const cortexCount = Math.floor(count * .58);
    const foldCount = Math.floor(count * .22);
    const contourCount = Math.floor(count * .04);
    const cerebellumCount = Math.floor(count * .10);
    brainPoints = [];
    // Two ridged 3D hemispheres. The grooves are deformations of the surface,
    // so depth and rotation reveal the folds instead of a flat SVG contour.
    for (let index = 0; index < cortexCount; index++) {
      const half = index % 2 === 0 ? 1 : -1;
      const localIndex = Math.floor(index / 2);
      const perHalf = Math.ceil(cortexCount / 2);
      const ny = 1 - 2 * (localIndex + .5) / perHalf;
      const ring = Math.sqrt(Math.max(0, 1 - ny * ny));
      const phi = localIndex * goldenAngle + (half < 0 ? .65 : 0);
      const theta = Math.acos(ny);
      const nx = Math.cos(phi) * ring;
      const nz = Math.sin(phi) * ring;
      const fold = Math.sin(theta * 10 + 1.4 * Math.sin(phi * 3))
        * Math.cos(phi * 8 + 1.25 * Math.sin(theta * 4));
      const ridge = (fold + 1) / 2;
      const relief = 1 + fold * .105;
      const posteriorLift = ny < 0 ? .15 * Math.max(0, nx + .15) : 0;
      brainPoints.push({
        x: nx * 1.16 * relief,
        y: ny * .75 * relief + nx * .08 + posteriorLift,
        z: half * .29 + nz * .36 * relief,
        size: 1.35 + random() * 1.3,
        angle: random() * Math.PI * 2,
        phase: random() * Math.PI * 2,
        ridge,
        color: palette[Math.floor((ridge * .55 + ((nx + 1) / 2) * .45) * (palette.length - 1))],
        part: "cortex"
      });
    }
    // Cortical ridges follow long winding curves on the near hemisphere.
    // Closely spaced triangles along these curves make the gyri readable.
    const gyri = [
      [[-1.02, .10], [-.92, .60], [-.51, .70], [-.08, .64]],
      [[-.08, .64], [.30, .71], [.71, .56], [1.00, .16]],
      [[-.86, .23], [-.71, .57], [-.29, .45], [.03, .39]],
      [[.03, .39], [.39, .31], [.50, .54], [.82, .28]],
      [[-.27, .58], [-.12, .22], [-.50, .17], [-.26, -.04]],
      [[-.26, -.04], [.03, -.21], [-.14, -.47], [-.36, -.61]],
      [[-1.03, -.03], [-.74, .15], [-.62, -.15], [-.88, -.27]],
      [[-.88, -.27], [-.83, -.56], [-.46, -.56], [-.50, -.28]],
      [[-.50, -.28], [-.37, -.07], [-.72, -.02], [-.59, .18]],
      [[-.48, -.43], [-.04, -.53], [.33, -.51], [.63, -.35]],
      [[-.10, .15], [.19, .37], [.19, -.08], [.47, .04]],
      [[.47, .04], [.69, .26], [1.02, .10], [.95, -.16]],
      [[.12, -.28], [.36, -.06], [.65, -.30], [.88, -.16]]
    ];
    for (let index = 0; index < foldCount; index++) {
      const segment = gyri[index % gyri.length];
      const step = Math.floor(index / gyri.length);
      const samples = Math.ceil(foldCount / gyri.length);
      const t = (step + .5) / samples;
      const s = 1 - t;
      const weights = [s * s * s, 3 * s * s * t, 3 * s * t * t, t * t * t];
      const x = segment.reduce((sum, p, i) => sum + p[0] * weights[i], 0) + (random() - .5) * .055;
      const y = segment.reduce((sum, p, i) => sum + p[1] * weights[i], 0) + (random() - .5) * .055;
      const surface = Math.sqrt(Math.max(0, 1 - (x / 1.2) ** 2 - (y / .81) ** 2));
      brainPoints.push({
        x, y,
        z: .30 + surface * .42,
        size: 1.8 + random() * .9,
        angle: random() * Math.PI * 2,
        phase: random() * Math.PI * 2,
        ridge: .9,
        color: palette[(Math.floor(t * 3) + index % gyri.length) % palette.length],
        part: "gyrus"
      });
    }
    for (let index = 0; index < contourCount; index++) {
      const angle = index / contourCount * Math.PI * 2;
      const x = Math.cos(angle) * 1.16;
      const ny = Math.sin(angle);
      brainPoints.push({
        x,
        y: ny * .75 + x * .07 + (ny < 0 ? .15 * Math.max(0, x + .15) : 0),
        z: .24,
        size: 1.8 + random() * .8,
        angle: angle + .6,
        phase: angle,
        ridge: .8,
        color: palette[index % palette.length],
        part: "contour"
      });
    }
    // The smaller folded cerebellum sits beneath the posterior lobe.
    for (let index = 0; index < cerebellumCount; index++) {
      const ny = 1 - 2 * (index + .5) / cerebellumCount;
      const ring = Math.sqrt(Math.max(0, 1 - ny * ny));
      const phi = index * goldenAngle;
      const rib = 1 + .065 * Math.sin(ny * 44);
      brainPoints.push({
        x: .68 + Math.cos(phi) * ring * .39 * rib,
        y: -.57 + ny * .28 * rib,
        z: Math.sin(phi) * ring * .40,
        size: 1.2 + random() * 1.2,
        angle: phi,
        phase: random() * Math.PI * 2,
        ridge: .55 + .4 * Math.sin(ny * 22),
        color: palette[index % palette.length],
        part: "cerebellum"
      });
    }
    // A tapering stem gives the silhouette the anatomy of a brain in profile.
    const stemCount = count - cortexCount - foldCount - contourCount - cerebellumCount;
    for (let index = 0; index < stemCount; index++) {
      const t = (index + .5) / stemCount;
      const phi = index * goldenAngle;
      const radius = .115 - t * .055;
      brainPoints.push({
        x: .45 - t * .11 + Math.cos(phi) * radius,
        y: -.72 - t * .53,
        z: Math.sin(phi) * radius,
        size: 1.1 + random(),
        angle: phi,
        phase: random() * Math.PI * 2,
        ridge: .6,
        color: palette[index % palette.length],
        part: "stem"
      });
    }
    // Distribute the accent particles (data-accent-ratio) across the anatomy, not in color bands.
    brainPoints.forEach((point, index) => {
      const accent = Math.floor((index + 1) * accentRatio) > Math.floor(index * accentRatio);
      point.color = accent ? palette[2] : palette[index % 2];
      point.accent = accent;
      // Every triangle starts on a Fibonacci sphere and settles into its brain position.
      const sphereY = 1 - 2 * (index + .5) / count;
      const sphereRadius = Math.sqrt(Math.max(0, 1 - sphereY * sphereY));
      point.orbX = Math.cos(index * goldenAngle) * sphereRadius * .98;
      point.orbY = sphereY * .98 - .12;
      point.orbZ = Math.sin(index * goldenAngle) * sphereRadius * .98;
    });
    const orbitLimit = window.innerWidth <= 760 ? brainCanvas.dataset.mobileOrbitCount : brainCanvas.dataset.orbitCount;
    const orbitCount = Math.max(0, Math.min(240, Number(orbitLimit) || 0));
    orbitPoints = Array.from({ length: orbitCount }, (_, index) => ({
      angle: index * goldenAngle,
      radius: 1.20 + random() * .15,
      inclination: index % 3,
      size: .55 + random() * .65,
      accent: index % 8 === 0
    }));
    projected.length = brainPoints.length;
    for (let index = 0; index < projected.length; index++) projected[index] = {};
  }

  function sizeCanvas(canvas, context, width, height) {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  function resize() {
    const bounds = brainCanvas.getBoundingClientRect();
    const heroBounds = document.getElementById("home").getBoundingClientRect();
    heroTop = heroBounds.top + window.scrollY;
    heroHeight = heroBounds.height;
    brainWidth = bounds.width;
    brainHeight = bounds.height;
    sizeCanvas(brainCanvas, brainContext, brainWidth, brainHeight);
    buildBrain();
    drawBrain();
  }

  function triangle(context, x, y, radius, angle, color, alpha, lineWidth) {
    context.strokeStyle = `rgba(${color},${alpha})`;
    context.lineWidth = lineWidth;
    context.beginPath();
    for (let corner = 0; corner < 3; corner++) {
      const a = angle + corner * Math.PI * 2 / 3;
      const px = x + Math.cos(a) * radius;
      const py = y + Math.sin(a) * radius;
      if (corner === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.stroke();
  }

  function drawBrain() {
    brainContext.clearRect(0, 0, brainWidth, brainHeight);
    const time = reducedMotion ? 0 : elapsed / 1000;
    const progress = reducedMotion ? 1 : Math.min(1, entranceElapsed / entranceDuration);
    const settle = progress * progress * (3 - 2 * progress);
    const morph = (1 - settle) + settle * scrollDepth * .65;
    const yaw = -.36 + Math.sin(time * .12) * .28 + smoothed.x * .14;
    const pitch = .10 + Math.sin(time * .08) * .045 + smoothed.y * .065;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cp = Math.cos(pitch), sp = Math.sin(pitch);
    const scale = Math.min(brainWidth / 3.15, brainHeight / 2.9);
    const unit = Math.max(.65, scale / 175);
    const breath = 1 + Math.sin(time * .42) * .014;
    const wave = Math.sin(time * .55) * 1.5;

    function project(x, y, z) {
      const rx = x * cy + z * sy;
      const rz = z * cy - x * sy;
      const ry = y * cp - rz * sp;
      const depth = y * sp + rz * cp;
      const perspective = 3.8 / (3.8 - depth * .6);
      return {
        x: brainWidth * .49 + rx * scale * perspective,
        y: brainHeight * .48 - (ry + .18) * scale * perspective,
        z: depth, perspective
      };
    }

    // Fine orbital arcs and satellites add the depth of a data orb, in the existing palette.
    function orbitPosition(angle, radius, inclination) {
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const tilt = [.40, -.62, 1.04][inclination];
      return project(x * Math.cos(tilt) - y * .28 * Math.sin(tilt),
        x * Math.sin(tilt) + y * .28 * Math.cos(tilt) - .12, y * .84);
    }
    for (let ring = 0; ring < 3; ring++) {
      brainContext.beginPath();
      for (let step = 0; step <= 100; step++) {
        const point = orbitPosition(step / 100 * Math.PI * 2 + time * .035, 1.30, ring);
        if (step === 0) brainContext.moveTo(point.x, point.y);
        else brainContext.lineTo(point.x, point.y);
      }
      brainContext.strokeStyle = `rgba(${palette[2]},.09)`;
      brainContext.lineWidth = .65;
      brainContext.stroke();
    }
    for (const point of orbitPoints) {
      const p = orbitPosition(point.angle + time * .055, point.radius, point.inclination);
      const opacity = p.z < 0 ? .12 : .34;
      brainContext.beginPath();
      brainContext.arc(p.x, p.y, point.size * unit, 0, Math.PI * 2);
      brainContext.fillStyle = `rgba(${point.accent ? palette[2] : palette[1]},${opacity})`;
      brainContext.fill();
    }

    for (let index = 0; index < brainPoints.length; index++) {
      const point = brainPoints[index];
      const bx = (point.x * (1 - morph) + point.orbX * morph) * breath;
      const by = (point.y * (1 - morph) + point.orbY * morph) * breath;
      const bz = (point.z * (1 - morph) + point.orbZ * morph) * breath;
      const p = project(bx, by, bz);
      const front = Math.max(0, Math.min(1, (p.z + .8) / 1.6));
      const signal = reducedMotion ? 0 : Math.exp(-((bx - wave) ** 2) / .055);
      const target = projected[index];
      target.x = p.x;
      target.y = p.y;
      target.z = p.z;
      target.size = point.size * unit * p.perspective * (1 + signal * .16);
      target.angle = point.angle + yaw * .4 + (1 - settle) * Math.PI * .5;
      target.color = point.color;
      target.accent = point.accent;
      target.signal = signal;
      target.alpha = Math.min(.9, (point.part === "gyrus" ? .40 + front * .24 : (.20 + front * .44) * (.65 + point.ridge * .35)) + signal * .16);
      target.line = .55 + front * .55;
    }
    projected.sort((a, b) => a.z - b.z);
    for (const point of projected) {
      // A broad, faint outline makes accent signals luminous without shadows or gradients.
      if (point.accent && point.z > 0) {
        triangle(brainContext, point.x, point.y, point.size * 1.4, point.angle,
          point.color, .06 + point.signal * .10, 2);
      }
      triangle(brainContext, point.x, point.y, point.size, point.angle, point.color, point.alpha, point.line);
    }
  }

  function animate(time) {
    frame = requestAnimationFrame(animate);
    // Canvas drawing stays at 30fps; no frame catch-up after tab visibility changes.
    if (lastDraw && time - lastDraw < 1000 / 30) return;
    if (lastTime) {
      const delta = Math.min(time - lastTime, 80);
      elapsed += delta;
      entranceElapsed += delta;
    }
    lastTime = time;
    lastDraw = time;
    smoothed.x += (pointer.x - smoothed.x) * .075;
    smoothed.y += (pointer.y - smoothed.y) * .075;
    const targetDepth = Math.max(0, Math.min(1, (scrollOffset - heroTop) / heroHeight));
    scrollDepth += (targetDepth - scrollDepth) * .05;
    if (heroVisible) drawBrain();
  }
  function sync() {
    cancelAnimationFrame(frame);
    lastTime = 0;
    lastDraw = 0;
    const paused = manuallyPaused || reducedMotion;
    document.body.classList.toggle("motion-paused", paused);
    if (!document.hidden && !paused && heroVisible) frame = requestAnimationFrame(animate);
    else if (heroVisible) drawBrain();
  }
  brainCanvas.addEventListener("pointermove", (event) => {
    if (reducedMotion || manuallyPaused || !pointerQuery.matches || event.pointerType === "touch") return;
    const rect = brainCanvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1;
  });
  brainCanvas.addEventListener("pointerleave", () => { pointer.x = 0; pointer.y = 0; });
  window.addEventListener("scroll", () => {
    scrollOffset = window.scrollY;
  }, { passive: true });
  new ResizeObserver(resize).observe(brainCanvas);
  new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    sync();
  }, { threshold: 0 }).observe(document.getElementById("home"));
  document.addEventListener("visibilitychange", sync);
  motionQuery.addEventListener("change", (event) => {
    reducedMotion = event.matches;
    smoothed.x = 0; smoothed.y = 0;
    pointer.x = 0; pointer.y = 0;
    scrollDepth = 0;
    entranceElapsed = entranceDuration;
    sync();
  });
  window.addEventListener("resize", resize, { passive: true });
  resize();
  brainCanvas.closest(".hero-art").classList.add("has-particles");
  sync();
}
  startParticles();
})();
