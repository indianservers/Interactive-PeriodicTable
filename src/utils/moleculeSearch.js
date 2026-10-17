export function moleculeModel(molecule) {
  const index = new Map(molecule.atoms.map((atom,i)=>[atom.id,i]));
  return {
    atoms:molecule.atoms.map(atom=>[atom.element,...atom.position]),
    bonds:molecule.bonds.map(bond=>[index.get(bond.from),index.get(bond.to)]),
  };
}
export function requestedMolecule(location, molecules) {
  const name=new URLSearchParams((location.hash || '').split('?')[1] || '').get('compound');
  return molecules.find(m=>m.name===name);
}
