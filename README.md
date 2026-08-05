# argyrios-dev Automated Portfolio

A fully automated, single-page portfolio website for
[`argyrios-dev`](https://github.com/argyrios-dev).

The site uses Tailwind CSS and native JavaScript to discover public GitHub
repositories, render project cards, extract preview images from repository
README files, and choose the best destination URL for every project.

No project list is maintained manually.

## Features

- Fully automated public repository discovery
- Responsive one, two and three-column project grid
- High-end dark interface with neon violet, cyan and emerald gradients
- Smooth card elevation, scale and border-glow animations
- Search, filtering, sorting and progressive loading
- Repository language, stars, forks, topics and update date
- Animated loading skeletons
- README image preview extraction
- Elegant generated SVG placeholders
- GitHub Pages and homepage URL detection
- Browser caching and stale-data fallback
- Concurrency-limited README requests
- No framework runtime beyond Tailwind's browser package
- No build system required
- No analytics or tracking

## Files

```text
argyrios-dev.github.io/
├── index.html
└── README.md
```

## How the automation works

### 1. Repository discovery

The page requests public repositories from:

```text
https://api.github.com/users/argyrios-dev/repos
```

It uses pagination with up to 100 repositories per request and orders the
results by the most recently updated repository.

The portfolio repository itself is excluded:

```text
argyrios-dev.github.io
```

Every other public repository returned by GitHub is displayed automatically.

### 2. Project destination logic

The **View Project** button uses this priority:

1. GitHub Pages, when `repo.has_pages` is `true`
2. The repository `homepage` value, when it contains a valid HTTP or HTTPS URL
3. The normal GitHub repository URL from `repo.html_url`

Project GitHub Pages URLs are generated as:

```text
https://argyrios-dev.github.io/REPOSITORY-NAME/
```

The special user-site repository would use:

```text
https://argyrios-dev.github.io/
```

The portfolio repository is excluded from the cards, so it does not list
itself.

### 3. README preview extraction

For each visible repository, the site attempts to fetch its README from the
repository's actual default branch.

It first tries these common filenames through raw GitHub content:

```text
README.md
Readme.md
readme.md
README.MD
```

If those direct requests fail, it uses GitHub's repository README endpoint as
a fallback.

The parser locates the first image in document order from either syntax:

```md
![Alternative text](image-url)
```

or:

```html
<img src="image-url">
```

Relative image paths such as these are resolved against the raw README URL:

```text
IntroREADME.png
./Assets/banner.png
../shared/preview.png
```

GitHub `blob` image links are converted to raw-content links where possible.

When no usable image exists, the page creates a repository-specific dark SVG
placeholder containing the repository name and primary language.

README requests run through a small concurrency queue, preventing the browser
from requesting every README simultaneously.

### 4. Caching

Repository metadata is cached in the visitor's browser for 30 minutes.

Discovered preview image URLs are cached for 24 hours.

The cached repository list is rendered immediately and refreshed in the
background. If GitHub is temporarily unavailable, a valid cached copy remains
usable.

## GitHub API limits

The website uses GitHub's unauthenticated public API and does not place a
personal access token in frontend code.

GitHub applies an anonymous API limit based on the visitor's IP address.
Repository caching and direct raw README requests keep API usage low.

Never embed a private GitHub token in `index.html`. Any token placed in a
public frontend can be read by visitors.

## Publish with GitHub Pages

### 1. Create the repository

Create a public repository named exactly:

```text
argyrios-dev.github.io
```

### 2. Upload the files

Place these files in the root of the repository:

```text
index.html
README.md
```

### 3. Enable Pages

Open the repository on GitHub and go to:

```text
Settings → Pages
```

Under **Build and deployment**, choose:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

Save the configuration.

The portfolio will be published at:

```text
https://argyrios-dev.github.io/
```

No GitHub Actions workflow is required for this static deployment.

## Upload from Terminal

```bash
cd ~/Downloads
unzip argyrios-dev-automated-portfolio.zip
cd argyrios-dev-automated-portfolio

git init
git branch -M main
git add index.html README.md
git commit -m "Create automated project portfolio"
git remote add origin https://github.com/argyrios-dev/argyrios-dev.github.io.git
git push -u origin main
```

## Automatic future projects

After the portfolio is published, create any new public repository under
`argyrios-dev`.

The new repository will appear automatically when the page obtains refreshed
GitHub data. Because repository metadata is cached for 30 minutes, an existing
visitor may need to wait for the cache to expire.

For immediate testing:

- Open the portfolio in a private browser window
- Clear local storage for the portfolio domain
- Or wait 30 minutes

No portfolio code needs to be edited.

## Adding a live project website

A repository appears even when it only contains source code.

To make its card open a deployed website, use one of these methods.

### Enable GitHub Pages

Open the project repository and configure GitHub Pages under:

```text
Settings → Pages
```

### Add an external homepage

On the repository page, edit the **About** section and enter the complete
public URL in the **Website** field.

When both Pages and a homepage are present, the Pages URL has priority, as
required by the portfolio URL logic.

## Customization

The configuration is near the bottom of `index.html`:

```js
const CONFIG = Object.freeze({
  username: "argyrios-dev",
  excludedRepository: "argyrios-dev.github.io",
  initialCards: 9,
  cardsPerLoad: 9,
  previewConcurrency: 4
});
```

You can adjust:

- Number of initially visible cards
- Number of cards loaded per click
- Cache durations
- README request concurrency
- Username
- Excluded repository

All visible interface text is also contained in `index.html`.

## Tailwind CSS

The project uses Tailwind CSS 4 through the official browser package so the
portfolio remains a single HTML file with no Node.js build step.

For a stricter production pipeline, Tailwind recommends compiling a static CSS
file with the CLI or another build integration instead of using the browser
package. The supplied version is intentionally optimized for immediate,
zero-build GitHub Pages deployment.

## Security

- Only public GitHub data is requested
- No credentials are stored
- No token is embedded
- No analytics are installed
- Repository text is assigned through safe DOM APIs
- User-controlled metadata is not inserted with `innerHTML`
- External project links open with `rel="noreferrer"`

## License

Choose and add the license that you want for this portfolio repository.

The generated website code may be adapted to match your personal brand.
