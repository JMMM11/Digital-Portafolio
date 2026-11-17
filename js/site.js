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
  function setMenu(open, returnFocus = false) {
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
      panel.append(points);
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
  const introItems = [...document.querySelectorAll("[data-intro]")];
  if (canAnimate() && introItems.length) {
    M.animate(introItems, { opacity: [0, 1], y: [22, 0] },
      { delay: M.stagger(0.08), duration: 0.7, ease: EASE_OUT })
      .then(() => root.classList.remove("intro-pending"));
  } else {
    root.classList.remove("intro-pending");
  }

  // Pluma de ave dibujada con codigo (SVG), color chocolate. La punta (la plumilla) queda en (9, 358).
  // Las barbas salen del raquis con un generador de numeros fijo: siempre sale la misma pluma.
  const QUILL = { w: 170, h: 362, tipX: 9, tipY: 358 };
  function quillSvg() {
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const P0 = [46, 238], P1 = [66, 118], P2 = [144, 8]; // Curva del raquis (el eje central).
    const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u * u * P0[k] + 2 * u * t * P1[k] + t * t * P2[k]); };
    const tangent = (t) => {
      const u = 1 - t;
      const d = [0, 1].map((k) => 2 * u * (P1[k] - P0[k]) + 2 * t * (P2[k] - P1[k]));
      const len = Math.hypot(d[0], d[1]);
      return [d[0] / len, d[1] / len];
    };
    const N = 52, upper = [], lower = [];
    let barbs = "";
    for (let i = 0; i <= N; i++) {
      const t = i / N, [x, y] = at(t), [tx, ty] = tangent(t), nx = ty, ny = -tx; // n: lado de arriba a la izquierda
      const shape = Math.sin(Math.PI * Math.pow(t, 0.7));
      const wa = 2 + 41 * shape * (0.88 + rnd() * 0.24), wb = 2 + 33 * shape * (0.88 + rnd() * 0.24);
      upper.push([x + nx * wa, y + ny * wa]);
      lower.push([x - nx * wb, y - ny * wb]);
      if (i > 1 && i < N) {
        [[1, wa], [-1, wb]].forEach(([side, w]) => {
          // Cada barba sale inclinada hacia la punta.
          const bx = x + (side * nx * 0.92 + tx * 0.62) * w, by = y + (side * ny * 0.92 + ty * 0.62) * w;
          const dark = rnd() > 0.45;
          barbs += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}" stroke="${dark ? "#26110a" : "#a2674a"}" stroke-opacity="${dark ? 0.38 : 0.26}" stroke-width="0.9"/>`;
        });
      }
    }
    const outline = [...upper, ...lower.reverse()].map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("") + "Z";
    const rachis = `M${P0[0]} ${P0[1]}Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
    return `<svg viewBox="0 0 ${QUILL.w} ${QUILL.h}" width="${QUILL.w}" height="${QUILL.h}" aria-hidden="true">
      <defs><linearGradient id="quill-vane" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="#3b1f14"/><stop offset="0.5" stop-color="#6b3b26"/><stop offset="1" stop-color="#4a2818"/>
      </linearGradient></defs>
      <path d="M10 352L${P0[0]} ${P0[1]}" stroke="#b48a74" stroke-width="5.5" stroke-linecap="round" fill="none"/>
      <path d="M18 322L25 298" stroke="#b5642b" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="${outline}" fill="url(#quill-vane)"/>
      ${barbs}
      <path d="${rachis}" stroke="#d2ac99" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <path d="M4 338L15 341L9 358Z" fill="#aab0b4"/><path d="M7.5 351L10.5 351.5L9 358Z" fill="#1c1210"/>
    </svg>`;
  }

  // Nombre del inicio: se escribe letra a letra. Cada letra se descubre de izquierda a derecha
  // (clip-path) y la punta de la pluma sigue el borde de la tinta, con un temblor de mano.
  // aria-label conserva el nombre completo para lectores de pantalla.
  async function splitName() {
    const name = document.querySelector(".hero-name");
    if (!name || !canAnimate()) return;
    name.setAttribute("aria-label", name.textContent.replace(/\s+/g, " ").trim());
    name.dataset.noI18n = "";
    const lines = [...name.children];
    lines.forEach((line) => {
      const words = line.textContent.trim().split(" ");
      line.setAttribute("aria-hidden", "true");
      line.replaceChildren(...words.flatMap((word, i) => {
        const wrapper = element("span", "word");
        [...word].forEach((char) => wrapper.append(element("span", "ch", char)));
        return i < words.length - 1 ? [wrapper, " "] : [wrapper];
      }));
    });
    const chars = [...name.querySelectorAll(".ch")];
    const HIDDEN = "inset(-25% 100% -25% -15%)";
    chars.forEach((char) => { char.style.clipPath = HIDDEN; });
    name.style.opacity = "1"; // Gana a .intro-pending: las letras ya estan escondidas.
    await (document.fonts?.ready ?? Promise.resolve()); // Las medidas dependen de la fuente final.

    const stage = name.parentElement; // .wrap: la pluma se posiciona dentro de el.
    const stageBox = stage.getBoundingClientRect();
    const fontSize = parseFloat(getComputedStyle(name).fontSize);
    const speed = fontSize * 3.4; // px de tinta por segundo.
    // Pluma 3D (js/quill3d.js, three.js) sobre un canvas que cubre el nombre y el aire de arriba.
    // Si WebGL o el archivo no estan, se usa la pluma SVG dibujada arriba.
    const nameBox = name.getBoundingClientRect();
    const reach = fontSize * 2.1; // largo de la pluma en px
    const canvasLeft = nameBox.left - stageBox.left - fontSize * 0.8;
    const canvasTop = nameBox.top - stageBox.top - reach * 1.3;
    const feather = window.QuillFeather?.create({
      length: reach,
      width: Math.round(nameBox.width + fontSize * 3.2),
      height: Math.round(nameBox.height + reach * 1.3 + fontSize * 0.4)
    }) ?? null;
    let quill, ax = 0, ay = 0;
    if (feather) {
      quill = feather.canvas;
      quill.classList.add("quill", "quill-3d");
      quill.setAttribute("aria-hidden", "true");
      quill.style.left = `${canvasLeft}px`;
      quill.style.top = `${canvasTop}px`;
    } else {
      const k = (fontSize * 2.0) / QUILL.h; // La pluma crece con el nombre.
      quill = element("span", "quill");
      quill.innerHTML = quillSvg(); // SVG propio, sin datos externos.
      const svg = quill.firstElementChild;
      svg.setAttribute("width", String(QUILL.w * k));
      svg.setAttribute("height", String(QUILL.h * k));
      ax = QUILL.tipX * k;
      ay = QUILL.tipY * k;
      quill.style.transformOrigin = `${ax}px ${ay}px`;
    }
    stage.append(quill);

    // Tiempos: cada letra dura segun su ancho; hay pausa entre palabras y un viaje entre lineas.
    let clock = 0.25, prevWord = null, prevLine = -1;
    const marks = chars.map((char) => {
      const box = char.getBoundingClientRect();
      const word = char.parentElement, line = lines.indexOf(word.parentElement);
      if (prevLine !== -1 && line !== prevLine) clock += 0.55;
      else if (prevWord && word !== prevWord) clock += 0.14;
      const mark = {
        char, x: box.left - stageBox.left, w: box.width, base: box.top - stageBox.top + box.height * 0.8,
        start: clock, end: clock + Math.max(0.05, box.width / speed), line
      };
      clock = mark.end; prevWord = word; prevLine = line;
      return mark;
    });
    const first = marks[0], last = marks[marks.length - 1];
    const t0 = performance.now();
    let fading = false;
    const place = (x, y, lift, now) => {
      const rot = -4 + Math.sin(now * 11) * 2.2 - lift * 0.12;
      if (feather) {
        feather.setPose(x - canvasLeft, y - lift - canvasTop, rot, now);
        feather.render();
      } else {
        quill.style.transform = `translate(${x - ax}px, ${y - lift - ay}px) rotate(${rot}deg)`;
      }
    };
    function frame() {
      const now = (performance.now() - t0) / 1000;
      let current = -1;
      if (!fading) quill.style.opacity = String(Math.min(1, now / 0.2));
      marks.forEach((mark, i) => {
        if (mark.start <= now) current = i;
        if (mark.done) return;
        const p = Math.min(1, Math.max(0, (now - mark.start) / (mark.end - mark.start)));
        if (p >= 1) { mark.char.style.clipPath = "none"; mark.done = true; }
        else if (p > 0) mark.char.style.clipPath = `inset(-25% ${((1 - p) * 100).toFixed(1)}% -25% -15%)`;
      });
      if (current === -1) {
        place(first.x, first.base, 24 * (1 - Math.min(1, now / 0.25)), now); // Baja hasta la primera letra.
      } else {
        const m = marks[current], next = marks[current + 1];
        if (now <= m.end) {
          const p = (now - m.start) / (m.end - m.start);
          place(m.x + p * m.w, m.base + Math.sin(now * 38) * fontSize * 0.012, 0, now);
        } else if (next) {
          // Entre palabras o lineas la pluma se levanta y se desplaza.
          const s = (now - m.end) / (next.start - m.end);
          const ease = s * s * (3 - 2 * s);
          const x = m.x + m.w + (next.x - (m.x + m.w)) * ease;
          const y = m.base + (next.base - m.base) * ease;
          place(x, y, Math.sin(Math.PI * s) * (next.line !== m.line ? fontSize * 0.35 : fontSize * 0.14), now);
        } else {
          place(last.x + last.w, last.base, 0, now);
        }
      }
      if (now > last.end && !fading) {
        fading = true;
        name.style.opacity = "";
        M.animate(quill, { opacity: [1, 0] }, { delay: 0.5, duration: 0.7, ease: "easeIn" }).then(() => { feather?.dispose(); quill.remove(); });
      }
      if (!fading || quill.isConnected) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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
  //   --hp  cuanto se ha ido el bloque .hero o .page-head (0 a 1): el titulo se achica y se separa.
  //   --p   en el inicio, cuanto cubre la tarjeta siguiente a la anterior: la anterior se achica.
  let scrollTicking = false;
  function syncScroll() {
    scrollTicking = false;
    if (!canAnimate()) return;
    document.querySelectorAll(".hero, .page-head").forEach((block) => {
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

  // Arranque: primero se aplica el idioma (dibuja tarjetas y efectos), luego lo demas.
  applyLanguage();
  splitName();
})();
