# Digital Portafolio

Portafolio personal de Jair M. Morales Magallon: estudiante de Ciberseguridad en la Universidad Tecnológica de Panamá y desarrollador web.

Sitio en vivo: <https://jmmm11.github.io/Digital-Portafolio/>

Es un sitio estático (HTML, CSS y JavaScript, sin framework ni paso de compilación). El contenido del sitio está en inglés; los comentarios del código, en español.

## Cómo ejecutarlo

Opción rápida: abre `index.html` con doble clic. Todo funciona sin servidor.

Con servidor local (recomendado, se comporta igual que GitHub Pages):

```bash
npm install     # solo la primera vez
npm start       # abre http://localhost:4173
```

Para publicar, haz `git push` a `main`. GitHub Pages sirve los archivos tal como están.

## Estructura

```
index.html          Inicio: presentación, proyectos recientes y bloque Now
about.html          Sobre mí: historia, motivación, formación
projects.html       Proyectos destacados (problema y reto) y el resto con filtros
services.html       Servicios con cotización por WhatsApp y el proceso de trabajo
skills.html         Habilidades agrupadas por área
experience.html     Experiencia, voluntariado y certificaciones
contact.html        Correo, enlaces y formulario

css/styles.css            Estilos de todo el sitio (variables al inicio)
css/origami-journey.css   Solo la animación del ave en experience.html

js/theme.js           Tema claro/oscuro e idioma inicial (se carga primero)
js/site.js            Navegación, filtros, formulario, idioma y animaciones
js/i18n-es.js         Textos en español (inglés exacto -> español)
js/projects-data.js   Datos de los proyectos
js/brain.js           Cerebro de triángulos del inicio
js/origami-journey.js Animación del ave de origami
js/vendor/motion.js   Librería Motion (copia de node_modules)

assets/fonts/     Chakra Petch y Hanken Grotesk
assets/images/    Favicon, cerebro de respaldo y capturas de proyectos
assets/cv/        CV en PDF, en inglés (_EN) y en español (_ES)
scripts/          Utilidad para actualizar Motion
```

## Cómo editar

| Quiero cambiar | Dónde |
| --- | --- |
| Textos de una página | En su `.html`. Cada bloque tiene un comentario en mayúsculas que dice qué es. |
| Agregar o editar un proyecto | `js/projects-data.js`. Copia un bloque `{ ... }`; las instrucciones están al inicio del archivo. |
| Captura de un proyecto | Guárdala en `assets/images/projects/` (1280x800) y pon su ruta en `image`. |
| Colores, tipografía, espaciado | Variables de `:root` en `css/styles.css` (tema claro) y `:root[data-theme="dark"]` (oscuro). |
| El menú | La cabecera se repite en las siete páginas: cambia el enlace en todas. `aria-current="page"` marca la página activa. |
| Correo de contacto | `contact.html` (enlace y `data-to` del formulario) y el pie de cada página. |
| Bloque Now del inicio | Busca `AHORA` en `index.html`: cambia los puntos, la fecha y su `datetime`, y las mismas líneas en `js/i18n-es.js`. |
| Proyectos destacados de Projects | Campo `spotlight` (1, 2, 3) en `js/projects-data.js`, con `problem`, `challenge` y `result`. |
| Textos en español | `js/i18n-es.js`. Si cambias un texto en inglés en un `.html`, cambia también su línea ahí; si no coincide, se queda en inglés. Los proyectos se traducen en el campo `es` de `js/projects-data.js`. |
| El CV | Reemplaza los PDF de `assets/cv/` con el mismo nombre. El botón ES/EN elige cuál se descarga. |
| Colores y cantidad de triángulos del cerebro | Atributos `data-*` del `<body>` y del `<canvas>` en `index.html`. |

Busca `TODO` en el proyecto para ver los datos que faltan por completar.

## Diseño

La idea visual es el papel de origami, por el ave que uso como marca: una cara verde y otra naranja. El naranja aparece solo donde algo está "doblado": la pestaña del menú, la esquina de las tarjetas y los botones.

- Tipografías: Chakra Petch para títulos y Hanken Grotesk para texto.
- Tema claro por defecto y tema oscuro con el botón de la cabecera. La elección se guarda en el navegador.

## Animaciones

Se usan con [Motion](https://motion.dev) y solo donde aportan:

- La pestaña naranja del menú se desliza desde la página anterior a la actual y acompaña al cursor.
- Una sola secuencia de entrada por página (elementos con `data-intro`).
- El menú móvil se despliega con sus enlaces en cascada.
- Las tarjetas aparecen en secuencia al cambiar de filtro.
- La línea naranja de `experience.html` avanza con el scroll.

Todas usan únicamente `transform` y `opacity`, y se desactivan si el sistema pide movimiento reducido.

Motion se instala con npm, pero el sitio carga la copia de `js/vendor/motion.js` porque GitHub Pages no publica `node_modules`. Para actualizarla:

```bash
npm install motion@latest
npm run vendor
```

## Créditos

- Logos del origami: [Devicon](https://github.com/devicons/devicon) v2.16.0, licencia MIT (`assets/licenses/devicon-MIT.txt`). El símbolo de Cursor proviene de sus recursos oficiales de marca y pertenece a Anysphere.
- Fuentes: Chakra Petch y Hanken Grotesk, SIL Open Font License 1.1, descargadas de Google Fonts.
- Motion: licencia MIT.
