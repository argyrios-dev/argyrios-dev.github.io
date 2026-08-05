"use strict";

const CONFIGURATION = Object.freeze({
  githubUser: "argyrios-dev",
  apiRoot: "https://api.github.com",
  repositoriesPerPage: 100,
  maximumApiPages: 10,
  cardsInitiallyVisible: 8,
  cardsPerLoad: 8,
  cacheKey: "argyrios-dev-public-projects-v4",
  cacheDurationMilliseconds: 30 * 60 * 1000,
  excludedRepositories: new Set([
    "argyrios-dev.github.io"
  ])
});

const elements = Object.freeze({
  repositoryCount: document.getElementById("repositoryCount"),
  pagesCount: document.getElementById("pagesCount"),
  totalStars: document.getElementById("totalStars"),
  lastRefresh: document.getElementById("lastRefresh"),
  searchInput: document.getElementById("searchInput"),
  projectFilter: document.getElementById("projectFilter"),
  projectSort: document.getElementById("projectSort"),
  activeFilters: document.getElementById("activeFilters"),
  projectsGrid: document.getElementById("projectsGrid"),
  loadMoreWrap: document.getElementById("loadMoreWrap"),
  loadMoreButton: document.getElementById("loadMoreButton"),
  projectTemplate: document.getElementById("projectTemplate"),
  currentYear: document.getElementById("currentYear")
});

const state = {
  repositories: [],
  visibleRepositoryCount: CONFIGURATION.cardsInitiallyVisible,
  searchQuery: "",
  filter: "all",
  sort: "updated"
};

elements.currentYear.textContent = String(new Date().getFullYear());

function isValidHTTPURL(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  try {
    const parsedURL = new URL(value);
    return parsedURL.protocol === "http:" || parsedURL.protocol === "https:";
  } catch {
    return false;
  }
}

function pagesURL(repository) {
  const user = CONFIGURATION.githubUser;
  const repositoryName = repository.name;

  if (repositoryName.toLowerCase() === `${user}.github.io`.toLowerCase()) {
    return `https://${user}.github.io/`;
  }

  return `https://${user}.github.io/${encodeURIComponent(repositoryName)}/`;
}

function websiteURL(repository) {
  if (isValidHTTPURL(repository.homepage)) {
    return repository.homepage.trim();
  }

  if (repository.has_pages === true) {
    return pagesURL(repository);
  }

  return null;
}

function isVisiblePublicRepository(repository) {
  return (
    repository &&
    repository.visibility === "public" &&
    repository.private === false &&
    repository.fork === false &&
    repository.archived === false &&
    repository.disabled === false &&
    !CONFIGURATION.excludedRepositories.has(repository.name)
  );
}

function formatCompactNumber(value) {
  const number = Number(value) || 0;

  return new Intl.NumberFormat("en", {
    notation: number >= 1000 ? "compact" : "standard",
    maximumFractionDigits: 1
  }).format(number);
}

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function daysSince(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return (Date.now() - date.getTime()) / 86_400_000;
}

function projectImageURL(repository) {
  const revision = encodeURIComponent(
    repository.pushed_at ||
    repository.updated_at ||
    repository.created_at ||
    "latest"
  );

  return (
    `https://opengraph.githubassets.com/${revision}/` +
    `${repository.full_name}`
  );
}

