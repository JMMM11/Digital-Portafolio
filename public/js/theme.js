/*
 * INICIO (se carga en el <head>, antes del CSS, para evitar parpadeos).
 * - Marca <html> con "js" (hay JavaScript) e "intro-pending" (hay animacion de entrada).
 */
(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");

  // IDIOMA: el ingles es la base. Solo se usa espanol si el visitante lo eligio antes.
  // En espanol la pagina se oculta un instante hasta que site.js traduce los textos.
  let lang = "en";
  try {
    const saved = localStorage.getItem("jair-portfolio-lang");
    if (saved === "es" || saved === "en") lang = saved;
  } catch { /* Sin almacenamiento se usa el idioma del navegador. */ }
  root.lang = lang;
  if (lang === "es") {
    root.classList.add("i18n-pending");
    setTimeout(() => root.classList.remove("i18n-pending"), 2500);
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // PRECARGA: solo en la primera pagina de la visita (sessionStorage). Cortina con el nombre;
  // site.js la levanta cuando todo esta listo. Este temporizador la quita si algo falla.
  let firstView = true;
  try {
    firstView = !sessionStorage.getItem("jair-preloaded");
    sessionStorage.setItem("jair-preloaded", "1");
  } catch { /* Sin almacenamiento: se muestra igual, una sola vez por carga. */ }
  const preloading = firstView && !reduced;
  if (preloading) {
    root.classList.add("preloading");
    setTimeout(() => root.classList.remove("preloading"), 3200);
  }

  // Los elementos con data-intro empiezan ocultos solo si se van a animar.
  // Si site.js o Motion no cargan, este temporizador los muestra igualmente.
  if (!reduced) {
    root.classList.add("intro-pending");
    setTimeout(() => root.classList.remove("intro-pending"), preloading ? 4500 : 2500);
  }
})();
