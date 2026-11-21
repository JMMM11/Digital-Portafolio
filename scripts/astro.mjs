// Lanza Astro (npm run dev / build / preview).
// En Windows usa la version WebAssembly de un modulo nativo de Astro (satteri): la politica de
// control de aplicaciones de este equipo bloquea su binario .node. npm no instala esa version en
// Windows por su cuenta, asi que la primera vez se instala aqui. En GitHub (Linux) no hace falta.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const env = { ...process.env };
if (process.platform === "win32" && env.NAPI_RS_FORCE_WASI === undefined) {
  env.NAPI_RS_FORCE_WASI = "true";
  if (!existsSync("node_modules/@bruits/satteri-wasm32-wasi")) {
    const { version } = JSON.parse(readFileSync("node_modules/satteri/package.json", "utf8"));
    console.log(`Instalando @bruits/satteri-wasm32-wasi@${version} (version WebAssembly)...`);
    spawnSync("npm", ["install", "--no-save", "--force", `@bruits/satteri-wasm32-wasi@${version}`], { stdio: "inherit", shell: true });
  }
}

const child = spawn(process.execPath, ["node_modules/astro/bin/astro.mjs", ...process.argv.slice(2)], { stdio: "inherit", env });
child.on("exit", (code) => process.exit(code ?? 1));
