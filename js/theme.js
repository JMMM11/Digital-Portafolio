/*
 * INICIO (se carga en el <head>, antes del CSS, para evitar parpadeos).
 * - Marca <html> con "js" (hay JavaScript) e "intro-pending" (hay animacion de entrada).
 */
(() => {
  "use strict";
  const root = document.documentElement;
  root.classList.add("js");

  // IDIOMA: el que eligio el visitante; si es su primera visita, el de su navegador.
  // En espanol la pagina se oculta un instante hasta que site.js traduce los textos.
  let lang = (navigator.language || "").toLowerCase().startsWith("es") ? "es" : "en";
  try {
    const saved = localStorage.getItem("jair-portfolio-lang");
    if (saved === "es" || saved === "en") lang = saved;
  } catch { /* Sin almacenamiento se usa el idioma del navegador. */ }
  root.lang = lang;
  if (lang === "es") {
    root.classList.add("i18n-pending");
    setTimeout(() => root.classList.remove("i18n-pending"), 2500);
  }

  // Los elementos con data-intro empiezan ocultos solo si se van a animar.
  // Si site.js o Motion no cargan, este temporizador los muestra igualmente.
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("intro-pending");
    setTimeout(() => root.classList.remove("intro-pending"), 2500);
  }
})();
