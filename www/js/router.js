// Router por hash. El botón "atrás" de Android navega por el historial,
// así que cada pantalla puede definir un "guard" que confirma antes de salir.
import { closeAllDialogs } from './ui.js';

const routes = [];
let active = null; // { path, guard, cleanup }
let renderToken = 0;
let onRouteChange = () => {};

export function route(pattern, handler, options = {}) {
  const keys = [];
  const source = pattern.replace(/:([a-zA-Z]+)/g, (_, key) => {
    keys.push(key);
    return '([^/]+)';
  });
  routes.push({ regex: new RegExp(`^${source}$`), keys, handler, options });
}

export function setRouteListener(fn) {
  onRouteChange = fn;
}

export const currentPath = () => location.hash.replace(/^#/, '') || '/';

export function navigate(path, { replace = false } = {}) {
  if (replace) {
    history.replaceState(null, '', `#${path}`);
    render();
  } else if (currentPath() === path) {
    render();
  } else {
    location.hash = path;
  }
}

// Sale de la pantalla actual sin pasar por su guard (p. ej. al terminar una lección).
export function leave() {
  if (active) active.guard = null;
  history.back();
}

window.addEventListener('hashchange', async () => {
  if (active?.guard) {
    const { path, guard } = active;
    history.pushState(null, '', `#${path}`);
    if (!(await guard())) return;
    leave();
    return;
  }
  render();
});

async function render() {
  const path = currentPath();
  const token = ++renderToken;
  let match = null;
  let params = {};
  for (const r of routes) {
    const m = r.regex.exec(path);
    if (m) {
      match = r;
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      break;
    }
  }
  if (!match) {
    match = routes.find((r) => r.options.fallback);
    params = {};
  }

  closeAllDialogs();
  active?.cleanup?.();
  active = null;

  const screen = document.getElementById('screen');
  const view = document.createElement('div');
  view.className = 'view';
  screen.replaceChildren(view);
  document.body.classList.toggle('no-tabbar', !match.options.tab);
  onRouteChange(match.options.tab || null);
  window.scrollTo(0, 0);

  let result = null;
  try {
    result = await match.handler(view, params);
  } catch (err) {
    console.error(err);
    view.replaceChildren(errorView(err));
  }
  if (token !== renderToken) {
    result?.cleanup?.();
    return;
  }
  active = { path, guard: result?.guard || null, cleanup: result?.cleanup || null };
}

function errorView(err) {
  const box = document.createElement('div');
  box.className = 'card';
  box.innerHTML = '<p class="subheading">Algo salió mal</p><p class="body-text"></p>';
  box.querySelector('.body-text').textContent = err?.message || String(err);
  return box;
}
