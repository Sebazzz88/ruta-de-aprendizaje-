import { loadLanguages, loadCourse } from '../data.js';
import { getState } from '../storage.js';
import { navigate } from '../router.js';
import { h, icon, langBadge, dialog, confirmDialog } from '../ui.js';
import { getLevel, courseSummary, setCurrentLanguage, deleteLanguageProgress } from '../game.js';

export async function languagesScreen(view) {
  const languages = await loadLanguages();
  const s = getState();

  const summaries = {};
  await Promise.all(
    languages
      .filter((l) => s.progress[l.id])
      .map(async (l) => {
        summaries[l.id] = courseSummary(await loadCourse(l.id), s.progress[l.id]);
      }),
  );

  view.append(
    h('h1', { class: 'title' }, 'Lenguajes'),
    h('p', { class: 'body-text', style: 'margin:8px 0 24px' }, 'Elige qué quieres aprender. Tu progreso se guarda por lenguaje.'),
    h('div', { class: 'lang-list' }, languages.map((lang) => languageCard(lang, s, summaries[lang.id]))),
  );
}

function languageCard(lang, s, summary) {
  const isCurrent = s.currentLang === lang.id;
  const saved = s.progress[lang.id];
  const meta = [];
  if (isCurrent) meta.push(h('span', { class: 'pill pill-green' }, 'Aprendiendo'));
  else if (saved) meta.push(h('span', { class: 'pill pill-blue' }, 'Progreso guardado'));
  if (saved && summary) {
    meta.push(h('span', { class: 'pill' }, getLevel(saved.level).name));
    meta.push(h('span', { class: 'pill' }, `${summary.done}/${summary.total} lecciones`));
  }

  return h(
    'button',
    { class: 'card card-button lang-card', type: 'button', onclick: () => chooseLanguage(lang) },
    langBadge(lang, { active: isCurrent }),
    h(
      'div',
      { class: 'row-main' },
      h('div', { class: 'card-title' }, lang.name),
      h('div', { class: 'card-text' }, lang.description),
      meta.length ? h('div', { class: 'lang-meta' }, meta) : null,
    ),
    icon('chevronRight', 24, 'chevron'),
  );
}

// Flujo al tocar un lenguaje:
// 1. Si estás aprendiendo otro, pregunta si guardar su progreso.
// 2. Si el elegido tiene progreso guardado: ¿eliminar y empezar de 0? -> si no, ¿continuar donde lo dejaste?
// 3. Si no tiene progreso: elegir nivel.
export async function chooseLanguage(lang) {
  const s = getState();
  if (s.currentLang === lang.id) {
    navigate('/path', { replace: true });
    return;
  }

  if (s.currentLang) {
    const languages = await loadLanguages();
    const current = languages.find((l) => l.id === s.currentLang);
    const currentName = current?.name || s.currentLang;
    const choice = await dialog({
      title: `¿Guardar tu progreso en ${currentName}?`,
      message: `Vas a cambiar a ${lang.name}. Si lo guardas, podrás volver a ${currentName} cuando quieras.`,
      buttons: [
        { label: 'Guardar progreso', value: 'save', variant: 'btn-primary' },
        { label: 'No guardar', value: 'discard', variant: 'btn-danger-outline' },
        { label: 'Cancelar', value: null, variant: 'btn-ghost' },
      ],
    });
    if (!choice) return;
    if (choice === 'discard') {
      const sure = await confirmDialog({
        title: `Se borrará tu progreso en ${currentName}`,
        message: 'Esta acción no se puede deshacer.',
        yes: 'Borrar y cambiar',
        no: 'Cancelar',
        danger: true,
      });
      if (!sure) return;
      deleteLanguageProgress(s.currentLang);
    }
  }

  const saved = getState().progress[lang.id];
  if (saved) {
    const summary = courseSummary(await loadCourse(lang.id), saved);
    const reset = await dialog({
      title: '¿Deseas eliminar tu progreso y empezar desde 0?',
      message: `Tienes progreso guardado en ${lang.name}: nivel ${getLevel(saved.level).name}, ${summary.done} de ${summary.total} lecciones.`,
      buttons: [
        { label: 'Sí', value: 'yes', variant: 'btn-danger' },
        { label: 'No', value: 'no', variant: 'btn-outline' },
      ],
    });
    if (reset === 'yes') {
      deleteLanguageProgress(lang.id);
      navigate(`/level/${lang.id}`);
      return;
    }
    if (reset === 'no') {
      const resume = await dialog({
        title: '¿Deseas continuar donde lo dejaste?',
        buttons: [
          { label: 'Sí', value: true, variant: 'btn-primary' },
          { label: 'No', value: false, variant: 'btn-outline' },
        ],
      });
      if (resume) {
        setCurrentLanguage(lang.id);
        navigate('/path', { replace: true });
        return;
      }
    }
    // Si no eligió nada, se queda en la lista; si había quitado el lenguaje actual, se refresca.
    navigate('/languages', { replace: true });
    return;
  }

  navigate(`/level/${lang.id}`);
}
