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
  if (meta) meta.content = theme === "dark" ? "#0c1912" : "#f3f6f1";

  // Los elementos con data-intro empiezan ocultos solo si se van a animar.
  // Si site.js o Motion no cargan, este temporizador los muestra igualmente.
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("intro-pending");
    setTimeout(() => root.classList.remove("intro-pending"), 2500);
  }
})();
