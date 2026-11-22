# Digital Portafolio

Portafolio personal de Jair M. Morales Magallon: estudiante de Ciberseguridad en la Universidad Tecnológica de Panamá y desarrollador web.

Sitio en vivo: <https://jmmm11.github.io/Digital-Portafolio/>

Hecho con [Astro](https://astro.build) (sitio estático), CSS propio y JavaScript sin framework. El contenido está en inglés con traducción al español; los comentarios del código, en español.

## Cómo ejecutarlo

```bash
npm install       # solo la primera vez
npm run dev       # http://localhost:4321/Digital-Portafolio/
npm run build     # genera el sitio en dist/
npm run preview   # sirve dist/ para revisarlo antes de publicar
```

Live Server o abrir los `.html` con doble clic ya no sirve: las páginas se arman con Astro.

> **Windows:** `npm run dev/build/preview` pasan por `scripts/astro.mjs`. En equipos con control de aplicaciones que bloquea binarios nativos, usa la versión WebAssembly de un módulo de Astro y la instala sola la primera vez.

## Cómo se publica

Cada `git push` a `main` ejecuta `.github/workflows/deploy.yml`: instala, compila con Astro y publica `dist/` en GitHub Pages. En el repositorio, **Settings → Pages → Source** debe estar en **GitHub Actions**.

## Estructura

```
src/
  layouts/Base.astro       <head>, cabecera y pie de todas las páginas (SEO, OG, datos estructurados)
  components/Header.astro  Menú (un solo archivo para todas las páginas)
  components/Footer.astro  Pie de página
  pages/                   Una página por archivo: index, about, projects, services, skills,
                           experience, contact, cv y 404
  three/showroom.js        Fuente del monitor 3D del inicio (three.js)

public/                    Se publica tal cual
  css/styles.css           Estilos de todo el sitio (variables al inicio)
  css/origami-journey.css  Solo la animación del ave en experience
  js/theme.js              Idioma, precarga y entrada (se carga primero)
  js/site.js               Navegación, proyectos, idioma, animaciones, vitrina, terminal y reloj
  js/i18n-es.js            Textos en español (inglés exacto -> español)
  js/projects-data.js      Datos de los proyectos
  js/name-water.js         Títulos en agua (WebGL2)
  js/showroom.js           Monitor 3D compilado (no se edita: sale de src/three/showroom.js)
  js/origami-journey.js    Animación del ave de origami
  js/vendor/               Motion y Lenis (copias de node_modules)
  assets/fonts/            Instrument Serif e Instrument Sans
  assets/images/           Favicon, imagen OG y capturas de proyectos (1280 y 720 px)
  assets/cv/               CV en PDF, en inglés (_EN) y en español (_ES)

scripts/
  astro.mjs                Lanza Astro (con el arreglo para Windows)
  copy-vendor.mjs          Copia Motion y Lenis a public/js/vendor
```

## Cómo editar

| Quiero cambiar | Dónde |
| --- | --- |
| Textos de una página | `src/pages/<pagina>.astro`. Cada bloque tiene un comentario que dice qué es. |
| El menú o el pie | `src/components/Header.astro` y `src/components/Footer.astro`. |
| Título y descripción para buscadores | Atributos `title` y `description` de `<Base>` en cada página. |
| Agregar o editar un proyecto | `public/js/projects-data.js`. Copia un bloque `{ ... }`; las instrucciones están al inicio. |
| Captura de un proyecto | `public/assets/images/projects/`: `nombre.webp` (1280x800) y `nombre-720.webp` (720 de ancho). |
| Obras principales | Campo `spotlight` (1, 2, 3) en `projects-data.js`, con `problem`, `challenge` y `result`. Van primero en el monitor y en Projects. |
| Proyectos del inicio | Campo `featured: true` en `projects-data.js`. |
| Colores, tipografía, espaciado | Variables de `:root` en `public/css/styles.css`. |
| Textos en español | `public/js/i18n-es.js`. Si cambias un texto en inglés, cambia también su línea ahí; si no coincide, se queda en inglés. Los proyectos se traducen en el campo `es` de `projects-data.js`. |
| El monitor 3D | `src/three/showroom.js` y luego `npm run build:showroom`. |
| El editor y la terminal del inicio | `typeCode()` y `runTerminal()` en `public/js/site.js`. |
| El CV | Reemplaza los PDF de `public/assets/cv/` con el mismo nombre. |

Busca `TODO` en el proyecto para ver los datos que faltan por completar.

## Diseño

Papel crema, tinta verde bosque y un verde salvia de acento, con guiños de programación: rutas tipo terminal (`$ cd ~/jair/about`), secciones numeradas como comentarios (`// 01`), una terminal con `ls -la ~/projects`, un editor que escribe solo y una 404 de terminal.

- Colores: crema `#f4f0e6`, tinta `#17261c`, verde `#2e5e43`, salvia `#9dbaa4`, verde profundo `#1c3326`.
- Tipografías: Instrument Serif para títulos e Instrument Sans para el texto; los detalles de código usan la fuente monoespaciada del sistema.

## Animaciones

- **Inicio:** monitor 3D (three.js) que pasa los proyectos con una transición glitch; una laptop orbita alrededor y el nombre está detrás. Se descarga después de que la página ya se ve.
- **Títulos:** bajo una lámina de agua (simulación de ondas en WebGL2) que reacciona al puntero, al dedo y a los clics.
- **Menú:** la pestaña verde se desliza desde la página anterior a la actual.
- **Entrada y scroll:** precarga con cortina en la primera visita, entrada escalonada, revelado al bajar, parallax de las capturas y tarjetas que se apilan (con [Motion](https://motion.dev)); scroll suave con [Lenis](https://lenis.darkroom.engineering).

Todo respeta `prefers-reduced-motion`.

## SEO

- Mapa del sitio automático (`sitemap-index.xml`) con `@astrojs/sitemap`.
- Ficha `Person` de schema.org en el inicio, Open Graph e imagen para compartir (`og-image.jpg`, 1200x630).
- Para que Google lo indexe antes, agrega el sitio en Google Search Console y envía `sitemap-index.xml`.

## Créditos

- Logos del origami: [Devicon](https://github.com/devicons/devicon) v2.16.0, licencia MIT (`public/assets/licenses/devicon-MIT.txt`). El símbolo de Cursor proviene de sus recursos oficiales de marca y pertenece a Anysphere.
- Fuentes: Instrument Serif e Instrument Sans, SIL Open Font License 1.1 (`public/assets/licenses/`).
- Motion, Lenis y three.js: licencia MIT.
