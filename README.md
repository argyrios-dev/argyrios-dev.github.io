# Argyrios — Portfolio

The [live site](https://argyrios-dev.github.io/) is a visual English-language introduction to Argyrios Gogonas Serrano. It focuses on an approach to building software, three areas of practice and a [verified HarvardX course certificate](https://courses.edx.org/certificates/12af242c911e41d8930627c551fc07af). It does not list individual projects; visitors can explore the public GitHub profile from the site.

## Design and motion

Two original editorial images give the site its dark titanium and champagne visual identity. The hero sculpture pans, scales and rotates in CSS 3D perspective as the visitor scrolls. A second image tilts in 3D as its chapter enters, followed by a slower cinematic image transition in the closing section. Motion respects reduced-motion settings. Three small vector icons and the site mark are original inline/repository SVG assets. No external scripts, fonts, analytics, API requests or build process are needed.

## Run locally

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

The site is hosted from the root of this repository on GitHub Pages.
