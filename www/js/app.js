import { APP_NAME } from './config.js';
import { loadState, getState } from './storage.js';
import { applyTheme } from './theme.js';
import { route, navigate, currentPath, setRouteListener } from './router.js';
import { h, icon, closeTopDialog } from './ui.js';
import { pathScreen } from './screens/path.js';
import { languagesScreen } from './screens/languages.js';
import { levelScreen } from './screens/level.js';
import { lessonScreen } from './screens/lesson.js';
import { profileScreen } from './screens/profile.js';
import { settingsScreen } from './screens/settings.js';
import { tutorialScreen } from './screens/tutorial.js';

document.title = APP_NAME;
loadState();
applyTheme(getState().settings.theme);

/* ---------- Pestañas ---------- */
const TABS = [
  { id: 'learn', label: 'Aprender', icon: 'home', path: '/path' },
  { id: 'languages', label: 'Lenguajes', icon: 'code', path: '/languages' },
  { id: 'profile', label: 'Perfil', icon: 'user', path: '/profile' },
  { id: 'settings', label: 'Ajustes', icon: 'settings', path: '/settings' },
];

const tabButtons = TABS.map((tab) =>
  h(
    'button',
    {
      class: 'tab',
      type: 'button',
      onclick: () => {
        const path = tab.id === 'learn' && !getState().currentLang ? '/languages' : tab.path;
        navigate(path, { replace: true });
      },
    },
    icon(tab.icon, 26),
    tab.label,
  ),
);
document.getElementById('tabbar').append(...tabButtons);

setRouteListener((activeTab) => {
  tabButtons.forEach((b, i) => {
    if (TABS[i].id === activeTab) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
});

/* ---------- Rutas ---------- */
route('/path', pathScreen, { tab: 'learn', fallback: true });
route('/languages', languagesScreen, { tab: 'languages' });
route('/level/:lang', levelScreen);
route('/lesson/:lang/:id', lessonScreen);
route('/profile', profileScreen, { tab: 'profile' });
route('/settings', settingsScreen, { tab: 'settings' });
route('/tutorial', tutorialScreen);

/* ---------- Botón "atrás" de Android (plugin @capacitor/app) ---------- */
const CapApp = window.Capacitor?.Plugins?.App;
if (CapApp) {
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (closeTopDialog()) return;
    if (canGoBack) history.back();
    else CapApp.exitApp();
  });
}

/* ---------- Inicio ---------- */
const s = getState();
let start = currentPath();
if (!s.tutorialDone) start = '/tutorial';
else if (!['/path', '/languages', '/profile', '/settings'].includes(start)) start = s.currentLang ? '/path' : '/languages';
navigate(start, { replace: true });
