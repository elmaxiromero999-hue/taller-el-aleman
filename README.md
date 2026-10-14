# Landing demo · Taller El Alemán

Página única en HTML + CSS + JS, sin frameworks ni paso de build.

## Cómo abrirla
Doble clic en `index.html` funciona. Para verla igual que en un servidor:

```bash
cd "08-landing/site" && python3 -m http.server 8790
```
y abrir http://127.0.0.1:8790

## Qué tiene de especial
- **Barrido de luz de cabina** sobre el hero al cargar, y el titular que entra línea por línea.
- **Consulta en 10 segundos**: el cliente elige daño, si va con seguro, particular o flota, y su auto. Se arma el mensaje de WhatsApp listo para enviar.
- **Siniestros paso a paso** (escritorio): la foto y el número cambian con el scroll y un auto recorre la línea de progreso. En el celular se ve como lista con foto.
- **Luz de inspección de granizo**: al mover el mouse o el dedo sobre el capot, las bandas de luz se deforman donde hay bollos, igual que en el tablero del sacabollos. Si nadie la toca, recorre el capot sola.
- **Mapa sin rastreo**: Google Maps se carga solo cuando se hace clic.
- Todo respeta `prefers-reduced-motion`. Sin JS, el contenido se ve completo.

## Placeholders (antes de publicar)
- Horario: `[horario a confirmar]` en Contacto y `[a confirmar]` en el horario extendido de granizo.
- Plazo de 72 h para la denuncia (comentario en el HTML).
- 4,4 ★ y +700 reseñas: datos de Google, también en el JSON-LD. Hay que verificarlos.
- Fotos: todas son referencias generadas con Firefly. La galería de Trabajos se reemplaza por antes y después reales.
- `url`, `og:image` y `og:url` absolutos cuando haya dominio.

## Preguntas abiertas para el taller
1. Horario oficial de atención.
2. ¿El plazo de 72 h para denunciar el siniestro es correcto para sus aseguradoras habituales?
3. Fotos reales del taller, del equipo y de trabajos (antes y después).
4. Dominio a usar (ya tienen el mail en `tallerelaleman.com.ar`).
5. Foto de perfil de Instagram: fondo rojo, blanco o negro (ver `04-instagram/variantes-perfil.png`).
