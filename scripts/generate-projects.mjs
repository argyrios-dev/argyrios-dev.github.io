#!/usr/bin/env node

import { writeFile } from "node:fs/promises";

const USERNAME = "argyrios-dev";
const EXCLUDED_REPOSITORIES = new Set([
  "argyrios-dev.github.io"
]);

const API_ROOT = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  throw new Error("GITHUB_TOKEN is required.");
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${TOKEN}`,
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": `${USERNAME}-portfolio-generator`
};

function encodePath(value) {
  return String(value)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function isHTTPURL(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function pagesURL(repository) {
  if (
    repository.name.toLowerCase() ===
    `${USERNAME}.github.io`.toLowerCase()
  ) {
    return `https://${USERNAME}.github.io/`;
  }

  return (
    `https://${USERNAME}.github.io/` +
    `${encodeURIComponent(repository.name)}/`
  );
}

function projectURL(repository) {
  if (repository.has_pages === true) {
    return pagesURL(repository);
  }

  if (isHTTPURL(repository.homepage)) {
    return repository.homepage.trim();
  }

  return repository.html_url;
}

async function githubJSON(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub request failed (${response.status}): ${body}`
    );
  }

  return response.json();
}

async function fetchRepositories() {
  const repositories = [];

  for (let page = 1; page <= 10; page += 1) {
    const parameters = new URLSearchParams({
      type: "owner",
      sort: "updated",
      direction: "desc",
      per_page: "100",
      page: String(page)
    });

    const batch = await githubJSON(
      `${API_ROOT}/users/${encodeURIComponent(USERNAME)}/repos?${parameters}`
    );

    repositories.push(...batch);

    if (batch.length < 100) {
      break;
    }
  }

  return repositories.filter((repository) => (
    repository.private === false &&
    repository.fork === false &&
    repository.archived === false &&
    repository.disabled === false &&
    !EXCLUDED_REPOSITORIES.has(repository.name)
  ));
}

async function fetchReadme(repository) {
  const endpoint =
    `${API_ROOT}/repos/${encodeURIComponent(USERNAME)}/` +
    `${encodeURIComponent(repository.name)}/readme`;

  const response = await fetch(endpoint, {
    headers: {
      ...headers,
      Accept: "application/vnd.github.raw+json"
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `README request failed for ${repository.name}: ${response.status}`
    );
  }

  const contentLocation = response.headers.get("content-location");
  const text = await response.text();

  const rawBase =
    contentLocation && isHTTPURL(contentLocation)
      ? contentLocation
      : (
          `https://raw.githubusercontent.com/${USERNAME}/` +
          `${encodeURIComponent(repository.name)}/` +
          `${encodePath(repository.default_branch || "main")}/README.md`
        );

  return { text, rawBase };
}

function extractFirstImage(markdown) {
  const candidates = [];
  const markdownPattern =
    /!\[[^\]]*]\(\s*<?([^)\s>]+)(?:\s+["'][^"']*["'])?>?\s*\)/gi;
  const htmlPattern =
    /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;

  let match;

  while ((match = markdownPattern.exec(markdown)) !== null) {
    candidates.push({ index: match.index, source: match[1] });
  }

  while ((match = htmlPattern.exec(markdown)) !== null) {
    candidates.push({ index: match.index, source: match[1] });
  }

  candidates.sort((left, right) => left.index - right.index);

  return candidates[0]?.source?.trim() ?? null;
}

function normalizeImageURL(source, repository, rawBase) {
  if (!source) {
    return null;
  }

  let value = source
    .trim()
    .replace(/^<|>$/g, "")
    .replaceAll("&amp;", "&");

  if (
    value.startsWith("data:") ||
    value.startsWith("javascript:") ||
    value.startsWith("#")
  ) {
    return null;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  if (isHTTPURL(value)) {
    const url = new URL(value);

    if (
      url.hostname === "github.com" &&
      url.pathname.includes("/blob/")
    ) {
      return url.href
        .replace("https://github.com/", "https://raw.githubusercontent.com/")
        .replace("/blob/", "/");
    }

    return url.href;
  }

  try {
    return new URL(value, rawBase).href;
  } catch {
    return (
      `https://raw.githubusercontent.com/${USERNAME}/` +
      `${encodeURIComponent(repository.name)}/` +
      `${encodePath(repository.default_branch || "main")}/` +
      `${value.replace(/^\.?\//, "")}`
    );
  }
}

async function enrichRepository(repository) {
  let previewURL = null;

  try {
    const readme = await fetchReadme(repository);

    if (readme) {
      previewURL = normalizeImageURL(
        extractFirstImage(readme.text),
        repository,
        readme.rawBase
      );
    }
  } catch (error) {
    console.warn(error.message);
  }

  return {
    id: repository.id,
    name: repository.name,
    full_name: repository.full_name,
    html_url: repository.html_url,
    description: repository.description,
    homepage: repository.homepage,
    has_pages: repository.has_pages,
    default_branch: repository.default_branch,
    language: repository.language,
    topics: repository.topics ?? [],
    stargazers_count: repository.stargazers_count,
    forks_count: repository.forks_count,
    created_at: repository.created_at,
    updated_at: repository.updated_at,
    pushed_at: repository.pushed_at,
    project_url: projectURL(repository),
    preview_url: previewURL
  };
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;

      if (index >= values.length) {
        return;
      }

      results[index] = await mapper(values[index], index);
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, values.length) },
      () => worker()
    )
  );

  return results;
}

const repositories = await fetchRepositories();
const enriched = await mapWithConcurrency(
  repositories,
  5,
  enrichRepository
);

const payload = {
  schema_version: 1,
  generated_at: new Date().toISOString(),
  username: USERNAME,
  repository_count: enriched.length,
  repositories: enriched
};

await writeFile(
  "projects.json",
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8"
);

console.log(
  `Generated projects.json with ${enriched.length} repositories.`
);
