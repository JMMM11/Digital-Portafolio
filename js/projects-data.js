/*
 * PROYECTOS: este es el unico archivo que editas para agregar, quitar o cambiar proyectos.
 * La pagina de inicio muestra los que tienen featured: true; projects.html los muestra todos.
 *
 * Para agregar uno, copia un bloque { ... } completo y cambia sus datos:
 *   title    Nombre del proyecto.
 *   kind     Etiqueta corta que se ve en la tarjeta.
 *   category "gift" | "website" | "app". La usan los filtros de projects.html.
 *   summary  Una o dos frases: que es y que problema resuelve.
 *   role     Tu rol. Si lo dejas vacio (""), no se muestra.
 *   stack    Tecnologias, en el orden en que quieres que aparezcan.
 *   image    Captura en assets/images/projects/ (1280x800). Usa "" si no tienes captura.
 *   alt      Descripcion de la captura para lectores de pantalla.
 *   demo     URL de la demo en vivo. Usa "" si no hay.
 *   repo     URL del repositorio. Usa "" si no hay.
 *   note     Texto opcional que aparece cuando falta la demo o el repositorio.
 *   spotlight  Opcional. 1, 2, 3...: el proyecto sale arriba en projects.html, en ese orden,
 *              con problem (que resuelve), challenge (lo mas dificil y como se resolvio)
 *              y result (solo con un dato real; si no hay, dejalo en "").
 *   es       Los mismos textos en espanol (kind, summary, role, alt, note, problem, challenge, result).
 *            Si falta alguno, se muestra el texto en ingles.
 */
