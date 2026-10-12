// Copia la libreria Motion desde node_modules a js/vendor/ para que el sitio
// funcione como archivos estaticos (GitHub Pages no publica node_modules).
// Uso: npm install && npm run vendor
import { copyFile, mkdir } from "node:fs/promises";

await mkdir("js/vendor", { recursive: true });
await copyFile("node_modules/motion/dist/motion.js", "js/vendor/motion.js");
console.log("Motion copiado en js/vendor/motion.js");
