import { loadCourse } from '../data.js';
import { getState } from '../storage.js';
import { navigate, leave } from '../router.js';
import { h, icon, progressBar, dialog, setChildren } from '../ui.js';
import { createExercise, TYPE_LABELS, DEFAULT_PROMPTS } from '../exercises/index.js';
import { getLevel, lessonStates, refreshLives, loseLife, completeLesson, streakInfo, todayXp, formatWait } from '../game.js';
import { playCorrect, playWrong, playComplete } from '../sound.js';

export async function lessonScreen(view, { lang: langId, id: lessonId }) {
  const s = getState();
  const progress = s.progress[langId];
  if (!progress || s.currentLang !== langId) {
    navigate('/path', { replace: true });
    return;
  }
  const course = await loadCourse(langId);
  const lesson = course.units.flatMap((u) => u.lessons).find((l) => l.id === lessonId);
  const status = lesson && lessonStates(course, progress).map[lesson.id];
  if (!lesson || !status || status === 'locked') {
    navigate('/path', { replace: true });
    return;
  }

  const level = getLevel(progress.level);
  const total = lesson.exercises.length;
  const queue = lesson.exercises.map((ex, index) => ({ ex, index, retry: false }));
  const firstTry = new Set(); // ejercicios acertados al primer intento
  let solved = 0;
  let mistakes = 0;
  let pos = 0;
  let inProgress = true;

  const livesValue = h('span', {}, refreshLives().count);
  const barHolder = h('div', { style: 'flex:1' }, progressBar(0, total));
  const header = h(
    'div',
    { class: 'lesson-header' },
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Salir de la lección', onclick: () => history.back() }, icon('x', 28)),
    barHolder,
    h('span', { class: 'stat-chip' }, icon('heart', 22, 'ico-heart'), livesValue),
  );
  const body = h('div', { class: 'lesson-body' });
  const footerInner = h('div', { class: 'lesson-footer-inner' });
  const footer = h('div', { class: 'lesson-footer' }, footerInner);
  const root = h('div', { class: 'lesson' }, header, body);
  view.append(root, footer);

  const setProgress = () => barHolder.replaceChildren(progressBar(solved, total));

  function showExercise() {
    const item = queue[pos];
    const { ex } = item;
    const checkBtn = h('button', { class: 'btn btn-primary btn-block', type: 'button', disabled: true }, 'Comprobar');
    // Algunos ejercicios avisan de cambios mientras se construyen, antes de asignar `exercise`.
    let exercise = null;
    exercise = createExercise(ex, () => { if (exercise) checkBtn.disabled = !exercise.isReady(); });
    checkBtn.disabled = !exercise.isReady();
    checkBtn.addEventListener('click', () => check(item, exercise));

    body.replaceChildren(
      h('div', { class: 'label exercise-type' }, item.retry ? `Repaso · ${TYPE_LABELS[ex.type]}` : TYPE_LABELS[ex.type]),
      h('h1', { class: 'exercise-prompt' }, ex.prompt || DEFAULT_PROMPTS[ex.type]),
      exercise.el,
    );
    footer.className = 'lesson-footer';
    footerInner.replaceChildren(checkBtn);
    window.scrollTo(0, 0);
  }

  function check(item, exercise) {
    const correct = exercise.check();
    exercise.lock();

    if (correct) {
      playCorrect();
      if (!item.retry) firstTry.add(item.index);
      solved++;
    } else {
      playWrong();
      mistakes++;
      livesValue.textContent = loseLife();
      if (level.repeatMistakes && !item.retry) queue.push({ ...item, retry: true });
      else solved++;
    }
    setProgress();

    const outOfLives = !correct && getState().lives.count <= 0;
    const nextBtn = h(
      'button',
      { class: `btn btn-block ${correct ? 'btn-primary' : 'btn-danger'}`, type: 'button' },
      outOfLives ? 'Ver resultado' : 'Continuar',
    );
    nextBtn.addEventListener('click', () => {
      if (outOfLives) return showOutOfLives();
      pos++;
      if (pos < queue.length) showExercise();
      else finish();
    });

    footer.className = `lesson-footer ${correct ? 'is-correct' : 'is-wrong'}`;
    setChildren(
      footerInner,
      h(
        'div',
        { class: 'feedback-title' },
        h('span', { class: 'feedback-icon' }, icon(correct ? 'check' : 'x', 20)),
        correct ? '¡Correcto!' : 'Incorrecto',
      ),
      correct ? null : h('div', {}, h('div', { class: 'caption' }, 'Respuesta correcta:'), h('div', { class: 'feedback-answer' }, exercise.solution())),
      item.ex.explanation ? h('p', { class: 'feedback-text' }, item.ex.explanation) : null,
      nextBtn,
    );
    nextBtn.focus({ preventScroll: true });
  }

  function finish() {
    inProgress = false;
    playComplete();
    const goal = getState().settings.dailyGoal;
    const before = todayXp();
    const xp = completeLesson(langId, lesson.id, { perfect: mistakes === 0, correct: firstTry.size, total });
    const accuracy = Math.round((firstTry.size / total) * 100);
    const streak = streakInfo();
    const reachedGoal = before < goal && before + xp >= goal;

    footer.className = 'lesson-footer';
    footerInner.replaceChildren(h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => leave() }, 'Continuar'));
    root.replaceChildren(
      h(
        'div',
        { class: 'lesson-end' },
        h('div', { class: 'big-icon ico-bolt' }, icon('star', 56)),
        h('h1', { class: 'display' }, '¡Genial!'),
        h('p', { class: 'body-text' }, mistakes === 0 ? 'Lección perfecta, sin errores.' : `Completaste "${lesson.title}".`),
        h(
          'div',
          { class: 'end-stats' },
          stat('bolt', 'ico-bolt', `+${xp}`, 'XP'),
          stat('target', 'ico-green', `${accuracy}%`, 'Precisión'),
          stat('flame', 'ico-flame', streak.current, streak.current === 1 ? 'Día' : 'Días'),
        ),
        reachedGoal ? h('p', { class: 'pill pill-green' }, '¡Meta diaria cumplida!') : null,
      ),
    );
  }

  function showOutOfLives() {
    inProgress = false;
    const lives = refreshLives();
    footer.className = 'lesson-footer';
    footerInner.replaceChildren(h('button', { class: 'btn btn-primary btn-block', type: 'button', onclick: () => leave() }, 'Volver a la ruta'));
    root.replaceChildren(
      h(
        'div',
        { class: 'lesson-end' },
        h('div', { class: 'big-icon ico-heart' }, icon('heart', 56)),
        h('h1', { class: 'title' }, 'Te quedaste sin vidas'),
        h('p', { class: 'body-text' }, `Recuperas 1 vida cada 30 minutos. La próxima llega en ${formatWait(lives.nextInMs)}.`),
      ),
    );
  }

  showExercise();

  return {
    guard: async () => {
      if (!inProgress) return true;
      const exit = await dialog({
        title: '¿Salir de la lección?',
        message: 'Perderás el avance de esta lección.',
        buttons: [
          { label: 'Seguir aprendiendo', value: false, variant: 'btn-primary' },
          { label: 'Salir', value: true, variant: 'btn-danger-outline' },
        ],
      });
      return exit === true;
    },
  };
}

function stat(name, cls, value, label) {
  return h('div', { class: 'stat-tile' }, icon(name, 24, cls), h('div', { class: 'stat-value' }, value), h('div', { class: 'stat-label' }, label));
}
