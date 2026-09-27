// Stable isotopes for the Atom Builder's supported elements (Z = 1–18).
// Reference: https://physics.nist.gov/cgi-bin/Compositions/stand_alone.pl
const stableMassNumbers = {
  1:[1,2], 2:[3,4], 3:[6,7], 4:[9], 5:[10,11], 6:[12,13],
  7:[14,15], 8:[16,17,18], 9:[19], 10:[20,21,22], 11:[23],
  12:[24,25,26], 13:[27], 14:[28,29,30], 15:[31],
  16:[32,33,34,36], 17:[35,37], 18:[36,38,40],
};
export function stabilityFor(protons, neutrons) {
  if (!protons) return ['No atomic nucleus', 'unstable'];
  return stableMassNumbers[protons]?.includes(protons + neutrons)
    ? ['Stable', 'stable'] : ['Unstable', 'unstable'];
}
