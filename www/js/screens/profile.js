import { loadLanguages, loadCourse } from '../data.js';
import { getState } from '../storage.js';
import { navigate } from '../router.js';
import { h, icon, langBadge, progressBar } from '../ui.js';
import { getLevel, courseSummary, streakInfo, todayXp } from '../game.js';

export async function profileScreen(view) {
  const s = getState();
  const languages = await loadLanguages();
  const streak = streakInfo();
  const name = s.user.name.trim() || 'Estudiante';
  const current = languages.find((l) => l.id === s.currentLang);
  const goal = s.settings.dailyGoal;
  const xpToday = todayXp();
  const accuracy = s.stats.exercisesTotal ? Math.round((s.stats.exercisesCorrect / s.stats.exercisesTotal) * 100) : 0;

  const learning = languages.filter((l) => s.progress[l.id]);
  const rows = await Promise.all(
    learning.map(async (lang) => {
      const p = s.progress[lang.id];
      const sum = courseSummary(await loadCourse(lang.id), p);
      const isCurrent = lang.id === s.currentLang;
      return h(
        'div',
        { class: 'list-row stack-row' },
        h(
          'div',
          { class: 'row' },
          langBadge(lang, { active: isCurrent, small: true }),
          h('div', { class: 'row-main' }, h('div', { class: 'row-title' }, lang.name), h('div', { class: 'row-sub' }, `Nivel ${getLevel(p.level).name} · ${p.xp || 0} XP`)),
          isCurrent ? h('span', { class: 'pill pill-green' }, 'Actual') : h('span', { class: 'pill pill-blue' }, 'Guardado'),
        ),
        h('div', { class: 'row', style: 'margin-top:8px' }, h('div', { style: 'flex:1' }, progressBar(sum.done, sum.total, 'sm')), h('span', { class: 'caption' }, `${sum.done}/${sum.total}`)),
      );
    }),
  );

  view.append(
    h(
      'div',
      { class: 'profile-head' },
      h('div', { class: 'avatar', 'aria-hidden': 'true' }, name.charAt(0).toUpperCase()),
      h(
        'div',
        { style: 'min-width:0' },
        h('h1', { class: 'title', style: 'overflow-wrap:anywhere' }, name),
        h('p', { class: 'body-text' }, current ? `Aprendiendo ${current.name} · ${getLevel(s.progress[current.id].level).name}` : 'Aún no eliges un lenguaje'),
      ),
    ),
    h(
      'div',
      { class: 'stats-grid' },
      tile('flame', 'ico-flame', streak.current, 'Racha actual'),
      tile('flame', 'ico-flame', streak.best, 'Mejor racha'),
      tile('bolt', 'ico-bolt', s.xp.total, 'XP total'),
      tile('check', 'ico-green', s.stats.lessonsCompleted, 'Lecciones'),
    ),
    h('h2', { class: 'label section-label' }, 'Meta diaria'),
    h(
      'div',
      { class: 'card' },
      h('div', { class: 'row', style: 'margin-bottom:8px' }, icon('target', 22, xpToday >= goal ? 'ico-green' : 'muted'), h('span', { class: 'subheading' }, xpToday >= goal ? '¡Meta cumplida!' : `${xpToday} de ${goal} XP`)),
      progressBar(xpToday, goal),
      h('p', { class: 'caption', style: 'margin-top:8px' }, `Precisión total: ${accuracy}% de respuestas correctas al primer intento.`),
    ),
    h('h2', { class: 'label section-label' }, 'Mis lenguajes'),
    rows.length
      ? h('div', { class: 'list' }, rows)
      : h(
          'div',
          { class: 'card stack' },
          h('p', { class: 'body-text' }, 'Todavía no empiezas ningún lenguaje.'),
          h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => navigate('/languages', { replace: true }) }, 'Elegir lenguaje'),
        ),
    h('div', { style: 'height:16px' }),
    h('button', { class: 'btn btn-outline btn-block', type: 'button', onclick: () => navigate('/settings', { replace: true }) }, icon('edit', 18), 'Editar perfil'),
  );
}

function tile(name, cls, value, label) {
  return h('div', { class: 'stat-tile' }, icon(name, 28, cls), h('div', {}, h('div', { class: 'stat-value' }, value), h('div', { class: 'stat-label' }, label)));
}
