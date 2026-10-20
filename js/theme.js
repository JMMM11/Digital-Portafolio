/*
 * TEMA (se carga en el <head>, antes del CSS, para evitar parpadeos).
 * - Restaura el tema guardado. La primera visita abre en modo claro.
 * - Marca <html> con "js" (hay JavaScript) e "intro-pending" (hay animacion de entrada).
 */
(() => {
  "use strict";
  const root = document.documentElement;
  // El almacenamiento puede no estar disponible (modo privado, file://).
  let theme = "light";
  try {
    if (localStorage.getItem("jair-portfolio-theme") === "dark") theme = "dark";
  } catch { /* El tema por defecto sigue funcionando. */ }
  root.dataset.theme = theme;
  root.classList.add("js");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#121210" : "#ffffeb";

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
