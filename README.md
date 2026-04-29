# epayco-assets
Recursos graficos de ePayco.

## Carouseles embebibles (GitHub Pages)

Se agrego una pagina lista para iframe en:

- `carousel/index.html`

Esta pagina renderiza dos carouseles:

- Version para fondo claro
- Version para fondo oscuro
- Usa marcos SVG oficiales:
  - `carousel/frames/container_carousel_blanco.svg` (logos oscuros para fondos claros)
  - `carousel/frames/container_carousel_oscuro.svg` (logos claros para fondos oscuros)

### Como insertar en cualquier plataforma

Usa un iframe apuntando a tu GitHub Pages:

```html
<iframe
  src="https://TU-USUARIO.github.io/epayco-assets/carousel/?view=both&branch=main"
  width="100%"
  height="170"
  style="border:0;overflow:hidden"
  loading="lazy"
  referrerpolicy="no-referrer"
></iframe>
```

Tambien puedes usar:

- `view=light` (solo claro)
- `view=dark` (solo oscuro)
- `view=both` (ambos, por defecto)

### Carga automatica de logos

El carrusel consulta GitHub API y lista automaticamente los archivos de:

- `carousel/logos/light`
- `carousel/logos/dark`

Estructura recomendada:

- `carousel/index.html` (pagina embebible en iframe)
- `carousel/iframe-carousel.js` (logica de carga y animacion)
- `carousel/iframe-carousel.css` (estilos)
- `carousel/frames/container_carousel_blanco.svg` (marco para fondo claro)
- `carousel/frames/container_carousel_oscuro.svg` (marco para fondo oscuro)
- `carousel/logos/light` (logos oscuros)
- `carousel/logos/dark` (logos claros)

Formatos soportados: `.svg`, `.png`, `.jpg`, `.jpeg`, `.webp`.

Para publicar nuevos logos solo debes:

1. Subir archivos a esas carpetas
2. Hacer push a `main`
3. GitHub Pages los mostrara sin tocar codigo del carrusel

### Parametros avanzados

Puedes sobreescribir rutas y datos del repo con query params:

- `owner`
- `repo`
- `branch`
- `lightPath`
- `darkPath`
- `refresh` (minutos para recargar logos, por defecto 10)

Ejemplo:

`.../carousel/?view=both&owner=TU-USUARIO&repo=epayco-assets&branch=main&lightPath=carousel/logos/light&darkPath=carousel/logos/dark`
