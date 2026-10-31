# Marela Boutique — prototipo multipágina (demo)

Sitio estático y responsive para una boutique femenina **ficticia** llamada «Marela». Es una demo: el nombre de marca, la dirección, los horarios y el WhatsApp son datos de ejemplo.

## Páginas

- `index.html` — inicio. Incluye la sección "Lo nuevo" (tarjetas de prenda con fondo de color que revelan a la modelo al tocarlas) y el bloque "Detrás de Marela".
- `coleccion.html` — colección en 3 categorías (Vestidos, Formales, Casuales), cada una como un carrusel horizontal con flechas y avance automático. La tarjeta central (o las dos centrales, si caben un número par) muestra a la modelo sin necesidad de tocar.
- `estilo.html` — filosofía de marca.
- `contacto.html` — WhatsApp, ubicación y horario (datos de ejemplo).

## Archivos

- `styles.css` — sistema visual y responsive.
- `script.js` — menú móvil, tarjetas interactivas, carrusel de Colección y reveal al hacer scroll.
- `BRAND_GUIDE.md` — criterio visual y de experiencia: paleta, tipografías, formas y animación.
- `assets/` — recortes PNG sin fondo, organizados por categoría (`Vestidos/`, `Formales/`, `Casuales/`). Cada prenda va en pareja: `Nombre - sin fondo.png` (la prenda) y `Nombre modelo - sin fondo.png` (la modelo con la prenda puesta).

## Ejecutar

Puedes abrir `index.html` directamente o servir la carpeta con cualquier servidor estático.

Ejemplo con Python:

```bash
python -m http.server 8000
```

Luego abre `http://localhost:8000`.

## Importante

- Las imágenes de `assets/` son material de ejemplo para la demo. Antes de cualquier uso real, sustitúyelas por fotografía propia o con licencia.
- Inicio y Nuestro estilo cargan dos fotografías remotas de Unsplash, por lo que necesitan conexión a internet.
- «Marela» es un nombre inventado para la demo; no se ha comprobado que esté libre de registro de marca.
