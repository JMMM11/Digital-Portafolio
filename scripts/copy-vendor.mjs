// Copia la libreria Motion desde node_modules a public/js/vendor/ para que el sitio
// funcione como archivos estaticos (GitHub Pages no publica node_modules).
// Uso: npm install && npm run vendor
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("public/js/vendor", { recursive: true });
await copyFile("node_modules/motion/dist/motion.js", "public/js/vendor/motion.js");
await copyFile("node_modules/lenis/dist/lenis.min.js", "public/js/vendor/lenis.min.js");
await copyFile("node_modules/lenis/dist/lenis.min.js.map", "public/js/vendor/lenis.min.js.map");
console.log("Motion y Lenis copiados en public/js/vendor/");
