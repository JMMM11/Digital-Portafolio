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
    note: ""
  },
  {
    title: "Hydronexis",
    kind: "Informational website",
    category: "website",
    featured: true,
    summary: "Website for a hydroponics initiative that helps families and communities grow fresh food at home, with a marketplace section for local exchange.",
    role: "Front-end and back-end development",
    stack: ["HTML", "CSS", "JavaScript"],
    image: "assets/images/projects/hydronexis.jpg",
    alt: "Hydronexis home page: a family tending lettuce in a home hydroponic system.",
    demo: "https://jmmm11.github.io/Hydronexis/livedemo00.template-help.com/wt_prod-10492/theme/index.html",
    repo: "https://github.com/JMMM11/Hydronexis",
    note: ""
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
    note: ""
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
    note: ""
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
    note: ""
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
    note: "The demo asks for camera access to detect your hands."
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
    note: ""
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
    note: ""
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
    note: ""
  },
  {
    title: "Digital Portfolio",
    kind: "Personal website",
    category: "website",
    featured: false,
    summary: "The site you are reading. Six hand-written pages that share one stylesheet, light and dark themes, and a small set of animations.",
    role: "Front-end development",
    stack: ["HTML", "CSS", "JavaScript", "Motion"],
    image: "assets/images/projects/digital-portfolio.jpg",
    alt: "Home page of this portfolio with the name Jair M. Morales Magallon and a brain made of triangles.",
    demo: "https://jmmm11.github.io/Digital-Portafolio/",
    repo: "https://github.com/JMMM11/Digital-Portafolio",
    note: ""
  }
];
