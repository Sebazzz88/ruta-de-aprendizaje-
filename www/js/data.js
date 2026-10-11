// Carga del contenido (JSON en www/data). Se cachea en memoria.
const cache = new Map();

function getJson(url) {
  if (!cache.has(url)) {
    const request = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`No se pudo cargar ${url} (${res.status})`);
        return res.json();
      })
      .catch((err) => {
        cache.delete(url);
        throw err;
      });
    cache.set(url, request);
  }
  return cache.get(url);
}

export const loadLanguages = () => getJson('data/languages.json');

export async function getLanguage(id) {
  const languages = await loadLanguages();
  return languages.find((l) => l.id === id) || null;
}

export async function loadCourse(id) {
  const lang = await getLanguage(id);
  if (!lang) throw new Error(`Lenguaje desconocido: ${id}`);
  return getJson(`data/courses/${lang.file}`);
}
