// Nombre provisional de la app. Para renombrarla cambia este valor
// y "appName" en capacitor.config.json.
export const APP_NAME = 'Codi';

// Versión instalada. Súbela en cada release junto con versionName/versionCode
// en android/app/build.gradle y crea el tag vX.Y.Z en GitHub.
export const APP_VERSION = '1.0.0';

// Repositorio donde se publican las versiones (GitHub Releases).
export const GITHUB_REPO = 'Sebazzz88/ruta-de-aprendizaje-';

export const STORAGE_KEY = 'ruta-aprendizaje-state';

export const LIFE_REGEN_MINUTES = 30;
export const BASE_XP = 10;
export const PERFECT_BONUS_XP = 5;
export const DAILY_GOALS = [10, 20, 30, 50];

// Niveles de inicio. Cada nivel empieza en su unidad del curso (mismo orden)
// y ajusta la dificultad: vidas máximas, XP ganada y si se repiten los errores.
export const LEVELS = [
  { id: 'regular', name: 'Regular', description: 'Nunca he programado.', maxLives: 5, xpMultiplier: 1, repeatMistakes: true },
  { id: 'medio', name: 'Medio', description: 'Conozco lo más básico.', maxLives: 5, xpMultiplier: 1.25, repeatMistakes: true },
  { id: 'intermedio', name: 'Intermedio', description: 'Ya uso variables y condicionales.', maxLives: 4, xpMultiplier: 1.5, repeatMistakes: true },
  { id: 'avanzado', name: 'Avanzado', description: 'Manejo funciones y colecciones.', maxLives: 3, xpMultiplier: 1.75, repeatMistakes: false },
  { id: 'pro', name: 'Pro', description: 'Quiero retos de objetos, memoria y errores.', maxLives: 3, xpMultiplier: 2, repeatMistakes: false },
];
