const molFile = (name, atoms, bonds) => {
  const atomBlock = atoms.map(([x, y, z, el]) => (
    `${x.toFixed(4).padStart(10)}${y.toFixed(4).padStart(10)}${z.toFixed(4).padStart(10)} ${el.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`
  ));
  const bondBlock = bonds.map(([a, b, order = 1]) => (
    `${String(a).padStart(3)}${String(b).padStart(3)}${String(order).padStart(3)}  0  0  0  0`
  ));
  return [
    name,
    "  Chemistry Universe",
    "",
    `${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0  0  0  0  0999 V2000`,
    ...atomBlock,
    ...bondBlock,
    "M  END",
  ].join("\n");
};

export const POLARITY_STRUCTURES = {
  H2O: { url: "/assets/carbohydrate-studio/structures/water.sdf", format: "sdf", label: "Water · PubChem CID 962" },
  CO2: { data: molFile("Carbon dioxide", [[-1.16, 0, 0, "O"], [0, 0, 0, "C"], [1.16, 0, 0, "O"]], [[1, 2, 2], [2, 3, 2]]), format: "mol", label: "Carbon dioxide" },
  BF3: { data: molFile("Boron trifluoride", [[0, 0, 0, "B"], [1.30, 0, 0, "F"], [-0.65, 1.126, 0, "F"], [-0.65, -1.126, 0, "F"]], [[1, 2], [1, 3], [1, 4]]), format: "mol", label: "Boron trifluoride" },
  NH3: { data: molFile("Ammonia", [[0, 0.36, 0, "N"], [0.94, -0.12, 0, "H"], [-0.47, -0.12, 0.81, "H"], [-0.47, -0.12, -0.81, "H"]], [[1, 2], [1, 3], [1, 4]]), format: "mol", label: "Ammonia" },
  CH4: { data: molFile("Methane", [[0, 0, 0, "C"], [0.63, 0.63, 0.63, "H"], [-0.63, -0.63, 0.63, "H"], [-0.63, 0.63, -0.63, "H"], [0.63, -0.63, -0.63, "H"]], [[1, 2], [1, 3], [1, 4], [1, 5]]), format: "mol", label: "Methane" },
  SO2: { data: molFile("Sulfur dioxide", [[0, 0, 0, "S"], [1.24, 0.67, 0, "O"], [-1.24, 0.67, 0, "O"]], [[1, 2, 2], [1, 3, 2]]), format: "mol", label: "Sulfur dioxide" },
};

export const INTERACTIVE_STRUCTURES = {
  "butyl-acetate-esterification": { url: "/assets/spectroscopy/ethyl-acetate.sdf", format: "sdf", label: "Ethyl acetate · ester reference" },
  "methyl-acetate-hydrolysis": { url: "/assets/spectroscopy/ethyl-acetate.sdf", format: "sdf", label: "Carboxylate ester reference" },
  "carbohydrates-glucose-fructose": { url: "/assets/carbohydrate-studio/structures/d-glucose.sdf", format: "sdf", label: "D-Glucose" },
  "conformational-analysis": { url: "/assets/isomerism/butane.sdf", format: "sdf", label: "Butane conformer" },
  "nmr-mass-ir-uv-practice": { url: "/assets/spectroscopy/ethyl-acetate.sdf", format: "sdf", label: "Ethyl acetate" },
  "pblock-structures": { url: "/assets/p-block/silicon-diamond.cif", format: "mmcif", label: "Diamond-cubic silicon" },
  "heterocycles-pyrrole-pyridine": { url: "/assets/research-toolkit/caffeine-2519.sdf", format: "sdf", label: "Caffeine · fused N-heterocycle reference" },
};

export function benchKindFor(id = "", subject = "") {
  if (INTERACTIVE_STRUCTURES[id]) return "structure";
  if (/conduct|ph-metry|potentiom|ka-acetic|ksp-baso4|electrograv/.test(id)) return "electrodes";
  if (/colorim|flame|polarog/.test(id)) return "cuvette";
  if (/kinetics|saponif|h2o2|persulfate|distribution|solvent-extraction/.test(id)) return "flask";
  if (subject === "Organic" || /aspirin|nitro|benzo|ester|ether|azo|isatin|qualitative|naphthyl|benzylidene/.test(id)) return "organic";
  return "titration";
}
