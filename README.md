# Tu portafolio

Abre `index.html` en el navegador. **Todos los textos, capturas, enlaces y datos personales se editan directamente en `index.html`.** No necesitas editar JavaScript, instalar paquetes ni compilar nada.

## Encuentra lo que quieres cambiar

En `index.html`, usa **Ctrl+F** y busca los comentarios `CABECERA`, `INICIO`, `HABILIDADES`, `PROYECTO 1`, `IMAGEN PROYECTO`, `ENLACES DEL PROYECTO`, `DESCARGAR CV`, `EXPERIENCIA Y ESTUDIOS`, `CONTACTO` o `PIE DE PAGINA`.

Reemplaza los valores `[[...]]` por tu información. Los enlaces que todavía contienen `[[...]]` permanecen desactivados; se activan al reemplazar su `href` y recargar. El texto visible de cada enlace también está en el HTML.

## Poner una captura

1. Guarda la imagen dentro de `assets/images/`, por ejemplo `proyecto-1.webp`. También puedes usar PNG o JPG. Usa nombres en minúsculas y sin espacios.
2. Busca `IMAGEN PROYECTO 1` en el HTML.
3. Cambia la ruta de `src` y la descripción de `alt`. Ajusta `width` y `height` a las dimensiones reales del archivo.

```html
<img src="assets/images/proyecto-1.webp"
     alt="Página principal de mi proyecto"
     width="1440" height="2200"
     loading="lazy" decoding="async">
```

La imagen de muestra ya existe. Si una captura no se encuentra, aparece un respaldo visual. Las capturas altas se desplazan suavemente al pasar el cursor o enfocar la tarjeta con el teclado. El efecto respeta la preferencia de movimiento reducido.

## Enlaces de proyectos

Reemplaza `href="[[REPOSITORY URL]]"` por el enlace al repositorio y `href="[[LIVE DEMO URL]]"` por el enlace al sitio. Cada tarjeta tiene una demo encima de la imagen y otra debajo de los detalles: cambia ambos enlaces.

```html
<a href="https://github.com/JMMM11/mi-proyecto" target="_blank" rel="noopener noreferrer">Source code</a>
```

## Descargar tu CV

Guarda tu PDF como `assets/cv.pdf`. Busca `DESCARGAR CV` y cambia los **dos** enlaces, uno al inicio y otro en contacto:

```html
<a class="text-link" href="assets/cv.pdf" download>Download CV</a>
```

Conserva el atributo `download`. Puedes usar otro nombre, siempre que `href` coincida. No se incluye un CV ficticio. Usa un PDF local para que se descargue, en lugar de abrir un servicio externo.

## Correo y redes

En `CONTACTO`, reemplaza el correo tanto en el enlace como en el texto:

```html
<a class="contact-email" href="mailto:tu-correo@ejemplo.com">tu-correo@ejemplo.com</a>
```

Cambia el `href` de LinkedIn y, si hace falta, el de GitHub. El perfil de GitHub suministrado ya está enlazado.

## Agregar o quitar proyectos

Copia o elimina un bloque completo desde `<article class="project-card" ...>` hasta su `</article>`. Para un proyecto nuevo:

1. Cambia `aria-labelledby="project-one-title"` y el `id="project-one-title"` del título por un identificador nuevo y coincidente.
2. Usa `data-category="personal"` o `data-category="team"` para el filtro.
3. Actualiza la categoría visible, la captura, los textos y los enlaces.

Los contadores se calculan automáticamente a partir de las tarjetas del HTML.

## Diseño y animación

`css/styles.css` contiene los colores `#f7f3e9` y `#e3e8dc`, la tipografía serif y los estilos adaptables. La composición adapta la referencia de Dala a esta paleta: titulares amplios de peso 400, espacio abierto, un botón principal y triángulos como motivo visual. `js/main.js` controla el menú, los filtros, los enlaces pendientes y la animación. **Ya no se usa `js/data.js`.**

El cerebro está formado por triángulos en una superficie tridimensional, con hemisferios, pliegues, cerebelo y tallo. Gira suavemente y responde al cursor. Hay más triángulos flotando en los espacios libres del resto de la página; evitan los bloques de texto y las tarjetas.

Busca `PARTICULAS` o `CEREBRO DE TRIANGULOS` en **index.html** para ajustar el efecto:

- `data-triangle-colors` en `<body>`: los cinco colores, separados por comas. La paleta inicial usa oliva, salvia, eucalipto y un tono cálido.
- `data-count` y `data-mobile-count` en el canvas `constellation`: cantidad de triángulos del cerebro en escritorio y móvil. Se usan 2,100 y 720, con un máximo de 2,500.
- Los mismos atributos en `ambient-particles`: cantidad del fondo. Se usan 72 y 28, con un máximo de 160.

El botón junto a “Curiosity, connected.” pausa ambas animaciones. El dibujo se actualiza como máximo 30 veces por segundo y limita la resolución a dos veces el tamaño del canvas. El cerebro deja de animarse cuando el inicio sale de pantalla; todos los movimientos se detienen al ocultar la pestaña o si el visitante prefiere movimiento reducido. El contenido sigue visible sin JavaScript; en ese caso, `assets/images/brain-particles.svg` muestra una versión estática del cerebro con los colores iniciales.

## Publicar en GitHub Pages

1. El repositorio debe llamarse exactamente **JMMM11.github.io**.
2. Coloca `index.html` en la raíz de la rama **main**, junto a `css`, `js` y `assets`.
3. Abre **Settings → Pages → Deploy from a branch → main → / (root)** y guarda.
4. La página estará en **https://jmmm11.github.io**. GitHub muestra la URL en minúsculas.

Antes de publicar, reemplaza los `[[...]]`, incluido el título y las etiquetas `meta` del inicio del HTML. Para una vista previa en redes, puedes usar una imagen PNG/JPG con su URL pública completa en `og:image`. El SVG de muestra `assets/images/social-preview.svg` es opcional y no se actualiza automáticamente al cambiar los textos de la página.

**Más adelante, no ahora:** un repositorio separado llamado **JMMM11** con un `README.md` sirve para tu perfil de GitHub; es distinto del repositorio de este sitio.
