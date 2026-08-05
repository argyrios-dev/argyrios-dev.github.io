# argyrios-dev.github.io

A self-updating portfolio for all public repositories owned by
[`argyrios-dev`](https://github.com/argyrios-dev).

## How automatic discovery works

The website reads the public GitHub REST API directly in the visitor's browser.

Every repository appears automatically when it is:

- Public
- Owned by `argyrios-dev`
- Not a fork
- Not archived
- Not disabled

A repository does **not** need GitHub Pages or a Website field to appear.

When GitHub Pages is enabled or the repository has a valid **Website** URL,
the card also displays an **Open website** button. Otherwise, the card links
to the source repository.

The portfolio repository itself, `argyrios-dev.github.io`, is excluded to
avoid listing the website as one of its own projects.

## Files

```text
argyrios-dev.github.io/
├── index.html
├── style.css
├── app.js
├── .nojekyll
├── README.md
└── LICENSE
```

## Publish with GitHub Pages

1. Create a public repository named exactly:

   ```text
   argyrios-dev.github.io
   ```

2. Upload every file in this project to the repository root.

3. Open:

   ```text
   Settings → Pages
   ```

4. Configure:

   ```text
   Source: Deploy from a branch
   Branch: main
   Folder: / (root)
   ```

5. Open:

   ```text
   https://argyrios-dev.github.io/
   ```

No GitHub Actions workflow is required.

## Automatic updates

You do not need to edit this website when creating another repository.

A new public repository is loaded from GitHub automatically when the website
is opened. Results are cached in the visitor's browser for 30 minutes to avoid
unnecessary GitHub API requests.

To force an immediate refresh while testing:

- Open the site in a private browser window, or
- Clear the site's local storage, or
- Wait 30 minutes.

## Project websites

To add an **Open website** button to a project card, use either option:

### GitHub Pages

Enable GitHub Pages in the project's repository settings.

### External website

Open the repository page, edit the **About** section and put the complete URL
in the **Website** field.

## Configuration

The main settings are at the top of `app.js`:

```js
const CONFIGURATION = Object.freeze({
  githubUser: "argyrios-dev",
  repositoriesPerPage: 100,
  maximumApiPages: 10,
  cardsInitiallyVisible: 8,
  cardsPerLoad: 8
});
```

To hide another repository, add its exact name here:

```js
excludedRepositories: new Set([
  "argyrios-dev.github.io",
  "Repository-To-Hide"
])
```

## GitHub API limit

GitHub allows anonymous public API requests with a rate limit based on the
visitor's IP address. The site caches successful results for 30 minutes and
falls back to the cached copy when a refresh fails.

## License

Copyright © 2026 argyrios-dev.

Licensed under the Mozilla Public License 2.0.
