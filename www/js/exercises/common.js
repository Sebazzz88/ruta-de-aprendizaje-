import { h } from '../ui.js';

export const TYPE_LABELS = {
  choice: 'Opción múltiple',
  fill: 'Completa el código',
  order: 'Ordena las líneas',
  output: 'Predice la salida',
};

export const DEFAULT_PROMPTS = {
  choice: 'Elige la respuesta correcta',
  fill: 'Completa el código',
  order: 'Ordena las líneas de código',
  output: '¿Qué muestra este código?',
};

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const codeBlock = (code) => h('pre', { class: 'code' }, h('code', {}, code));
