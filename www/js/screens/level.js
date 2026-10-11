import { LEVELS } from '../config.js';
import { getLanguage, loadCourse } from '../data.js';
import { navigate } from '../router.js';
import { h, langBadge, backButton } from '../ui.js';
import { startLanguage } from '../game.js';

export async function levelScreen(view, { lang: langId }) {
  const lang = await getLanguage(langId);
  if (!lang) {
    navigate('/languages', { replace: true });
    return;
  }
  const course = await loadCourse(langId);
  let selected = LEVELS[0].id;

  const startBtn = h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: start }, 'Empezar');
  const note = h('p', { class: 'caption', style: 'margin-top:4px' });

  const cards = LEVELS.map((level, i) => {
    const unit = course.units[i];
    return h(
      'button',
      {
        class: 'card card-button level-card',
        type: 'button',
        role: 'radio',
        dataset: { level: level.id },
        onclick: () => select(level.id),
      },
      h('div', { class: 'card-title' }, level.name),
      h('div', { class: 'card-text' }, level.description),
      h(
        'div',
        { class: 'level-meta' },
        h('span', { class: 'pill' }, `${level.maxLives} vidas`),
        h('span', { class: 'pill' }, `XP ×${level.xpMultiplier}`),
        unit ? h('span', { class: 'pill' }, unit.title) : null,
      ),
    );
  });

  function select(id) {
    selected = id;
    cards.forEach((c) => {
      const on = c.dataset.level === id;
      c.classList.toggle('selected', on);
      c.setAttribute('aria-checked', String(on));
    });
    const index = LEVELS.findIndex((l) => l.id === id);
    const level = LEVELS[index];
    note.textContent =
      (index === 0
        ? 'Empiezas desde la primera unidad.'
        : `Empiezas en la unidad ${index + 1}. Las anteriores quedan abiertas para repasar.`) +
      (level.repeatMistakes ? ' Los ejercicios que falles se repiten al final.' : ' Los errores no se repiten: cada fallo cuenta.');
  }

  function start() {
    startLanguage(langId, selected);
    navigate('/path', { replace: true });
  }

  select(selected);

  view.append(
    h('div', { class: 'screen-header' }, backButton(() => history.back()), langBadge(lang, { small: true }), h('span', { class: 'subheading' }, lang.name)),
    h('h1', { class: 'title' }, '¿Desde qué nivel quieres empezar?'),
    h('p', { class: 'body-text', style: 'margin:8px 0 24px' }, 'El nivel define dónde empiezas y la dificultad: vidas, XP y repetición de errores.'),
    h('div', { class: 'stack', role: 'radiogroup', 'aria-label': 'Nivel' }, cards),
    h('div', { class: 'bottom-action' }, note, h('div', { style: 'height:12px' }), startBtn),
  );
}
