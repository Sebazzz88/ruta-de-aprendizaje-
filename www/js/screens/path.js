import { LEVELS } from '../config.js';
import { getLanguage, loadCourse } from '../data.js';
import { getState } from '../storage.js';
import { navigate } from '../router.js';
import { h, icon, langBadge, progressBar, dialog, toast } from '../ui.js';
import { lessonStates, levelIndex, refreshLives, streakInfo, todayXp, formatWait } from '../game.js';

const OFFSETS = [0, 44, 64, 44, 0, -44, -64, -44];

export async function pathScreen(view) {
  const s = getState();
  if (!s.currentLang || !s.progress[s.currentLang]) {
    navigate('/languages', { replace: true });
    return;
  }
  const lang = await getLanguage(s.currentLang);
  const course = await loadCourse(s.currentLang);
  const progress = s.progress[s.currentLang];
  const { map, currentId } = lessonStates(course, progress);
  const start = levelIndex(progress.level);

  const livesValue = h('span');
  const updateLives = () => {
    livesValue.textContent = refreshLives().count;
  };
  updateLives();
  const streak = streakInfo();

  const topbar = h(
    'header',
    { class: 'topbar' },
    h('button', { class: 'lang-switch', type: 'button', 'aria-label': 'Cambiar de lenguaje', onclick: () => navigate('/languages', { replace: true }) }, langBadge(lang, { active: true, small: true }), lang.name),
    h('div', { class: 'spacer' }),
    h('span', { class: `stat-chip${streak.doneToday ? '' : ' dim'}`, title: 'Racha' }, icon('flame', 22, 'ico-flame'), streak.current),
    h('span', { class: 'stat-chip', title: 'XP' }, icon('bolt', 22, 'ico-bolt'), s.xp.total),
    h('span', { class: 'stat-chip', title: 'Vidas' }, icon('heart', 22, 'ico-heart'), livesValue),
  );

  const goal = s.settings.dailyGoal;
  const xpToday = todayXp();
  const goalRow = h(
    'div',
    { class: 'daily-goal' },
    icon('target', 22, xpToday >= goal ? 'ico-green' : 'muted'),
    progressBar(xpToday, goal, 'sm'),
    h('span', { class: 'caption' }, `${Math.min(xpToday, goal)}/${goal} XP hoy`),
  );

  let currentNode = null;
  let globalIndex = 0;
  const units = course.units.map((unit, ui) => {
    const isReview = ui < start;
    const nodes = unit.lessons.map((lesson) => {
      const status = map[lesson.id];
      const offset = OFFSETS[globalIndex++ % OFFSETS.length];
      const isCurrent = lesson.id === currentId;
      const glyph = status === 'completed' ? 'check' : status === 'locked' ? 'lock' : isCurrent ? 'star' : 'play';
      const wrap = h(
        'div',
        { class: `node-wrap${isCurrent ? ' has-start' : ''}`, style: `transform:translateX(${offset}px)` },
        isCurrent ? h('span', { class: 'node-start' }, 'Empezar') : null,
        h(
          'button',
          {
            class: `node ${status}`,
            type: 'button',
            'aria-label': `${lesson.title} (${statusLabel(status)})`,
            onclick: () => openLesson(lesson, status),
          },
          icon(glyph, 32),
        ),
        h('span', { class: 'node-label' }, lesson.title),
      );
      if (isCurrent) currentNode = wrap;
      return wrap;
    });
    return h(
      'section',
      { class: 'unit' },
      h(
        'div',
        { class: `unit-header${isReview ? ' is-review' : ''}` },
        h('div', { class: 'unit-kicker' }, `Unidad ${ui + 1} · ${LEVELS[ui]?.name || unit.level}${isReview ? ' · Repaso' : ''}`),
        h('div', { class: 'unit-title' }, unit.title),
        h('div', { class: 'unit-desc' }, unit.description),
      ),
      h('div', { class: 'nodes' }, nodes),
    );
  });

  const finished = !currentId && Object.values(map).every((st) => st === 'completed' || st === 'review');
  view.append(
    topbar,
    goalRow,
    ...units,
    finished
      ? h(
          'div',
          { class: 'card course-done' },
          h('p', { class: 'subheading' }, `¡Completaste el curso de ${lang.name}!`),
          h('p', { class: 'body-text', style: 'margin-top:8px' }, 'Puedes repasar cualquier lección o empezar otro lenguaje.'),
        )
      : null,
  );

  async function openLesson(lesson, status) {
    if (status === 'locked') {
      toast('Completa la lección anterior para desbloquearla');
      return;
    }
    const lives = refreshLives();
    if (lives.count <= 0) {
      await dialog({
        title: 'Te quedaste sin vidas',
        message: `Recuperas 1 vida en ${formatWait(lives.nextInMs)}. Vuelve en un rato.`,
        buttons: [{ label: 'Entendido', value: true, variant: 'btn-primary' }],
      });
      return;
    }
    navigate(`/lesson/${s.currentLang}/${lesson.id}`);
  }

  requestAnimationFrame(() => currentNode?.scrollIntoView({ block: 'center' }));
  const timer = setInterval(updateLives, 30000);
  return { cleanup: () => clearInterval(timer) };
}

function statusLabel(status) {
  return { completed: 'completada', available: 'disponible', review: 'repaso', locked: 'bloqueada' }[status];
}
