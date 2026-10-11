import { APP_NAME, APP_VERSION, DAILY_GOALS } from '../config.js';
import { getLanguage } from '../data.js';
import { getState, update, resetAll } from '../storage.js';
import { navigate } from '../router.js';
import { h, icon, toast, confirmDialog } from '../ui.js';
import { getLevel } from '../game.js';
import { checkForUpdates } from '../update.js';
import { applyTheme } from '../theme.js';

const THEMES = [
  { id: 'system', label: 'Sistema' },
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Oscuro' },
];

export async function settingsScreen(view) {
  const s = getState();
  const current = s.currentLang ? await getLanguage(s.currentLang) : null;

  /* Perfil */
  const nameInput = h('input', {
    class: 'input',
    type: 'text',
    maxlength: '24',
    placeholder: 'Tu nombre',
    value: s.user.name,
    'aria-label': 'Nombre',
  });
  nameInput.addEventListener('change', () => {
    update((st) => { st.user.name = nameInput.value.trim(); });
    toast('Nombre guardado');
  });

  /* Tema */
  const themeButtons = THEMES.map((t) =>
    h('button', { type: 'button', 'aria-pressed': String(s.settings.theme === t.id), onclick: () => setTheme(t.id) }, t.label),
  );
  function setTheme(id) {
    update((st) => { st.settings.theme = id; });
    applyTheme(id);
    themeButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(THEMES[i].id === id)));
  }

  /* Meta diaria */
  const goalButtons = DAILY_GOALS.map((g) =>
    h('button', { type: 'button', 'aria-pressed': String(s.settings.dailyGoal === g), onclick: () => setGoal(g) }, `${g} XP`),
  );
  function setGoal(g) {
    update((st) => { st.settings.dailyGoal = g; });
    goalButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(DAILY_GOALS[i] === g)));
  }

  /* Sonido */
  const soundToggle = h('button', {
    class: 'toggle',
    type: 'button',
    role: 'switch',
    'aria-checked': String(s.settings.sound),
    'aria-label': 'Sonidos',
    onclick: () => {
      update((st) => { st.settings.sound = !st.settings.sound; });
      soundToggle.setAttribute('aria-checked', String(getState().settings.sound));
    },
  });

  /* Actualizaciones */
  const updateStatus = h('div', { class: 'update-status', hidden: true, role: 'status' });
  const updateIcon = icon('refresh', 22, 'row-icon');
  const updateBtn = h(
    'button',
    { class: 'list-row', type: 'button', onclick: runUpdateCheck },
    updateIcon,
    h('div', { class: 'row-main' }, h('div', { class: 'row-title' }, 'Buscar actualizaciones'), h('div', { class: 'row-sub' }, `Versión instalada: ${APP_VERSION}`)),
  );
  let checking = false;
  async function runUpdateCheck() {
    if (checking) return;
    checking = true;
    updateIcon.classList.add('spin');
    updateStatus.hidden = false;
    updateStatus.className = 'update-status';
    updateStatus.textContent = 'Buscando actualizaciones…';
    try {
      const result = await checkForUpdates();
      if (result.status === 'outdated') {
        updateStatus.className = 'update-status outdated';
        updateStatus.textContent = `No tienes la última versión. Hay una actualización pendiente: v${result.latest} (tienes v${APP_VERSION}).`;
      } else if (result.status === 'latest') {
        updateStatus.className = 'update-status ok';
        updateStatus.textContent = `Ya tienes la última actualización instalada (v${APP_VERSION}).`;
      } else {
        updateStatus.className = 'update-status ok';
        updateStatus.textContent = `Ya tienes la última versión instalada (v${APP_VERSION}). Aún no hay otras versiones publicadas.`;
      }
    } catch {
      updateStatus.className = 'update-status';
      updateStatus.textContent = 'No se pudo comprobar. Revisa tu conexión a internet e inténtalo de nuevo.';
    } finally {
      checking = false;
      updateIcon.classList.remove('spin');
    }
  }

  /* Acciones */
  async function stopLearning() {
    const ok = await confirmDialog({
      title: `¿Dejar de aprender ${current.name}?`,
      message: 'Tu progreso queda guardado. Podrás continuar donde lo dejaste cuando vuelvas.',
      yes: 'Sí, dejarlo por ahora',
      no: 'Cancelar',
    });
    if (!ok) return;
    update((st) => { st.currentLang = null; });
    toast(`Progreso de ${current.name} guardado`);
    navigate('/languages', { replace: true });
  }

  async function eraseAll() {
    const ok = await confirmDialog({
      title: '¿Borrar todo tu progreso?',
      message: 'Se eliminan lenguajes, XP, racha y vidas. Tus ajustes se mantienen. No se puede deshacer.',
      yes: 'Borrar todo',
      no: 'Cancelar',
      danger: true,
    });
    if (!ok) return;
    resetAll();
    toast('Progreso borrado');
    navigate('/languages', { replace: true });
  }

  const row = (iconName, title, sub, control) =>
    h('div', { class: 'list-row' }, icon(iconName, 22, 'row-icon'), h('div', { class: 'row-main' }, h('div', { class: 'row-title' }, title), sub ? h('div', { class: 'row-sub' }, sub) : null), control);

  const stackRow = (iconName, title, control) =>
    h('div', { class: 'list-row stack-row' }, h('div', { class: 'row' }, icon(iconName, 22, 'row-icon'), h('div', { class: 'row-title' }, title)), h('div', { style: 'margin-top:12px' }, control));

  const actionRow = (iconName, title, sub, onClick, danger = false) =>
    h(
      'button',
      { class: 'list-row', type: 'button', onclick: onClick },
      icon(iconName, 22, 'row-icon'),
      h('div', { class: 'row-main' }, h('div', { class: 'row-title', style: danger ? 'color:var(--color-cardinal)' : null }, title), sub ? h('div', { class: 'row-sub' }, sub) : null),
      icon('chevronRight', 22, 'chevron'),
    );

  view.append(
    h('h1', { class: 'title' }, 'Ajustes'),

    h('h2', { class: 'label section-label' }, 'Perfil'),
    h('div', { class: 'list' }, stackRow('user', 'Nombre', nameInput)),

    h('h2', { class: 'label section-label' }, 'Aprendizaje'),
    h(
      'div',
      { class: 'list' },
      current
        ? actionRow('logout', `Dejar de aprender ${current.name}`, `Nivel ${getLevel(s.progress[current.id].level).name} · tu progreso se guarda`, stopLearning)
        : actionRow('code', 'Elegir un lenguaje', 'No estás aprendiendo ninguno ahora', () => navigate('/languages', { replace: true })),
      actionRow('layers', 'Cambiar de lenguaje', 'Python, Java, C, C++, Ruby, Assembly y más', () => navigate('/languages', { replace: true })),
      stackRow('target', 'Meta diaria', h('div', { class: 'segmented' }, goalButtons)),
    ),

    h('h2', { class: 'label section-label' }, 'Apariencia y sonido'),
    h('div', { class: 'list' }, stackRow('moon', 'Tema', h('div', { class: 'segmented' }, themeButtons)), row('volume', 'Sonidos', 'Al acertar, fallar y terminar', soundToggle)),

    h('h2', { class: 'label section-label' }, 'Ayuda'),
    h('div', { class: 'list' }, actionRow('book', 'Ver tutorial', 'Repasa cómo funciona la app', () => navigate('/tutorial'))),

    h('h2', { class: 'label section-label' }, 'Actualizaciones'),
    h('div', { class: 'list' }, updateBtn),
    updateStatus,

    h('h2', { class: 'label section-label' }, 'Datos'),
    h('div', { class: 'list' }, actionRow('trash', 'Borrar todo el progreso', 'Empieza la app desde cero', eraseAll, true)),

    h('p', { class: 'caption', style: 'text-align:center;margin-top:24px' }, `${APP_NAME} v${APP_VERSION} · Funciona sin conexión`),
  );
}
