// Reglas de juego: niveles, vidas, XP, racha y estado de las lecciones.
import { LEVELS, LIFE_REGEN_MINUTES, BASE_XP, PERFECT_BONUS_XP } from './config.js';
import { getState, saveState, update } from './storage.js';

const pad = (n) => String(n).padStart(2, '0');

export const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function addDays(key, n) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + n));
}

/* ---------- Niveles ---------- */
export const getLevel = (id) => LEVELS.find((l) => l.id === id) || LEVELS[0];

export function levelIndex(id) {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i < 0 ? 0 : i;
}

export function currentLevel(state = getState()) {
  const p = state.currentLang && state.progress[state.currentLang];
  return getLevel(p?.level);
}

/* ---------- Vidas ---------- */
const REGEN_MS = LIFE_REGEN_MINUTES * 60 * 1000;

export function refreshLives() {
  const s = getState();
  const max = currentLevel(s).maxLives;
  const lives = s.lives;
  const now = Date.now();
  if (lives.updatedAt > now) lives.updatedAt = now;
  if (lives.count > max) lives.count = max;
  if (lives.count >= max) {
    lives.updatedAt = now;
  } else {
    const gained = Math.floor((now - lives.updatedAt) / REGEN_MS);
    if (gained > 0) {
      lives.count = Math.min(max, lives.count + gained);
      lives.updatedAt = lives.count >= max ? now : lives.updatedAt + gained * REGEN_MS;
    }
  }
  saveState();
  return {
    count: lives.count,
    max,
    nextInMs: lives.count >= max ? 0 : REGEN_MS - (now - lives.updatedAt),
  };
}

export function loseLife() {
  const { max } = refreshLives();
  update((s) => {
    if (s.lives.count >= max) s.lives.updatedAt = Date.now();
    s.lives.count = Math.max(0, s.lives.count - 1);
  });
  return getState().lives.count;
}

export function formatWait(ms) {
  const min = Math.max(1, Math.ceil(ms / 60000));
  return min >= 60 ? `${Math.floor(min / 60)} h ${min % 60} min` : `${min} min`;
}

/* ---------- Racha y XP ---------- */
export function streakInfo() {
  const { current, best, lastDay } = getState().streak;
  const today = dayKey();
  const alive = lastDay === today || lastDay === addDays(today, -1);
  return { current: alive ? current : 0, best, doneToday: lastDay === today };
}

function bumpStreak(s) {
  const today = dayKey();
  const last = s.streak.lastDay;
  if (last === today) return;
  s.streak.current = last === addDays(today, -1) ? s.streak.current + 1 : 1;
  s.streak.lastDay = today;
  s.streak.best = Math.max(s.streak.best, s.streak.current);
}

export const todayXp = () => getState().xp.byDay[dayKey()] || 0;

export function lessonXp(levelId, perfect) {
  return Math.round((BASE_XP + (perfect ? PERFECT_BONUS_XP : 0)) * getLevel(levelId).xpMultiplier);
}

function pruneDays(byDay) {
  const keys = Object.keys(byDay).sort();
  keys.slice(0, Math.max(0, keys.length - 30)).forEach((k) => delete byDay[k]);
}

export function completeLesson(langId, lessonId, { perfect, correct, total }) {
  let xp = 0;
  update((s) => {
    const p = s.progress[langId];
    if (!p) return;
    xp = lessonXp(p.level, perfect);
    const prev = p.completed[lessonId];
    p.completed[lessonId] = {
      times: (prev?.times || 0) + 1,
      perfect: perfect || !!prev?.perfect,
      lastAt: Date.now(),
    };
    p.xp = (p.xp || 0) + xp;
    p.updatedAt = Date.now();
    s.xp.total += xp;
    const k = dayKey();
    s.xp.byDay[k] = (s.xp.byDay[k] || 0) + xp;
    pruneDays(s.xp.byDay);
    bumpStreak(s);
    if (!prev) s.stats.lessonsCompleted += 1;
    s.stats.exercisesCorrect += correct;
    s.stats.exercisesTotal += total;
  });
  return xp;
}

/* ---------- Progreso por lenguaje ---------- */
export function startLanguage(langId, levelId) {
  update((s) => {
    s.progress[langId] = { level: levelId, completed: {}, xp: 0, startedAt: Date.now(), updatedAt: Date.now() };
    s.currentLang = langId;
  });
}

export function setCurrentLanguage(langId) {
  update((s) => {
    s.currentLang = langId;
  });
}

export function deleteLanguageProgress(langId) {
  update((s) => {
    delete s.progress[langId];
    if (s.currentLang === langId) s.currentLang = null;
  });
}

export function flatLessons(course) {
  const out = [];
  course.units.forEach((unit, unitIndex) => {
    unit.lessons.forEach((lesson) => out.push({ ...lesson, unitIndex }));
  });
  return out;
}

// Estado de cada lección: completed | available | review | locked.
// Las unidades anteriores al nivel elegido quedan abiertas como repaso.
export function lessonStates(course, progress) {
  const start = levelIndex(progress.level);
  const map = {};
  let currentId = null;
  let prevDone = true;
  for (const lesson of flatLessons(course)) {
    const done = !!progress.completed[lesson.id];
    let status;
    if (done) status = 'completed';
    else if (lesson.unitIndex < start) status = 'review';
    else if (prevDone) status = 'available';
    else status = 'locked';
    if (status === 'available' && !currentId) currentId = lesson.id;
    if (lesson.unitIndex >= start) prevDone = done;
    map[lesson.id] = status;
  }
  return { map, currentId };
}

export function courseSummary(course, progress) {
  const start = levelIndex(progress.level);
  const path = flatLessons(course).filter((l) => l.unitIndex >= start);
  const done = path.filter((l) => progress.completed[l.id]).length;
  return { done, total: path.length, completedAll: Object.keys(progress.completed).length };
}
