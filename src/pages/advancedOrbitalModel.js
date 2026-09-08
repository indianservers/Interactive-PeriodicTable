// Qualitative LCAO model in angstrom coordinates; amplitudes are arbitrary units.
// The carbon 2p lobes are normal to the molecular xy plane.
export function orbitalAmplitude(x, y, z, orbital = 'HOMO (π)') {
  const a = Math.exp(-2.2 * Math.hypot(x + 0.67, y, z));
  const b = Math.exp(-2.2 * Math.hypot(x - 0.67, y, z));
  if (orbital.startsWith('σ')) return (a + b) * 0.22;
  return z * (orbital.startsWith('LUMO') ? a - b : a + b);
}

export const etheneAtoms = [
  ['C', -.67, 0, 0], ['C', .67, 0, 0],
  ['H', -1.23, .93, 0], ['H', -1.23, -.93, 0],
  ['H', 1.23, .93, 0], ['H', 1.23, -.93, 0],
];
