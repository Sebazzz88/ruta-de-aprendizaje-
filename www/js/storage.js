import { STORAGE_KEY } from './config.js';

const defaultState = () => ({
  version: 1,
  tutorialDone: false,
  user: { name: '' },
  settings: { theme: 'system', sound: true, dailyGoal: 20 },
  currentLang: null,
  // progress[langId] = { level, completed: { lessonId: {...} }, xp, startedAt, updatedAt }
  progress: {},
  xp: { total: 0, byDay: {} },
  lives: { count: 5, updatedAt: Date.now() },
  streak: { current: 0, best: 0, lastDay: null },
  stats: { lessonsCompleted: 0, exercisesCorrect: 0, exercisesTotal: 0 },
});

let state = null;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

function merge(base, saved) {
  const out = { ...base };
  for (const [key, value] of Object.entries(saved)) {
    out[key] = isObject(base[key]) && isObject(value) ? merge(base[key], value) : value;
  }
  return out;
}

export function loadState() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    saved = null;
  }
  state = merge(defaultState(), isObject(saved) ? saved : {});
  return state;
}

export function getState() {
  return state || loadState();
}

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('No se pudo guardar el progreso', err);
  }
}

export function update(fn) {
  fn(getState());
  saveState();
}

// Borra todo el progreso; conserva ajustes y el tutorial visto.
export function resetAll() {
  const { settings, user } = getState();
  state = defaultState();
  state.settings = settings;
  state.user = user;
  state.tutorialDone = true;
  saveState();
}
