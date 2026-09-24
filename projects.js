'use strict';
(() => {
  const owner = 'argyrios-dev';
  const cacheKey = 'argyrios-public-projects-v1';
  const cacheMs = 5 * 60 * 1000;
  const trigger = document.getElementById('projects-trigger');
  const overlay = document.getElementById('projects-menu');
  const panel = overlay.querySelector('.projects-panel');
  const query = document.getElementById('projects-query');
  const refresh = document.getElementById('projects-refresh');
  const count = document.getElementById('projects-count');
  const status = document.getElementById('projects-status');
  const list = document.getElementById('projects-list');
  let repositories = [];
  let lastFetch = 0;
  let pending = null;
  let previousFocus = null;
  const excluded = new Set([owner.toLowerCase(), `${owner}.github.io`]);

  function getCache() {
    try {
      const data = JSON.parse(localStorage.getItem(cacheKey) || 'null');
      if (Array.isArray(data?.items) && Number.isFinite(data?.time)) return data;
    } catch { /* Storage can be unavailable in private browsing. */ }
    return null;
  }
  function saveCache(items) {
    try { localStorage.setItem(cacheKey, JSON.stringify({time:Date.now(),items})); } catch { /* A live request still works. */ }
  }
  function normalize(items) {
    return items.filter(repo => repo && !repo.fork && !excluded.has(String(repo.name).toLowerCase()) && String(repo.owner?.login).toLowerCase() === owner)
      .map(repo => ({name:String(repo.name),description:typeof repo.description === 'string' ? repo.description : '',language:typeof repo.language === 'string' ? repo.language : '',created_at:repo.created_at || ''}))
      .sort((a,b) => b.created_at.localeCompare(a.created_at));
  }
  function render() {
    const term = query.value.trim().toLocaleLowerCase();
    const matched = repositories.filter(repo => `${repo.name} ${repo.description} ${repo.language}`.toLocaleLowerCase().includes(term));
    count.textContent = `${repositories.length} PUBLIC PROJECT${repositories.length === 1 ? '' : 'S'}`;
    list.replaceChildren();
    if (!matched.length) {
      const message = document.createElement('p');
      message.className = 'projects-empty';
      message.textContent = repositories.length ? 'No projects match that search.' : 'No public repositories to show yet. Open GitHub to see the full list.';
      list.append(message);
      return;
    }
    const fragment = document.createDocumentFragment();
    matched.forEach((repo,index) => {
      const link = document.createElement('a');
      link.className = 'repo';
      link.href = `https://github.com/${owner}/${encodeURIComponent(repo.name)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      const number = document.createElement('span');
      number.className = 'repo-number'; number.textContent = String(index+1).padStart(2,'0');
      const body = document.createElement('div');
      const title = document.createElement('h3'); title.textContent = repo.name;
      const description = document.createElement('p'); description.textContent = repo.description || 'View the source on GitHub.';
      const language = document.createElement('span'); language.className = 'repo-language'; language.textContent = repo.language || 'PUBLIC REPOSITORY';
      const arrow = document.createElement('span'); arrow.className = 'repo-arrow'; arrow.setAttribute('aria-hidden','true'); arrow.textContent = '↗';
      body.append(title,description,language); link.append(number,body,arrow); fragment.append(link);
    });
    list.append(fragment);
  }
  async function fetchRepositories() {
    const all = [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      // The GitHub API returns at most 100 per page. Continue until the last page.
      for (let page=1; page<=5; page++) {
        const url = `https://api.github.com/users/${owner}/repos?type=owner&sort=created&direction=desc&per_page=100&page=${page}`;
        const response = await fetch(url,{signal:controller.signal,headers:{Accept:'application/vnd.github+json'}});
        if (!response.ok) throw new Error(`GitHub API ${response.status}`);
        const batch = await response.json();
        if (!Array.isArray(batch)) throw new Error('Unexpected GitHub response');
        all.push(...batch);
        if (batch.length < 100) break;
      }
      return normalize(all);
    } finally { clearTimeout(timeout); }
  }
  async function load(force=false) {
    if (pending) return pending;
    const cache = getCache();
    if (!force && cache && Date.now()-cache.time<cacheMs) {
      repositories=cache.items;lastFetch=cache.time;status.textContent='UP TO DATE';render();return;
    }
    if (!force && lastFetch && Date.now()-lastFetch<cacheMs) { status.textContent='UP TO DATE';render();return; }
    status.textContent='CHECKING GITHUB...';refresh.disabled=true;
    pending=(async()=>{
      try {
        repositories=await fetchRepositories();
        lastFetch=Date.now();saveCache(repositories);
        status.textContent='UP TO DATE';render();
      } catch {
        if (cache?.items?.length) { repositories=cache.items;lastFetch=cache.time;status.textContent='SHOWING SAVED LIST';render(); }
        else { status.textContent='GITHUB UNAVAILABLE';render(); }
      } finally { pending=null;refresh.disabled=false; }
    })();
    return pending;
  }
  function open() {
    previousFocus=document.activeElement;
    overlay.hidden=false;trigger.setAttribute('aria-expanded','true');document.body.classList.add('projects-open');
    query.focus();load();
  }
  function close() {
    overlay.hidden=true;trigger.setAttribute('aria-expanded','false');document.body.classList.remove('projects-open');
    if (previousFocus instanceof HTMLElement) previousFocus.focus();
  }
  trigger.addEventListener('click',()=>overlay.hidden?open():close());
  overlay.querySelectorAll('[data-close-projects]').forEach(button=>button.addEventListener('click',close));
  query.addEventListener('input',render);
  refresh.addEventListener('click',()=>load(true));
  document.addEventListener('keydown',event=>{
    if (overlay.hidden) return;
    if (event.key==='Escape') {event.preventDefault();close();return;}
    if (event.key!=='Tab') return;
    const focusable=[...panel.querySelectorAll('button:not([disabled]),input,a[href]')];
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}
  });
  setInterval(()=>{if(!overlay.hidden && Date.now()-lastFetch>=cacheMs) load();},60_000);
})();
