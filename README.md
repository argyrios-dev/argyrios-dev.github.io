# argyrios-dev Automated Portfolio

A self-updating GitHub Pages portfolio with no visitor-side GitHub API limit.

## Why this version avoids API limits

The browser does not call the GitHub REST API.

A GitHub Actions workflow uses the repository's built-in `GITHUB_TOKEN` to
generate a static `projects.json` file. The website only downloads that file.

This prevents visitors from consuming GitHub's anonymous API allowance.

## Automatic updates

The workflow runs:

- Whenever `main` receives a push
- Every six hours
- Manually through the Actions tab

It finds every public repository owned by `argyrios-dev`, excludes
`argyrios-dev.github.io`, reads the first image from each README, and writes
the result to `projects.json`.

## Required repository setting

Open:

```text
Settings → Actions → General → Workflow permissions
```

Select:

```text
Read and write permissions
```

Save the setting.

The workflow needs this permission to commit the generated `projects.json`.

## First run

Open:

```text
Actions → Update Portfolio Data → Run workflow
```

Run it on `main`.

After the workflow succeeds, `projects.json` will contain all public projects.

## GitHub Pages

Open:

```text
Settings → Pages
```

Choose:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

The site will be available at:

```text
https://argyrios-dev.github.io/
```

## Files

```text
index.html
projects.json
scripts/generate-projects.mjs
.github/workflows/update-projects.yml
README.md
```

## Update frequency

The workflow currently runs every six hours:

```yaml
schedule:
  - cron: "17 */6 * * *"
```

You can also run it manually immediately after creating a repository.
