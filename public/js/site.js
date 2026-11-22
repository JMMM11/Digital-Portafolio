/*
 * COMPORTAMIENTO COMPARTIDO POR TODAS LAS PAGINAS.
 * El contenido vive en los .html y en js/projects-data.js; aqui solo hay interaccion:
 *   1. Navegacion: pestana que se desliza, menu movil
 *   2. Tarjetas de proyectos y filtros (galeria editorial con parallax)
 *   3. Formulario de contacto
 *   4. Idioma ingles / espanol (textos en js/i18n-es.js)
 *   5. Animaciones con Motion (js/vendor/motion.js, global "Motion"): entrada, revelado al bajar,
 *      parallax y apilado de tarjetas
 * Todas las animaciones usan solo transform y opacity y se desactivan
 * con "movimiento reducido" o si Motion no carga.
 */
(() => {
  "use strict";
  const root = document.documentElement;
  const M = window.Motion;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const canAnimate = () => Boolean(M) && !reduceMotion.matches;
  const EASE_OUT = [0.22, 1, 0.36, 1];
  // Idioma: theme.js ya lo puso en <html lang>. Sin js/i18n-es.js el sitio queda en ingles.
  const I18N = window.I18N;
  let lang = I18N && root.lang === "es" ? "es" : "en";
  const FALLBACK_UI = {
    menu: "Menu", close: "Close", role: "My role", builtWith: "Built with", demo: "Live demo", source: "Source code",
    shown: (n) => `${n} ${n === 1 ? "project" : "projects"} shown`, messageFrom: "message from",
    cv: "assets/cv/Jair_Morales_CV_EN.pdf", whatsapp: "", quote: "",
    problem: "Problem", challenge: "Challenge", result: "Result"
  };
  const ui = () => I18N?.ui[lang] ?? FALLBACK_UI;

  /* ---------- 1. Navegacion ---------- */
  const nav = document.querySelector(".nav");
  const navList = document.querySelector(".nav-list");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const menuToggle = document.querySelector(".menu-toggle");
  const desktopNav = matchMedia("(min-width: 1120px)"); // Igual que el @media del menu en styles.css.
  const currentLink = navLinks.find((link) => link.getAttribute("aria-current") === "page");

  // Pestana naranja: un solo elemento que se desliza detras del enlace activo.
  // Al cargar, sale desde el enlace de la pagina anterior, para que el cambio
  // de pagina se sienta continuo. Al pasar el cursor, acompana al enlace.
  const tab = document.createElement("span");
  tab.className = "nav-tab";
  tab.setAttribute("aria-hidden", "true");
  navList.prepend(tab);
  const TAB_BASE = 100; // Ancho base en px; se ajusta con scaleX (solo transform).
  let tabTarget = null;

  function tabFrame(link) {
    return { x: link.offsetLeft, scaleX: link.offsetWidth / TAB_BASE };
  }
  function moveTab(link, animated = true) {
    tabTarget?.classList.remove("is-tabbed");
    tabTarget = link;
    if (!link) { tab.style.opacity = "0"; return; }
    link.classList.add("is-tabbed");
    const frame = tabFrame(link);
    tab.style.opacity = "1";
    if (animated && canAnimate()) {
      M.animate(tab, frame, { type: "spring", stiffness: 420, damping: 36 });
    } else {
      tab.style.transform = `translateX(${frame.x}px) scaleX(${frame.scaleX})`;
    }
  }
  function placeTab() {
    if (!desktopNav.matches) return;
    let previous = null;
    try { previous = navLinks[Number(sessionStorage.getItem("nav-from"))] ?? null; } catch { /* Sin almacenamiento. */ }
    if (previous && previous !== currentLink && currentLink) {
      moveTab(previous, false);
      // Un frame de espera para que el navegador pinte la posicion inicial.
      requestAnimationFrame(() => moveTab(currentLink));
    } else {
      moveTab(currentLink, false);
    }
    try { sessionStorage.setItem("nav-from", String(navLinks.indexOf(currentLink))); } catch { /* Sin almacenamiento. */ }
  }
  // Las fuentes cambian el ancho de los enlaces: se coloca cuando ya cargaron.
  (document.fonts?.ready ?? Promise.resolve()).then(placeTab);
  navLinks.forEach((link) => {
    link.addEventListener("pointerenter", (event) => {
      if (desktopNav.matches && event.pointerType === "mouse") moveTab(link);
    });
    link.addEventListener("focus", () => { if (desktopNav.matches) moveTab(link); });
  });
  navList.addEventListener("pointerleave", () => { if (desktopNav.matches) moveTab(currentLink); });
  navList.addEventListener("focusout", (event) => {
    if (desktopNav.matches && !navList.contains(event.relatedTarget)) moveTab(currentLink);
  });
  window.addEventListener("resize", () => { if (desktopNav.matches) moveTab(currentLink, false); }, { passive: true });

  // Menu movil: una hoja que se despliega bajo la cabecera.
  let lenis = null; // scroll suave; se crea al final (seccion 5)
  function setMenu(open, returnFocus = false) {
    if (open) lenis?.stop(); else lenis?.start();
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.querySelector(".menu-toggle-label").textContent = open ? ui().close : ui().menu;
    root.classList.toggle("menu-open", open);
    if (open) {
      nav.classList.add("is-open");
      if (canAnimate()) {
        M.animate(nav, { opacity: [0, 1], y: [-12, 0] }, { duration: 0.28, ease: EASE_OUT });
        M.animate(navLinks, { opacity: [0, 1], x: [-18, 0] }, { delay: M.stagger(0.045, { startDelay: 0.06 }), duration: 0.34, ease: EASE_OUT });
      }
    } else if (nav.classList.contains("is-open")) {
      const finish = () => {
        nav.classList.remove("is-open");
        nav.style.opacity = "";
        nav.style.transform = "";
        navLinks.forEach((link) => { link.style.opacity = ""; link.style.transform = ""; });
      };
      if (canAnimate()) M.animate(nav, { opacity: 0, y: -8 }, { duration: 0.18, ease: "easeIn" }).then(finish);
      else finish();
    }
    if (returnFocus) menuToggle.focus();
  }
  menuToggle.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") setMenu(false, true);
  });
  desktopNav.addEventListener("change", (event) => {
    if (event.matches) { setMenu(false); placeTab(); }
  });

  /* ---------- 2. Proyectos ---------- */
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }
  function externalLink(label, url, className) {
    const link = element("a", className, label);
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }
  // Captura dentro de un marco con parallax (.px). El cursor muestra "Open" encima.
  function projectMedia(project, className) {
    const url = project.demo || project.repo;
    const media = element(url ? "a" : "div", `${className} px`);
    if (url) {
      media.href = url;
      media.target = "_blank";
      media.rel = "noopener noreferrer";
      media.tabIndex = -1; // El titulo ya es el enlace accesible.
      media.setAttribute("aria-hidden", "true");
    }
    if (project.image) {
      const image = element("img");
      image.src = project.image;
      image.alt = "";
      image.width = 1280;
      image.height = 800;
      image.loading = "lazy";
      image.decoding = "async";
      media.append(image);
    } else {
      media.classList.add("is-typographic");
      media.append(element("span", "media-title", project.title));
    }
    return media;
  }
  function projectLinks(project) {
    const links = element("div", "project-links");
    if (project.demo) links.append(externalLink(ui().demo, project.demo, "arrow-link"));
    if (project.repo) links.append(externalLink(ui().source, project.repo, "arrow-link"));
    return links;
  }
  // Tarjeta grande: captura a un lado y panel de color al otro. En el inicio se apilan al bajar.
  // Con spotlight (projects.html) el panel suma problema, reto y resultado.
  function workCard(project, index, withCase) {
    const card = element("article", `work-card tone-${index % 3}`);
    card.dataset.category = project.category;
    const panel = element("div", "work-panel");
    panel.append(element("p", "mono-label", `${String(index + 1).padStart(2, "0")} / ${project.kind}`));
    const title = element("h3", "work-name");
    const url = project.demo || project.repo;
    if (url) title.append(externalLink(project.title, url, ""));
    else title.textContent = project.title;
    panel.append(title);
    if (withCase) {
      const points = element("dl", "case-points");
      [["problem", project.problem], ["challenge", project.challenge], ["result", project.result]]
        .filter(([, text]) => text)
        .forEach(([label, text]) => points.append(element("dt", "mono-label", ui()[label]), element("dd", "", text)));
      panel.append(points.children.length ? points : element("p", "work-summary", project.summary));
    } else {
      panel.append(element("p", "work-summary", project.summary));
    }
    const tags = element("ul", "case-tags");
    tags.setAttribute("aria-label", ui().builtWith);
    (withCase ? project.tags ?? project.stack : project.stack).forEach((tag) => tags.append(element("li", "", tag)));
    panel.append(tags, projectLinks(project));
    if (project.note) panel.append(element("p", "project-note", project.note));
    card.append(projectMedia(project, "work-media"), panel);
    return card;
  }
  // Cuadricula de projects.html: imagen grande y texto debajo, sin caja.
  function projectTile(project, index) {
    const tile = element("article", "tile");
    tile.dataset.category = project.category;
    const body = element("div", "tile-body");
    body.append(element("p", "mono-label", `${project.kind}`));
    const title = element("h3", "tile-title");
    const url = project.demo || project.repo;
    if (url) title.append(externalLink(project.title, url, ""));
    else title.textContent = project.title;
    body.append(title, element("p", "tile-summary", project.summary));
    body.append(element("p", "tile-stack mono-label", project.stack.join(" / ")), projectLinks(project));
    if (project.note) body.append(element("p", "project-note", project.note));
    tile.append(projectMedia(project, "tile-media"), body);
    return tile;
  }
  // Dibuja las tarjetas en el idioma actual. Los textos en espanol estan en project.es.
  function renderProjects() {
    const all = (window.PROJECTS ?? [])
      .map((project) => (lang === "es" && project.es ? { ...project, ...project.es } : project));
    document.querySelectorAll("[data-projects]").forEach((container) => {
      const featured = container.dataset.projects === "featured";
      // Si la pagina tiene destacados, la cuadricula muestra solo el resto.
      const skipSpotlight = Boolean(document.querySelector("[data-spotlight]"));
      const list = all.filter((project) => (featured ? project.featured : !(skipSpotlight && project.spotlight)));
      container.replaceChildren(...list.map((project, index) => (featured
        ? (() => { const item = element("li", "work-item"); item.append(workCard(project, index, false)); return item; })()
        : projectTile(project, index))));
    });
    document.querySelectorAll("[data-spotlight]").forEach((container) => {
      const list = all.filter((project) => project.spotlight).sort((a, b) => a.spotlight - b.spotlight);
      container.replaceChildren(...list.map((project, index) => workCard(project, index, true)));
    });
  }

  // Filtros de projects.html.
  const filters = [...document.querySelectorAll("[data-filter]")];
  const filterStatus = document.querySelector("[data-filter-status]");
  const projectCards = () => [...document.querySelectorAll("[data-projects='all'] .tile")];
  function applyFilter(animated) {
    const active = filters.find((item) => item.getAttribute("aria-pressed") === "true")?.dataset.filter ?? "all";
    const shown = projectCards().filter((card) => {
      const match = active === "all" || card.dataset.category === active;
      card.hidden = !match;
      return match;
    });
    if (filterStatus && active !== "all") filterStatus.textContent = ui().shown(shown.length);
    else if (filterStatus) filterStatus.textContent = "";
    if (animated && canAnimate()) {
      M.animate(shown, { opacity: [0, 1], y: [14, 0] }, { delay: M.stagger(0.05), duration: 0.4, ease: EASE_OUT });
    }
  }
  renderProjects();
  filters.forEach((button) => {
    const cards = projectCards();
    const total = button.dataset.filter === "all" ? cards.length
      : cards.filter((card) => card.dataset.category === button.dataset.filter).length;
    button.querySelector(".filter-count").textContent = String(total);
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;
      filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
      applyFilter(true);
    });
  });

  /* ---------- 3. Contacto ---------- */
  // El sitio es estatico: el formulario prepara un correo en la app del visitante.
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const status = contactForm.querySelector("[data-form-status]");
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const data = new FormData(contactForm);
      const subject = `${data.get("topic")}: ${ui().messageFrom} ${data.get("name")}`;
      const body = `${data.get("message")}\n\n${data.get("name")}\n${data.get("email")}`;
      location.href = `mailto:${contactForm.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.hidden = false;
      if (canAnimate()) M.animate(status, { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, ease: EASE_OUT });
    });
  }

  /* ---------- 4. Idioma ---------- */
  // Cada texto de la pagina se busca en I18N.es ("ingles exacto": "espanol").
  // Se guarda el original para poder volver al ingles sin recargar.
  const norm = (text) => text.replace(/\s+/g, " ").trim();
  const originals = new Map();
  const ATTRS = ["aria-label", "alt", "content"];
  function translatePage() {
    originals.forEach((saved, node) => {
      if (saved.html !== undefined) node.innerHTML = saved.html;
      Object.entries(saved.attrs).forEach(([name, value]) => node.setAttribute(name, value));
    });
    originals.clear();
    if (lang !== "es") return;
    const dict = I18N.es;
    const saved = (node) => {
      if (!originals.has(node)) originals.set(node, { attrs: {} });
      return originals.get(node);
    };
    const walk = (node) => {
      for (const name of ATTRS) {
        const value = node.getAttribute(name);
        if (value && dict[norm(value)] !== undefined) {
          saved(node).attrs[name] = value;
          node.setAttribute(name, dict[norm(value)]);
        }
      }
      // Las tarjetas de proyectos se dibujan aparte (renderProjects) y los SVG no tienen texto visible.
      if (node.matches("svg, script, noscript, [data-projects], [data-spotlight], [data-no-i18n]")) return;
      const key = norm(node.innerHTML);
      if (key && dict[key] !== undefined) {
        saved(node).html = node.innerHTML;
        node.innerHTML = dict[key];
        return;
      }
      [...node.children].forEach(walk);
    };
    [document.querySelector("title"), document.querySelector('meta[name="description"]'), document.body]
      .filter(Boolean).forEach(walk);
  }
  const langToggle = document.querySelector(".lang-toggle");
  function applyLanguage() {
    root.lang = lang;
    translatePage();
    renderProjects();
    applyFilter(false);
    initEffects();
    refreshTitleWater();
    renderLs();
    // CV en el idioma elegido, mensaje de WhatsApp y textos de botones.
    document.querySelectorAll("[data-cv]").forEach((node) => {
      if (node.tagName === "IFRAME") node.src = `${ui().cv}#view=FitH`;
      else node.href = ui().cv;
    });
    // data-wa="quote" pide cotizacion; el resto de enlaces lleva el saludo general.
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
      const message = link.dataset.wa === "quote" ? ui().quote : ui().whatsapp;
      if (!message) return;
      const url = new URL(link.href);
      link.href = `${url.origin}${url.pathname}?text=${encodeURIComponent(message)}`;
    });
    menuToggle.querySelector(".menu-toggle-label").textContent =
      menuToggle.getAttribute("aria-expanded") === "true" ? ui().close : ui().menu;
    if (langToggle && I18N) {
      langToggle.querySelector(".lang-toggle-code").textContent = ui().langButton;
      langToggle.setAttribute("aria-label", ui().langLabel);
      langToggle.lang = lang === "es" ? "en" : "es";
      langToggle.hidden = false;
    }
    // Los enlaces del menu cambian de ancho: la pestana naranja se recoloca.
    if (desktopNav.matches && currentLink) moveTab(currentLink, false);
    root.classList.remove("i18n-pending");
  }
  // Cambio de idioma suave: el contenido visible se desvanece, se cambian los textos
  // mientras esta oculto y vuelve a entrar bloque por bloque.
  let switching = false;
  langToggle?.addEventListener("click", async () => {
    if (switching) return;
    switching = true;
    lang = lang === "es" ? "en" : "es";
    try { localStorage.setItem("jair-portfolio-lang", lang); } catch { /* Funciona sin guardar. */ }
    if (!canAnimate()) { applyLanguage(); switching = false; return; }
    // Los bloques que aun esperan su revelado al bajar no participan: se muestran ya traducidos.
    const blocks = () => [...document.querySelectorAll("main > *, .site-footer, .nav-list")]
      .filter((node) => !node.dataset.fxPending);
    await M.animate(blocks(), { opacity: 0, y: 6 }, { duration: 0.22, ease: "easeIn" });
    applyLanguage();
    const incoming = blocks();
    incoming.forEach((node) => { node.style.opacity = "0"; });
    await M.animate(incoming, { opacity: [0, 1], y: [14, 0] },
      { delay: M.stagger(0.06), duration: 0.7, ease: EASE_OUT });
    incoming.forEach((node) => { node.style.opacity = ""; node.style.transform = ""; });
    switching = false;
  });

  /* ---------- 5. Animaciones de pagina ---------- */
  const stackLayout = matchMedia("(min-width: 861px)"); // Igual que el @media de .work-list en styles.css.
  let fxStops = []; // Controladores de scroll vivos; se reinician al dibujar de nuevo las tarjetas.

  // Entrada: una sola secuencia por pagina, sobre los elementos con data-intro.
  // Si hay cortina de precarga, la entrada empieza cuando la cortina sube.
  const introItems = [...document.querySelectorAll("[data-intro]")];
  function runIntro() {
    if (canAnimate() && introItems.length) {
      M.animate(introItems, { opacity: [0, 1], y: [22, 0] },
        { delay: M.stagger(0.08), duration: 0.8, ease: EASE_OUT })
        .then(() => root.classList.remove("intro-pending"));
    } else {
      root.classList.remove("intro-pending");
    }
  }

  // PRECARGA: la cortina (theme.js + styles.css) sube cuando las fuentes y la pagina cargaron,
  // tras un minimo de 1.1 s para que se lea el nombre y un maximo de 2.6 s.
  function finishPreload() {
    if (!root.classList.contains("preloading")) return Promise.resolve();
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const loaded = document.readyState === "complete" ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener("load", resolve, { once: true }));
    const ready = Promise.all([document.fonts?.ready, loaded, wait(Math.max(0, 1100 - performance.now()))]);
    return Promise.race([ready, wait(2600)]).then(() => {
      root.classList.remove("preloading");
      return wait(450); // la mitad de la subida de la cortina
    });
  }

  // Efectos que dependen de las tarjetas dibujadas: parallax, revelado al bajar y cinta de proyectos.
  const REVEAL = ".section-head, .now, .closing-inner > *, .skill-group, .timeline-group, .service-card, " +
    ".process-list li, .about-aside, .prose > *, .contact-direct, .contact-form, .more-work, .filter-bar, " +
    ".more-title, .tile, .case-list > *, .experience-art, .hero-facts";
  function initEffects() {
    fxStops.forEach((stop) => { if (typeof stop === "function") stop(); });
    fxStops = [];
    const marquee = document.querySelector("[data-marquee]");
    if (marquee && !marquee.children.length) {
      const titles = (window.PROJECTS ?? []).map((project) => project.title);
      if (titles.length) {
        const group = () => titles.flatMap((title) => [element("span", "", title), element("i", "", "✦")]);
        marquee.append(...group(), ...group());
      }
    }
    if (!canAnimate()) return;
    // Parallax: la imagen es mas alta que su marco y se desplaza mientras el marco cruza la pantalla.
    document.querySelectorAll(".px").forEach((frame) => {
      const image = frame.querySelector("img");
      if (image) fxStops.push(M.scroll(M.animate(image, { y: ["-9%", "9%"] }, { ease: "linear" }),
        { target: frame, offset: ["start end", "end start"] }));
    });
    // Revelado: lo que esta bajo el pliegue entra con un fundido al llegar a la pantalla.
    document.querySelectorAll(REVEAL).forEach((node) => {
      if (node.dataset.fx) return;
      node.dataset.fx = "1";
      if (node.getBoundingClientRect().top < innerHeight * 0.9) return;
      node.style.opacity = "0";
      node.dataset.fxPending = "1";
      const delay = ([...node.parentElement.children].indexOf(node) % 3) * 0.08;
      let done = false;
      fxStops.push(M.inView(node, () => {
        if (done) return;
        done = true;
        delete node.dataset.fxPending;
        M.animate(node, { opacity: [0, 1], y: [36, 0] }, { delay, duration: 0.85, ease: EASE_OUT })
          .then(() => { node.style.opacity = ""; node.style.transform = ""; });
      }, { amount: 0.15 }));
    });
    syncScroll();
  }

  // Variables CSS ligadas al scroll (el CSS que las usa solo toca scale, translate y opacity):
  //   --hp  cuanto se ha ido el bloque .page-head (0 a 1): el titulo se achica.
  //   --p   en el inicio, cuanto cubre la tarjeta siguiente a la anterior: la anterior se achica.
  let scrollTicking = false;
  function syncScroll() {
    scrollTicking = false;
    if (!canAnimate()) return;
    document.querySelectorAll(".page-head").forEach((block) => {
      const box = block.getBoundingClientRect();
      block.style.setProperty("--hp", Math.min(1, Math.max(0, -box.top / box.height)).toFixed(3));
    });
    const items = [...document.querySelectorAll(".work-list .work-item")];
    items.forEach((item, i) => {
      const next = items[i + 1];
      let p = 0;
      if (next && stackLayout.matches) p = Math.min(1, Math.max(0, (innerHeight - next.getBoundingClientRect().top) / (innerHeight - 24)));
      item.firstElementChild.style.setProperty("--p", p.toFixed(3));
    });
  }
  const queueScroll = () => { if (!scrollTicking) { scrollTicking = true; requestAnimationFrame(syncScroll); } };
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll, { passive: true });

  // Linea del recorrido (experience.html): se dibuja al avanzar el scroll.
  const timeline = document.querySelector(".timeline");
  const progress = document.querySelector(".timeline-progress");
  if (timeline && progress && canAnimate()) {
    progress.style.transform = "scaleY(0)";
    M.scroll(M.animate(progress, { scaleY: [0, 1] }, { ease: "linear" }),
      { target: timeline, offset: ["start 0.75", "end 0.6"] });
  }

  // Ano del pie de pagina.
  document.querySelectorAll("[data-year]").forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  // Titulos de pagina: el h1 queda bajo una lamina de agua que se ondula con el puntero y
  // aparece de izquierda a derecha (js/name-water.js). El h1 sigue en el HTML (lectores de pantalla, traduccion,
  // seleccion) con el texto transparente.
  let titleWater = null, fitTitleWater = () => {};
  function startTitleWater() {
    const head = document.querySelector(".page-head");
    const title = head?.querySelector("h1");
    if (!title || !window.startNameWater || !window.waterTextLayout) return;
    const canvas = element("canvas", "title-water");
    canvas.setAttribute("aria-hidden", "true");
    fitTitleWater = () => {
      const pad = parseFloat(getComputedStyle(title).fontSize) * 0.3;
      Object.assign(canvas.style, {
        left: `${title.offsetLeft - pad}px`, top: `${title.offsetTop - pad}px`,
        width: `${title.offsetWidth + pad * 2}px`, height: `${title.offsetHeight + pad * 2}px`
      });
    };
    fitTitleWater();
    head.append(canvas);
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fitTitleWater();
      titleWater = window.startNameWater(canvas, { layout: window.waterTextLayout(title), reducedMotion: reduceMotion.matches });
      if (!titleWater) { canvas.remove(); return; }
      head.classList.add("has-water");
      new ResizeObserver(() => fitTitleWater()).observe(title);
      window.addEventListener("pagehide", () => { titleWater?.(); titleWater = null; }, { once: true });
    });
  }
  function refreshTitleWater() {
    if (!titleWater) return;
    fitTitleWater();
    titleWater.refresh();
  }

  // projects.html: una terminal lista todos los proyectos ("ls -la ~/projects").
  // Cada fila: permisos, numero de tecnologias, nombre como enlace y el tipo como comentario.
  function renderLs() {
    const list = document.querySelector("[data-ls]");
    if (!list) return;
    const all = (window.PROJECTS ?? []).map((project) => (lang === "es" && project.es ? { ...project, ...project.es } : project));
    const rows = all.map((project) => {
      const item = element("li", "ls-row");
      const slug = project.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      item.append(element("span", "ls-perm", project.spotlight ? "drwxr-xr-x*" : "drwxr-xr-x "));
      item.append(element("span", "ls-size", String(project.stack.length).padStart(2, " ")));
      const link = element("a", "ls-name", `${slug}/`);
      link.href = project.demo || project.repo;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      item.append(link, element("span", "ls-comment", `# ${project.kind}`));
      return item;
    });
    list.replaceChildren(...rows);
    if (canAnimate()) M.animate(rows, { opacity: [0, 1], x: [-6, 0] }, { delay: M.stagger(0.06, { startDelay: 0.4 }), duration: 0.35 });
  }

  // Pie: hora local de Panama.
  function startClock() {
    const clock = document.querySelector("[data-clock]");
    if (!clock) return;
    const tick = () => {
      clock.textContent = new Date().toLocaleTimeString(lang === "es" ? "es-PA" : "en-US", { timeZone: "America/Panama", hour: "2-digit", minute: "2-digit" });
    };
    tick();
    setInterval(tick, 30000);
  }

  // Para quien abra la consola del navegador.
  console.log("%c</> Jair M. Morales", "font: 600 16px ui-monospace, monospace; color: #2e5e43;");
  console.log("%cLooking at the source? It's open: https://github.com/JMMM11/Digital-Portafolio", "font: 12px ui-monospace, monospace; color: #5a6a5e;");

  // Vitrina (inicio): el monitor 3D pasa las obras principales primero y despues el resto.
  const showroom = document.querySelector("[data-showroom]");
  function showroomProjects() {
    const all = (window.PROJECTS ?? []).map((project) => (lang === "es" && project.es ? { ...project, ...project.es } : project));
    return [...all.filter((p) => p.spotlight).sort((a, b) => a.spotlight - b.spotlight), ...all.filter((p) => !p.spotlight)];
  }
  // Editor que escribe solo: un objeto con los datos de Jair. Colores como un editor de codigo.
  function typeCode() {
    const target = showroom?.querySelector("[data-typing]");
    if (!target) return;
    const count = (window.PROJECTS ?? []).length;
    const tokens = [
      ["kw", "const "], ["fn", "jair"], ["", " = "], ["kw", "new "], ["fn", "Developer"], ["", "({\n"],
      ["prop", "  name"], ["", ": "], ["str", '"Jair M. Morales"'], ["", ",\n"],
      ["prop", "  base"], ["", ": "], ["str", '"Panam\u00e1"'], ["", ",\n"],
      ["prop", "  stack"], ["", ": ["], ["str", '"Full-stack development"'], ["", ", "], ["str", '"UX design"'], ["", "],\n"],
      ["prop", "  coffee"], ["", ": "], ["num", "Infinity"], ["", ",\n"],
      ["", "});\n\n"],
      ["fn", "jair"], ["", "."], ["fn", "ship"], ["", "(projects); "], ["com", `// ${count} live`]
    ];
    const spans = tokens.map(([kind]) => element("span", kind ? `tk-${kind}` : ""));
    target.replaceChildren(...spans);
    if (reduceMotion.matches) { tokens.forEach(([, text], i) => { spans[i].textContent = text; }); return; }
    let token = 0, char = 0;
    const step = () => {
      if (token >= tokens.length) { setTimeout(() => { spans.forEach((s) => { s.textContent = ""; }); token = 0; char = 0; step(); }, 7000); return; }
      char++;
      spans[token].textContent = tokens[token][1].slice(0, char);
      if (char >= tokens[token][1].length) { token++; char = 0; }
      setTimeout(step, 26 + Math.random() * 40);
    };
    step();
  }

  // Terminal flotante: comandos que se escriben y su respuesta.
  function runTerminal() {
    const target = showroom?.querySelector("[data-terminal]");
    if (!target) return;
    const lines = [
      "$ git add .", "$ git commit -m \"ship it\"", "$ git push origin main", "\u2192 deployed to github pages",
      "$ npm run build", "\u2192 0 errors \u00b7 0 warnings", "$ brew install coffee", "\u2192 already installed"
    ];
    if (reduceMotion.matches) { target.textContent = lines[2]; return; }
    let line = 0, char = 0;
    const step = () => {
      const text = lines[line];
      char++;
      target.textContent = text.slice(0, char);
      if (char < text.length) { setTimeout(step, text.startsWith("$") ? 55 : 18); return; }
      setTimeout(() => { line = (line + 1) % lines.length; char = 0; step(); }, 1400);
    };
    step();
  }

  function startShowroomSection() {
    if (!showroom) return;
    const list = showroomProjects();
    typeCode();
    runTerminal();
    const stop = window.startShowroom?.({
      canvas: showroom.querySelector(".showroom-canvas"),
      projects: list.map((p) => ({ image: p.image, url: p.demo || p.repo, title: p.title })),
      reducedMotion: reduceMotion.matches
    });
    if (stop) { window.addEventListener("pagehide", () => stop(), { once: true }); return; }
    // Sin WebGL: la captura del primer proyecto, quieta, delante del nombre.
    const image = element("img", "showroom-fallback");
    image.src = list[0]?.image ?? "";
    image.alt = "";
    showroom.querySelector(".showroom-canvas").replaceWith(image);
  }

  // Scroll suave (Lenis): una inercia ligera. No en paginas con iframe (el CV), donde
  // Lenis bloquea el iframe, ni con movimiento reducido.
  if (window.Lenis && !reduceMotion.matches && !document.querySelector("iframe")) {
    lenis = new window.Lenis({ autoRaf: true, anchors: true, lerp: 0.11 });
  }

  // Arranque: primero se aplica el idioma (dibuja tarjetas y efectos), luego lo demas.
  applyLanguage();
  startClock();
  finishPreload().then(() => {
    startTitleWater();
    startShowroomSection();
    runIntro();
  });
})();
