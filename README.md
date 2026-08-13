# argyrios-dev — Project Portfolio

Static and manual portfolio for the public projects of
[`argyrios-dev`](https://github.com/argyrios-dev).

The website currently features:

* [BridgeLock](https://github.com/argyrios-dev/BridgeLock)
* [AirControll](https://github.com/argyrios-dev/AirControll)

## Why This Version Is Manual

The website does not query the GitHub API and does not require GitHub Actions.

This avoids:

* API rate limits.
* Errors caused by anonymous requests.
* Remote JavaScript dependencies.
* Incomplete cards caused by unexpected metadata.
* Automatic changes to the presentation.

Each project is added manually to control:

* Thumbnail.
* Icon.
* Description.
* Tags.
* Website link.
* Source code link.
* Releases link.

## Files

```text
argyrios-dev.github.io/
├── index.html
└── README.md
```

It does not require CSS, JavaScript, Node.js, or any additional dependencies. The
styles and the small animation script are included inside `index.html`.

## Publish With GitHub Pages

Create or use the repository:

```text
argyrios-dev.github.io
```

Place `index.html` and `README.md` in the root of the `main` branch.

Then open:

```text
Settings → Pages
```

Select:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

The website will be published at:

```text
https://argyrios-dev.github.io/
```

## Upload From Terminal

```zsh
cd ~/Downloads
unzip -o argyrios-dev-proyectos-manual.zip
cd argyrios-dev-proyectos-manual

git init
git branch -M main
git add index.html README.md
git commit -m "Create manual projects portfolio"
git remote add origin https://github.com/argyrios-dev/argyrios-dev.github.io.git
git push -u origin main
```

When the repository is already cloned:

```zsh
cp ~/Downloads/argyrios-dev-proyectos-manual/index.html \
  ~/Downloads/argyrios-dev.github.io/index.html

cp ~/Downloads/argyrios-dev-proyectos-manual/README.md \
  ~/Downloads/argyrios-dev.github.io/README.md

cd ~/Downloads/argyrios-dev.github.io
git add index.html README.md
git commit -m "Use manual BridgeLock and AirControll portfolio"
git push
```

## Thumbnails Used

BridgeLock:

```text
https://raw.githubusercontent.com/argyrios-dev/BridgeLock/main/IntroREADME.png
```

AirControll:

```text
https://raw.githubusercontent.com/argyrios-dev/AirControll/main/IntroREADME.png
```

The icons are also loaded directly from each repository.

## Add Another Project Manually

In `index.html`, search for:

```html
<div class="projects-grid">
```

Copy one of the complete blocks:

```html
<article class="project-card reveal">
  ...
</article>
```

Then change:

* Project name.
* Description.
* Thumbnail URL.
* Icon URL.
* Website link.
* Repository link.
* Releases link.
* Tags.

Also update this counter in the hero section:

```html
<strong>2</strong>
```

For example, when adding the third project:

```html
<strong>3</strong>
```

## Dependencies

None.

The website exclusively uses:

* HTML.
* Native CSS.
* Native JavaScript.
* Public images hosted in the repositories.

## Privacy

The website does not contain:

* Analytics.
* Cookies.
* GitHub API.
* Tokens.
* Tracking.
* Forms.
* Requests to third-party services, except for public GitHub images.

## Customization

The main colors are located at the beginning of `index.html`:

```css
:root {
  --bg: #05070d;
  --violet: #9b8cff;
  --cyan: #72dbff;
  --green: #67e6a3;
}
```

The current favicon uses the `argyrios-dev` profile image. It can be changed by
modifying:

```html
<link
  rel="icon"
  type="image/png"
  href="https://github.com/argyrios-dev.png"
>
```
