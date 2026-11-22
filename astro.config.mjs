// Configuracion de Astro. El sitio se publica en GitHub Pages bajo /Digital-Portafolio/.
// build.format "file" genera about.html, projects.html... asi los enlaces de siempre siguen valiendo.
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://jmmm11.github.io",
  base: "/Digital-Portafolio",
  build: { format: "file" },
  // Al pasar el cursor por un enlace, la pagina se descarga antes del clic: navegar se siente inmediato.
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  compressHTML: true,
  // Mapa del sitio para Google (sitemap-index.xml). La 404 no entra.
  integrations: [sitemap({ filter: (page) => !page.includes("404") })]
});
