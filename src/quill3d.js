/*
 * PLUMA 3D (three.js) que escribe el nombre del inicio.
 * Fuente: este archivo. Se empaqueta en js/quill3d.js con `npm run build:quill`
 * (esbuild deja solo las partes de three.js que se usan).
 *
 * Expone window.QuillFeather.create({ length, width, height }) y devuelve:
 *   canvas            el <canvas> transparente que se coloca sobre el nombre
 *   setPose(x, y, rot, t)  punta de la plumilla en px del canvas (y hacia abajo), giro en grados, tiempo en s
 *   render()          dibuja un cuadro (site.js lo llama en su propio requestAnimationFrame)
 *   dispose()         libera WebGL y quita el canvas
 * Si WebGL no esta disponible, create() devuelve null y site.js usa la pluma SVG.
 *
 * Piezas separadas, como una pluma fuente de lujo adaptada a pluma de ave:
 *   plumilla bicolor (acero y oro) con grosor, ranura, agujero, grabado y bola de iridio,
 *   alimentador de ebonita con aletas, seccion de laca chocolate con barniz y rotulo dorado,
 *   aros y collar de oro, canon translucido, raquis y el vexilo: cientos de barbas sueltas,
 *   cada una con su propio resorte. Materiales PBR con microrayones; luz de tres puntos,
 *   reflejos de estudio y una sombra suave sobre el papel que nace en la punta.
 */
