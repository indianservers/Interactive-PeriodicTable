// A studio owns its nested routes; App owns entering and leaving the studio.
export const studioRoutes = [
  { id: 'bio-nucleic-acids', hash: 'visuals/bio/nucleic-acids', path: '/nucleic-acid-explorer' },
  { id: 'bio-carbohydrates', hash: 'visuals/bio/carbohydrates', path: '/carbohydrate-structure-studio' },
  { id: 'drug-discovery', hash: 'drug-discovery', path: '/drug-discovery' },
  { id: 'physical-simulators', hash: 'modules/physical' },
];
const within = (value, prefix) => value === prefix || value.startsWith(`${prefix}/`);
export const cleanHash = hash => hash.replace(/^#\/?/, '').split('?')[0].replace(/\/$/, '');
export function resolveAppRoute(location, aliases = {}) {
  const hash = cleanHash(location.hash || '');
  // Explicit hashes take precedence over legacy pathname routes, including exit.
  if (hash) {
    if (aliases[hash]) return aliases[hash];
    const studio = studioRoutes.find(item => within(hash, item.hash));
    if (studio) return studio.id;
    const nested = hash.split('#').filter(Boolean);
    if (nested.length > 1 && nested.at(-1) === 'molecule') return 'molecule';
    return aliases[nested[0]] || hash;
  }
  const pathname = (location.pathname || '/').replace(/\/$/, '');
  return studioRoutes.find(item => item.path && within(pathname, item.path))?.id || 'dashboard';
}
export function studioSection(location, id) {
  const studio = studioRoutes.find(item => item.id === id);
  if (!studio) return '';
  const hash = cleanHash(location.hash || '');
  if (within(hash, studio.hash)) return hash.slice(studio.hash.length).replace(/^\//, '');
  const path = (location.pathname || '').replace(/\/$/, '');
  return studio.path && within(path, studio.path) ? path.slice(studio.path.length).replace(/^\//, '') : '';
}
export function appRouteUrl(location, hash) {
  const url = new URL(location.href);
  if (studioRoutes.some(item => item.path && within(url.pathname.replace(/\/$/, ''), item.path))) url.pathname = '/';
  url.searchParams.delete('screen');
  url.searchParams.delete('pdb');
  url.searchParams.delete('q');
  const [route, ...query] = hash.replace(/^#\/?/, '').split('?');
  url.hash = `/${cleanHash(route)}${query.length ? `?${query.join('?')}` : ''}`;
  return url;
}
export function navigateStudio(id, section = '', params) {
  const studio = studioRoutes.find(item => item.id === id);
  if (!studio) throw new Error(`Unknown studio: ${id}`);
  const url = appRouteUrl(window.location, `${studio.hash}${section ? `/${section}` : ''}`);
  if (params) Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  if (url.href === window.location.href) return;
  window.history.pushState({}, '', url);
  // pushState does not emit either navigation event; notify root and workspace.
  window.dispatchEvent(new PopStateEvent('popstate'));
}
