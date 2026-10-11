// Tema: 'system' sigue al teléfono; 'light' / 'dark' lo fuerzan.
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
  else delete root.dataset.theme;
}