function repositorySearchText(repository) {
  return [
    repository.name,
    repository.description,
    repository.language,
    repository.homepage,
    ...(Array.isArray(repository.topics) ? repository.topics : [])
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterRepository(repository) {
  const queryMatches =
    state.searchQuery === "" ||
    repositorySearchText(repository).includes(state.searchQuery);

  if (!queryMatches) {
    return false;
  }

  switch (state.filter) {
    case "website":
      return websiteURL(repository) !== null;

    case "source":
      return websiteURL(repository) === null;

    case "swift":
      return String(repository.language || "").toLowerCase() === "swift";

    case "recent":
      return daysSince(repository.pushed_at || repository.updated_at) <= 90;

    case "all":
    default:
      return true;
  }
}

function sortRepositories(repositories) {
  return [...repositories].sort((left, right) => {
    switch (state.sort) {
      case "created":
        return (
          new Date(right.created_at).getTime() -
          new Date(left.created_at).getTime()
        );

      case "stars":
        return (
          Number(right.stargazers_count || 0) -
          Number(left.stargazers_count || 0)
        );

      case "name":
        return left.name.localeCompare(right.name, "en", {
          sensitivity: "base"
        });

      case "updated":
      default:
        return (
          new Date(right.pushed_at || right.updated_at).getTime() -
          new Date(left.pushed_at || left.updated_at).getTime()
        );
    }
  });
}

function filteredAndSortedRepositories() {
  return sortRepositories(state.repositories.filter(filterRepository));
}

function setText(element, value) {
  element.textContent = String(value);
}

function buildTopic(topicName) {
  const element = document.createElement("span");
  element.className = "topic";
  element.textContent = topicName;
  return element;
}

function buildProjectCard(repository) {
  const fragment = elements.projectTemplate.content.cloneNode(true);
  const card = fragment.querySelector(".project-card");
  const visualLink = fragment.querySelector(".project-visual");
  const image = fragment.querySelector(".project-image");
  const status = fragment.querySelector(".project-status");
  const languageBadge = fragment.querySelector(".project-language-badge");
  const title = fragment.querySelector(".project-title");
  const description = fragment.querySelector(".project-description");
  const stars = fragment.querySelector(".project-stars");
  const forks = fragment.querySelector(".project-forks");
  const updated = fragment.querySelector(".project-updated");
  const topics = fragment.querySelector(".project-topics");
  const websiteLink = fragment.querySelector(".project-website");
  const sourceLink = fragment.querySelector(".project-source");

  const website = websiteURL(repository);
  const primaryURL = website || repository.html_url;

  card.dataset.repository = repository.name.toLowerCase();

  visualLink.href = primaryURL;
  image.src = projectImageURL(repository);
  image.alt = `${repository.name} repository preview`;
  image.addEventListener("error", () => {
    image.removeAttribute("src");
    image.alt = "";
  }, { once: true });

  status.textContent = website ? "Website available" : "Public repository";
  languageBadge.textContent = repository.language || "Open source";
  title.textContent = repository.name;
  description.textContent =
    repository.description ||
    "An open-source project by argyrios-dev.";

  stars.textContent = `★ ${formatCompactNumber(repository.stargazers_count)}`;
  forks.textContent = `⑂ ${formatCompactNumber(repository.forks_count)}`;
  updated.textContent = `Updated ${formatDate(
    repository.pushed_at || repository.updated_at
  )}`;

  const repositoryTopics = Array.isArray(repository.topics)
    ? repository.topics.slice(0, 5)
    : [];

  if (repositoryTopics.length === 0) {
    topics.append(buildTopic(repository.language || "project"));
  } else {
    repositoryTopics.forEach((topic) => {
      topics.append(buildTopic(topic));
    });
  }

  if (website) {
    websiteLink.href = website;
  } else {
    websiteLink.remove();
  }

  sourceLink.href = repository.html_url;

  return fragment;
}

function renderEmptyState() {
  elements.projectsGrid.replaceChildren();

  const stateCard = document.createElement("div");
  stateCard.className = "state-card";

  const title = document.createElement("strong");
  title.textContent = "No matching projects.";

  const message = document.createElement("span");
  message.textContent = "Try a different search or filter.";

  stateCard.append(title, message);
  elements.projectsGrid.append(stateCard);
  elements.loadMoreWrap.hidden = true;
}

function renderProjects() {
  const repositories = filteredAndSortedRepositories();

  if (repositories.length === 0) {
    renderEmptyState();
    updateActiveFilterDescription(0);
    return;
  }

  const visibleRepositories = repositories.slice(
    0,
    state.visibleRepositoryCount
  );

  const fragment = document.createDocumentFragment();

  visibleRepositories.forEach((repository) => {
    fragment.append(buildProjectCard(repository));
  });

  elements.projectsGrid.replaceChildren(fragment);

  const remaining = repositories.length - visibleRepositories.length;
  elements.loadMoreWrap.hidden = remaining <= 0;

  if (remaining > 0) {
    elements.loadMoreButton.textContent =
      `Show more projects (${remaining} remaining)`;
  }

  updateActiveFilterDescription(repositories.length);
}

function updateActiveFilterDescription(resultCount) {
  const descriptions = [];

  if (state.searchQuery !== "") {
    descriptions.push(`search: “${elements.searchInput.value.trim()}”`);
  }

  if (state.filter !== "all") {
    const label =
      elements.projectFilter.options[
        elements.projectFilter.selectedIndex
      ].textContent;
    descriptions.push(label.toLowerCase());
  }

  if (descriptions.length === 0) {
    elements.activeFilters.hidden = true;
    elements.activeFilters.textContent = "";
    return;
  }

  elements.activeFilters.hidden = false;
  elements.activeFilters.textContent =
    `${resultCount} result${resultCount === 1 ? "" : "s"} · ` +
    descriptions.join(" · ");
}

function updateStatistics() {
  const websiteCount = state.repositories.filter(
    (repository) => websiteURL(repository) !== null
  ).length;

  const starCount = state.repositories.reduce(
    (total, repository) =>
      total + Number(repository.stargazers_count || 0),
    0
  );

  setText(elements.repositoryCount, state.repositories.length);
  setText(elements.pagesCount, websiteCount);
  setText(elements.totalStars, formatCompactNumber(starCount));
  setText(
    elements.lastRefresh,
    new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric"
    }).format(new Date())
  );
}

