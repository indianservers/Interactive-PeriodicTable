export const MOLSTAR_COLOR_SCHEMES = {
  spectrum: 'sequence-id',
  chain: 'chain-id',
  element: 'element-symbol',
  secondary: 'secondary-structure',
  residue: 'residue-name',
  hydrophobicity: 'hydrophobicity',
  charge: 'residue-name',
  bfactor: 'uncertainty',
};

export const MOLSTAR_REPRESENTATIONS = {
  cartoon: { type: 'cartoon', component: 'polymer' },
  sticks: { type: 'ball-and-stick', component: 'all' },
  spacefill: { type: 'spacefill', component: 'all' },
  surface: { type: 'molecular-surface', component: 'polymer' },
};

export function resolveColorScheme(value = 'chain') {
  return MOLSTAR_COLOR_SCHEMES[value] || 'chain-id';
}
