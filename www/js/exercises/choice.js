// Opción múltiple y "predecir la salida" (misma mecánica; la salida usa fuente de código).
import { h } from '../ui.js';
import { shuffle, codeBlock } from './common.js';

export function createChoice(ex, onChange) {
  const mono = ex.type === 'output';
  let selected = null;
  let locked = false;

  const buttons = shuffle(ex.options.map((_, i) => i)).map((i) =>
    h(
      'button',
      {
        class: `option${mono ? ' mono' : ''}`,
        type: 'button',
        dataset: { i },
        onclick: () => {
          if (locked) return;
          selected = i;
          buttons.forEach((b) => b.classList.toggle('selected', Number(b.dataset.i) === i));
          onChange();
        },
      },
      h('span', { class: 'option-text' }, ex.options[i]),
    ),
  );

  return {
    el: h('div', { class: 'exercise' }, ex.code ? codeBlock(ex.code) : null, h('div', { class: 'options' }, buttons)),
    isReady: () => selected !== null,
    check: () => selected === ex.answer,
    lock() {
      locked = true;
      buttons.forEach((b) => {
        const i = Number(b.dataset.i);
        b.disabled = true;
        b.classList.remove('selected');
        if (i === ex.answer) b.classList.add('right');
        else if (i === selected) b.classList.add('wrong');
      });
    },
    solution: () => ex.options[ex.answer],
  };
}