function readCache() {
  try {
    const rawValue = localStorage.getItem(CONFIGURATION.cacheKey);

    if (!rawValue) {
      return null;
    }

    const cache = JSON.parse(rawValue);

    if (
      typeof cache !== "object" ||
      cache === null ||
      !Array.isArray(cache.repositories) ||
      typeof cache.savedAt !== "number" ||
      Date.now() - cache.savedAt >
        CONFIGURATION.cacheDurationMilliseconds
    ) {
      return null;
    }

    return cache.repositories;
  } catch {
    return null;
  }
}

function writeCache(repositories) {
  try {
    localStorage.setItem(
      CONFIGURATION.cacheKey,
      JSON.stringify({
        savedAt: Date.now(),
        repositories
      })
    );
  } catch {
    // The site remains functional when local storage is unavailable.
  }
}

async function fetchRepositoryPage(pageNumber) {
  const query = new URLSearchParams({
    type: "owner",
    sort: "updated",
    direction: "desc",
    per_page: String(CONFIGURATION.repositoriesPerPage),
    page: String(pageNumber)
  });

  const endpoint =
    `${CONFIGURATION.apiRoot}/users/` +
    `${encodeURIComponent(CONFIGURATION.githubUser)}/repos?${query}`;

  const response = await fetch(endpoint, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    const error = new Error(
      `GitHub API request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.rateLimitRemaining =
      response.headers.get("x-ratelimit-remaining");

    throw error;
  }

  const repositories = await response.json();

  if (!Array.isArray(repositories)) {
    throw new Error("GitHub returned an unexpected response.");
  }

  return repositories;
}

async function fetchAllPublicRepositories() {
  const repositories = [];

  for (
    let page = 1;
    page <= CONFIGURATION.maximumApiPages;
    page += 1
  ) {
    const pageRepositories = await fetchRepositoryPage(page);
    repositories.push(...pageRepositories);

    if (
      pageRepositories.length <
      CONFIGURATION.repositoriesPerPage
    ) {
      break;
    }
  }

  return repositories.filter(isVisiblePublicRepository);
}

function useRepositories(repositories) {
  state.repositories = repositories;
  state.visibleRepositoryCount =
    CONFIGURATION.cardsInitiallyVisible;

  updateStatistics();
  renderProjects();
}

function renderLoadingError(error) {
  elements.projectsGrid.replaceChildren();

  const stateCard = document.createElement("div");
  stateCard.className = "state-card";

  const title = document.createElement("strong");
  const message = document.createElement("span");
  const profileLink = document.createElement("a");

  const rateLimited =
    error &&
    (error.status === 403 ||
      error.rateLimitRemaining === "0");

  title.textContent = rateLimited
    ? "GitHub API limit reached."
    : "Projects could not be loaded.";

  message.textContent = rateLimited
    ? "GitHub limits anonymous API requests. Try again later."
    : "The GitHub API may be temporarily unavailable.";

  profileLink.className = "button button-secondary";
  profileLink.href =
    `https://github.com/${CONFIGURATION.githubUser}` +
    "?tab=repositories";
  profileLink.target = "_blank";
  profileLink.rel = "noreferrer";
  profileLink.textContent = "View repositories on GitHub ↗";

  stateCard.append(title, message, profileLink);
  elements.projectsGrid.append(stateCard);
  elements.loadMoreWrap.hidden = true;
}

function resetVisibleCountAndRender() {
  state.visibleRepositoryCount =
    CONFIGURATION.cardsInitiallyVisible;
  renderProjects();
}

function installEventListeners() {
  elements.searchInput.addEventListener("input", () => {
    state.searchQuery =
      elements.searchInput.value.trim().toLowerCase();
    resetVisibleCountAndRender();
  });

  elements.projectFilter.addEventListener("change", () => {
    state.filter = elements.projectFilter.value;
    resetVisibleCountAndRender();
  });

  elements.projectSort.addEventListener("change", () => {
    state.sort = elements.projectSort.value;
    resetVisibleCountAndRender();
  });

  elements.loadMoreButton.addEventListener("click", () => {
    state.visibleRepositoryCount +=
      CONFIGURATION.cardsPerLoad;
    renderProjects();
  });
}

async function initialize() {
  installEventListeners();

  const cachedRepositories = readCache();

  if (cachedRepositories) {
    useRepositories(cachedRepositories);
  }

  try {
    const repositories = await fetchAllPublicRepositories();
    writeCache(repositories);
    useRepositories(repositories);
  } catch (error) {
    if (!cachedRepositories) {
      renderLoadingError(error);
    }

    console.error("Unable to refresh GitHub repositories:", error);
  }
}

initialize();