window.PROJECTS = [
  {
    title: "La Gran Noche",
    kind: "Quinceañera invitation",
    category: "gift",
    featured: true,
    summary: "A digital invitation that plays like a story. Guests walk up to the house, receive a letter from Lady Whistledown and tour the celebration before confirming attendance. RSVPs and guest messages are saved to a database.",
    role: "Front-end and back-end development",
    stack: ["HTML", "CSS", "JavaScript", "Supabase"],
    image: "assets/images/projects/la-gran-noche.jpg",
    alt: "Opening screen of the invitation: a brick townhouse covered in wisteria behind an iron gate.",
    demo: "https://jmmm11.github.io/Adriana-Victoria-Pinzon-Jaen/",
    repo: "https://github.com/JMMM11/Adriana-Victoria-Pinzon-Jaen",
    note: "",
    spotlight: 2,
    problem: "A quinceañera needed an invitation guests would remember, and the family needed one place to collect RSVPs and guest messages.",
    challenge: "Keeping the guest list private on a public website. RSVPs are stored in Supabase with row level security: guests can send a confirmation, but nobody can read, edit or delete confirmations from the page, and the site only accepts the public key. The database also checks names, message lengths and guest counts.",
    result: "", // TODO: agrega un dato real si lo tienes (por ejemplo, cuantos invitados confirmaron en linea).
    es: {
      kind: "Invitación de quinceaños",
      summary: "Una invitación digital que se vive como una historia. El invitado llega a la casa, recibe una carta de Lady Whistledown y recorre la celebración antes de confirmar su asistencia. Las confirmaciones y los mensajes se guardan en una base de datos.",
      role: "Desarrollo front-end y back-end",
      alt: "Pantalla de entrada de la invitación: una casa de ladrillo cubierta de glicinas detrás de una reja.",
      note: "",
      problem: "Unos quinceaños necesitaban una invitación que los invitados recordaran, y la familia necesitaba un solo lugar para recibir confirmaciones y mensajes.",
      challenge: "Mantener privada la lista de invitados en un sitio público. Las confirmaciones se guardan en Supabase con seguridad a nivel de fila: los invitados pueden enviar su confirmación, pero nadie puede leerlas, editarlas ni borrarlas desde la página, y el sitio solo acepta la clave pública. La base de datos también valida nombres, largo de los mensajes y cantidad de acompañantes.",
    }
  },
  {
    title: "Hydronexis",
    kind: "Informational website",
    category: "website",
    featured: true,
    summary: "Hydronexis empowers families and communities to grow fresh, healthy food through hydroponic technology, while connecting users through a marketplace designed for local exchange and collaboration.",
    role: "Front-end and back-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/hydronexis.jpg",
    alt: "Hydronexis home page: a family tending lettuce in a home hydroponic system.",
    demo: "https://jmmm11.github.io/Hydronexis/livedemo00.template-help.com/wt_prod-10492/theme/index.html",
    repo: "https://github.com/JMMM11/Hydronexis",
    note: "",
    spotlight: 3,
    tags: ["HTML", "CSS", "JavaScript", "Python", "Flask", "Gemini API"],
    problem: "Hydronexis empowers families and communities to grow fresh, healthy food through hydroponic technology, while connecting users through a marketplace designed for local exchange and collaboration.",
    challenge: "Adding NEXIS, an assistant powered by Gemini that only answers questions about Hydronexis. It runs on a small Flask back end so the API key never reaches the browser, and its instructions tell it to say when something is not available instead of guessing.",
    result: "", // TODO: agrega un dato real si lo tienes.
    es: {
      kind: "Sitio informativo",
      summary: "Hydronexis ayuda a familias y comunidades a cultivar alimentos frescos y sanos con tecnología hidropónica, y conecta a sus usuarios con un mercado pensado para el intercambio y la colaboración local.",
      role: "Desarrollo front-end y back-end",
      alt: "Página de inicio de Hydronexis: una familia cuidando lechugas en un sistema hidropónico casero.",
      note: "",
      problem: "Hydronexis ayuda a familias y comunidades a cultivar alimentos frescos y sanos con tecnología hidropónica, y conecta a sus usuarios con un mercado pensado para el intercambio y la colaboración local.",
      challenge: "Agregar a NEXIS, un asistente con Gemini que solo responde preguntas sobre Hydronexis. Corre en un pequeño back end con Flask para que la clave de la API nunca llegue al navegador, y sus instrucciones le piden decir cuando algo no está disponible en vez de inventar.",
    }
  },
  {
    title: "PanaRoots",
    kind: "Tourism website",
    category: "website",
    featured: false,
    summary: "A site that connects travelers with the authentic Panama: its culture, traditions, gastronomy, crafts and local communities, through curated destinations, tour concepts and a cultural calendar.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/panaroots.jpg",
    alt: "PanaRoots home page: the name over a palm-covered island in turquoise water, with a search bar for destination, starting point and experience type.",
    demo: "https://jmmm11.github.io/Panaroots/",
    repo: "https://github.com/JMMM11/Panaroots",
    note: "",
    es: {
      kind: "Sitio de turismo",
      summary: "Un sitio que conecta a los viajeros con el Panamá auténtico: su cultura, tradiciones, gastronomía, artesanías y comunidades locales, con destinos seleccionados, ideas de tours y un calendario cultural.",
      role: "Desarrollo front-end",
      alt: "Página de inicio de PanaRoots: el nombre sobre una isla de palmeras en agua turquesa, con un buscador de destino, punto de partida y tipo de experiencia.",
      note: "",
    }
  },
  {
    title: "HealthBoost",
    kind: "Wellness website",
    category: "website",
    featured: false,
    summary: "A wellness platform that brings nutrition, mental wellness and physical activity together in one place, to help people build healthier habits with guidance from professionals and wellness partners.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/healthboost.jpg",
    alt: "HealthBoost home page: a pilates class behind the headline Train wherever you want, whenever you want, with buttons to choose a plan and view programs.",
    demo: "https://jmmm11.github.io/HealthBoost/",
    repo: "https://github.com/JMMM11/HealthBoost",
    note: "",
    es: {
      kind: "Sitio de bienestar",
      summary: "Una plataforma de bienestar que reúne nutrición, salud mental y actividad física en un solo lugar, para ayudar a las personas a crear hábitos más sanos con la guía de profesionales y aliados.",
      role: "Desarrollo front-end",
      alt: "Página de inicio de HealthBoost: una clase de pilates detrás del titular, con botones para elegir un plan y ver los programas.",
      note: "",
    }
  },
  {
    title: "FoodWizz",
    kind: "Product website",
    category: "website",
    featured: false,
    summary: "Official site for FoodWizz, inventory software for small restaurants and food trucks. It presents the features (real-time stock tracking, low-stock alerts, recipes and sales reports), compares pricing plans and offers the app for download.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/foodwizz.jpg",
    alt: "FoodWizz home page: the headline Smarter inventory for small restaurants next to a burger with its layers floating over an orange circle.",
    demo: "https://jmmm11.github.io/Foodwizz/",
    repo: "https://github.com/JMMM11/Foodwizz",
    note: "",
    spotlight: 1,
    tags: ["HTML", "CSS", "JavaScript", "Firebase Hosting"],
    problem: "Small restaurants and food trucks need a simple way to keep track of their stock. FoodWizz is inventory software built for them, and its site has to explain the features, compare the pricing plans and let people download the app.",
    challenge: "Making one site that runs unchanged on Firebase Hosting and in a GitHub Pages subfolder. The header and footer are shared fragments loaded on every page, and their links are recalculated from the site root, so nothing breaks when the address changes.",
    result: "", // TODO: agrega un dato real si lo tienes.
    es: {
      kind: "Sitio de producto",
      summary: "Sitio oficial de FoodWizz, un software de inventario para restaurantes pequeños y food trucks. Presenta sus funciones (control de stock en tiempo real, alertas de bajo stock, recetas y reportes de ventas), compara los planes de precio y ofrece la app para descargar.",
      role: "Desarrollo front-end",
      alt: "Página de inicio de FoodWizz: el titular junto a una hamburguesa con sus capas flotando sobre un círculo naranja.",
      note: "",
      problem: "Los restaurantes pequeños y los food trucks necesitan una forma sencilla de controlar su inventario. FoodWizz es un software de inventario hecho para ellos, y su sitio tiene que explicar las funciones, comparar los planes y permitir descargar la app.",
      challenge: "Hacer un solo sitio que funcione sin cambios en Firebase Hosting y en una subcarpeta de GitHub Pages. La cabecera y el pie son fragmentos compartidos que se cargan en cada página, y sus enlaces se recalculan desde la raíz del sitio, así nada se rompe cuando cambia la dirección.",
    }
  },
  {
    title: "Hands",
    kind: "Gesture control web app",
    category: "app",
    featured: true,
    summary: "A web app that recognizes hand gestures in real time through the camera and turns them into 3D particle effects: a beating heart, spheres, an explosion and text messages. Everything runs in the browser, and the video never leaves the device.",
    role: "Front-end development",
    stack: ["JavaScript", "Three.js", "MediaPipe Hands"],
    image: "assets/images/projects/hands.jpg",
    alt: "Hands running in the browser: the word HOLA drawn in blue particles over the camera view, with a guide of gestures along the bottom.",
    demo: "https://jmmm11.github.io/Hands/",
    repo: "https://github.com/JMMM11/Hands",
    note: "The demo asks for camera access to detect your hands.",
    es: {
      kind: "Web app con gestos",
      summary: "Una web app que reconoce los gestos de las manos en tiempo real con la cámara y los convierte en efectos de partículas 3D: un corazón que late, esferas, una explosión y mensajes de texto. Todo corre en el navegador y el video nunca sale del dispositivo.",
      role: "Desarrollo front-end",
      alt: "Hands en el navegador: la palabra HOLA dibujada con partículas azules sobre la cámara, con una guía de gestos abajo.",
      note: "La demo pide acceso a la cámara para detectar tus manos.",
    }
  },
  {
    title: "Bajo el Mismo Cielo",
    kind: "Graduation gift",
    category: "gift",
    featured: false,
    summary: "A graduation gift for someone special: a letter told in chapters under a night sky, with a side index to move between them.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/bajo-el-mismo-cielo.jpg",
    alt: "Title screen in gold lettering over a starry sky, followed by the first chapter of the letter.",
    demo: "https://jmmm11.github.io/My-life/",
    repo: "https://github.com/JMMM11/My-life",
    note: "",
    es: {
      kind: "Regalo de graduación",
      summary: "Un regalo de graduación para alguien especial: una carta contada en capítulos bajo un cielo nocturno, con un índice lateral para moverse entre ellos.",
      role: "Desarrollo front-end",
      alt: "Pantalla de título en letras doradas sobre un cielo estrellado, seguida del primer capítulo de la carta.",
      note: "",
    }
  },
  {
    title: "Jardín de Rosas Amarillas",
    kind: "Digital gift",
    category: "gift",
    featured: false,
    summary: "A bouquet that never wilts: an illustrated, animated garden of yellow roses under the sun, made to be sent as a gift.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/rosas-amarillas.jpg",
    alt: "Illustrated field of yellow roses with a bee and a butterfly under a bright sun.",
    demo: "https://jmmm11.github.io/Roses/",
    repo: "https://github.com/JMMM11/Roses",
    note: "",
    es: {
      kind: "Regalo digital",
      summary: "Un ramo que nunca se marchita: un jardín ilustrado y animado de rosas amarillas bajo el sol, hecho para enviarse como regalo.",
      role: "Desarrollo front-end",
      alt: "Campo ilustrado de rosas amarillas con una abeja y una mariposa bajo un sol brillante.",
      note: "",
    }
  },
  {
    title: "Feliz Navidad",
    kind: "Animated greeting card",
    category: "gift",
    featured: false,
    summary: "A Christmas card for the browser: a tree drawn from thousands of particles, with falling snow and blinking lights.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/navidad.jpg",
    alt: "A Christmas tree made of green particles with a yellow star, snowflakes and colored lights on a dark background.",
    demo: "https://jmmm11.github.io/Navidad/",
    repo: "https://github.com/JMMM11/Navidad",
    note: "",
    es: {
      kind: "Tarjeta animada",
      summary: "Una tarjeta de Navidad para el navegador: un árbol dibujado con miles de partículas, nieve que cae y luces que parpadean.",
      role: "Desarrollo front-end",
      alt: "Un árbol de Navidad hecho de partículas verdes con una estrella amarilla, copos de nieve y luces de colores sobre fondo oscuro.",
      note: "",
    }
  },
  {
    title: "Digital Portfolio",
    kind: "Personal website",
    category: "website",
    featured: false,
    summary: "The site you are reading. Six hand-written pages that share one stylesheet, light and dark themes, two languages and a small set of animations.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript", "Motion"],
    image: "assets/images/projects/digital-portfolio.jpg",
    alt: "Home page of this portfolio with the name Jair M. Morales Magallon and a brain made of triangles.",
    demo: "https://jmmm11.github.io/Digital-Portafolio/",
    repo: "https://github.com/JMMM11/Digital-Portafolio",
    note: "",
    es: {
      kind: "Sitio personal",
      summary: "El sitio que estás leyendo. Seis páginas escritas a mano que comparten una hoja de estilos, tema claro y oscuro, dos idiomas y unas pocas animaciones.",
      role: "Desarrollo front-end",
      alt: "Página de inicio de este portafolio con el nombre Jair M. Morales Magallon y un cerebro hecho de triángulos.",
      note: "",
    }
  }
];
