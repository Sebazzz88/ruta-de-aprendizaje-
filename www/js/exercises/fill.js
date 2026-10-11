// Completar el código: cada "___" del código es un hueco; se rellena tocando las fichas.
import { h } from '../ui.js';
import { shuffle } from './common.js';

export function createFill(ex, onChange) {
  const parts = ex.code.split('___');
  const blanks = parts.length - 1;
  const filled = Array(blanks).fill(null); // índice de la opción colocada en cada hueco
  let locked = false;

  const blankEls = [];
  const codeEl = h('pre', { class: 'code code-fill' });
  parts.forEach((part, k) => {
    codeEl.append(document.createTextNode(part));
    if (k < blanks) {
      const blank = h('button', {
        class: 'blank',
        type: 'button',
        'aria-label': `Hueco ${k + 1}`,
        onclick: () => {
          if (locked || filled[k] === null) return;
          filled[k] = null;
          refresh();
        },
      });
      blankEls.push(blank);
      codeEl.append(blank);
    }
  });

  const order = shuffle(ex.options.map((_, i) => i));
  const chipEls = order.map((i) =>
    h(
      'button',
      {
        class: 'chip',
        type: 'button',
        onclick: () => {
          if (locked || filled.includes(i)) return;
          const k = filled.indexOf(null);
          if (k < 0) return;
          filled[k] = i;
          refresh();
        },
      },
      ex.options[i],
    ),
  );

  function refresh() {
    blankEls.forEach((b, k) => {
      const v = filled[k];
      b.textContent = v === null ? ' ' : ex.options[v];
      b.classList.toggle('filled', v !== null);
    });
    chipEls.forEach((c, j) => {
      const used = filled.includes(order[j]);
      c.classList.toggle('used', used);
      c.disabled = used || locked;
    });
    onChange();
  }
  refresh();

  return {
    el: h('div', { class: 'exercise' }, codeEl, h('div', { class: 'chip-bank' }, chipEls)),
    isReady: () => filled.every((v) => v !== null),
    check: () => filled.every((v, k) => v !== null && ex.options[v] === ex.answer[k]),
    lock() {
      locked = true;
      blankEls.forEach((b, k) => {
        b.disabled = true;
        b.classList.add(ex.options[filled[k]] === ex.answer[k] ? 'right' : 'wrong');
      });
      chipEls.forEach((c) => { c.disabled = true; });
    },
    solution: () => parts.reduce((acc, part, k) => acc + part + (k < blanks ? ex.answer[k] : ''), ''),
  };
}
