/*
 * TITULOS EN AGUA. El titulo esta bajo una lamina de agua: al pasar el puntero la superficie
 * se ondula y las letras se refractan, con brillos donde la ola mira a la luz.
 * Un clic suelta una gota grande. Al cargar, el texto aparece de izquierda a derecha
 * salpicando gotas en el frente; despues, de vez en cuando, cae una gota sola.
 *
 * WebGL2. Simulacion real de ondas (ecuacion de onda en dos texturas que se alternan, a media
 * resolucion) y un segundo paso que dibuja el texto refractado. Necesita poder dibujar en texturas
 * de coma flotante (EXT_color_buffer_float); si no, el texto solo aparece, sin olas.
 *
 * Uso: window.startNameWater(canvas, { layout: window.waterTextLayout(h1), reducedMotion })
 * Devuelve stop() con stop.refresh() (vuelve a medir y a aparecer), o null si WebGL2 no esta.
 */
(() => {
  "use strict";

  const VERT = `#version 300 es
  void main() {
    vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
  }`;

  // Un paso de la ecuacion de onda. R = altura actual, G = altura anterior.
  const SIM = `#version 300 es
  precision highp float;
  uniform sampler2D uState;
  uniform vec2 uTexel;
  uniform vec4 uDrop; // x, y (px de la simulacion), radio (px), fuerza
  out vec4 outState;
  void main() {
    vec2 uv = gl_FragCoord.xy * uTexel;
    vec4 c = texture(uState, uv);
    float n = texture(uState, uv + vec2(uTexel.x, 0.0)).r + texture(uState, uv - vec2(uTexel.x, 0.0)).r
            + texture(uState, uv + vec2(0.0, uTexel.y)).r + texture(uState, uv - vec2(0.0, uTexel.y)).r;
    float next = (n * 0.5 - c.g) * 0.984;
    float d = distance(gl_FragCoord.xy, uDrop.xy);
    next += uDrop.w * (1.0 - smoothstep(0.0, uDrop.z, d));
    outState = vec4(next, c.r, 0.0, 1.0);
  }`;

  // Dibujo: texto refractado por la superficie, con brillos y sombras de las olas.
  const DRAW = `#version 300 es
  precision highp float;
  uniform sampler2D uState;
  uniform sampler2D uMask;
  uniform vec2 uRes;
  uniform vec2 uSimTexel;
  uniform float uReveal; // frente de aparicion, de 0 a 1.2 (izquierda a derecha)
  out vec4 outColor;
  const vec3 INK = vec3(0.110, 0.200, 0.149);    // #1c3326
  const vec3 GREEN = vec3(0.180, 0.369, 0.263);  // #2e5e43
  const vec3 FOAM = vec3(0.945, 0.957, 0.925);   // brillo del agua
  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float hl = texture(uState, uv - vec2(uSimTexel.x, 0.0)).r, hr = texture(uState, uv + vec2(uSimTexel.x, 0.0)).r;
    float hd = texture(uState, uv - vec2(0.0, uSimTexel.y)).r, hu = texture(uState, uv + vec2(0.0, uSimTexel.y)).r;
    vec2 grad = vec2(hr - hl, hu - hd);
    float text = texture(uMask, uv + grad * 0.05).r;
    text *= 1.0 - smoothstep(uReveal - 0.06, uReveal, uv.x);   // aparece de izquierda a derecha

    vec3 n = normalize(vec3(-grad * 5.0, 1.0));
    vec3 L = normalize(vec3(-0.45, 0.6, 0.65));
    float shade = dot(n, L) - L.z;                    // >0 mira a la luz, <0 de espaldas
    float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 60.0);

    vec3 ink = mix(INK, GREEN, clamp(0.35 + shade * 6.0, 0.0, 1.0));
    ink = mix(ink, FOAM, spec * 0.7);
    // Fuera de las letras: brillos y sombras muy suaves sobre el papel, que se apagan hacia los
    // bordes del lienzo para que no se note su rectangulo.
    vec2 e = min(uv, 1.0 - uv);
    float fade = smoothstep(0.0, 0.12, min(e.x * uRes.x / uRes.y, e.y));
    float waterA = clamp(abs(shade) * 0.7 + spec * 0.5, 0.0, 0.1) * fade;
    vec3 water = shade > 0.0 ? FOAM : vec3(0.36, 0.47, 0.40);
    vec3 col = mix(water, ink, text);
    float a = max(text, waterA);
    outColor = vec4(col, a);
  }`;

  function compile(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }
  function program(gl, fragment) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    return p;
  }

  // Palabras de un elemento del DOM tal como el navegador las coloco (con sus saltos de linea).
  // Se mide contra el propio elemento y se suma su lugar dentro del canvas (offsetLeft/offsetTop),
  // asi da igual si se esta animando.
  function waterTextLayout(element) {
    return (canvas) => {
      const ebox = element.getBoundingClientRect();
      const k = element.offsetWidth / (ebox.width || 1);
      const ox = element.offsetLeft - canvas.offsetLeft, oy = element.offsetTop - canvas.offsetTop;
      const style = getComputedStyle(element);
      const size = parseFloat(style.fontSize);
      const font = (s) => `${style.fontStyle} ${style.fontWeight} ${s}px ${style.fontFamily}`;
      const spacing = parseFloat(style.letterSpacing) || 0;
      const items = [];
      const range = document.createRange();
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        for (const match of node.textContent.matchAll(/\S+/g)) {
          range.setStart(node, match.index);
          range.setEnd(node, match.index + match[0].length);
          const r = range.getBoundingClientRect();
          items.push({ text: match[0], font, size, spacing,
            x: ox + (r.left - ebox.left) * k, y: oy + (r.top + r.height / 2 - ebox.top) * k });
        }
      }
      return items;
    };
  }

  function startNameWater(canvas, { layout, reducedMotion = false } = {}) {
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false, alpha: true });
    if (!gl) return null;
    let sim, draw;
    try {
      sim = program(gl, SIM);
      draw = program(gl, DRAW);
    } catch (error) {
      console.warn("[name-water]", error);
      return null;
    }
    const waves = Boolean(gl.getExtension("EXT_color_buffer_float")) && !reducedMotion;
    gl.bindVertexArray(gl.createVertexArray());
    const S = { state: gl.getUniformLocation(sim, "uState"), texel: gl.getUniformLocation(sim, "uTexel"), drop: gl.getUniformLocation(sim, "uDrop") };
    const D = {
      state: gl.getUniformLocation(draw, "uState"), mask: gl.getUniformLocation(draw, "uMask"),
      res: gl.getUniformLocation(draw, "uRes"), simTexel: gl.getUniformLocation(draw, "uSimTexel"), reveal: gl.getUniformLocation(draw, "uReveal")
    };

    const texture = (filter) => {
      const t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const maskTex = texture(gl.LINEAR);
    // Dos estados de la simulacion que se alternan (ping-pong).
    const states = [0, 1].map(() => ({ tex: texture(gl.LINEAR), fb: gl.createFramebuffer() }));
    let flip = 0, width = 1, height = 1, simW = 1, simH = 1, dpr = 1;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.round(canvas.clientWidth * dpr));
      height = Math.max(1, Math.round(canvas.clientHeight * dpr));
      canvas.width = width;
      canvas.height = height;
      // Mascara del texto (R), con la misma fuente y posicion que el h1.
      const mask = document.createElement("canvas");
      mask.width = width;
      mask.height = height;
      const g = mask.getContext("2d");
      g.fillStyle = "#000";
      g.fillRect(0, 0, width, height);
      g.fillStyle = "#f00";
      g.textBaseline = "middle";
      layout(canvas).forEach((word) => {
        g.font = word.font(word.size * dpr);
        if ("letterSpacing" in g) g.letterSpacing = `${word.spacing * dpr}px`;
        g.fillText(word.text, word.x * dpr, word.y * dpr);
      });
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mask);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      // Simulacion a media resolucion: mas rapida y las olas salen mas suaves.
      simW = Math.max(2, Math.round(width / 2));
      simH = Math.max(2, Math.round(height / 2));
      states.forEach(({ tex, fb }) => {
        gl.bindTexture(gl.TEXTURE_2D, tex);
        if (waves) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null);
        else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      });
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // Gotas pendientes en px de la simulacion (y hacia arriba).
    const drops = [];
    const toSim = (clientX, clientY) => {
      const box = canvas.getBoundingClientRect();
      return { x: ((clientX - box.left) / box.width) * simW, y: (1 - (clientY - box.top) / box.height) * simH };
    };
    let last = null;
    const onMove = (event) => {
      const p = toSim(event.clientX, event.clientY);
      const speed = last ? Math.hypot(p.x - last.x, p.y - last.y) : 0;
      last = p;
      if (speed > 0.5) drops.push({ ...p, r: 7, s: Math.min(0.2, 0.04 + speed * 0.02) });
    };
    const onDown = (event) => { const p = toSim(event.clientX, event.clientY); drops.push({ ...p, r: 18, s: 1.4 }); };
    const onLeave = () => { last = null; };
    // En el telefono: el dedo tambien deja ondas (el navegador cancela los pointermove al hacer scroll).
    const onTouch = (event) => { const t = event.touches[0]; if (t) onMove({ clientX: t.clientX, clientY: t.clientY }); };
    const onTouchStart = (event) => { const t = event.touches[0]; if (t) { last = null; const p = toSim(t.clientX, t.clientY); drops.push({ ...p, r: 14, s: 0.9 }); } };
    const host = canvas.parentElement;
    if (waves) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerdown", onDown);
      host.addEventListener("pointerleave", onLeave);
      host.addEventListener("touchmove", onTouch, { passive: true });
      host.addEventListener("touchstart", onTouchStart, { passive: true });
    }

    const resizer = new ResizeObserver(build);
    resizer.observe(canvas);
    let frame = 0, visible = true, start = performance.now(), nextRain = 0;
    const watcher = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) frame = requestAnimationFrame(tick);
    });
    watcher.observe(canvas);

    function step(drop) {
      const src = states[flip], dst = states[1 - flip];
      gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fb);
      gl.viewport(0, 0, simW, simH);
      gl.useProgram(sim);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, src.tex);
      gl.uniform1i(S.state, 0);
      gl.uniform2f(S.texel, 1 / simW, 1 / simH);
      gl.uniform4f(S.drop, drop?.x ?? -1e4, drop?.y ?? -1e4, drop?.r ?? 1, drop?.s ?? 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      flip = 1 - flip;
    }

    function tick(now) {
      frame = 0;
      if (!visible) return;
      const t = (now - start) / 1000;
      const reveal = reducedMotion ? 2 : Math.min(1.2, t / 1.3);
      if (waves) {
        // Al aparecer, gotas en el frente; despues, una gota sola de vez en cuando.
        if (t < 1.6 && Math.random() < 0.35) drops.push({ x: (reveal - 0.03) * simW, y: simH * (0.25 + Math.random() * 0.5), r: 6, s: 0.5 });
        if (t > 3 && now > nextRain) {
          drops.push({ x: Math.random() * simW, y: simH * (0.2 + Math.random() * 0.6), r: 9, s: 0.6 });
          nextRain = now + 1800 + Math.random() * 2600;
        }
        step(drops.shift());
        step(drops.shift());
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, width, height);
      gl.useProgram(draw);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, states[flip].tex);
      gl.uniform1i(D.state, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, maskTex);
      gl.uniform1i(D.mask, 1);
      gl.uniform2f(D.res, width, height);
      gl.uniform2f(D.simTexel, waves ? 1 / simW : 0, waves ? 1 / simH : 0);
      gl.uniform1f(D.reveal, reveal);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frame = requestAnimationFrame(tick);
    }
    build();
    frame = requestAnimationFrame(tick);

    function stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      visible = false;
      resizer.disconnect();
      watcher.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("touchmove", onTouch);
      host.removeEventListener("touchstart", onTouchStart);
      states.forEach(({ tex, fb }) => { gl.deleteTexture(tex); gl.deleteFramebuffer(fb); });
      gl.deleteTexture(maskTex);
      gl.deleteProgram(sim);
      gl.deleteProgram(draw);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
    // Vuelve a medir y a aparecer (por ejemplo, despues de traducir el titulo).
    stop.refresh = () => { build(); start = performance.now(); };
    return stop;
  }

  window.startNameWater = startNameWater;
  window.waterTextLayout = waterTextLayout;
})();
