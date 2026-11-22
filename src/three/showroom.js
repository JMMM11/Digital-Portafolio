/*
 * VITRINA DE PROYECTOS (projects.html). Fuente; se empaqueta en js/showroom.js con `npm run build:showroom`.
 *
 * Un monitor de escritorio en 3D (estilo iMac verde salvia) pasa los proyectos uno tras otro:
 * cada captura va dentro de una ventana de navegador con su direccion, y el cambio entre
 * proyectos es un glitch de pantalla (corte de lineas y desfase de color), un guino a la programacion.
 * Una laptop pequena orbita alrededor del monitor con codigo en su pantalla.
 * El monitor mira un poco hacia el puntero y se inclina al bajar.
 *
 * window.startShowroom({ canvas, projects, reducedMotion, onChange })
 *   projects: [{ image, url, title }], onChange(i) cuando aparece un proyecto.
 * Devuelve stop() o null si WebGL no esta disponible.
 */
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, ShaderMaterial,
  MeshPhysicalMaterial, MeshStandardMaterial, MeshBasicMaterial, CanvasTexture, SRGBColorSpace, PMREMGenerator,
  DirectionalLight, HemisphereLight, ACESFilmicToneMapping, MathUtils
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const { clamp, lerp } = MathUtils;
const SCREEN_W = 6.62, SCREEN_H = 3.8;  // area visible de la pantalla
const TEX_W = 1280, TEX_H = Math.round(1280 * SCREEN_H / SCREEN_W);
const HOLD = 3.6, SWITCH = 0.9;         // segundos por proyecto y duracion del glitch

// Pantalla: dos ventanas (actual y siguiente) y un glitch que las cambia.
const SCREEN_VERT = `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SCREEN_FRAG = `
  uniform sampler2D uA;
  uniform sampler2D uB;
  uniform float uMix;    // 0 = A, 1 = B
  uniform float uGlitch; // fuerza del glitch (0-1)
  uniform float uTime;
  uniform float uZoom;   // acercamiento lento mientras se muestra
  varying vec2 vUv;
  float hash(float n) { return fract(sin(n) * 43758.5453); }
  vec3 pick(vec2 uv) {
    vec2 z = (uv - 0.5) / uZoom + 0.5;
    vec3 a = texture2D(uA, z).rgb;
    vec3 b = texture2D(uB, uv).rgb;
    // La nueva ventana entra de arriba hacia abajo, como una pagina que carga.
    float m = smoothstep(uMix * 1.25 - 0.25, uMix * 1.25, 1.0 - uv.y);
    return mix(a, b, m);
  }
  void main() {
    vec2 uv = vUv;
    float g = uGlitch;
    float slice = floor(uv.y * 28.0 + floor(uTime * 24.0) * 7.0);
    uv.x += (hash(slice) - 0.5) * 0.09 * g * step(0.55, hash(slice + 3.1));
    vec3 col;
    col.r = pick(uv + vec2(0.012 * g, 0.0)).r;
    col.g = pick(uv).g;
    col.b = pick(uv - vec2(0.012 * g, 0.0)).b;
    col *= 0.965 + 0.035 * sin(vUv.y * 900.0);               // lineas de barrido muy suaves
    col += g * 0.06 * step(0.92, hash(slice + floor(uTime * 40.0)));
    vec2 v = vUv - 0.5;
    col *= 1.0 - dot(v, v) * 0.35;                            // vineta de pantalla
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`;

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Ventana de navegador dibujada a mano: barra con botones, direccion con candado y la captura.
function browserWindow(image, url) {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const g = c.getContext("2d");
  const bar = 54;
  g.fillStyle = "#ece7da";
  g.fillRect(0, 0, TEX_W, bar);
  ["#e96b5f", "#e9b94f", "#62b867"].forEach((color, i) => {
    g.fillStyle = color;
    g.beginPath();
    g.arc(30 + i * 26, bar / 2, 8, 0, Math.PI * 2);
    g.fill();
  });
  g.fillStyle = "#faf8f2";
  g.beginPath();
  g.roundRect(140, 11, TEX_W - 280, bar - 22, 16);
  g.fill();
  g.fillStyle = "#2e5e43";
  g.font = "500 19px ui-monospace, Consolas, monospace";
  g.textBaseline = "middle";
  // Solo dominio y primera carpeta: jmmm11.github.io/FLUYA
  const short = url.replace(/^https?:\/\//, "").split("/").filter(Boolean).slice(0, 2).join("/");
  g.fillText(`https://${short}`, 162, bar / 2 + 1);
  if (image) {
    // La captura cubre el resto de la ventana (recorte centrado arriba).
    const h = TEX_H - bar;
    const scale = Math.max(TEX_W / image.width, h / image.height);
    g.drawImage(image, (TEX_W - image.width * scale) / 2, bar, image.width * scale, image.height * scale);
  } else {
    g.fillStyle = "#d3e0cf";
    g.fillRect(0, bar, TEX_W, TEX_H - bar);
  }
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

// Pantalla de la laptop: lineas de codigo de colores, como un editor visto de lejos.
function codeTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 320;
  const g = c.getContext("2d");
  g.fillStyle = "#17261c";
  g.fillRect(0, 0, 512, 320);
  const palette = ["#9dbaa4", "#e4c98f", "#f1ecdf", "#7fb3d5", "#d98c7a"];
  let seed = 3;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let line = 0; line < 14; line++) {
    let x = 22 + Math.floor(rnd() * 3) * 22;
    g.fillStyle = "rgba(241,236,223,0.25)";
    g.fillRect(6, 18 + line * 21, 8, 8);
    const tokens = 1 + Math.floor(rnd() * 4);
    for (let t = 0; t < tokens; t++) {
      const w = 20 + rnd() * 90;
      g.fillStyle = palette[Math.floor(rnd() * palette.length)];
      g.fillRect(x, 16 + line * 21, w, 10);
      x += w + 10;
    }
  }
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

