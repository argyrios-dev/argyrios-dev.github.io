# Argyrios — Interactive portfolio

The [live portfolio](https://argyrios-dev.github.io/) is an English-language résumé for Argyrios Gogonas Serrano. It presents selected open-source software and a verified HarvardX course certificate.

The background is a perspective-projected 3D network that rotates as the page scrolls. It uses Canvas 2D and native JavaScript, with no third-party runtime dependencies, build step, analytics or GitHub API requests. Scroll updates are scheduled with `requestAnimationFrame`; canvas resolution is capped at 2× device pixel ratio. Reduced-motion preferences stop the rotation and reveal content immediately.

## Run locally

Open `index.html` in a browser, or serve the repository root:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/`.

## Publish

This repository is the GitHub Pages user site for [`argyrios-dev`](https://github.com/argyrios-dev). Pages can deploy the root of `main` at `https://argyrios-dev.github.io/`.

## Update content

Project links and descriptions are maintained directly in `index.html`. Credential verification links point to the edX certificate page. Contact links point to the public GitHub profile.
