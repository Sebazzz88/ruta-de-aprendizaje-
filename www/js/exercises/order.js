// Ordenar líneas: "lines" en el JSON está en el orden correcto; aquí se desordena.
import { h } from '../ui.js';
import { shuffle } from './common.js';

export function createOrder(ex, onChange) {
  const ids = ex.lines.map((_, i) => i);
  let pool = shuffle(ids);
  for (let tries = 0; tries < 10 && pool.every((id, k) => ex.lines[id] === ex.lines[k]); tries++) pool = shuffle(ids);

  const placed = [];
  let locked = false;
  const answerEl = h('div', { class: 'order-answer', 'aria-label': 'Tu respuesta' });
  const bankEl = h('div', { class: 'order-bank' });

  const lineButton = (id, onClick, used = false) =>
    h('button', { class: `chip line-chip${used ? ' used' : ''}`, type: 'button', disabled: used || locked, onclick: onClick }, ex.lines[id]);

  function render() {
    answerEl.replaceChildren(
      ...(placed.length
        ? placed.map((id, k) =>
            lineButton(id, () => {
              if (locked) return;
              placed.splice(k, 1);
              render();
            }),
          )
        : [h('span', { class: 'order-empty' }, 'Toca las líneas en el orden correcto')]),
    );
    bankEl.replaceChildren(
      ...pool.map((id) =>
        lineButton(
          id,
          () => {
            if (locked || placed.includes(id)) return;
            placed.push(id);
            render();
          },
          placed.includes(id),
        ),
      ),
    );
    onChange();
  }
  render();

  const isRight = () => placed.length === ex.lines.length && placed.every((id, k) => ex.lines[id] === ex.lines[k]);

  return {
    el: h('div', { class: 'exercise' }, answerEl, bankEl),
    isReady: () => placed.length === ex.lines.length,
    check: isRight,
    lock() {
      locked = true;
      render();
      answerEl.classList.add(isRight() ? 'right' : 'wrong');
    },
    solution: () => ex.lines.join('\n'),
  };
}
