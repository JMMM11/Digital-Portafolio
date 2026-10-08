# Fuentes de los iconos

- **Devicon v2.16.0:** https://github.com/devicons/devicon/tree/v2.16.0/icons — Python, Java, JavaScript, TypeScript, C++, HTML5, CSS3, Git, GitHub, Supabase, Firebase, IntelliJ IDEA, Figma y Visual Studio Code. Licencia MIT incluida en LICENSE.txt.
- **Cursor:** https://cursor.com/brand — símbolo vectorial 2D de sus recursos oficiales; geometría tomada de https://cursor.com/marketing-static/favicon.svg. Se utiliza solo el cubo, sin el fondo del icono de aplicación. La marca pertenece a Anysphere y no queda cubierta por la licencia de Devicon.

## Adaptaciones

Los SVG de esta carpeta son las variantes monocromas para el carrusel. Sus siluetas y espacios negativos se conservan; el relleno claro cambia a oscuro mediante CSS cuando corresponde. GitHub usa su variante original monocroma.

El origami en index.html contiene los vectores inline a color. Los efectos decorativos de degradado y sombra de Supabase, IntelliJ IDEA y Visual Studio Code se sustituyen por colores planos. GitHub y Cursor utilizan tonos neutros que se adaptan a ambos temas. Todos los recursos se sirven localmente: la página no descarga iconos desde un CDN.