// Logo de la barbilla: "</>" en verde profundo, como la manzana de un iMac.
function logoTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d");
  g.fillStyle = "#3e6a4d";
  g.font = "700 92px ui-monospace, Consolas, monospace";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("</>", 128, 68);
  const texture = new CanvasTexture(c);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

// Sombra suave en el suelo (degradado radial).
function shadowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(23,38,28,0.45)");
  grad.addColorStop(1, "rgba(23,38,28,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  return new CanvasTexture(c);
}

function startShowroom({ canvas, projects, reducedMotion = false, onChange }) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = envMap;
  scene.add(new HemisphereLight(0xfffbf0, 0x9dbaa4, 0.6));
  const key = new DirectionalLight(0xfff4e6, 1.7);
  key.position.set(-5, 7, 9);
  const fill = new DirectionalLight(0xe6f0ff, 0.45);
  fill.position.set(6, 1, 6);
  const rim = new DirectionalLight(0xffffff, 1.4);
  rim.position.set(2, 5, -8);
  scene.add(key, fill, rim);

  const camera = new PerspectiveCamera(20, 1, 0.1, 200);
  camera.position.set(0, 0.6, 33);

  // En pantallas chicas el material "fisico" (con barniz) se cambia por el estandar: se ve casi
  // igual a ese tamano y su shader compila mucho mas rapido, asi el telefono no se traba al arrancar.
  const lite = window.innerWidth < 760;
  const physical = (params) => {
    if (!lite) return new MeshPhysicalMaterial(params);
    const { clearcoat, clearcoatRoughness, ...standard } = params;
    return new MeshStandardMaterial(standard);
  };
  const owned = [];
  const own = (x) => { owned.push(x); return x; };

  /* ---------- Monitor ---------- */
  const monitor = new Group();
  scene.add(monitor);
  const sage = own(physical({ color: "#a9c3ae", metalness: 0.35, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.2 }));
  const sageDeep = own(physical({ color: "#7fa48a", metalness: 0.45, roughness: 0.3, clearcoat: 0.4 }));
  const bezel = own(physical({ color: "#f6f4ee", metalness: 0, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.05 }));

  const shell = new Mesh(own(new RoundedBoxGeometry(7.1, 4.95, 0.26, 10, 0.16)), sage);
  shell.position.set(0, 0, -0.08);
  const front = new Mesh(own(new RoundedBoxGeometry(6.98, 4.1, 0.05, 8, 0.12)), bezel);
  front.position.set(0, 0.36, 0.07);
  const chin = new Mesh(own(new RoundedBoxGeometry(6.98, 0.86, 0.05, 8, 0.12)), sageDeep);
  chin.position.set(0, -2.02, 0.065);
  monitor.add(shell, front, chin);
  const logo = new Mesh(own(new PlaneGeometry(0.62, 0.31)), own(new MeshBasicMaterial({ map: own(logoTexture()), transparent: true, toneMapped: false })));
  logo.position.set(0, -2.02, 0.095);
  monitor.add(logo);

  // Pantalla con su material de glitch y un vidrio delante que refleja el estudio.
  const textures = projects.map(() => null);
  const blank = own(browserWindow(null, "loading..."));
  const screenMaterial = own(new ShaderMaterial({
    uniforms: {
      uA: { value: blank }, uB: { value: blank }, uMix: { value: 0 },
      uGlitch: { value: 0 }, uTime: { value: 0 }, uZoom: { value: 1 }
    },
    vertexShader: SCREEN_VERT, fragmentShader: SCREEN_FRAG, toneMapped: false
  }));
  const screen = new Mesh(own(new PlaneGeometry(SCREEN_W, SCREEN_H)), screenMaterial);
  screen.position.set(0, 0.36, 0.1);
  const glass = new Mesh(screen.geometry, own(physical({
    color: "#ffffff", metalness: 0, roughness: 0.02, transparent: true, opacity: 0.1, envMapIntensity: 3,
    clearcoat: 1, clearcoatRoughness: 0, depthWrite: false
  })));
  glass.position.set(0, 0.36, 0.105);
  monitor.add(screen, glass);

  // Pie: placa inclinada detras y base plana.
  const stand = new Mesh(own(new RoundedBoxGeometry(1.9, 3.0, 0.1, 3, 0.04)), sage);
  stand.position.set(0, -2.95, -0.55);
  stand.rotation.x = 0.28;
  const base = new Mesh(own(new RoundedBoxGeometry(2.5, 0.08, 1.9, 3, 0.04)), sage);
  base.position.set(0, -4.38, -0.35);
  monitor.add(stand, base);
  const shadow = new Mesh(own(new PlaneGeometry(11, 5)), own(new MeshBasicMaterial({ map: own(shadowTexture()), transparent: true, depthWrite: false })));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -4.43, -0.3);
  monitor.add(shadow);
  monitor.position.y = 0.6;

  /* ---------- Laptop que orbita ---------- */
  const laptop = new Group();
  const metal = own(physical({ color: "#d9d6cc", metalness: 0.7, roughness: 0.28 }));
  const lapBase = new Mesh(own(new RoundedBoxGeometry(1.7, 0.08, 1.15, 3, 0.03)), metal);
  const hinge = new Group();
  hinge.position.set(0, 0.04, -0.55);
  hinge.rotation.x = -0.32; // tapa abierta un poco mas de 90 grados
  const lid = new Mesh(own(new RoundedBoxGeometry(1.7, 1.1, 0.05, 3, 0.03)), metal);
  lid.position.set(0, 0.55, 0);
  const lapScreen = new Mesh(own(new PlaneGeometry(1.55, 0.97)), own(new MeshBasicMaterial({ map: own(codeTexture()), toneMapped: false })));
  lapScreen.position.set(0, 0.55, 0.03);
  hinge.add(lid, lapScreen);
  laptop.add(lapBase, hinge);
  laptop.scale.setScalar(1.05);
  scene.add(laptop);

  /* ---------- Proyectos ---------- */
  // Las pantallas se preparan a medida que hacen falta (la actual y la siguiente), no las diez
  // de golpe: asi el arranque no traba el telefono.
  const loading = [];
  function ensure(i) {
    if (textures[i] || loading[i]) return;
    loading[i] = true;
    loadImage(projects[i].image).then((image) => {
      textures[i] = own(browserWindow(image, projects[i].url));
      if (i === 0) {
        screenMaterial.uniforms.uA.value = textures[0];
        screenMaterial.uniforms.uB.value = textures[0];
      }
    });
  }
  ensure(0);
  ensure(1 % projects.length);
  let current = 0, phaseStart = performance.now() / 1000, switching = false;
  onChange?.(0);

  /* ---------- Entrada del usuario ---------- */
  const pointer = { x: 0, y: 0 }, look = { x: 0, y: 0 };
  const onPointer = (event) => {
    pointer.x = event.clientX / innerWidth - 0.5;
    pointer.y = event.clientY / innerHeight - 0.5;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  let portrait = false, shortLandscape = false;
  function resize() {
    const box = canvas.getBoundingClientRect();
    const w = Math.max(1, box.width), h = Math.max(1, box.height);
    // Escritorio: un poco de supermuestreo. Telefono: menos pixeles para que vaya fluido y no gaste bateria.
    renderer.setPixelRatio(w < 760 ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min((window.devicePixelRatio || 1) * 1.25, 2.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // En pantallas estrechas la camara se aleja para que el monitor quepa entero.
    // En vertical la camara se aleja segun la proporcion: telefono (0.46) y tablet (0.7) dejan sitio al nombre.
    const ratio = Math.max(0.42, w / h);
    camera.position.z = ratio < 1 ? 33 / ratio * (0.78 + (ratio - 0.46) * 0.7) : 33;
    // En vertical el monitor baja para dejar arriba el nombre, y la laptop orbita mas cerca.
    portrait = w / h < 1;
    // Telefono en horizontal (poca altura): la camara se aleja y el monitor baja bajo el nombre.
    shortLandscape = !portrait && h < 520;
    if (shortLandscape) camera.position.z = 48;
    camera.updateProjectionMatrix();
  }
  const resizer = new ResizeObserver(resize);
  resizer.observe(canvas);
  resize();

  let frame = 0, visible = true;
  const start = performance.now() / 1000;
  const watcher = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !frame) frame = requestAnimationFrame(tick);
  });
  watcher.observe(canvas);

  function tick(nowMs) {
    frame = 0;
    if (!visible) return;
    const now = nowMs / 1000, t = now - start;
    const u = screenMaterial.uniforms;
    u.uTime.value = t;

    // Ciclo de proyectos: se muestra, glitch, el siguiente.
    const shown = now - phaseStart;
    if (!switching && shown > HOLD && textures[(current + 1) % projects.length]) {
      switching = true;
      phaseStart = now;
      u.uB.value = textures[(current + 1) % projects.length];
    }
    if (switching) {
      const p = clamp((now - phaseStart) / SWITCH, 0, 1);
      u.uMix.value = reducedMotion ? (p > 0.5 ? 1 : 0) : p;
      u.uGlitch.value = reducedMotion ? 0 : Math.sin(p * Math.PI);
      if (p >= 1) {
        switching = false;
        current = (current + 1) % projects.length;
        ensure((current + 1) % projects.length);
        u.uA.value = u.uB.value;
        u.uMix.value = 0;
        u.uGlitch.value = 0;
        phaseStart = now;
        onChange?.(current);
      }
    } else if (textures[current]) {
      u.uA.value = textures[current];
    }
    u.uZoom.value = switching ? 1 : 1 + Math.min(shown, HOLD) * 0.012;

    // El monitor flota, mira un poco al puntero y se inclina al bajar la pagina.
    const scrolled = clamp(scrollY / innerHeight, 0, 1);
    const k = reducedMotion ? 1 : 0.06;
    look.x = lerp(look.x, pointer.x, k);
    look.y = lerp(look.y, pointer.y, k);
    const float = reducedMotion ? 0 : Math.sin(t * 0.9) * 0.08;
    monitor.rotation.set(-0.04 + look.y * 0.12 + scrolled * 0.25, -0.12 + look.x * 0.35, 0);
    monitor.position.y = (portrait ? -0.9 : shortLandscape ? -2.2 : 0.2) + float - scrolled * 1.2;

    // La laptop da vueltas alrededor del monitor, a veces delante y a veces detras.
    const orbit = reducedMotion ? 1.2 : t * 0.22;
    const radius = portrait ? 3.4 : 5.6;
    laptop.position.set(Math.cos(orbit) * radius, (portrait ? -3.6 : -2.6) + Math.sin(t * 1.3) * 0.15, Math.sin(orbit) * 2.8);
    laptop.rotation.set(0.12, -orbit + Math.PI / 2 + 0.6, Math.sin(t * 0.8) * 0.05);

    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  }
  frame = requestAnimationFrame(tick);

  return function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
    visible = false;
    window.removeEventListener("pointermove", onPointer);
    resizer.disconnect();
    watcher.disconnect();
    owned.forEach((x) => x?.dispose?.());
    envMap.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}

window.startShowroom = startShowroom;