import {
  WebGLRenderer, Scene, OrthographicCamera, Group, Mesh, BufferGeometry, BufferAttribute,
  MeshPhysicalMaterial, ShaderMaterial, HemisphereLight, DirectionalLight, Color, Vector3, Matrix4,
  DoubleSide, PMREMGenerator, MathUtils, SphereGeometry, CanvasTexture, SRGBColorSpace,
  RepeatWrapping, ACESFilmicToneMapping, LessDepth
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const { degToRad, clamp, smoothstep } = MathUtils;
const BRAND = "ATELIER J·M · PANAMÁ"; // marca ficticia grabada en la seccion

// Textura dibujada en un <canvas> 2D.
function canvasTexture(width, height, draw, isColor) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext("2d"), width, height);
  const texture = new CanvasTexture(canvas);
  if (isColor) texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function createQuill({ length, width, height }) {
  const L = length;
  let seed = 23;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  let renderer;
  try {
    renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping; // respuesta de pelicula, como una foto de producto
  renderer.toneMappingExposure = 1.12;
  const canvas = renderer.domElement;

  const scene = new Scene();
  // Camara ortografica en px: x a la derecha, y hacia arriba, origen abajo a la izquierda.
  const camera = new OrthographicCamera(0, width, height, 0, 1, 4000);
  camera.position.z = 2000;

  // Reflejos de estudio: un cuarto neutro de three.js convertido en mapa de entorno.
  const pmrem = new PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  pmrem.dispose();
  scene.environment = envMap;

  // Luz de tres puntos: principal calida, relleno frio y contraluz que dibuja el borde.
  scene.add(new HemisphereLight(0xfff3e6, 0x2a150c, 0.55));
  const key = new DirectionalLight(0xfff1e0, 2.4);
  key.position.set(-0.7, 1, 1);
  const fill = new DirectionalLight(0xd6e4ff, 0.55);
  fill.position.set(1, -0.25, 0.8);
  const rim = new DirectionalLight(0xffcf9a, 1.7);
  rim.position.set(0.6, 0.8, -1);
  scene.add(key, fill, rim);

  const owned = []; // texturas, geometrias y materiales a liberar
  const own = (item) => { owned.push(item); return item; };

  /* ---------- Texturas procedurales ---------- */
  // Microrayones: rugosidad base baja y rayas finas mas rugosas.
  const scratches = own(canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = "rgb(120,120,120)";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2400; i++) {
      const v = 100 + rnd() * 50;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(rnd() * w, rnd() * h, 1.5, 1.5);
    }
    g.lineCap = "round";
    for (let i = 0; i < 140; i++) {
      const x = rnd() * w, y = rnd() * h, a = rnd() * Math.PI, len = 20 + rnd() * 120;
      g.strokeStyle = `rgba(255,255,255,${0.15 + rnd() * 0.35})`;
      g.lineWidth = 0.4 + rnd() * 0.6;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + rnd() * 6, y + Math.sin(a) * len * 0.5, x + Math.cos(a) * len, y + Math.sin(a) * len);
      g.stroke();
    }
  }, false));
  scratches.wrapS = scratches.wrapT = RepeatWrapping;

  // Plumilla: u cruza el ancho, v va de la punta (abajo) a la base (arriba).
  // Acero con corazon de oro alrededor del agujero, volutas grabadas y marcas.
  const drawNib = (g, w, h, engraveOnly) => {
    const X = (u) => u * w, Y = (v) => (1 - v) * h;
    g.fillStyle = engraveOnly ? "#fff" : "#e9ecef";
    g.fillRect(0, 0, w, h);
    const heart = () => {
      g.beginPath();
      g.moveTo(X(0.5), Y(0.2));
      g.bezierCurveTo(X(0.98), Y(0.42), X(0.92), Y(0.78), X(0.5), Y(0.7));
      g.bezierCurveTo(X(0.08), Y(0.78), X(0.02), Y(0.42), X(0.5), Y(0.2));
    };
    if (!engraveOnly) {
      g.fillStyle = "#e4b863";
      heart();
      g.fill();
    }
    g.strokeStyle = engraveOnly ? "#000" : "#6b6258";
    g.lineWidth = 2.2;
    heart();
    g.stroke();
    g.lineWidth = 1.4;
    for (let k = 0; k < 7; k++) { // volutas a ambos lados
      [1, -1].forEach((side) => {
        g.beginPath();
        const v0 = 0.24 + k * 0.08, u0 = 0.5 + side * (0.36 - k * 0.012);
        g.arc(X(u0), Y(v0), w * 0.06, side > 0 ? Math.PI * 0.6 : -Math.PI * 0.4, side > 0 ? Math.PI * 1.9 : Math.PI * 0.9);
        g.stroke();
      });
    }
    g.fillStyle = engraveOnly ? "#000" : "#4d4740";
    g.textAlign = "center";
    g.font = `600 ${w * 0.15}px Georgia, serif`;
    g.fillText("J·M", X(0.5), Y(0.76));
    g.font = `600 ${w * 0.08}px Georgia, serif`;
    g.fillText("18K · 750", X(0.5), Y(0.85));
    g.fillText("PANAMÁ", X(0.5), Y(0.93));
  };
  const nibMap = own(canvasTexture(256, 512, (g, w, h) => drawNib(g, w, h, false), true));
  const nibBump = own(canvasTexture(256, 512, (g, w, h) => drawNib(g, w, h, true), false));

  // Seccion de laca: rotulo de pan de oro a lo largo (u) en dos lados del cilindro (v).
  const gripMap = own(canvasTexture(1024, 128, (g, w, h) => {
    g.fillStyle = "#1a0f0a";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#d9ae5c";
    g.font = `500 ${h * 0.13}px Georgia, serif`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    [0.25, 0.75].forEach((v) => g.fillText(BRAND, w * 0.45, h * v));
  }, true));

  /* ---------- Materiales PBR ---------- */
  const mat = {
    lacquer: new MeshPhysicalMaterial({ map: gripMap, roughness: 0.38, roughnessMap: scratches, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05 }),
    gold: new MeshPhysicalMaterial({ color: "#e8bd66", metalness: 1, roughness: 0.42, roughnessMap: scratches, envMapIntensity: 1.25 }),
    nib: new MeshPhysicalMaterial({ map: nibMap, bumpMap: nibBump, bumpScale: 1.6, metalness: 1, roughness: 0.4, roughnessMap: scratches, envMapIntensity: 1.45, side: DoubleSide }),
    chrome: new MeshPhysicalMaterial({ color: "#f2f4f6", metalness: 1, roughness: 0.12, envMapIntensity: 1.5 }),
    feed: new MeshPhysicalMaterial({ color: "#0d0a09", roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.4 }),
    ink: new MeshPhysicalMaterial({ color: "#0b0d12", roughness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, side: DoubleSide }),
    calamus: new MeshPhysicalMaterial({ color: "#e2cbb1", roughness: 0.34, clearcoat: 0.6, clearcoatRoughness: 0.2, sheen: 0.4, sheenColor: new Color("#fff1de"), sheenRoughness: 0.5 }),
    rachis: new MeshPhysicalMaterial({ color: "#cfa98c", roughness: 0.46, clearcoat: 0.35, clearcoatRoughness: 0.3 }),
    vane: new MeshPhysicalMaterial({ vertexColors: true, roughness: 0.66, sheen: 1, sheenColor: new Color("#d49b72"), sheenRoughness: 0.35, side: DoubleSide })
  };
  Object.values(mat).forEach(own);

  /* ---------- Raquis: curva central (s = 0 en la boca de la seccion, 1 en la punta) ---------- */
  const M = 280;
  const centre = [];
  const walk = new Vector3();
  for (let i = 0; i < M; i++) {
    const s = i / (M - 1);
    const tau = degToRad(8 + 26 * s * s); // se inclina mas hacia la punta
    const t = new Vector3(Math.sin(tau), Math.cos(tau), 0.1 + 0.25 * s).normalize();
    if (i > 0) walk.addScaledVector(t, L / (M - 1));
    const n = new Vector3(t.y, -t.x, 0).normalize(); // lateral, en el plano de la pluma
    const b = new Vector3().crossVectors(t, n).normalize();
    centre.push({ p: walk.clone(), t, n, b });
  }
  const at = (s) => {
    const f = clamp(s, 0, 1) * (M - 1);
    const i = Math.min(M - 2, Math.floor(f)), k = f - i;
    const A = centre[i], B = centre[i + 1];
    return {
      p: A.p.clone().lerp(B.p, k), t: A.t.clone().lerp(B.t, k).normalize(),
      n: A.n.clone().lerp(B.n, k).normalize(), b: A.b.clone().lerp(B.b, k).normalize()
    };
  };

  const inner = new Group(); // la pluma con la punta de la plumilla en el origen
  const pose = new Group();  // se mueve y gira como la mano
  pose.add(inner);
  scene.add(pose);

  function meshFrom(vertices, index, uvs, material) {
    const geometry = own(new BufferGeometry());
    geometry.setAttribute("position", new BufferAttribute(new Float32Array(vertices), 3));
    if (uvs) geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
    geometry.setIndex(index);
    geometry.computeVertexNormals();
    return new Mesh(geometry, material);
  }

  // Tubo de radio variable sobre el raquis, con UV (u a lo largo, v alrededor).
  function tube(sA, sB, radius, material, steps = 48, radial = 20) {
    const vertices = [], uvs = [], index = [];
    for (let i = 0; i <= steps; i++) {
      const s = sA + (sB - sA) * (i / steps), c = at(s), r = radius(s);
      for (let j = 0; j <= radial; j++) {
        const a = (j / radial) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        vertices.push(c.p.x + (c.n.x * ca + c.b.x * sa) * r, c.p.y + (c.n.y * ca + c.b.y * sa) * r, c.p.z + (c.n.z * ca + c.b.z * sa) * r);
        uvs.push(i / steps, j / radial);
      }
    }
    const row = radial + 1;
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * row + j, b2 = a + 1, c2 = a + row, d = c2 + 1;
        index.push(a, c2, b2, b2, c2, d);
      }
    }
    const mesh = meshFrom(vertices, index, uvs, material);
    inner.add(mesh);
    return mesh;
  }

  /* ---------- Seccion, aros y collar ---------- */
  const SEC = 0.12; // largo de la seccion de laca
  const secRadius = (s) => L * (0.022 + 0.01 * smoothstep(s, 0, SEC)) * (0.9 + 0.1 * Math.sqrt(clamp(s / 0.008, 0, 1)));
  const bump = (s, c, w) => Math.sqrt(Math.max(0, 1 - ((s - c) / w) ** 2));
  const ring = (c, w) => tube(c - w, c + w, (s) => secRadius(c) + L * 0.0024 * (0.35 + 0.65 * bump(s, c, w)), mat.gold, 10, 28);
  tube(0, SEC, secRadius, mat.lacquer, 40, 32);
  ring(0.006, 0.006);  // aro de la boca
  ring(0.084, 0.004);  // doble aro
  ring(0.096, 0.004);
  // Collar de oro donde entra el canon: un cono corto.
  tube(SEC - 0.002, SEC + 0.022, (s) => {
    const k = clamp((s - SEC) / 0.022, 0, 1);
    return (secRadius(SEC) + L * 0.002) * (1 - k) + L * 0.0185 * k;
  }, mat.gold, 12, 28);
  // Canon (calamo) y raquis.
  tube(SEC + 0.015, 0.31, (s) => L * (0.018 - 0.006 * (s - SEC) / (0.31 - SEC)), mat.calamus, 40);
  tube(0.3, 1, (s) => 0.4 + L * 0.0125 * Math.pow(1 - (s - 0.3) / 0.7, 0.85), mat.rachis, 90, 12);

  /* ---------- Plumilla bicolor con grosor, ranura y alimentador ---------- */
  const Hn = L * 0.2, wHalf = Hn * 0.25, thick = Hn * 0.014;
  const nibWidth = (v) => {
    let w = wHalf * Math.pow(Math.sin(Math.min(1, v / 0.58) * Math.PI / 2), 1.15);
    if (v > 0.58 && v < 0.65) w *= 0.86; // muesca de los hombros
    return w;
  };
  // Superficie curvada: se enrolla sobre el alimentador y la punta baja un poco hacia el papel.
  const nibPoint = (u, v, lift = 0) => {
    const x = u * nibWidth(v), y = v * Hn;
    const z = -(x * x) / (wHalf * 1.5) * (0.25 + 0.75 * v) - Math.pow(1 - v, 3) * Hn * 0.06 + lift;
    return [x, y, z];
  };
  const nib = new Group();
  {
    const R = 80, C = 41; // C impar: hay una columna central para la ranura
    const hy = Hn * 0.44, hr = Hn * 0.052; // agujero de respiracion
    const vertices = [], uvs = [], index = [];
    const sheet = (lift) => {
      for (let i = 0; i <= R; i++) {
        for (let j = 0; j <= C; j++) {
          vertices.push(...nibPoint(-1 + 2 * j / C, i / R, lift));
          uvs.push(j / C, i / R);
        }
      }
    };
    sheet(0);        // cara de arriba
    sheet(-thick);   // cara de abajo
    const back = (R + 1) * (C + 1);
    for (let i = 0; i < R; i++) {
      for (let j = 0; j < C; j++) {
        const [xc, yc] = nibPoint(-1 + (2 * j + 1) / C, (i + 0.5) / R);
        const inHole = xc * xc + (yc - hy) * (yc - hy) < hr * hr;
        const inSlit = j === (C - 1) / 2 && yc > Hn * 0.012 && yc < hy;
        if (inHole || inSlit) continue;
        const a = i * (C + 1) + j, b2 = a + 1, c2 = a + C + 1, d = c2 + 1;
        index.push(a, b2, c2, b2, d, c2);
        index.push(back + a, back + c2, back + b2, back + b2, back + c2, back + d);
      }
    }
    // Cantos laterales: unen las dos caras y dan el grosor del acero.
    [0, C].forEach((j) => {
      for (let i = 0; i < R; i++) {
        const a = i * (C + 1) + j, c2 = a + C + 1;
        index.push(a, c2, back + a, back + a, c2, back + c2);
      }
    });
    nib.add(meshFrom(vertices, index, uvs, mat.nib));

    // Ranura: cinta oscura pegada a la superficie, del agujero a la punta.
    const slit = [], slitIndex = [];
    for (let k = 0; k <= 16; k++) {
      const v = 0.006 + (0.44 - 0.052 - 0.006) * (k / 16);
      const [x, y, z] = nibPoint(0, v, Hn * 0.003);
      const w = Hn * 0.0055;
      slit.push(x - w, y, z, x + w, y, z);
      if (k) slitIndex.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k - 1, 2 * k + 1, 2 * k);
    }
    nib.add(meshFrom(slit, slitIndex, null, mat.ink));

    // Bola de iridio en la punta y una gota de tinta.
    const tipping = new Mesh(own(new SphereGeometry(Hn * 0.03, 20, 14)), mat.chrome);
    tipping.position.set(0, Hn * 0.018, -Hn * 0.06);
    tipping.scale.set(1.25, 1, 0.9);
    const drop = new Mesh(own(new SphereGeometry(Hn * 0.018, 16, 10)), mat.ink);
    drop.position.set(0, Hn * 0.002, -Hn * 0.082);
    nib.add(tipping, drop);

    // Alimentador de ebonita bajo la plumilla, con aletas.
    const feed = [], feedIndex = [], radial = 18, steps = 40;
    for (let i = 0; i <= steps; i++) {
      const v = 0.16 + 0.86 * (i / steps), y = v * Hn;
      const fins = v > 0.52 && (v * 16) % 1 < 0.45 ? 1.12 : 1;
      const r = wHalf * 0.5 * Math.min(1, (v - 0.16) / 0.12 + 0.35) * fins;
      for (let j = 0; j <= radial; j++) {
        const a = (j / radial) * Math.PI * 2;
        feed.push(Math.cos(a) * r, y, -wHalf * 0.62 + Math.sin(a) * r * 0.75);
      }
    }
    for (let i = 0; i < steps; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * (radial + 1) + j, b2 = a + 1, c2 = a + radial + 1, d = c2 + 1;
        feedIndex.push(a, c2, b2, b2, c2, d);
      }
    }
    nib.add(meshFrom(feed, feedIndex, null, mat.feed));

    // Orienta la plumilla: su eje y sigue el raquis en s = 0, mirando al espectador.
    const c0 = at(0);
    const yAxis = c0.t.clone();
    const zAxis = c0.b.clone().negate();
    const xAxis = new Vector3().crossVectors(yAxis, zAxis).normalize();
    zAxis.crossVectors(xAxis, yAxis).normalize();
    nib.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(xAxis, yAxis, zAxis));
    nib.position.copy(c0.p).addScaledVector(yAxis, -Hn * 0.92); // la base entra en la seccion
    inner.add(nib);
    inner.position.copy(nib.position).negate(); // la punta de la plumilla queda en el origen
  }

  /* ---------- Vexilo: barbas individuales con resorte ---------- */
  const S = 8, s0 = 0.3, perSide = 240;
  const barbs = [];
  const splits = [[0.34, 0.035, 1], [0.58, 0.03, 1], [0.47, 0.03, -1], [0.72, 0.025, -1]];
  const colRoot = new Color("#24100a"), colMid = new Color("#5a301f"), colTip = new Color("#956042");
  [1, -1].forEach((side) => {
    for (let i = 0; i < perSide; i++) {
      const u = Math.min(1, (i + rnd() * 0.5) / perSide);
      const s = s0 + (1 - s0) * u;
      const c = at(s);
      const fluffy = u < 0.09; // plumon de la base: largo, caido y muy suelto
      const shape = Math.sin(Math.PI * Math.pow(u, 0.72));
      const lateral = L * (side > 0 ? 0.13 : 0.165) * shape * (0.86 + rnd() * 0.28) + (fluffy ? L * 0.05 : 0);
      const sweep = fluffy ? 0.35 : 0.85 + 0.4 * Math.pow(u, 3);
      let split = 0;
      splits.forEach(([cu, half, sd]) => { const du = u - cu; if (sd === side && Math.abs(du) < half) split = Math.sign(du || 1) * 0.32 * (1 - Math.abs(du) / half); });
      barbs.push({
        c, side, fluffy, sweep, split,
        len: Math.max(1.5, lateral / Math.cos(Math.min(1.2, sweep))),
        width: ((1 - s0) * L / perSide) * 1.8,
        cup: fluffy ? 0.55 : 0.2,
        a: 0, av: 0, z: 0, zv: 0,
        k: 60 + rnd() * 50, gain: 0.6 + rnd() * 0.8,
        amp: fluffy ? 0.16 : 0.035 + rnd() * 0.025, freq: 2.2 + rnd() * 3, phase: u * 9 + rnd() * 0.8,
        // Bandas suaves a lo largo de la pluma y variacion por barba.
        shade: (0.82 + rnd() * 0.3) * (1 + 0.08 * Math.sin(u * 46))
      });
    }
  });
  const vertsPerBarb = (S + 1) * 2;
  const positions = new Float32Array(barbs.length * vertsPerBarb * 3);
  const colors = new Float32Array(barbs.length * vertsPerBarb * 3);
  const vaneIndex = [];
  barbs.forEach((barb, n) => {
    const base = n * vertsPerBarb;
    for (let j = 0; j <= S; j++) {
      const q = j / S;
      const col = q < 0.5 ? colRoot.clone().lerp(colMid, q * 2) : colMid.clone().lerp(colTip, (q - 0.5) * 2);
      if (barb.fluffy) col.lerp(colTip, 0.35);
      col.multiplyScalar(barb.shade);
      for (let e = 0; e < 2; e++) colors.set([col.r, col.g, col.b], (base + j * 2 + e) * 3);
      if (j) vaneIndex.push(base + j * 2 - 2, base + j * 2 - 1, base + j * 2, base + j * 2 - 1, base + j * 2 + 1, base + j * 2);
    }
  });
  const vane = own(new BufferGeometry());
  vane.setAttribute("position", new BufferAttribute(positions, 3));
  vane.setAttribute("color", new BufferAttribute(colors, 3));
  vane.setIndex(vaneIndex);
  inner.add(new Mesh(vane, mat.vane));

  const dir = new Vector3(), cursor = new Vector3();
  function updateVane(time, dt, vx, vy) {
    const speed = Math.hypot(vx, vy);
    barbs.forEach((barb, n) => {
      const { c, side } = barb;
      // La inercia empuja cada barba al lado contrario del movimiento de la mano.
      const targetA = clamp(-(vx * c.n.x * side + vy * c.n.y * side) / 1000 * 0.9 * barb.gain, -0.6, 0.6);
      const targetZ = clamp(speed / 1000 * 0.35 * barb.gain, 0, 0.5);
      barb.av += ((targetA - barb.a) * barb.k - barb.av * 6) * dt;
      barb.a += barb.av * dt;
      barb.zv += ((targetZ - barb.z) * barb.k * 0.8 - barb.zv * 5) * dt;
      barb.z += barb.zv * dt;
      const wobble = barb.amp * Math.sin(time * barb.freq + barb.phase);
      const flap = barb.amp * 1.4 * Math.sin(time * barb.freq * 0.8 + barb.phase + 1);
      const base = n * vertsPerBarb * 3;
      cursor.copy(c.p);
      const seg = barb.len / S;
      for (let j = 0; j <= S; j++) {
        const q = j / S, bend = Math.pow(q, 1.4);
        if (j) {
          const psi = barb.sweep + 0.2 * q + barb.split + (barb.a + wobble) * bend;
          const lift = barb.cup * q + (barb.z + flap) * bend;
          dir.set(0, 0, 0)
            .addScaledVector(c.n, side * Math.cos(psi))
            .addScaledVector(c.t, Math.sin(psi))
            .addScaledVector(c.b, lift)
            .normalize();
          cursor.addScaledVector(dir, seg);
        }
        const hw = (barb.width / 2) * (1 - 0.65 * q); // cada barba se afina hacia su punta
        const o = base + j * 6;
        positions[o] = cursor.x - c.t.x * hw; positions[o + 1] = cursor.y - c.t.y * hw; positions[o + 2] = cursor.z - c.t.z * hw;
        positions[o + 3] = cursor.x + c.t.x * hw; positions[o + 4] = cursor.y + c.t.y * hw; positions[o + 5] = cursor.z + c.t.z * hw;
      }
    });
    vane.attributes.position.needsUpdate = true;
    vane.computeVertexNormals();
  }

  /* ---------- Sombra sobre el papel ----------
     Cada pieza se proyecta sobre el plano del papel siguiendo la luz principal.
     Es mas oscura donde la pluma toca el papel y se desvanece con la altura. */
  const paperZ = -Hn * 0.09;
  const shadowMaterial = own(new ShaderMaterial({
    uniforms: {
      lightDir: { value: new Vector3(0.32, -0.5, -1).normalize() },
      paperZ: { value: paperZ }, reach: { value: L * 0.3 }, strength: { value: 0.32 }
    },
    vertexShader: `
      uniform vec3 lightDir; uniform float paperZ; uniform float reach;
      varying float vFade;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        float h = max(world.z - paperZ, 0.0);
        world.xyz += lightDir * (h / -lightDir.z);
        world.z = paperZ;
        vFade = 1.0 - smoothstep(0.0, reach, h);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: `
      uniform float strength; varying float vFade;
      void main() { gl_FragColor = vec4(0.16, 0.08, 0.04, strength * vFade * vFade); }`,
    transparent: true, depthWrite: true, depthFunc: LessDepth, side: DoubleSide
  }));
  const casters = [];
  inner.traverse((node) => { if (node.isMesh) casters.push(node); });
  casters.forEach((node) => {
    const shadow = new Mesh(node.geometry, shadowMaterial);
    shadow.position.copy(node.position);
    shadow.quaternion.copy(node.quaternion);
    shadow.scale.copy(node.scale);
    shadow.renderOrder = -1; // primero la sombra; la igualdad de profundidad evita que se oscurezca dos veces
    node.parent.add(shadow);
  });

  /* ---------- Movimiento ---------- */
  let last = null, time = 0, dt = 1 / 60, vx = 0, vy = 0;
  function setPose(x, y, rotDeg, t) {
    if (last) {
      dt = clamp(t - last.t, 1 / 240, 1 / 20);
      // Velocidad suavizada (px/s, y hacia arriba como en la escena).
      vx += ((x - last.x) / dt - vx) * 0.35;
      vy += ((last.y - y) / dt - vy) * 0.35;
    }
    last = { x, y, t };
    time = t;
    pose.position.set(x, height - y, 0);
    // +30: la pluma se inclina a la derecha, como en la mano de quien escribe.
    // El giro en x levanta la parte de arriba del papel (proyecta la sombra).
    pose.rotation.set(0.3, 0.2 + 0.1 * Math.sin(t * 1.7), -degToRad(rotDeg + 30));
  }
  function render() {
    updateVane(time, dt, vx, vy);
    renderer.render(scene, camera);
  }
  function dispose() {
    owned.forEach((item) => item.dispose?.());
    envMap.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    canvas.remove();
  }
  return { canvas, setPose, render, dispose };
}

window.QuillFeather = { create: createQuill };
