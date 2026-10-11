// Comprueba si hay una versión más nueva publicada en GitHub Releases.
// Solo informa; no abre el navegador ni descarga nada.
import { APP_VERSION, GITHUB_REPO } from './config.js';

export function compareVersions(a, b) {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff > 0 ? 1 : -1;
  }
  return 0;
}

// Devuelve { status: 'latest' | 'outdated' | 'none', latest }
export async function checkForUpdates() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (res.status === 404) return { status: 'none', latest: null };
    if (!res.ok) throw new Error(`GitHub respondió ${res.status}`);
    const data = await res.json();
    const latest = String(data.tag_name || '').replace(/^v/i, '');
    return { status: compareVersions(latest, APP_VERSION) > 0 ? 'outdated' : 'latest', latest };
  } finally {
    clearTimeout(timer);
  }
}
