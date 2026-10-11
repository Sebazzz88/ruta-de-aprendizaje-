// Utilidades de interfaz: creación de elementos, iconos, diálogos y avisos.

export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value == null || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'html') el.innerHTML = value;
    else if (key === 'dataset') Object.assign(el.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else el.setAttribute(key, value === true ? '' : value);
  }
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

// Reemplaza los hijos de un elemento ignorando null/false (como h()).
export function setChildren(el, ...children) {
  el.replaceChildren(...children.flat(Infinity).filter((c) => c != null && c !== false));
}

/* ---------- Iconos (trazo grueso) ---------- */
const STROKE = {
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  chevronLeft: '<path d="m15 18-6-6 6-6"/>',
  refresh: '<path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
  book: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  trash: '<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  volume: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
};

const FILL = {
  heart: '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
  flame: '<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>',
  bolt: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
  star: '<path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
  play: '<path d="M8 5v14l11-7z"/>',
};

export function icon(name, size = 24, cls = '') {
  const span = document.createElement('span');
  span.className = `icon ${cls}`.trim();
  span.style.display = 'inline-flex';
  if (FILL[name]) {
    span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${FILL[name]}</svg>`;
  } else {
    span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${STROKE[name] || ''}</svg>`;
  }
  return span;
}

export function langBadge(lang, { active = false, small = false } = {}) {
  return h('span', { class: `lang-badge${active ? ' active' : ''}${small ? ' sm' : ''}`, 'aria-hidden': 'true' }, lang.short);
}

export function progressBar(value, max, cls = '') {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill = h('div', { class: 'progress-fill' });
  fill.style.width = `${pct}%`;
  return h('div', { class: `progress ${cls}`.trim(), role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(value) }, fill);
}

/* ---------- Diálogos ---------- */
const openDialogs = new Set();

// buttons: [{ label, value, variant }]. Devuelve el value elegido o null si se cierra.
export function dialog({ title, message, buttons, dismissible = true, content = null }) {
  return new Promise((resolve) => {
    let overlay;
    const close = (value) => {
      overlay.remove();
      openDialogs.delete(close);
      resolve(value);
    };
    overlay = h(
      'div',
      { class: 'overlay', onclick: (e) => { if (e.target === overlay && dismissible) close(null); } },
      h(
        'div',
        { class: 'sheet', role: 'dialog', 'aria-modal': 'true' },
        title && h('h2', { class: 'sheet-title' }, title),
        message && h('p', { class: 'sheet-text' }, message),
        content,
        h(
          'div',
          { class: 'sheet-actions' },
          buttons.map((b) => h('button', { class: `btn btn-block ${b.variant || 'btn-outline'}`, type: 'button', onclick: () => close(b.value) }, b.label)),
        ),
      ),
    );
    document.getElementById('overlay-root').append(overlay);
    openDialogs.add(close);
  });
}

export function closeAllDialogs() {
  [...openDialogs].forEach((close) => close(null));
}

// Cierra el último diálogo abierto. Devuelve true si había alguno.
export function closeTopDialog() {
  const last = [...openDialogs].pop();
  if (!last) return false;
  last(null);
  return true;
}

export function confirmDialog({ title, message, yes = 'Sí', no = 'No', danger = false }) {
  return dialog({
    title,
    message,
    buttons: [
      { label: yes, value: true, variant: danger ? 'btn-danger' : 'btn-primary' },
      { label: no, value: false, variant: 'btn-outline' },
    ],
  }).then((v) => v === true);
}

let toastTimer = null;
export function toast(text) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);
  const el = h('div', { class: 'toast', role: 'status' }, text);
  document.body.append(el);
  toastTimer = setTimeout(() => el.remove(), 2400);
}

export function backButton(onClick) {
  return h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Volver', onclick: onClick }, icon('chevronLeft', 28));
}
