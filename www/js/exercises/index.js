import { createChoice } from './choice.js';
import { createFill } from './fill.js';
import { createOrder } from './order.js';

const factories = {
  choice: createChoice,
  output: createChoice,
  fill: createFill,
  order: createOrder,
};

export function createExercise(ex, onChange) {
  const factory = factories[ex.type];
  if (!factory) throw new Error(`Tipo de ejercicio desconocido: ${ex.type}`);
  return factory(ex, onChange);
}

export { TYPE_LABELS, DEFAULT_PROMPTS } from './common.js';
