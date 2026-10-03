# Digital Portfolio

## Editar el portafolio

Todo el contenido se edita directamente en `index.html`. No necesitas modificar JavaScript.

La marca de Jair M. se encuentra en `assets/images/jair-mark.svg`; su versión para la pestaña está en `assets/images/favicon.svg`. Puedes cambiar sus rutas en la cabecera y en el `head` del HTML. El acento verde es `#7bc89c`.

- Busca `[[` para completar tus datos, títulos, descripciones y enlaces pendientes.
- Busca `IMAGEN PROYECTO`: cambia el atributo `src` por la ruta de tu captura y describe la imagen en `alt`. El marcador desaparece al añadir una imagen válida.
- Busca `DESCARGAR CV`: cambia los dos `href="[[CV PATH]]"` por `href="assets/cv.pdf"` y guarda el PDF en esa carpeta.
- Busca `ENLACES DEL PROYECTO` para pegar los enlaces al repositorio y a la demo. Actualiza también el enlace de demo sobre la imagen.
- Para añadir proyectos, duplica un `article.project-card`, asigna un ID de título único y conserva `data-category="personal"` o `"team"`. Los contadores se actualizan automáticamente.
- El canvas `constellation` define 700 triángulos en escritorio y 300 en móvil. En `body`, `data-accent-ratio="0.12"` reserva el 12 % para el verde.

El diseño usa un tema claro por defecto y el tema oscuro original. Los seis colores de cada tema están definidos en `:root` y `:root[data-theme="dark"]` de `css/styles.css`, sin degradados ni sombras. Poppins se carga localmente desde `Fonts/` en varios pesos e itálicas para dar personalidad a títulos, énfasis y texto general.

La animación puede pausarse junto al cerebro. La preferencia de movimiento reducido desactiva la animación, el paralaje y las transiciones. Las capturas y el CV se guardan en `assets/`, y sus rutas se cambian en el HTML.

### Modo claro y oscuro

La primera visita abre en modo claro, con fondo crema y acento verde. El botón de luna/sol en la cabecera permite cambiar al modo oscuro original. La selección se guarda localmente; `js/theme.js` la restaura antes de cargar los estilos para evitar parpadeos. Si el navegador no permite almacenamiento, el selector sigue funcionando durante la visita.

El cerebro usa `data-triangle-colors-light` en modo claro y `data-triangle-colors` en modo oscuro, ambos en el `body` de `index.html`. Los iconos incluidos se adaptan al fondo; las capturas de tus proyectos conservan sus colores.

### Animación del recorrido

Busca `ANIMACION DEL RECORRIDO` en `index.html`: el ave de origami flota entre rutas con puntos en movimiento. Puedes editar el pie y los valores `data-duration` de cada punto (milisegundos). Tiene un botón de pausa propio, respeta la pausa general y el movimiento reducido, y se detiene fuera de pantalla. Sin JavaScript se muestra la ilustración estática.

### Carrusel de iconos

Busca `CARRUSEL DE ICONOS` en `index.html`. Guarda tus imágenes en `assets/icons/` y cambia el `src` de cada `img`. Para añadir un icono, copia una sola línea `img` y cambia su ruta y su `alt`. No dupliques la lista: el carrusel repite automáticamente las imágenes sin cortes.

`data-speed="32"` controla la velocidad en píxeles por segundo. Se pausa con su botón, al pasar el cursor o al enfocarlo con el teclado. También respeta la pausa general y el movimiento reducido; en ese modo, o sin JavaScript, puedes desplazar la lista horizontalmente.

Se incluyen iconos de Python, Java, JavaScript, C++, HTML, CSS y Git de [Devicon v2.16.0](https://github.com/devicons/devicon/tree/v2.16.0), adaptados a blanco para combinar con la paleta. La licencia está en `assets/icons/LICENSE.txt`. Tus nuevas imágenes conservan sus propios colores.

### Animaciones del cerebro

La entrada transforma una esfera de triángulos en el cerebro. Sus órbitas giran lentamente y una onda luminosa recorre la figura. Al desplazarte, el cerebro se aproxima a la forma de un orbe; las secciones, iconos y proyectos aparecen en secuencia. El contenido y la tipografía Poppins se conservan.

En el canvas `constellation` de `index.html` puedes ajustar `data-reveal-duration="2600"` (duración de la entrada en milisegundos), `data-orbit-count="120"` y `data-mobile-orbit-count="48"` (puntos orbitales; usa 0 para ocultarlos). El botón de pausa detiene también las entradas y efectos de interacción. El cerebro deja de animarse cuando sale de la pantalla o la pestaña está oculta. Todo el texto permanece visible si JavaScript no está disponible.

Welcome to my digital portfolio — a space where I showcase my projects, skills, ideas, and ongoing growth in technology and digital development.

This portfolio represents both my technical journey and my creative approach to building digital experiences. Each project reflects a combination of problem-solving, design, programming, research, and continuous learning.

## About Me

I am a technology enthusiast interested in software development, web design, programming, and the creation of interactive digital experiences.

I enjoy transforming ideas into functional and visually appealing projects, while continuously exploring new technologies and improving my technical skills.

My approach is based on learning through practice, experimentation, and real-world projects. I believe that every project is an opportunity to learn something new, solve a problem, and improve the way I build digital solutions.

## What You'll Find Here

This portfolio contains a selection of projects and work related to:

* 💻 Web Development
* 🎨 UI/UX and Digital Design
* 📱 Application Development
* 🐍 Python Programming
* ☕ Java Programming
* ⚙️ C++ Development
* 📊 Data Structures and Algorithms
* 🤖 Artificial Intelligence
* 🌐 Interactive Digital Experiences
* 📚 Academic and Personal Projects

## Technologies & Tools

Throughout my learning and development process, I have worked with and explored different technologies, including:

### Programming Languages

* Python
* Java
* C++
* JavaScript
* HTML
* CSS

### Development & Design

* Git & GitHub
* Responsive Web Design
* UI/UX Principles
* Interactive Web Interfaces
* Digital Prototyping

### Exploring

I am continuously learning and experimenting with new technologies, particularly in areas such as:

* Artificial Intelligence
* Mobile Development
* Modern Web Technologies
* Automation
* Digital Product Development

## Featured Projects

The portfolio includes projects developed for different purposes, from academic assignments and programming exercises to web experiences and creative digital concepts.

Each project is an opportunity to demonstrate not only the final result, but also the process behind it — including planning, development, problem-solving, testing, and iteration.

## My Development Philosophy

> **Learn. Build. Experiment. Improve.**

I believe the best way to grow as a developer is by creating.

Instead of focusing only on theory, I try to apply what I learn through practical projects, experiments, and challenges. This allows me to understand technologies more deeply while developing a stronger problem-solving mindset.

## Goals

My goal is to continue developing my technical and creative abilities while building projects that combine functionality, design, and innovation.

I am particularly interested in opportunities where technology can be used to create useful, intuitive, and meaningful digital experiences.

```

## Currently Learning

I am continuously expanding my knowledge through courses, personal projects, experimentation, and practical development.

Some of the areas I am currently focusing on include:

* Advanced programming concepts
* Data structures and algorithms
* Modern web development
* Mobile application development
* Artificial intelligence
* Software architecture
* UI/UX design

## Let's Connect

Thank you for visiting my portfolio.

This portfolio is a work in progress and will continue to evolve as I learn, build, and explore new technologies.

**Feel free to explore the projects and follow my journey as I continue developing my skills in technology and digital development.**

---

*Designed and developed as part of my ongoing journey in technology.*
