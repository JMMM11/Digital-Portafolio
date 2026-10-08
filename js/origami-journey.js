/* SVG nativo + Web Animations API. Sin librerías ni bucle requestAnimationFrame. */
(() => {
  "use strict";
  document.querySelectorAll("[data-origami-journey]").forEach((figure) => {
    if (!Element.prototype.animate) return; // Sin JS/WAAPI: todos los logos visibles.
    const button = figure.querySelector(".oj-toggle");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const duration = Math.max(6000, Number(figure.dataset.duration) || 12000);
    const animations = [];
    let paused = false;
    let visible = !("IntersectionObserver" in window);

    function animate(element, frames, easing = "ease-in-out") {
      const animation = element.animate(frames, { duration, iterations: Infinity, easing: "linear" });
      // Easing por tramo: las pausas y todos los elementos comparten el mismo reloj.
      animation.effect.setKeyframes(frames.map((frame) => ({ ...frame, easing })));
      animation.pause();
      animation.currentTime = 0;
      animations.push(animation);
    }

    // Flotación, impulso después de recibir las señales y vuelta al origen.
    animate(figure.querySelector(".oj-float"), [
      { transform: "translateY(0px)", offset: 0 },
      { transform: "translateY(-4px)", offset: .18 },
      { transform: "translateY(0px)", offset: .36 },
      { transform: "translateY(-3px)", offset: .54 },
      { transform: "translateY(-2px)", offset: .70 },
      { transform: "translateY(-13px)", offset: .82 },
      { transform: "translateY(0px)", offset: 1 }
    ]);
    // Cada ala tiene coordenadas locales alineadas con su bisagra.
    // scaleY cambia SOLO su proyección; los dos extremos del pliegue quedan fijos.
    figure.querySelectorAll(".oj-wing").forEach((wing, index) => {
      const fold = index === 0 ? .965 : .955;
      animate(wing, [
        { transform: "scaleY(1)", offset: 0 },
        { transform: "scaleY(" + fold + ")", offset: .18 },
        { transform: "scaleY(1)", offset: .36 },
        { transform: "scaleY(" + fold + ")", offset: .54 },
        { transform: "scaleY(1)", offset: .70 },
        { transform: "scaleY(" + (fold - .015) + ")", offset: .79 },
        { transform: "scaleY(1)", offset: .90 },
        { transform: "scaleY(1)", offset: 1 }
      ]);
    });

    const logos = figure.querySelectorAll("[data-oj-logo]");
    // Reparte cualquier cantidad de logos dentro del mismo ciclo de 12 s.
    // El último termina su señal antes del impulso; ningún offset puede superar 1.
    logos.forEach((logo, index) => {
      const slot = index / Math.max(1, logos.length - 1);
      const enter = .035 + slot * .30;
      const send = .14 + slot * .46;
      animate(logo, [
        { opacity: 0, transform: "translateY(4px)", offset: 0 },
        { opacity: 0, transform: "translateY(4px)", offset: enter },
        { opacity: 1, transform: "translateY(0px)", offset: enter + .065 },
        { opacity: 1, transform: "translateY(0px)", offset: .88 },
        { opacity: 0, transform: "translateY(4px)", offset: .985 },
        { opacity: 0, transform: "translateY(4px)", offset: 1 }
      ]);
      const link = figure.querySelector('[data-oj-link="' + logo.dataset.ojLogo + '"]');
      const packet = figure.querySelector('[data-oj-packet="' + logo.dataset.ojLogo + '"]');
      animate(link, [
        { opacity: 0, offset: 0 },
        { opacity: 0, offset: send },
        { opacity: 1, offset: send + .02 },
        { opacity: 1, offset: send + .09 },
        { opacity: 0, offset: send + .12 },
        { opacity: 0, offset: 1 }
      ]);
      // Las coordenadas se leen del path editable del HTML, sin duplicarlas en JS.
      const start = link.getPointAtLength(0);
      const end = link.getPointAtLength(link.getTotalLength());
      const at = (point) => "translate(" + point.x + "px," + point.y + "px)";
      animate(packet, [
        { opacity: 0, transform: at(start), offset: 0 },
        { opacity: 0, transform: at(start), offset: send + .015 },
        { opacity: 1, transform: at(start), offset: send + .025 },
        { opacity: 1, transform: at(end), offset: send + .095 },
        { opacity: 0, transform: at(end), offset: send + .11 },
        { opacity: 0, transform: at(end), offset: 1 }
      ], "linear");
    });

    function sync() {
      const globalPause = document.body.classList.contains("motion-paused");
      const stopped = paused || globalPause || reduced.matches;
      animations.forEach((animation) => {
        if (reduced.matches) animation.cancel(); // Estilo base: composición completa y estática.
        else if (stopped || !visible || document.hidden) animation.pause();
        else animation.play();
      });
      button.hidden = false;
      button.disabled = reduced.matches || globalPause;
      button.setAttribute("aria-pressed", String(stopped));
      const label = reduced.matches ? button.dataset.reducedLabel
        : globalPause ? button.dataset.globalLabel
        : paused ? button.dataset.playLabel : button.dataset.pauseLabel;
      button.setAttribute("aria-label", label);
      button.title = label;
    }
    button.addEventListener("click", () => { paused = !paused; sync(); });
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(figure);
    }
    sync();
  });
})();
