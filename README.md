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

## Live projects menu

The **Projects** button opens an accessible search drawer populated from GitHub's public repository API. It lists repositories owned by `argyrios-dev`, excluding the profile README repository, this site repository, and forks. New public repositories appear on the next check, at most five minutes after a successful cached fetch; the refresh button checks immediately. The menu supports pagination up to 500 repositories, search, keyboard focus trapping and Escape to close. If the API is unavailable, it shows the most recent saved list and a direct link to all repositories on GitHub. Private repositories are never included. No token or backend is needed.
