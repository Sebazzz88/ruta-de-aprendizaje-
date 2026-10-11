import { APP_NAME, LEVELS, LIFE_REGEN_MINUTES } from '../config.js';
import { loadLanguages } from '../data.js';
import { getState, update } from '../storage.js';
import { navigate } from '../router.js';
import { h, icon, langBadge, setChildren } from '../ui.js';
import { TYPE_LABELS } from '../exercises/index.js';

export async function tutorialScreen(view) {
  const firstTime = !getState().tutorialDone;
  const languages = await loadLanguages();
  const slides = buildSlides(languages);
  let index = 0;

  const top = h('div', { class: 'tutorial-top' });
  const slideHolder = h('div', { style: 'flex:1;display:flex;flex-direction:column' });
  const dots = h('div', { class: 'dots', 'aria-hidden': 'true' });
  const actions = h('div', { class: 'tutorial-actions' });

  function finish() {
    update((s) => { s.tutorialDone = true; });
    if (firstTime) navigate(getState().currentLang ? '/path' : '/languages', { replace: true });
    else history.back();
  }

  function render() {
    const slide = slides[index];
    const last = index === slides.length - 1;
    top.replaceChildren(last ? h('span') : h('button', { class: 'link-btn', type: 'button', onclick: finish }, 'Saltar'));
    slideHolder.replaceChildren(
      h(
        'div',
        { class: 'tutorial-slide' },
        slide.art ? h('div', { class: 'tutorial-art' }, slide.art) : null,
        slide.display ? h('h1', { class: 'display', style: 'text-align:center' }, slide.display) : h('h1', { class: 'title' }, slide.title),
        h('p', { class: 'body-text', style: slide.display ? 'text-align:center' : null }, slide.text),
        slide.extra || null,
      ),
    );
    dots.replaceChildren(...slides.map((_, i) => h('span', { class: `dot${i === index ? ' active' : ''}` })));
    setChildren(
      actions,
      index > 0 ? h('button', { class: 'btn btn-outline', type: 'button', onclick: () => go(-1) }, 'Atrás') : null,
      h('button', { class: 'btn btn-primary', type: 'button', onclick: () => (last ? finish() : go(1)) }, last ? '¡Empezar!' : 'Siguiente'),
    );
  }

  function go(step) {
    index = Math.max(0, Math.min(slides.length - 1, index + step));
    render();
  }

  render();
  view.append(h('div', { class: 'tutorial' }, top, slideHolder, dots, actions));
}

function buildSlides(languages) {
  const pick = languages.slice(0, 3);
  return [
    {
      art: h('div', { class: 'sticker' }, icon('code', 64)),
      display: APP_NAME,
      text: 'Aprende a programar con lecciones cortas, como un juego. Te mostramos cómo funciona en unos pasos.',
    },
    {
      title: 'Elige un lenguaje',
      text: `Hay ${languages.length} lenguajes: ${languages.map((l) => l.name).join(', ')}. Puedes cambiar cuando quieras y tu progreso queda guardado.`,
      extra: h(
        'div',
        { class: 'stack' },
        pick.map((l, i) =>
          h('div', { class: 'card row' }, langBadge(l, { active: i === 0 }), h('div', { class: 'row-main' }, h('div', { class: 'card-title' }, l.name)), i === 0 ? h('span', { class: 'pill pill-green' }, 'Aprendiendo') : null),
        ),
      ),
    },
    {
      title: 'Elige tu nivel',
      text: 'Empieza desde cero o salta a un nivel más alto. El nivel cambia dónde empiezas, tus vidas y la XP que ganas.',
      extra: h('div', { class: 'stack' }, LEVELS.map((l) => h('div', { class: 'card row' }, h('div', { class: 'row-main' }, h('div', { class: 'card-title' }, l.name), h('div', { class: 'card-text' }, l.description)), h('span', { class: 'pill' }, `${l.maxLives} vidas`)))),
    },
    {
      title: 'Sigue la ruta',
      text: 'Las lecciones se desbloquean en orden. Completa una para abrir la siguiente.',
      extra: h(
        'div',
        { class: 'mock-nodes' },
        h('div', { class: 'node completed' }, icon('check', 28)),
        h('div', { class: 'node available' }, icon('star', 28)),
        h('div', { class: 'node locked' }, icon('lock', 28)),
      ),
    },
    {
      title: '4 tipos de ejercicios',
      text: 'Cada lección tiene de 5 a 10 ejercicios cortos. Al responder sabrás al instante si acertaste y por qué.',
      extra: h(
        'div',
        { class: 'list' },
        Object.entries({
          choice: 'Elige la respuesta correcta.',
          fill: 'Toca las fichas para rellenar los huecos del código.',
          order: 'Toca las líneas en el orden correcto.',
          output: 'Adivina qué imprime el código.',
        }).map(([type, desc]) => h('div', { class: 'list-row' }, h('div', { class: 'row-main' }, h('div', { class: 'row-title' }, TYPE_LABELS[type]), h('div', { class: 'row-sub' }, desc)))),
      ),
    },
    {
      title: 'Vidas, XP y racha',
      text: 'Así se mide tu avance:',
      extra: h(
        'div',
        { class: 'list' },
        h('div', { class: 'list-row' }, icon('heart', 26, 'ico-heart'), h('div', { class: 'row-main' }, h('div', { class: 'row-title' }, 'Vidas'), h('div', { class: 'row-sub' }, `Pierdes una al fallar. Recuperas 1 cada ${LIFE_REGEN_MINUTES} minutos.`))),
        h('div', { class: 'list-row' }, icon('bolt', 26, 'ico-bolt'), h('div', { class: 'row-main' }, h('div', { class: 'row-title' }, 'XP'), h('div', { class: 'row-sub' }, 'Ganas puntos al terminar lecciones. Más si no fallas.'))),
        h('div', { class: 'list-row' }, icon('flame', 26, 'ico-flame'), h('div', { class: 'row-main' }, h('div', { class: 'row-title' }, 'Racha'), h('div', { class: 'row-sub' }, 'Sube cada día que completas al menos una lección.'))),
      ),
    },
    {
      title: 'Perfil y ajustes',
      text: 'En Perfil ves tu progreso. En Ajustes cambias tu nombre, el tema claro u oscuro, la meta diaria, buscas actualizaciones o vuelves a ver este tutorial.',
      extra: h(
        'div',
        { class: 'list' },
        h('div', { class: 'list-row' }, icon('user', 22, 'row-icon'), h('div', { class: 'row-title' }, 'Perfil')),
        h('div', { class: 'list-row' }, icon('settings', 22, 'row-icon'), h('div', { class: 'row-title' }, 'Ajustes')),
        h('div', { class: 'list-row' }, icon('refresh', 22, 'row-icon'), h('div', { class: 'row-title' }, 'Buscar actualizaciones')),
      ),
    },
  ];
}
