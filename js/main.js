(() => {
  "use strict";
  // All content and URLs are edited in index.html. This file only adds behavior.
  // Keep unfinished links inert. Replacing href in the HTML enables them on reload.
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href").trim();
    if (!href || href.includes("[[")) {
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
      link.title = document.body.dataset.pendingLabel;
      link.addEventListener("click", (event) => event.preventDefault());
    }
  });
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".nav");
  function closeMenu(returnFocus = false) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.firstElementChild.textContent = menuToggle.dataset.openLabel;
    navigation.classList.remove("is-open");
    if (returnFocus) menuToggle.focus();
  }
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.firstElementChild.textContent = open ? menuToggle.dataset.closeLabel : menuToggle.dataset.openLabel;
    navigation.classList.toggle("is-open", open);
  });
  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const mobileOpen = menuToggle.getAttribute("aria-expanded") === "true";
    closeMenu();
    if (mobileOpen) {
      const section = document.querySelector(link.getAttribute("href"));
      section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  matchMedia("(min-width: 921px)").addEventListener("change", () => closeMenu());

  const filters = document.querySelectorAll(".filter");
  // Counts follow the actual cards, including any article copied in index.html.
  filters.forEach((button) => {
    const count = [...document.querySelectorAll(".project-card")].filter((card) =>
      button.dataset.filter === "all" || card.dataset.category === button.dataset.filter
    ).length;
    button.querySelector("span").textContent = count;
  });
  document.querySelector("[data-visible-count]").textContent = document.querySelectorAll(".project-card").length;
  filters.forEach((button) => button.addEventListener("click", () => {
    const category = button.dataset.filter;
    filters.forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
    let count = 0;
    document.querySelectorAll(".project-card").forEach((card) => {
      card.hidden = category !== "all" && card.dataset.category !== category;
      if (!card.hidden) count++;
    });
    document.querySelector("[data-visible-count]").textContent = count;
  }));
  document.querySelectorAll(".project-preview img").forEach((img) => {
    function fallback() {
      img.hidden = true;
      img.parentElement.querySelector(".preview-placeholder").hidden = false;
    }
    img.addEventListener("error", fallback, { once: true });
    if (img.getAttribute("src").endsWith("project-placeholder.svg") || (img.complete && !img.naturalWidth)) fallback();
  });

  let scrollQueued = false;
  function updateNavigation() {
    const sections = [...document.querySelectorAll("main > section")];
    let current = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= window.innerHeight * .4) current = section.id;
    }
    document.querySelectorAll(".nav-link").forEach((link) => {
      if (link.hash === `#${current}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    document.querySelector(".site-header").classList.toggle("scrolled", window.scrollY > 20);
    scrollQueued = false;
  }
  window.addEventListener("scroll", () => {
    if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateNavigation); }
  }, { passive: true });
  updateNavigation();
  // Reveal each section once. Content stays visible when JS or observers are unavailable.
  const revealMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if ("IntersectionObserver" in window && !revealMotion.matches) {
    const sections = [...document.querySelectorAll(".section > .wrap")];
    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove("reveal-pending");
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: "0px 0px -32px 0px" });
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top < window.innerHeight) return;
      section.classList.add("reveal-ready", "reveal-pending");
      reveal.observe(section);
    });
    // Keyboard navigation and motion preferences must never hide focused content.
    document.addEventListener("focusin", (event) => {
      const section = event.target.closest(".reveal-pending");
      if (section) { section.classList.remove("reveal-pending"); reveal.unobserve(section); }
    });
    revealMotion.addEventListener("change", (event) => {
      if (!event.matches) return;
      sections.forEach((section) => section.classList.remove("reveal-pending"));
      reveal.disconnect();
    });
  }
  // Preserve deep links and the fixed-header offset.
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant" }));
  }

  function startParticles() {
    const brainCanvas = document.getElementById("constellation");
    const ambientCanvas = document.getElementById("ambient-particles");
    const brainContext = brainCanvas.getContext("2d");
    const ambientContext = ambientCanvas.getContext("2d");
    const toggle = document.querySelector(".motion-toggle");
    if (!brainContext || !ambientContext) return;

    // All visual settings that you may want to change are HTML data attributes.
    const palette = document.body.dataset.triangleColors.split(",").map((hex) => {
      const color = hex.trim().replace("#", "");
      return /^[0-9a-f]{6}$/i.test(color)
        ? [0, 2, 4].map((index) => parseInt(color.slice(index, index + 2), 16)).join(",")
        : "236,238,243";
    });
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
    let scrollOffset = window.scrollY;
    let brainWidth = 0;
    let brainHeight = 0;
    let ambientWidth = 0;
    let ambientHeight = 0;
    let brainPoints = [];
    let ambientPoints = [];
    let exclusions = [];
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
      // Distribute exactly 12% accent particles across the anatomy, not in color bands.
      brainPoints.forEach((point, index) => {
        const accent = Math.floor((index + 1) * accentRatio) > Math.floor(index * accentRatio);
        point.color = accent ? palette[2] : palette[index % 2];
      });
      projected.length = brainPoints.length;
      for (let index = 0; index < projected.length; index++) projected[index] = {};
    }

    function buildAmbient() {
      const random = seededRandom(137);
      const count = configuredCount(ambientCanvas, 160);
      ambientPoints = Array.from({ length: count }, (_, index) => {
        const inMargin = random() < .60;
        const left = random() < .5;
        return {
          x: inMargin ? (left ? .015 + random() * .07 : .915 + random() * .07) : random(),
          y: random(),
          size: 2.5 + random() * (index % 9 === 0 ? 12 : 5),
          angle: random() * Math.PI * 2,
          color: palette[index % 2]
        };
      });
    }

    function measureExclusions() {
      // Cache document coordinates: no layout reads during animation frames.
      scrollOffset = window.scrollY;
      exclusions = [...document.querySelectorAll(
        ".hero-copy, .hero-art, .hero-bottom, .section-heading, .skill, .work-tools, .project-card, .experience-heading, .timeline, #contact .wrap, .footer-inner"
      )].filter((element) => !element.hidden).map((element) => {
        const rect = element.getBoundingClientRect();
        return { left: rect.left - 13, right: rect.right + 13, top: rect.top + scrollOffset - 13, bottom: rect.bottom + scrollOffset + 13 };
      });
      drawAmbient();
    }

    function sizeCanvas(canvas, context, width, height) {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function resize() {
      const bounds = brainCanvas.getBoundingClientRect();
      brainWidth = bounds.width;
      brainHeight = bounds.height;
      ambientWidth = window.innerWidth;
      ambientHeight = window.innerHeight;
      sizeCanvas(brainCanvas, brainContext, brainWidth, brainHeight);
      sizeCanvas(ambientCanvas, ambientContext, ambientWidth, ambientHeight);
      buildBrain();
      buildAmbient();
      measureExclusions();
      drawBrain();
      drawAmbient();
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
      const yaw = -.36 + Math.sin(time * .035) * .22 + smoothed.x * .07;
      const pitch = .10 + Math.sin(time * .025) * .025 + smoothed.y * .035;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const scale = Math.min(brainWidth / 3.05, brainHeight / 2.65);
      const unit = Math.max(.65, scale / 175);
      for (let index = 0; index < brainPoints.length; index++) {
        const point = brainPoints[index];
        const x = point.x * cy + point.z * sy;
        const z = point.z * cy - point.x * sy;
        const y = point.y * cp - z * sp;
        const depth = point.y * sp + z * cp;
        const perspective = 3.8 / (3.8 - depth * .6);
        const front = Math.max(0, Math.min(1, (depth + .8) / 1.6));
        const projectedPoint = projected[index];
        projectedPoint.x = brainWidth * .49 + x * scale * perspective;
        projectedPoint.y = brainHeight * .48 - (y + .18) * scale * perspective;
        projectedPoint.z = depth;
        projectedPoint.size = point.size * unit * perspective;
        projectedPoint.angle = point.angle + yaw * .4;
        projectedPoint.color = point.color;
        projectedPoint.alpha = point.part === "gyrus" ? .36 + front * .22 : (.18 + front * .42) * (.65 + point.ridge * .35);
        projectedPoint.line = .55 + front * .55;
      }
      // Render back to front so near-surface triangles reveal the volume.
      projected.sort((a, b) => a.z - b.z);
      for (const point of projected) triangle(brainContext, point.x, point.y, point.size, point.angle, point.color, point.alpha, point.line);

    }

    function drawAmbient() {
      ambientContext.clearRect(0, 0, ambientWidth, ambientHeight);
      // Static, sparse margin triangles preserve the motif without background motion.
      for (const point of ambientPoints) {
        const x = point.x * ambientWidth;
        const y = point.y * ambientHeight;
        if (y < 96 || exclusions.some((rect) => x > rect.left && x < rect.right && y + scrollOffset > rect.top && y + scrollOffset < rect.bottom)) continue;
        triangle(ambientContext, x, y, point.size, point.angle,
          point.color, .12, .85);
      }
    }

    function animate(time) {
      frame = requestAnimationFrame(animate);
      // Canvas drawing stays at 30fps; no frame catch-up after tab visibility changes.
      if (lastDraw && time - lastDraw < 1000 / 30) return;
      if (lastTime) elapsed += Math.min(time - lastTime, 80);
      lastTime = time;
      lastDraw = time;
      smoothed.x += (pointer.x - smoothed.x) * .075;
      smoothed.y += (pointer.y - smoothed.y) * .075;
      if (heroVisible) drawBrain();
    }
    function sync() {
      cancelAnimationFrame(frame);
      lastTime = 0;
      lastDraw = 0;
      const paused = manuallyPaused || reducedMotion;
      toggle.disabled = reducedMotion;
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", paused ? toggle.dataset.playLabel : toggle.dataset.pauseLabel);
      toggle.textContent = paused ? "▷" : "Ⅱ";
      if (!document.hidden && !paused && heroVisible) frame = requestAnimationFrame(animate);
      else { if (heroVisible) drawBrain(); drawAmbient(); }
    }
    toggle.addEventListener("click", () => { manuallyPaused = !manuallyPaused; sync(); });
    brainCanvas.addEventListener("pointermove", (event) => {
      if (reducedMotion || manuallyPaused || !pointerQuery.matches || event.pointerType === "touch") return;
      const rect = brainCanvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
      pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1;
    });
    brainCanvas.addEventListener("pointerleave", () => { pointer.x = 0; pointer.y = 0; });
    window.addEventListener("scroll", () => {
      scrollOffset = window.scrollY;
      drawAmbient();
    }, { passive: true });
    new ResizeObserver(resize).observe(brainCanvas);
    new ResizeObserver(measureExclusions).observe(document.querySelector("main"));
    new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      sync();
    }, { threshold: 0 }).observe(document.getElementById("home"));
    document.addEventListener("visibilitychange", sync);
    motionQuery.addEventListener("change", (event) => {
      reducedMotion = event.matches;
      smoothed.x = 0; smoothed.y = 0;
      sync();
    });
    window.addEventListener("resize", resize, { passive: true });
    resize();
    brainCanvas.closest(".hero-art").classList.add("has-particles");
    toggle.hidden = false;
    sync();
  }
  startParticles();
})();
