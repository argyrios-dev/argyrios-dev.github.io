# Argyrios — Interactive portfolio

The [live site](https://argyrios-dev.github.io/) is an English-language introduction to Argyrios Gogonas Serrano. It uses a five-chapter narrative instead of a project gallery, with a verified HarvardX course certificate and a link to the public GitHub profile.

## Visual system

The scroll-controlled scene is a 3D icosphere subdivided into 320 faces, rendered with perspective projection and depth-sorted facets. It changes shape across chapters, with orbit paths, particles, pointer parallax and a scroll-position light. The animation uses the Canvas 2D API and no external JavaScript, assets, fonts or build tools. It caps render resolution at 2× device pixel ratio and frame rate at roughly 30 FPS, pauses in hidden tabs and offers a static scene for reduced-motion preferences.

## Run locally

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Files

- `index.html` — semantic content and links
- `styles.css` — layout, typography and responsive presentation
- `scene.js` — scroll interaction and 3D rendering

GitHub Pages publishes the repository root from `main` at `https://argyrios-dev.github.io/`.
