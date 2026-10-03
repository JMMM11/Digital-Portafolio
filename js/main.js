(() => {
  "use strict";
  // All content and URLs are edited in index.html. This file only adds behavior.
  const themeToggle = document.querySelector(".theme-toggle");
  function applyTheme(theme, persist = false) {
    const selected = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = selected;
    document.querySelector('meta[name="theme-color"]').content = selected === "dark" ? "#08090d" : "#f7f3e9";
    if (themeToggle) {
      const label = selected === "dark" ? themeToggle.dataset.lightLabel : themeToggle.dataset.darkLabel;
      themeToggle.setAttribute("aria-label", label);
      themeToggle.setAttribute("aria-pressed", String(selected === "dark"));
      themeToggle.title = label;
      themeToggle.hidden = false;
    }
    if (persist) {
      try { localStorage.setItem("jair-portfolio-theme", selected); } catch { /* Theme switching still works. */ }
    }
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: selected } }));
  }
  applyTheme(document.documentElement.dataset.theme);
  themeToggle?.addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark", true);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === "jair-portfolio-theme" || event.key === null) applyTheme(event.newValue);
  });
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

  // Icon sources live in HTML. Clones are only visual and hidden from assistive technology.
  function startIconCarousels() {
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    document.querySelectorAll(".tech-marquee").forEach((carousel) => {
      const viewport = carousel.querySelector(".tech-marquee-viewport");
      const track = carousel.querySelector(".tech-marquee-track");
      const source = carousel.querySelector("[data-marquee-source]");
      const toggle = carousel.querySelector(".tech-marquee-toggle");
      if (!viewport || !track || !source || !toggle || !track.animate) return;
      const configuredSpeed = Number(carousel.dataset.speed);
      const speed = Number.isFinite(configuredSpeed) && configuredSpeed > 0
        ? Math.max(8, Math.min(100, configuredSpeed)) : 32;
      let animation;
      let duration = 0;
      let paused = false;
      let hovered = false;
      let focused = false;
      let visible = true;
      let resizeFrame = 0;

      function sync() {
        const globalPause = document.body.classList.contains("motion-paused");
        const stopped = paused || globalPause || reducedMotion.matches;
        toggle.hidden = !animation;
        toggle.disabled = globalPause || reducedMotion.matches;
        toggle.setAttribute("aria-pressed", String(stopped));
        toggle.setAttribute("aria-label", stopped ? toggle.dataset.playLabel : toggle.dataset.pauseLabel);
        toggle.firstElementChild.textContent = stopped ? "▷" : "Ⅱ";
        if (!animation) return;
        if (stopped || hovered || focused || !visible || document.hidden) animation.pause();
        else animation.play();
      }

      function build() {
        resizeFrame = 0;
        const phase = animation && duration ? (Number(animation.currentTime) % duration) / duration : 0;
        animation?.cancel();
        animation = undefined;
        track.querySelectorAll("[data-marquee-clone]").forEach((clone) => clone.remove());
        carousel.classList.remove("is-looping");
        carousel.hidden = source.children.length === 0;
        const width = source.getBoundingClientRect().width;
        if (reducedMotion.matches || !source.children.length || !width || !viewport.clientWidth) {
          sync();
          return;
        }
        // Fill even very wide screens or lists containing a single icon, plus one full cycle.
        const copies = Math.ceil(viewport.clientWidth / width);
        for (let index = 0; index < copies; index++) {
          const clone = source.cloneNode(true);
          clone.removeAttribute("data-marquee-source");
          clone.setAttribute("data-marquee-clone", "");
          clone.setAttribute("aria-hidden", "true");
          clone.setAttribute("inert", "");
          clone.removeAttribute("id");
          clone.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
          clone.querySelectorAll("img").forEach((img) => { img.alt = ""; });
          track.append(clone);
        }
        viewport.scrollLeft = 0;
        duration = width / speed * 1000;
        animation = track.animate(
          [{ transform: "translateX(0)" }, { transform: `translateX(-${width}px)` }],
          { duration, iterations: Infinity, easing: "linear" }
        );
        animation.currentTime = phase * duration;
        carousel.classList.add("is-looping");
        sync();
      }
      function scheduleBuild() {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(build);
      }
      toggle.addEventListener("click", () => { paused = !paused; sync(); });
      viewport.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse") return;
        hovered = true;
        sync();
      });
      viewport.addEventListener("pointerleave", () => { hovered = false; sync(); });
      viewport.addEventListener("focusin", () => { focused = true; sync(); });
      viewport.addEventListener("focusout", (event) => {
        focused = viewport.contains(event.relatedTarget);
        sync();
      });
      document.addEventListener("visibilitychange", sync);
      reducedMotion.addEventListener("change", scheduleBuild);
      new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
      new MutationObserver(scheduleBuild).observe(source, {
        childList: true, subtree: true, attributes: true, attributeFilter: ["src", "alt"]
      });
      if ("ResizeObserver" in window) {
        const resize = new ResizeObserver(scheduleBuild);
        resize.observe(viewport);
        resize.observe(source);
      } else {
        window.addEventListener("resize", scheduleBuild, { passive: true });
      }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); })
          .observe(carousel);
      }
      build();
    });
  }
  startIconCarousels();

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
  // Cinematic entrances use existing HTML; the content stays editable and works without JS.
  const revealMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let revealObserver;
  function revealAll() {
    document.querySelectorAll(".reveal-pending").forEach((element) => element.classList.remove("reveal-pending"));
    revealObserver?.disconnect();
  }
  if (!revealMotion.matches) {
    document.body.classList.add("motion-ready", "hero-enter");
    if ("IntersectionObserver" in window) {
      const targets = [...document.querySelectorAll(
        ".section > .wrap > .eyebrow, .section-heading, .skill, .work-tools, .project-card, .experience-heading, .timeline-label, .timeline-entry, .contact .wrap > :not(.eyebrow), .footer-inner"
      )];
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.remove("reveal-pending");
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
      targets.forEach((element) => {
        // Do not transform the sticky experience column.
        if (element.matches(".experience-heading")) return;
        if (element.matches(".skill, .project-card")) {
          const siblings = [...element.parentElement.children];
          element.style.setProperty("--reveal-delay", (siblings.indexOf(element) % 3) * 90 + "ms");
        }
        element.classList.add("reveal-ready", "reveal-pending");
        revealObserver.observe(element);
      });
      document.addEventListener("focusin", (event) => {
        const target = event.target.closest(".reveal-pending");
        if (target) { target.classList.remove("reveal-pending"); revealObserver.unobserve(target); }
      });
    }
  }
  revealMotion.addEventListener("change", (event) => {
    if (event.matches) {
      revealAll();
      document.body.classList.remove("motion-ready", "hero-enter");
    } else {
      document.body.classList.add("motion-ready");
    }
  });
  // Preserve deep links and the fixed-header offset.
  if (location.hash) {
    const target = document.getElementById(location.hash.slice(1));
    if (target) requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant" }));
  }

  function startJourneyVisual() {
    const figure = document.querySelector(".journey-visual");
    if (!figure || !figure.animate) return;
    const button = figure.querySelector(".journey-toggle");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const animations = [];
    let paused = false;
    let visible = !("IntersectionObserver" in window);
    // Sample the editable SVG paths once. The browser animates the transforms afterwards.
    figure.querySelectorAll("[data-orbit-path]").forEach((traveler) => {
      const path = document.getElementById(traveler.dataset.orbitPath);
      if (!path) return;
      const length = path.getTotalLength();
      const frames = Array.from({ length: 97 }, (_, index) => {
        const point = path.getPointAtLength(length * index / 96);
        return { transform: `translate(${point.x}px, ${point.y}px)`, offset: index / 96 };
      });
      const duration = Math.max(8000, Math.min(60000, Number(traveler.dataset.duration) || 18000));
      animations.push(traveler.animate(frames, { duration, iterations: Infinity, easing: "linear" }));
    });
    animations.push(figure.querySelector(".journey-bird-float").animate(
      [{ transform: "translateY(0px)" }, { transform: "translateY(-5px)" }, { transform: "translateY(0px)" }],
      { duration: 6400, iterations: Infinity, easing: "ease-in-out" }
    ));
    animations.push(figure.querySelector(".journey-signal").animate(
      [{ transform: "scale(1)", opacity: .35 }, { transform: "scale(2.8)", opacity: 0 }],
      { duration: 3200, iterations: Infinity, easing: "ease-out" }
    ));
    function sync() {
      const globalPause = document.body.classList.contains("motion-paused");
      const stopped = paused || motion.matches || globalPause;
      animations.forEach((animation) => {
        if (stopped || !visible || document.hidden) animation.pause();
        else animation.play();
      });
      button.hidden = motion.matches;
      button.disabled = globalPause;
      button.setAttribute("aria-pressed", String(stopped));
      button.setAttribute("aria-label", stopped ? button.dataset.playLabel : button.dataset.pauseLabel);
      button.firstElementChild.textContent = stopped ? "▷" : "Ⅱ";
    }
    button.addEventListener("click", () => { paused = !paused; sync(); });
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(figure);
    }
    sync();
  }
  startJourneyVisual();

  function startParticles() {
    const brainCanvas = document.getElementById("constellation");
    const ambientCanvas = document.getElementById("ambient-particles");
    const brainContext = brainCanvas.getContext("2d");
    const ambientContext = ambientCanvas.getContext("2d");
    const toggle = document.querySelector(".motion-toggle");
    if (!brainContext || !ambientContext) return;

    // All visual settings that you may want to change are HTML data attributes.
    function readPalette() {
      const colors = document.documentElement.dataset.theme === "light"
        ? document.body.dataset.triangleColorsLight : document.body.dataset.triangleColors;
      return colors.split(",").map((hex) => {
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
      const heroBounds = document.getElementById("home").getBoundingClientRect();
      heroTop = heroBounds.top + window.scrollY;
      heroHeight = heroBounds.height;
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
        // A broad, faint outline makes green signals luminous without shadows or gradients.
        if (point.accent && point.z > 0) {
          triangle(brainContext, point.x, point.y, point.size * 1.4, point.angle,
            point.color, .06 + point.signal * .10, 2);
        }
        triangle(brainContext, point.x, point.y, point.size, point.angle, point.color, point.alpha, point.line);
      }
    }

    function drawAmbient() {
      ambientContext.clearRect(0, 0, ambientWidth, ambientHeight);
      // Static, sparse margin triangles preserve the motif without background motion.
      for (const point of ambientPoints) {
        const x = point.x * ambientWidth;
        const y = point.y * ambientHeight + (reducedMotion || manuallyPaused ? 0 : Math.sin(scrollOffset * .0008 + point.angle) * 16);
        if (y < 96 || exclusions.some((rect) => x > rect.left && x < rect.right && y + scrollOffset > rect.top && y + scrollOffset < rect.bottom)) continue;
        triangle(ambientContext, x, y, point.size, point.angle,
          point.color, .12, .85);
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
      if (paused) revealAll();
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
    window.addEventListener("themechange", () => {
      palette = readPalette();
      buildBrain();
      buildAmbient();
      drawBrain();
      drawAmbient();
    });
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
    toggle.hidden = false;
    sync();
  }
  startParticles();
})();
