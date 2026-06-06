export function normalizePath(path: string) {
  const raw = path.replace(/^#\/?/, '');
  if (!raw.startsWith('/')) {
    return raw.length > 0 ? `/${raw}` : '/';
  }
  return raw;
}

export function navigateTo(path: string, replace = false) {
  const normalized = normalizePath(path);
  if (replace) {
    window.history.replaceState({}, '', normalized);
  } else {
    window.history.pushState({}, '', normalized);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}
