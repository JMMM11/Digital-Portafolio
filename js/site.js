/*
 * COMPORTAMIENTO COMPARTIDO POR TODAS LAS PAGINAS.
 * El contenido vive en los .html y en js/projects-data.js; aqui solo hay interaccion:
 *   1. Tema claro / oscuro
 *   2. Navegacion: pestana que se desliza, menu movil
 *   3. Tarjetas de proyectos y filtros
 *   4. Formulario de contacto
 *   5. Animaciones con Motion (js/vendor/motion.js, global "Motion")
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

  /* ---------- 1. Tema ---------- */
  const themeToggle = document.querySelector(".theme-toggle");
  function applyTheme(theme, persist = false) {
    const selected = theme === "dark" ? "dark" : "light";
    root.dataset.theme = selected;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = selected === "dark" ? "#0c1912" : "#f3f6f1";
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(selected === "dark"));
      themeToggle.hidden = false;
    }
    if (persist) {
      try { localStorage.setItem("jair-portfolio-theme", selected); } catch { /* Sigue funcionando sin guardar. */ }
    }
    // js/brain.js escucha este evento para volver a pintar con los colores del tema.
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: selected } }));
  }
  applyTheme(root.dataset.theme);
  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark", true);
  });

  /* ---------- 2. Navegacion ---------- */
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav");
  const navList = document.querySelector(".nav-list");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const menuToggle = document.querySelector(".menu-toggle");
  const desktopNav = matchMedia("(min-width: 861px)");
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
    menuToggle.querySelector(".menu-toggle-label").textContent = open ? "Close" : "Menu";
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

  // Linea bajo la cabecera cuando la pagina ya se desplazo.
  const markScrolled = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", markScrolled, { passive: true });
  markScrolled();

  /* ---------- 3. Proyectos ---------- */
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
  function projectCard(project) {
    const card = element("article", "project-card");
    card.dataset.category = project.category;

    // Portada: captura real o, si no hay, el titulo sobre el color de marca.
    const cover = element("div", "project-cover");
    if (project.image) {
      const image = element("img");
      image.src = project.image;
      image.alt = project.alt;
      image.width = 1280;
      image.height = 800;
      image.loading = "lazy";
      image.decoding = "async";
      cover.append(image);
    } else {
      cover.classList.add("is-typographic");
      cover.append(element("span", "project-cover-title", project.title));
    }

    const body = element("div", "project-body");
    body.append(element("p", "project-kind", project.kind));
    body.append(element("h3", "project-title", project.title));
    body.append(element("p", "project-summary", project.summary));

    const facts = element("dl", "project-facts");
    if (project.role) {
      facts.append(element("dt", "", "My role"), element("dd", "", project.role));
    }
    facts.append(element("dt", "", "Built with"), element("dd", "", project.stack.join(", ")));
    body.append(facts);

    const links = element("div", "project-links");
    if (project.demo) links.append(externalLink("Live demo", project.demo, "link-strong"));
    if (project.repo) links.append(externalLink("Source code", project.repo, "link-strong"));
    body.append(links);
    if (project.note) body.append(element("p", "project-note", project.note));

    card.append(cover, body);
    return card;
  }
  document.querySelectorAll("[data-projects]").forEach((container) => {
    const list = (window.PROJECTS ?? []).filter((project) =>
      container.dataset.projects === "featured" ? project.featured : true);
    container.replaceChildren(...list.map(projectCard));
  });

  // Filtros de projects.html.
  const filters = [...document.querySelectorAll("[data-filter]")];
  const filterStatus = document.querySelector("[data-filter-status]");
  if (filters.length) {
    const cards = [...document.querySelectorAll("[data-projects='all'] .project-card")];
    filters.forEach((button) => {
      const total = button.dataset.filter === "all" ? cards.length
        : cards.filter((card) => card.dataset.category === button.dataset.filter).length;
      button.querySelector(".filter-count").textContent = String(total);
      button.addEventListener("click", () => {
        if (button.getAttribute("aria-pressed") === "true") return;
        filters.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        const shown = cards.filter((card) => {
          const match = button.dataset.filter === "all" || card.dataset.category === button.dataset.filter;
          card.hidden = !match;
          return match;
        });
        if (filterStatus) filterStatus.textContent = `${shown.length} ${shown.length === 1 ? "project" : "projects"} shown`;
        if (canAnimate()) {
          M.animate(shown, { opacity: [0, 1], y: [14, 0] }, { delay: M.stagger(0.05), duration: 0.4, ease: EASE_OUT });
        }
      });
    });
  }

  /* ---------- 4. Contacto ---------- */
  // El sitio es estatico: el formulario prepara un correo en la app del visitante.
  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    const status = contactForm.querySelector("[data-form-status]");
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;
      const data = new FormData(contactForm);
      const subject = `${data.get("topic")}: message from ${data.get("name")}`;
      const body = `${data.get("message")}\n\n${data.get("name")}\n${data.get("email")}`;
      location.href = `mailto:${contactForm.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.hidden = false;
      if (canAnimate()) M.animate(status, { opacity: [0, 1], y: [8, 0] }, { duration: 0.35, ease: EASE_OUT });
    });
  }

  /* ---------- 5. Animaciones de pagina ---------- */
  // Entrada: una sola secuencia por pagina, sobre los elementos con data-intro.
  const introItems = [...document.querySelectorAll("[data-intro]")];
  if (canAnimate() && introItems.length) {
    M.animate(introItems, { opacity: [0, 1], y: [22, 0] },
      { delay: M.stagger(0.08), duration: 0.7, ease: EASE_OUT })
      .then(() => root.classList.remove("intro-pending"));
  } else {
    root.classList.remove("intro-pending");
  }

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
})();
