export const elements = [
  {
    atomicNumber: 1, symbol: "H", name: "Hydrogen", atomicMass: 1.008,
    category: "reactive nonmetal", group: 1, period: 1, block: "s",
    xpos: 1, ypos: 1, electronConfiguration: "1s¹", shells: [1],
    phase: "Gas", density: 0.00008988, meltingPoint: 13.99, boilingPoint: 20.271,
    electronegativity: 2.2, ionizationEnergy: 1312, atomicRadius: 53,
    discoveredBy: "Henry Cavendish", yearDiscovered: 1766,
    summary: "Hydrogen is the lightest and most abundant element in the universe. It is a colorless, odorless, tasteless gas at standard conditions.",
    commonUses: ["Fuel cells", "Ammonia production", "Rocket fuel", "Petroleum refining"]
  },
  {
    atomicNumber: 2, symbol: "He", name: "Helium", atomicMass: 4.0026,
    category: "noble gas", group: 18, period: 1, block: "s",
    xpos: 18, ypos: 1, electronConfiguration: "1s²", shells: [2],
    phase: "Gas", density: 0.0001664, meltingPoint: 0.95, boilingPoint: 4.222,
    electronegativity: null, ionizationEnergy: 2372, atomicRadius: 31,
    discoveredBy: "Pierre Janssen", yearDiscovered: 1868,
    summary: "Helium is the second lightest element and the second most abundant in the universe. It is a colorless, odorless noble gas.",
    commonUses: ["Balloons", "Cryogenics", "MRI machines", "Welding shield gas"]
  },
  {
    atomicNumber: 3, symbol: "Li", name: "Lithium", atomicMass: 6.94,
    category: "alkali metal", group: 1, period: 2, block: "s",
    xpos: 1, ypos: 2, electronConfiguration: "[He] 2s¹", shells: [2, 1],
    phase: "Solid", density: 0.534, meltingPoint: 453.65, boilingPoint: 1603,
    electronegativity: 0.98, ionizationEnergy: 520, atomicRadius: 167,
    discoveredBy: "Johan August Arfwedson", yearDiscovered: 1817,
    summary: "Lithium is the lightest metal and the least dense solid element. It is a soft, silvery-white alkali metal.",
    commonUses: ["Lithium-ion batteries", "Psychiatric medication", "Alloys", "Glass ceramics"]
  },
  {
    atomicNumber: 4, symbol: "Be", name: "Beryllium", atomicMass: 9.0122,
    category: "alkaline earth metal", group: 2, period: 2, block: "s",
    xpos: 2, ypos: 2, electronConfiguration: "[He] 2s²", shells: [2, 2],
    phase: "Solid", density: 1.85, meltingPoint: 1560, boilingPoint: 2742,
    electronegativity: 1.57, ionizationEnergy: 900, atomicRadius: 112,
    discoveredBy: "Louis Nicolas Vauquelin", yearDiscovered: 1798,
    summary: "Beryllium is a hard, grayish metal notable for its stiffness, low density, and high melting point.",
    commonUses: ["Aerospace components", "X-ray windows", "Nuclear reactors", "Electronic devices"]
  },
  {
    atomicNumber: 5, symbol: "B", name: "Boron", atomicMass: 10.81,
    category: "metalloid", group: 13, period: 2, block: "p",
    xpos: 13, ypos: 2, electronConfiguration: "[He] 2s² 2p¹", shells: [2, 3],
    phase: "Solid", density: 2.34, meltingPoint: 2349, boilingPoint: 4200,
    electronegativity: 2.04, ionizationEnergy: 800, atomicRadius: 87,
    discoveredBy: "Joseph Louis Gay-Lussac", yearDiscovered: 1808,
    summary: "Boron is a metalloid with properties between metals and nonmetals. It is essential for plant growth.",
    commonUses: ["Borosilicate glass", "Detergents", "Semiconductors", "Fertilizers"]
  },
  {
    atomicNumber: 6, symbol: "C", name: "Carbon", atomicMass: 12.011,
    category: "reactive nonmetal", group: 14, period: 2, block: "p",
    xpos: 14, ypos: 2, electronConfiguration: "[He] 2s² 2p²", shells: [2, 4],
    phase: "Solid", density: 2.267, meltingPoint: 3823, boilingPoint: 4098,
    electronegativity: 2.55, ionizationEnergy: 1086, atomicRadius: 67,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Carbon is the basis of all known life on Earth. It forms more compounds than any other element.",
    commonUses: ["Steel production", "Diamonds", "Fuel", "Plastics", "Carbon fiber"]
  },
  {
    atomicNumber: 7, symbol: "N", name: "Nitrogen", atomicMass: 14.007,
    category: "reactive nonmetal", group: 15, period: 2, block: "p",
    xpos: 15, ypos: 2, electronConfiguration: "[He] 2s² 2p³", shells: [2, 5],
    phase: "Gas", density: 0.0012506, meltingPoint: 63.15, boilingPoint: 77.355,
    electronegativity: 3.04, ionizationEnergy: 1402, atomicRadius: 56,
    discoveredBy: "Daniel Rutherford", yearDiscovered: 1772,
    summary: "Nitrogen makes up about 78% of Earth's atmosphere. It is essential for amino acids, proteins, and DNA.",
    commonUses: ["Fertilizers", "Explosives", "Food preservation", "Cryogenics"]
  },
  {
    atomicNumber: 8, symbol: "O", name: "Oxygen", atomicMass: 15.999,
    category: "reactive nonmetal", group: 16, period: 2, block: "p",
    xpos: 16, ypos: 2, electronConfiguration: "[He] 2s² 2p⁴", shells: [2, 6],
    phase: "Gas", density: 0.001429, meltingPoint: 54.36, boilingPoint: 90.188,
    electronegativity: 3.44, ionizationEnergy: 1314, atomicRadius: 48,
    discoveredBy: "Carl Wilhelm Scheele", yearDiscovered: 1771,
    summary: "Oxygen is essential for respiration in most living organisms. It makes up about 21% of Earth's atmosphere.",
    commonUses: ["Respiration", "Steel production", "Medical use", "Rocket propellant"]
  },
  {
    atomicNumber: 9, symbol: "F", name: "Fluorine", atomicMass: 18.998,
    category: "halogen", group: 17, period: 2, block: "p",
    xpos: 17, ypos: 2, electronConfiguration: "[He] 2s² 2p⁵", shells: [2, 7],
    phase: "Gas", density: 0.001696, meltingPoint: 53.48, boilingPoint: 85.03,
    electronegativity: 3.98, ionizationEnergy: 1681, atomicRadius: 42,
    discoveredBy: "Henri Moissan", yearDiscovered: 1886,
    summary: "Fluorine is the most electronegative element and the most reactive nonmetal. It is a pale yellow gas.",
    commonUses: ["Toothpaste", "Teflon", "Refrigerants", "Uranium enrichment"]
  },
  {
    atomicNumber: 10, symbol: "Ne", name: "Neon", atomicMass: 20.18,
    category: "noble gas", group: 18, period: 2, block: "p",
    xpos: 18, ypos: 2, electronConfiguration: "[He] 2s² 2p⁶", shells: [2, 8],
    phase: "Gas", density: 0.0008999, meltingPoint: 24.56, boilingPoint: 27.104,
    electronegativity: null, ionizationEnergy: 2081, atomicRadius: 38,
    discoveredBy: "William Ramsay", yearDiscovered: 1898,
    summary: "Neon is a noble gas and produces a distinctive reddish-orange glow in neon signs.",
    commonUses: ["Neon signs", "Lasers", "Cryogenic refrigerant", "Television tubes"]
  },
  {
    atomicNumber: 11, symbol: "Na", name: "Sodium", atomicMass: 22.99,
    category: "alkali metal", group: 1, period: 3, block: "s",
    xpos: 1, ypos: 3, electronConfiguration: "[Ne] 3s¹", shells: [2, 8, 1],
    phase: "Solid", density: 0.968, meltingPoint: 370.944, boilingPoint: 1156.09,
    electronegativity: 0.93, ionizationEnergy: 496, atomicRadius: 190,
    discoveredBy: "Humphry Davy", yearDiscovered: 1807,
    summary: "Sodium is a soft, silvery-white alkali metal. It is highly reactive and is essential for life.",
    commonUses: ["Table salt (NaCl)", "Sodium vapor lamps", "Soaps", "Paper production"]
  },
  {
    atomicNumber: 12, symbol: "Mg", name: "Magnesium", atomicMass: 24.305,
    category: "alkaline earth metal", group: 2, period: 3, block: "s",
    xpos: 2, ypos: 3, electronConfiguration: "[Ne] 3s²", shells: [2, 8, 2],
    phase: "Solid", density: 1.738, meltingPoint: 923, boilingPoint: 1363,
    electronegativity: 1.31, ionizationEnergy: 738, atomicRadius: 145,
    discoveredBy: "Joseph Black", yearDiscovered: 1755,
    summary: "Magnesium is a light, silvery metal essential to all cells of all known living organisms.",
    commonUses: ["Lightweight alloys", "Fireworks", "Fertilizers", "Medical antacids"]
  },
  {
    atomicNumber: 13, symbol: "Al", name: "Aluminium", atomicMass: 26.982,
    category: "post-transition metal", group: 13, period: 3, block: "p",
    xpos: 13, ypos: 3, electronConfiguration: "[Ne] 3s² 3p¹", shells: [2, 8, 3],
    phase: "Solid", density: 2.7, meltingPoint: 933.473, boilingPoint: 2743,
    electronegativity: 1.61, ionizationEnergy: 577, atomicRadius: 118,
    discoveredBy: "Hans Christian Ørsted", yearDiscovered: 1824,
    summary: "Aluminium is the most abundant metal in Earth's crust. It is lightweight, durable, and corrosion-resistant.",
    commonUses: ["Aircraft construction", "Beverage cans", "Electrical wiring", "Packaging"]
  },
  {
    atomicNumber: 14, symbol: "Si", name: "Silicon", atomicMass: 28.085,
    category: "metalloid", group: 14, period: 3, block: "p",
    xpos: 14, ypos: 3, electronConfiguration: "[Ne] 3s² 3p²", shells: [2, 8, 4],
    phase: "Solid", density: 2.3296, meltingPoint: 1687, boilingPoint: 3538,
    electronegativity: 1.9, ionizationEnergy: 786, atomicRadius: 111,
    discoveredBy: "Jöns Jacob Berzelius", yearDiscovered: 1824,
    summary: "Silicon is the second most abundant element in Earth's crust and is fundamental to modern electronics.",
    commonUses: ["Semiconductors", "Solar cells", "Glass", "Computer chips"]
  },
  {
    atomicNumber: 15, symbol: "P", name: "Phosphorus", atomicMass: 30.974,
    category: "reactive nonmetal", group: 15, period: 3, block: "p",
    xpos: 15, ypos: 3, electronConfiguration: "[Ne] 3s² 3p³", shells: [2, 8, 5],
    phase: "Solid", density: 1.82, meltingPoint: 317.3, boilingPoint: 553.65,
    electronegativity: 2.19, ionizationEnergy: 1012, atomicRadius: 98,
    discoveredBy: "Hennig Brand", yearDiscovered: 1669,
    summary: "Phosphorus is essential for life, forming part of DNA, RNA, and ATP. It is highly reactive.",
    commonUses: ["Fertilizers", "Matches", "Detergents", "Pesticides"]
  },
  {
    atomicNumber: 16, symbol: "S", name: "Sulfur", atomicMass: 32.06,
    category: "reactive nonmetal", group: 16, period: 3, block: "p",
    xpos: 16, ypos: 3, electronConfiguration: "[Ne] 3s² 3p⁴", shells: [2, 8, 6],
    phase: "Solid", density: 2.067, meltingPoint: 388.36, boilingPoint: 717.75,
    electronegativity: 2.58, ionizationEnergy: 1000, atomicRadius: 88,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Sulfur is a bright yellow crystalline solid at room temperature. It is essential for amino acids and proteins.",
    commonUses: ["Sulfuric acid production", "Fertilizers", "Rubber vulcanization", "Medicines"]
  },
  {
    atomicNumber: 17, symbol: "Cl", name: "Chlorine", atomicMass: 35.45,
    category: "halogen", group: 17, period: 3, block: "p",
    xpos: 17, ypos: 3, electronConfiguration: "[Ne] 3s² 3p⁵", shells: [2, 8, 7],
    phase: "Gas", density: 0.003214, meltingPoint: 171.65, boilingPoint: 239.11,
    electronegativity: 3.16, ionizationEnergy: 1251, atomicRadius: 79,
    discoveredBy: "Carl Wilhelm Scheele", yearDiscovered: 1774,
    summary: "Chlorine is a yellow-green gas widely used in water purification and as a disinfectant.",
    commonUses: ["Water disinfection", "PVC plastic", "Bleach", "Pharmaceuticals"]
  },
  {
    atomicNumber: 18, symbol: "Ar", name: "Argon", atomicMass: 39.948,
    category: "noble gas", group: 18, period: 3, block: "p",
    xpos: 18, ypos: 3, electronConfiguration: "[Ne] 3s² 3p⁶", shells: [2, 8, 8],
    phase: "Gas", density: 0.001784, meltingPoint: 83.81, boilingPoint: 87.302,
    electronegativity: null, ionizationEnergy: 1521, atomicRadius: 71,
    discoveredBy: "Lord Rayleigh", yearDiscovered: 1894,
    summary: "Argon is the third most abundant gas in Earth's atmosphere and is chemically inert.",
    commonUses: ["Welding shielding gas", "Incandescent light bulbs", "Cryogenic applications", "Laboratory atmospheres"]
  },
  {
    atomicNumber: 19, symbol: "K", name: "Potassium", atomicMass: 39.098,
    category: "alkali metal", group: 1, period: 4, block: "s",
    xpos: 1, ypos: 4, electronConfiguration: "[Ar] 4s¹", shells: [2, 8, 8, 1],
    phase: "Solid", density: 0.862, meltingPoint: 336.7, boilingPoint: 1032,
    electronegativity: 0.82, ionizationEnergy: 419, atomicRadius: 243,
    discoveredBy: "Humphry Davy", yearDiscovered: 1807,
    summary: "Potassium is a soft, silvery-white metal essential for all living cells and the functioning of the heart.",
    commonUses: ["Fertilizers", "Explosives", "Medicine", "Food additives"]
  },
  {
    atomicNumber: 20, symbol: "Ca", name: "Calcium", atomicMass: 40.078,
    category: "alkaline earth metal", group: 2, period: 4, block: "s",
    xpos: 2, ypos: 4, electronConfiguration: "[Ar] 4s²", shells: [2, 8, 8, 2],
    phase: "Solid", density: 1.55, meltingPoint: 1115, boilingPoint: 1757,
    electronegativity: 1.0, ionizationEnergy: 590, atomicRadius: 194,
    discoveredBy: "Humphry Davy", yearDiscovered: 1808,
    summary: "Calcium is essential for the development of bones and teeth and is the most abundant metal in the human body.",
    commonUses: ["Cement", "Bone structure", "Food additive", "Steel production"]
  },
  {
    atomicNumber: 21, symbol: "Sc", name: "Scandium", atomicMass: 44.956,
    category: "transition metal", group: 3, period: 4, block: "d",
    xpos: 3, ypos: 4, electronConfiguration: "[Ar] 3d¹ 4s²", shells: [2, 8, 9, 2],
    phase: "Solid", density: 2.985, meltingPoint: 1814, boilingPoint: 3109,
    electronegativity: 1.36, ionizationEnergy: 633, atomicRadius: 184,
    discoveredBy: "Lars Fredrik Nilson", yearDiscovered: 1879,
    summary: "Scandium is a silvery-white transition metal that is found in many minerals. It is lightweight and strong.",
    commonUses: ["Aerospace alloys", "Sports equipment", "High-intensity lighting", "Fuel cells"]
  },
  {
    atomicNumber: 22, symbol: "Ti", name: "Titanium", atomicMass: 47.867,
    category: "transition metal", group: 4, period: 4, block: "d",
    xpos: 4, ypos: 4, electronConfiguration: "[Ar] 3d² 4s²", shells: [2, 8, 10, 2],
    phase: "Solid", density: 4.507, meltingPoint: 1941, boilingPoint: 3560,
    electronegativity: 1.54, ionizationEnergy: 659, atomicRadius: 176,
    discoveredBy: "William Gregor", yearDiscovered: 1791,
    summary: "Titanium is a strong, lightweight metal known for its corrosion resistance and biocompatibility.",
    commonUses: ["Aircraft components", "Medical implants", "Pigments", "Sports equipment"]
  },
  {
    atomicNumber: 23, symbol: "V", name: "Vanadium", atomicMass: 50.942,
    category: "transition metal", group: 5, period: 4, block: "d",
    xpos: 5, ypos: 4, electronConfiguration: "[Ar] 3d³ 4s²", shells: [2, 8, 11, 2],
    phase: "Solid", density: 6.11, meltingPoint: 2183, boilingPoint: 3680,
    electronegativity: 1.63, ionizationEnergy: 651, atomicRadius: 171,
    discoveredBy: "Andrés Manuel del Río", yearDiscovered: 1801,
    summary: "Vanadium is a hard, silvery-grey metal that is used to toughen steel.",
    commonUses: ["Steel alloys", "Vanadium flow batteries", "Aerospace", "Catalysts"]
  },
  {
    atomicNumber: 24, symbol: "Cr", name: "Chromium", atomicMass: 51.996,
    category: "transition metal", group: 6, period: 4, block: "d",
    xpos: 6, ypos: 4, electronConfiguration: "[Ar] 3d⁵ 4s¹", shells: [2, 8, 13, 1],
    phase: "Solid", density: 7.19, meltingPoint: 2180, boilingPoint: 2944,
    electronegativity: 1.66, ionizationEnergy: 653, atomicRadius: 166,
    discoveredBy: "Louis Nicolas Vauquelin", yearDiscovered: 1798,
    summary: "Chromium is a hard, shiny metal known for its high corrosion resistance and used in stainless steel.",
    commonUses: ["Stainless steel", "Chrome plating", "Dyes and pigments", "Leather tanning"]
  },
  {
    atomicNumber: 25, symbol: "Mn", name: "Manganese", atomicMass: 54.938,
    category: "transition metal", group: 7, period: 4, block: "d",
    xpos: 7, ypos: 4, electronConfiguration: "[Ar] 3d⁵ 4s²", shells: [2, 8, 13, 2],
    phase: "Solid", density: 7.47, meltingPoint: 1519, boilingPoint: 2334,
    electronegativity: 1.55, ionizationEnergy: 717, atomicRadius: 161,
    discoveredBy: "Johan Gottlieb Gahn", yearDiscovered: 1774,
    summary: "Manganese is a grayish-white metal used primarily in steel production as a deoxidizing agent.",
    commonUses: ["Steel production", "Batteries", "Fertilizers", "Pigments"]
  },
  {
    atomicNumber: 26, symbol: "Fe", name: "Iron", atomicMass: 55.845,
    category: "transition metal", group: 8, period: 4, block: "d",
    xpos: 8, ypos: 4, electronConfiguration: "[Ar] 3d⁶ 4s²", shells: [2, 8, 14, 2],
    phase: "Solid", density: 7.874, meltingPoint: 1811, boilingPoint: 3134,
    electronegativity: 1.83, ionizationEnergy: 762, atomicRadius: 156,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Iron is the most used metal in the world and is essential for blood (hemoglobin) in living organisms.",
    commonUses: ["Steel production", "Construction", "Machinery", "Hemoglobin in blood"]
  },
  {
    atomicNumber: 27, symbol: "Co", name: "Cobalt", atomicMass: 58.933,
    category: "transition metal", group: 9, period: 4, block: "d",
    xpos: 9, ypos: 4, electronConfiguration: "[Ar] 3d⁷ 4s²", shells: [2, 8, 15, 2],
    phase: "Solid", density: 8.9, meltingPoint: 1768, boilingPoint: 3143,
    electronegativity: 1.88, ionizationEnergy: 760, atomicRadius: 152,
    discoveredBy: "Georg Brandt", yearDiscovered: 1735,
    summary: "Cobalt is a hard, lustrous metal used in high-performance alloys and rechargeable batteries.",
    commonUses: ["Lithium-ion batteries", "Superalloys", "Magnets", "Blue pigments"]
  },
  {
    atomicNumber: 28, symbol: "Ni", name: "Nickel", atomicMass: 58.693,
    category: "transition metal", group: 10, period: 4, block: "d",
    xpos: 10, ypos: 4, electronConfiguration: "[Ar] 3d⁸ 4s²", shells: [2, 8, 16, 2],
    phase: "Solid", density: 8.908, meltingPoint: 1728, boilingPoint: 3186,
    electronegativity: 1.91, ionizationEnergy: 737, atomicRadius: 149,
    discoveredBy: "Axel Fredrik Cronstedt", yearDiscovered: 1751,
    summary: "Nickel is a silvery-white metal with a slight golden tinge, used widely in stainless steel and batteries.",
    commonUses: ["Stainless steel", "Coins", "Rechargeable batteries", "Catalysts"]
  },
  {
    atomicNumber: 29, symbol: "Cu", name: "Copper", atomicMass: 63.546,
    category: "transition metal", group: 11, period: 4, block: "d",
    xpos: 11, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s¹", shells: [2, 8, 18, 1],
    phase: "Solid", density: 8.96, meltingPoint: 1357.77, boilingPoint: 2835,
    electronegativity: 1.9, ionizationEnergy: 745, atomicRadius: 145,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Copper is a ductile metal with very high thermal and electrical conductivity. It has been used for thousands of years.",
    commonUses: ["Electrical wiring", "Plumbing", "Coins", "Electronics"]
  },
  {
    atomicNumber: 30, symbol: "Zn", name: "Zinc", atomicMass: 65.38,
    category: "transition metal", group: 12, period: 4, block: "d",
    xpos: 12, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s²", shells: [2, 8, 18, 2],
    phase: "Solid", density: 7.134, meltingPoint: 692.68, boilingPoint: 1180,
    electronegativity: 1.65, ionizationEnergy: 906, atomicRadius: 142,
    discoveredBy: "Andreas Sigismund Marggraf", yearDiscovered: 1746,
    summary: "Zinc is a bluish-white metal that is essential for immune function and wound healing.",
    commonUses: ["Galvanization", "Brass alloys", "Sunscreen", "Dietary supplements"]
  },
  {
    atomicNumber: 31, symbol: "Ga", name: "Gallium", atomicMass: 69.723,
    category: "post-transition metal", group: 13, period: 4, block: "p",
    xpos: 13, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p¹", shells: [2, 8, 18, 3],
    phase: "Solid", density: 5.91, meltingPoint: 302.9146, boilingPoint: 2673,
    electronegativity: 1.81, ionizationEnergy: 579, atomicRadius: 136,
    discoveredBy: "Paul Emile Lecoq de Boisbaudran", yearDiscovered: 1875,
    summary: "Gallium is a soft, silvery metal that melts near room temperature. It is used in semiconductors.",
    commonUses: ["LEDs", "Solar cells", "Semiconductors", "Medical thermometers"]
  },
  {
    atomicNumber: 32, symbol: "Ge", name: "Germanium", atomicMass: 72.63,
    category: "metalloid", group: 14, period: 4, block: "p",
    xpos: 14, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p²", shells: [2, 8, 18, 4],
    phase: "Solid", density: 5.323, meltingPoint: 1211.4, boilingPoint: 3106,
    electronegativity: 2.01, ionizationEnergy: 762, atomicRadius: 125,
    discoveredBy: "Clemens Winkler", yearDiscovered: 1886,
    summary: "Germanium is a lustrous, hard metalloid in the carbon group. It is an important semiconductor material.",
    commonUses: ["Semiconductors", "Fiber optics", "Infrared optics", "Solar cells"]
  },
  {
    atomicNumber: 33, symbol: "As", name: "Arsenic", atomicMass: 74.922,
    category: "metalloid", group: 15, period: 4, block: "p",
    xpos: 15, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p³", shells: [2, 8, 18, 5],
    phase: "Solid", density: 5.776, meltingPoint: 1090, boilingPoint: 887,
    electronegativity: 2.18, ionizationEnergy: 947, atomicRadius: 114,
    discoveredBy: "Albertus Magnus", yearDiscovered: 1250,
    summary: "Arsenic is a metalloid with both metallic and nonmetallic properties. It is highly toxic.",
    commonUses: ["Wood preservatives", "Semiconductors", "Pesticides", "Glass production"]
  },
  {
    atomicNumber: 34, symbol: "Se", name: "Selenium", atomicMass: 78.971,
    category: "reactive nonmetal", group: 16, period: 4, block: "p",
    xpos: 16, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p⁴", shells: [2, 8, 18, 6],
    phase: "Solid", density: 4.809, meltingPoint: 494, boilingPoint: 958,
    electronegativity: 2.55, ionizationEnergy: 941, atomicRadius: 103,
    discoveredBy: "Jöns Jacob Berzelius", yearDiscovered: 1817,
    summary: "Selenium is a nonmetal with properties between sulfur and tellurium. It is essential in trace amounts.",
    commonUses: ["Glass coloring", "Solar cells", "Photocopiers", "Dietary supplements"]
  },
  {
    atomicNumber: 35, symbol: "Br", name: "Bromine", atomicMass: 79.904,
    category: "halogen", group: 17, period: 4, block: "p",
    xpos: 17, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p⁵", shells: [2, 8, 18, 7],
    phase: "Liquid", density: 3.1028, meltingPoint: 265.8, boilingPoint: 332,
    electronegativity: 2.96, ionizationEnergy: 1140, atomicRadius: 94,
    discoveredBy: "Antoine Jérôme Balard", yearDiscovered: 1826,
    summary: "Bromine is the only nonmetallic element that is liquid at room temperature. It has a pungent smell.",
    commonUses: ["Flame retardants", "Water purification", "Pharmaceuticals", "Photography"]
  },
  {
    atomicNumber: 36, symbol: "Kr", name: "Krypton", atomicMass: 83.798,
    category: "noble gas", group: 18, period: 4, block: "p",
    xpos: 18, ypos: 4, electronConfiguration: "[Ar] 3d¹⁰ 4s² 4p⁶", shells: [2, 8, 18, 8],
    phase: "Gas", density: 0.003749, meltingPoint: 115.78, boilingPoint: 119.93,
    electronegativity: 3.0, ionizationEnergy: 1351, atomicRadius: 88,
    discoveredBy: "William Ramsay", yearDiscovered: 1898,
    summary: "Krypton is a noble gas used in high-performance light sources and lasers.",
    commonUses: ["Fluorescent lamps", "Lasers", "Photography flash lamps", "Insulating windows"]
  },
  {
    atomicNumber: 37, symbol: "Rb", name: "Rubidium", atomicMass: 85.468,
    category: "alkali metal", group: 1, period: 5, block: "s",
    xpos: 1, ypos: 5, electronConfiguration: "[Kr] 5s¹", shells: [2, 8, 18, 8, 1],
    phase: "Solid", density: 1.532, meltingPoint: 312.45, boilingPoint: 961,
    electronegativity: 0.82, ionizationEnergy: 403, atomicRadius: 265,
    discoveredBy: "Robert Bunsen", yearDiscovered: 1861,
    summary: "Rubidium is a soft, silvery-white alkali metal that is highly reactive with water.",
    commonUses: ["Atomic clocks", "Research", "Fireworks", "Medical imaging"]
  },
  {
    atomicNumber: 38, symbol: "Sr", name: "Strontium", atomicMass: 87.62,
    category: "alkaline earth metal", group: 2, period: 5, block: "s",
    xpos: 2, ypos: 5, electronConfiguration: "[Kr] 5s²", shells: [2, 8, 18, 8, 2],
    phase: "Solid", density: 2.64, meltingPoint: 1050, boilingPoint: 1655,
    electronegativity: 0.95, ionizationEnergy: 550, atomicRadius: 219,
    discoveredBy: "Adair Crawford", yearDiscovered: 1790,
    summary: "Strontium is a soft silver-white metallic element that is highly reactive chemically.",
    commonUses: ["Fireworks (red color)", "Flares", "Nuclear medicine", "Magnets"]
  },
  {
    atomicNumber: 39, symbol: "Y", name: "Yttrium", atomicMass: 88.906,
    category: "transition metal", group: 3, period: 5, block: "d",
    xpos: 3, ypos: 5, electronConfiguration: "[Kr] 4d¹ 5s²", shells: [2, 8, 18, 9, 2],
    phase: "Solid", density: 4.472, meltingPoint: 1799, boilingPoint: 3203,
    electronegativity: 1.22, ionizationEnergy: 600, atomicRadius: 212,
    discoveredBy: "Johan Gadolin", yearDiscovered: 1794,
    summary: "Yttrium is a silvery-metallic transition metal used in LEDs, phosphors, and alloys.",
    commonUses: ["LED phosphors", "Superconductors", "Lasers", "Cancer treatment"]
  },
  {
    atomicNumber: 40, symbol: "Zr", name: "Zirconium", atomicMass: 91.224,
    category: "transition metal", group: 4, period: 5, block: "d",
    xpos: 4, ypos: 5, electronConfiguration: "[Kr] 4d² 5s²", shells: [2, 8, 18, 10, 2],
    phase: "Solid", density: 6.52, meltingPoint: 2128, boilingPoint: 4682,
    electronegativity: 1.33, ionizationEnergy: 640, atomicRadius: 206,
    discoveredBy: "Martin Heinrich Klaproth", yearDiscovered: 1789,
    summary: "Zirconium is a lustrous, grey-white metal that is highly resistant to corrosion.",
    commonUses: ["Nuclear reactors", "Ceramics", "Jewelry (cubic zirconia)", "Corrosion-resistant alloys"]
  },
  {
    atomicNumber: 41, symbol: "Nb", name: "Niobium", atomicMass: 92.906,
    category: "transition metal", group: 5, period: 5, block: "d",
    xpos: 5, ypos: 5, electronConfiguration: "[Kr] 4d⁴ 5s¹", shells: [2, 8, 18, 12, 1],
    phase: "Solid", density: 8.57, meltingPoint: 2750, boilingPoint: 5017,
    electronegativity: 1.6, ionizationEnergy: 652, atomicRadius: 198,
    discoveredBy: "Charles Hatchett", yearDiscovered: 1801,
    summary: "Niobium is a light grey, crystalline transition metal used in steel alloys and superconductors.",
    commonUses: ["Steel alloys", "Superconducting magnets", "Jet engines", "Optical glass"]
  },
  {
    atomicNumber: 42, symbol: "Mo", name: "Molybdenum", atomicMass: 95.95,
    category: "transition metal", group: 6, period: 5, block: "d",
    xpos: 6, ypos: 5, electronConfiguration: "[Kr] 4d⁵ 5s¹", shells: [2, 8, 18, 13, 1],
    phase: "Solid", density: 10.28, meltingPoint: 2896, boilingPoint: 4912,
    electronegativity: 2.16, ionizationEnergy: 684, atomicRadius: 190,
    discoveredBy: "Carl Wilhelm Scheele", yearDiscovered: 1778,
    summary: "Molybdenum is a silvery metal with one of the highest melting points of all elements.",
    commonUses: ["High-strength steel alloys", "Catalysts", "Lubricants", "Electronics"]
  },
  {
    atomicNumber: 43, symbol: "Tc", name: "Technetium", atomicMass: 98,
    category: "transition metal", group: 7, period: 5, block: "d",
    xpos: 7, ypos: 5, electronConfiguration: "[Kr] 4d⁵ 5s²", shells: [2, 8, 18, 13, 2],
    phase: "Solid", density: 11.5, meltingPoint: 2430, boilingPoint: 4538,
    electronegativity: 1.9, ionizationEnergy: 702, atomicRadius: 183,
    discoveredBy: "Carlo Perrier", yearDiscovered: 1937,
    summary: "Technetium is the first artificially produced element. All its isotopes are radioactive.",
    commonUses: ["Medical imaging (nuclear medicine)", "Research", "Radioactive tracers"]
  },
  {
    atomicNumber: 44, symbol: "Ru", name: "Ruthenium", atomicMass: 101.07,
    category: "transition metal", group: 8, period: 5, block: "d",
    xpos: 8, ypos: 5, electronConfiguration: "[Kr] 4d⁷ 5s¹", shells: [2, 8, 18, 15, 1],
    phase: "Solid", density: 12.45, meltingPoint: 2607, boilingPoint: 4423,
    electronegativity: 2.2, ionizationEnergy: 710, atomicRadius: 178,
    discoveredBy: "Karl Ernst Claus", yearDiscovered: 1844,
    summary: "Ruthenium is a rare, hard, silvery-white platinum group metal used as a catalyst.",
    commonUses: ["Catalysts", "Electrical contacts", "Hard disk coatings", "Solar cells"]
  },
  {
    atomicNumber: 45, symbol: "Rh", name: "Rhodium", atomicMass: 102.91,
    category: "transition metal", group: 9, period: 5, block: "d",
    xpos: 9, ypos: 5, electronConfiguration: "[Kr] 4d⁸ 5s¹", shells: [2, 8, 18, 16, 1],
    phase: "Solid", density: 12.41, meltingPoint: 2237, boilingPoint: 3968,
    electronegativity: 2.28, ionizationEnergy: 720, atomicRadius: 173,
    discoveredBy: "William Hyde Wollaston", yearDiscovered: 1804,
    summary: "Rhodium is one of the rarest and most valuable precious metals. It is highly reflective.",
    commonUses: ["Catalytic converters", "Jewelry plating", "Mirrors", "Electrical contacts"]
  },
  {
    atomicNumber: 46, symbol: "Pd", name: "Palladium", atomicMass: 106.42,
    category: "transition metal", group: 10, period: 5, block: "d",
    xpos: 10, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰", shells: [2, 8, 18, 18],
    phase: "Solid", density: 12.023, meltingPoint: 1828.05, boilingPoint: 3236,
    electronegativity: 2.2, ionizationEnergy: 804, atomicRadius: 169,
    discoveredBy: "William Hyde Wollaston", yearDiscovered: 1803,
    summary: "Palladium is a rare and lustrous silvery-white metal used in catalytic converters and electronics.",
    commonUses: ["Catalytic converters", "Electronics", "Dentistry", "Hydrogen purification"]
  },
  {
    atomicNumber: 47, symbol: "Ag", name: "Silver", atomicMass: 107.87,
    category: "transition metal", group: 11, period: 5, block: "d",
    xpos: 11, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s¹", shells: [2, 8, 18, 18, 1],
    phase: "Solid", density: 10.49, meltingPoint: 1234.93, boilingPoint: 2435,
    electronegativity: 1.93, ionizationEnergy: 731, atomicRadius: 165,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Silver is a soft, white, lustrous metal with the highest electrical and thermal conductivity of any element.",
    commonUses: ["Jewelry", "Currency", "Electronics", "Antibacterial applications"]
  },
  {
    atomicNumber: 48, symbol: "Cd", name: "Cadmium", atomicMass: 112.41,
    category: "transition metal", group: 12, period: 5, block: "d",
    xpos: 12, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s²", shells: [2, 8, 18, 18, 2],
    phase: "Solid", density: 8.65, meltingPoint: 594.22, boilingPoint: 1040,
    electronegativity: 1.69, ionizationEnergy: 868, atomicRadius: 161,
    discoveredBy: "Karl Samuel Leberecht Hermann", yearDiscovered: 1817,
    summary: "Cadmium is a soft, bluish-white metal that is toxic and a serious environmental hazard.",
    commonUses: ["Rechargeable batteries", "Pigments", "Electroplating", "Nuclear reactors"]
  },
  {
    atomicNumber: 49, symbol: "In", name: "Indium", atomicMass: 114.82,
    category: "post-transition metal", group: 13, period: 5, block: "p",
    xpos: 13, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p¹", shells: [2, 8, 18, 18, 3],
    phase: "Solid", density: 7.31, meltingPoint: 429.7485, boilingPoint: 2345,
    electronegativity: 1.78, ionizationEnergy: 558, atomicRadius: 156,
    discoveredBy: "Ferdinand Reich", yearDiscovered: 1863,
    summary: "Indium is a soft, silvery-white metal used primarily in touchscreen displays.",
    commonUses: ["LCD screens (ITO)", "Solders", "Semiconductors", "Bearings"]
  },
  {
    atomicNumber: 50, symbol: "Sn", name: "Tin", atomicMass: 118.71,
    category: "post-transition metal", group: 14, period: 5, block: "p",
    xpos: 14, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p²", shells: [2, 8, 18, 18, 4],
    phase: "Solid", density: 7.287, meltingPoint: 505.078, boilingPoint: 2875,
    electronegativity: 1.96, ionizationEnergy: 709, atomicRadius: 145,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Tin is a soft, silvery metal known for its resistance to corrosion and use in bronze alloys.",
    commonUses: ["Tin cans", "Solder", "Bronze alloys", "Coatings"]
  },
  {
    atomicNumber: 51, symbol: "Sb", name: "Antimony", atomicMass: 121.76,
    category: "metalloid", group: 15, period: 5, block: "p",
    xpos: 15, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p³", shells: [2, 8, 18, 18, 5],
    phase: "Solid", density: 6.685, meltingPoint: 903.778, boilingPoint: 1908,
    electronegativity: 2.05, ionizationEnergy: 834, atomicRadius: 133,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Antimony is a lustrous grey metalloid used in alloys and as a flame retardant.",
    commonUses: ["Flame retardants", "Lead alloys", "Semiconductors", "Pigments"]
  },
  {
    atomicNumber: 52, symbol: "Te", name: "Tellurium", atomicMass: 127.6,
    category: "metalloid", group: 16, period: 5, block: "p",
    xpos: 16, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁴", shells: [2, 8, 18, 18, 6],
    phase: "Solid", density: 6.232, meltingPoint: 722.66, boilingPoint: 1261,
    electronegativity: 2.1, ionizationEnergy: 869, atomicRadius: 123,
    discoveredBy: "Franz-Joseph Müller von Reichenstein", yearDiscovered: 1782,
    summary: "Tellurium is a brittle metalloid with properties between sulfur and selenium.",
    commonUses: ["Solar panels", "Alloys", "Rubber vulcanization", "Thermoelectrics"]
  },
  {
    atomicNumber: 53, symbol: "I", name: "Iodine", atomicMass: 126.9,
    category: "halogen", group: 17, period: 5, block: "p",
    xpos: 17, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁵", shells: [2, 8, 18, 18, 7],
    phase: "Solid", density: 4.933, meltingPoint: 386.85, boilingPoint: 457.4,
    electronegativity: 2.66, ionizationEnergy: 1008, atomicRadius: 115,
    discoveredBy: "Bernard Courtois", yearDiscovered: 1811,
    summary: "Iodine is essential for thyroid hormone production. It forms dark purple vapors when heated.",
    commonUses: ["Antiseptics", "Dietary supplements", "Photography", "Pharmaceuticals"]
  },
  {
    atomicNumber: 54, symbol: "Xe", name: "Xenon", atomicMass: 131.29,
    category: "noble gas", group: 18, period: 5, block: "p",
    xpos: 18, ypos: 5, electronConfiguration: "[Kr] 4d¹⁰ 5s² 5p⁶", shells: [2, 8, 18, 18, 8],
    phase: "Gas", density: 0.005894, meltingPoint: 161.4, boilingPoint: 165.051,
    electronegativity: 2.6, ionizationEnergy: 1170, atomicRadius: 108,
    discoveredBy: "William Ramsay", yearDiscovered: 1898,
    summary: "Xenon is a colorless, dense noble gas used in high-intensity lighting and ion propulsion.",
    commonUses: ["Flash lamps", "Anesthesia", "Ion thrusters", "Medical imaging"]
  },
  {
    atomicNumber: 55, symbol: "Cs", name: "Caesium", atomicMass: 132.91,
    category: "alkali metal", group: 1, period: 6, block: "s",
    xpos: 1, ypos: 6, electronConfiguration: "[Xe] 6s¹", shells: [2, 8, 18, 18, 8, 1],
    phase: "Solid", density: 1.879, meltingPoint: 301.7, boilingPoint: 944,
    electronegativity: 0.79, ionizationEnergy: 376, atomicRadius: 298,
    discoveredBy: "Robert Bunsen", yearDiscovered: 1860,
    summary: "Caesium is a soft, golden-colored alkali metal. It is used in atomic clocks for its precise frequency.",
    commonUses: ["Atomic clocks", "Oil drilling", "Night vision", "Research"]
  },
  {
    atomicNumber: 56, symbol: "Ba", name: "Barium", atomicMass: 137.33,
    category: "alkaline earth metal", group: 2, period: 6, block: "s",
    xpos: 2, ypos: 6, electronConfiguration: "[Xe] 6s²", shells: [2, 8, 18, 18, 8, 2],
    phase: "Solid", density: 3.51, meltingPoint: 1000, boilingPoint: 2118,
    electronegativity: 0.89, ionizationEnergy: 503, atomicRadius: 253,
    discoveredBy: "Carl Wilhelm Scheele", yearDiscovered: 1772,
    summary: "Barium is a soft, silvery alkaline earth metal. Barium sulfate is used in medical imaging.",
    commonUses: ["Medical X-ray contrast", "Fireworks", "Glass production", "Oil well drilling"]
  },
  {
    atomicNumber: 57, symbol: "La", name: "Lanthanum", atomicMass: 138.91,
    category: "lanthanide", group: 3, period: 6, block: "f",
    xpos: 3, ypos: 9, electronConfiguration: "[Xe] 5d¹ 6s²", shells: [2, 8, 18, 18, 9, 2],
    phase: "Solid", density: 6.145, meltingPoint: 1193, boilingPoint: 3737,
    electronegativity: 1.1, ionizationEnergy: 538, atomicRadius: 187,
    discoveredBy: "Carl Gustaf Mosander", yearDiscovered: 1839,
    summary: "Lanthanum is a soft, ductile, silvery-white metal that tarnishes slowly in air.",
    commonUses: ["Camera lenses", "Hybrid car batteries", "Catalytic converters", "Lighting"]
  },
  {
    atomicNumber: 58, symbol: "Ce", name: "Cerium", atomicMass: 140.12,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 4, ypos: 9, electronConfiguration: "[Xe] 4f¹ 5d¹ 6s²", shells: [2, 8, 18, 19, 9, 2],
    phase: "Solid", density: 6.77, meltingPoint: 1068, boilingPoint: 3716,
    electronegativity: 1.12, ionizationEnergy: 534, atomicRadius: 182,
    discoveredBy: "Martin Heinrich Klaproth", yearDiscovered: 1803,
    summary: "Cerium is the most abundant of the rare earth elements. It is used as a catalyst and in glass polishing.",
    commonUses: ["Catalytic converters", "Glass polishing", "Mischmetal alloys", "UV filters"]
  },
  {
    atomicNumber: 59, symbol: "Pr", name: "Praseodymium", atomicMass: 140.91,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 5, ypos: 9, electronConfiguration: "[Xe] 4f³ 6s²", shells: [2, 8, 18, 21, 8, 2],
    phase: "Solid", density: 6.773, meltingPoint: 1208, boilingPoint: 3793,
    electronegativity: 1.13, ionizationEnergy: 527, atomicRadius: 182,
    discoveredBy: "Carl Auer von Welsbach", yearDiscovered: 1885,
    summary: "Praseodymium is a soft, silvery, malleable, and ductile rare earth metal. Its compounds are green.",
    commonUses: ["Permanent magnets", "Laser materials", "Colored glass", "Catalysts"]
  },
  {
    atomicNumber: 60, symbol: "Nd", name: "Neodymium", atomicMass: 144.24,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 6, ypos: 9, electronConfiguration: "[Xe] 4f⁴ 6s²", shells: [2, 8, 18, 22, 8, 2],
    phase: "Solid", density: 7.007, meltingPoint: 1297, boilingPoint: 3347,
    electronegativity: 1.14, ionizationEnergy: 533, atomicRadius: 181,
    discoveredBy: "Carl Auer von Welsbach", yearDiscovered: 1885,
    summary: "Neodymium is used to create some of the strongest permanent magnets in the world.",
    commonUses: ["Permanent magnets", "Lasers", "Electric motors", "Wind turbines"]
  },
  {
    atomicNumber: 61, symbol: "Pm", name: "Promethium", atomicMass: 144.91,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 7, ypos: 9, electronConfiguration: "[Xe] 4f⁵ 6s²", shells: [2, 8, 18, 23, 8, 2],
    phase: "Solid", density: 7.26, meltingPoint: 1315, boilingPoint: 3273,
    electronegativity: 1.13, ionizationEnergy: 540, atomicRadius: 183,
    discoveredBy: "Chien Shiung Wu", yearDiscovered: 1945,
    summary: "Promethium is a radioactive lanthanide that does not occur in nature in significant quantities.",
    commonUses: ["Nuclear batteries", "Luminous paint", "Research", "X-ray sources"]
  },
  {
    atomicNumber: 62, symbol: "Sm", name: "Samarium", atomicMass: 150.36,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 8, ypos: 9, electronConfiguration: "[Xe] 4f⁶ 6s²", shells: [2, 8, 18, 24, 8, 2],
    phase: "Solid", density: 7.52, meltingPoint: 1345, boilingPoint: 2173,
    electronegativity: 1.17, ionizationEnergy: 545, atomicRadius: 180,
    discoveredBy: "Lecoq de Boisbaudran", yearDiscovered: 1879,
    summary: "Samarium is used in strong permanent magnets and as a neutron absorber in nuclear reactors.",
    commonUses: ["Permanent magnets", "Cancer treatment", "Neutron capture", "Lasers"]
  },
  {
    atomicNumber: 63, symbol: "Eu", name: "Europium", atomicMass: 151.96,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 9, ypos: 9, electronConfiguration: "[Xe] 4f⁷ 6s²", shells: [2, 8, 18, 25, 8, 2],
    phase: "Solid", density: 5.244, meltingPoint: 1099, boilingPoint: 1802,
    electronegativity: null, ionizationEnergy: 547, atomicRadius: 180,
    discoveredBy: "Eugène-Anatole Demarçay", yearDiscovered: 1901,
    summary: "Europium is the most reactive of the rare earth metals, used in red and blue phosphors.",
    commonUses: ["TV phosphors", "Euro banknote security", "Fluorescent lamps", "Research"]
  },
  {
    atomicNumber: 64, symbol: "Gd", name: "Gadolinium", atomicMass: 157.25,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 10, ypos: 9, electronConfiguration: "[Xe] 4f⁷ 5d¹ 6s²", shells: [2, 8, 18, 25, 9, 2],
    phase: "Solid", density: 7.9, meltingPoint: 1585, boilingPoint: 3546,
    electronegativity: 1.2, ionizationEnergy: 593, atomicRadius: 180,
    discoveredBy: "Jean Charles Galissard de Marignac", yearDiscovered: 1880,
    summary: "Gadolinium is used in MRI contrast agents and as a neutron absorber.",
    commonUses: ["MRI contrast agents", "Nuclear reactors", "Data storage", "Alloys"]
  },
  {
    atomicNumber: 65, symbol: "Tb", name: "Terbium", atomicMass: 158.93,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 11, ypos: 9, electronConfiguration: "[Xe] 4f⁹ 6s²", shells: [2, 8, 18, 27, 8, 2],
    phase: "Solid", density: 8.23, meltingPoint: 1629, boilingPoint: 3503,
    electronegativity: null, ionizationEnergy: 566, atomicRadius: 177,
    discoveredBy: "Carl Gustaf Mosander", yearDiscovered: 1843,
    summary: "Terbium is used in solid-state devices and as a dopant in calcium fluoride.",
    commonUses: ["Solid-state devices", "Fuel cells", "Sonar systems", "Green phosphors"]
  },
  {
    atomicNumber: 66, symbol: "Dy", name: "Dysprosium", atomicMass: 162.5,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 12, ypos: 9, electronConfiguration: "[Xe] 4f¹⁰ 6s²", shells: [2, 8, 18, 28, 8, 2],
    phase: "Solid", density: 8.551, meltingPoint: 1680, boilingPoint: 2840,
    electronegativity: 1.22, ionizationEnergy: 573, atomicRadius: 178,
    discoveredBy: "Lecoq de Boisbaudran", yearDiscovered: 1886,
    summary: "Dysprosium is used in neodymium magnets to improve performance at high temperatures.",
    commonUses: ["Permanent magnets", "Nuclear reactors", "Lasers", "Data storage"]
  },
  {
    atomicNumber: 67, symbol: "Ho", name: "Holmium", atomicMass: 164.93,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 13, ypos: 9, electronConfiguration: "[Xe] 4f¹¹ 6s²", shells: [2, 8, 18, 29, 8, 2],
    phase: "Solid", density: 8.795, meltingPoint: 1734, boilingPoint: 2873,
    electronegativity: 1.23, ionizationEnergy: 581, atomicRadius: 176,
    discoveredBy: "Marc Delafontaine", yearDiscovered: 1878,
    summary: "Holmium has the highest magnetic moment of any naturally occurring element.",
    commonUses: ["Magnets", "Nuclear reactors", "Lasers", "Microwave equipment"]
  },
  {
    atomicNumber: 68, symbol: "Er", name: "Erbium", atomicMass: 167.26,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 14, ypos: 9, electronConfiguration: "[Xe] 4f¹² 6s²", shells: [2, 8, 18, 30, 8, 2],
    phase: "Solid", density: 9.066, meltingPoint: 1802, boilingPoint: 3141,
    electronegativity: 1.24, ionizationEnergy: 589, atomicRadius: 176,
    discoveredBy: "Carl Gustaf Mosander", yearDiscovered: 1843,
    summary: "Erbium is used in fiber optic amplifiers and in pink-colored glass.",
    commonUses: ["Fiber optic amplifiers", "Laser medicine", "Glass colorant", "Neutron absorber"]
  },
  {
    atomicNumber: 69, symbol: "Tm", name: "Thulium", atomicMass: 168.93,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 15, ypos: 9, electronConfiguration: "[Xe] 4f¹³ 6s²", shells: [2, 8, 18, 31, 8, 2],
    phase: "Solid", density: 9.32, meltingPoint: 1818, boilingPoint: 2223,
    electronegativity: 1.25, ionizationEnergy: 597, atomicRadius: 176,
    discoveredBy: "Per Teodor Cleve", yearDiscovered: 1879,
    summary: "Thulium is the rarest and least abundant of the lanthanides found in nature.",
    commonUses: ["Portable X-ray devices", "Lasers", "Magnetic materials", "Research"]
  },
  {
    atomicNumber: 70, symbol: "Yb", name: "Ytterbium", atomicMass: 173.04,
    category: "lanthanide", group: null, period: 6, block: "f",
    xpos: 16, ypos: 9, electronConfiguration: "[Xe] 4f¹⁴ 6s²", shells: [2, 8, 18, 32, 8, 2],
    phase: "Solid", density: 6.9, meltingPoint: 1097, boilingPoint: 1469,
    electronegativity: null, ionizationEnergy: 603, atomicRadius: 176,
    discoveredBy: "Jean Charles Galissard de Marignac", yearDiscovered: 1878,
    summary: "Ytterbium is used in fiber lasers and as a dopant in stainless steel.",
    commonUses: ["Fiber lasers", "Atomic clocks", "Steel alloys", "Pressure sensors"]
  },
  {
    atomicNumber: 71, symbol: "Lu", name: "Lutetium", atomicMass: 174.97,
    category: "lanthanide", group: 3, period: 6, block: "d",
    xpos: 17, ypos: 9, electronConfiguration: "[Xe] 4f¹⁴ 5d¹ 6s²", shells: [2, 8, 18, 32, 9, 2],
    phase: "Solid", density: 9.841, meltingPoint: 1925, boilingPoint: 3675,
    electronegativity: 1.27, ionizationEnergy: 524, atomicRadius: 174,
    discoveredBy: "Carl Auer von Welsbach", yearDiscovered: 1906,
    summary: "Lutetium is the last and hardest element in the lanthanide series.",
    commonUses: ["PET scan detectors", "Catalysts", "Alloys", "Research"]
  },
  {
    atomicNumber: 72, symbol: "Hf", name: "Hafnium", atomicMass: 178.49,
    category: "transition metal", group: 4, period: 6, block: "d",
    xpos: 4, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d² 6s²", shells: [2, 8, 18, 32, 10, 2],
    phase: "Solid", density: 13.31, meltingPoint: 2506, boilingPoint: 4876,
    electronegativity: 1.3, ionizationEnergy: 659, atomicRadius: 208,
    discoveredBy: "Dirk Coster", yearDiscovered: 1923,
    summary: "Hafnium is a lustrous silvery metal chemically similar to zirconium, used in nuclear control rods.",
    commonUses: ["Nuclear control rods", "Microchips", "Plasma cutting", "Alloys"]
  },
  {
    atomicNumber: 73, symbol: "Ta", name: "Tantalum", atomicMass: 180.95,
    category: "transition metal", group: 5, period: 6, block: "d",
    xpos: 5, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d³ 6s²", shells: [2, 8, 18, 32, 11, 2],
    phase: "Solid", density: 16.65, meltingPoint: 3290, boilingPoint: 5731,
    electronegativity: 1.5, ionizationEnergy: 761, atomicRadius: 200,
    discoveredBy: "Anders Gustaf Ekeberg", yearDiscovered: 1802,
    summary: "Tantalum is a rare blue-grey metal known for its high corrosion resistance.",
    commonUses: ["Capacitors", "Surgical implants", "Jet engines", "Cutting tools"]
  },
  {
    atomicNumber: 74, symbol: "W", name: "Tungsten", atomicMass: 183.84,
    category: "transition metal", group: 6, period: 6, block: "d",
    xpos: 6, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d⁴ 6s²", shells: [2, 8, 18, 32, 12, 2],
    phase: "Solid", density: 19.3, meltingPoint: 3695, boilingPoint: 5828,
    electronegativity: 2.36, ionizationEnergy: 770, atomicRadius: 193,
    discoveredBy: "Carl Wilhelm Scheele", yearDiscovered: 1781,
    summary: "Tungsten has the highest melting point of all metallic elements and highest boiling point.",
    commonUses: ["Light bulb filaments", "Cutting tools", "Armor-piercing ammunition", "X-ray tubes"]
  },
  {
    atomicNumber: 75, symbol: "Re", name: "Rhenium", atomicMass: 186.21,
    category: "transition metal", group: 7, period: 6, block: "d",
    xpos: 7, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d⁵ 6s²", shells: [2, 8, 18, 32, 13, 2],
    phase: "Solid", density: 21.02, meltingPoint: 3459, boilingPoint: 5869,
    electronegativity: 1.9, ionizationEnergy: 760, atomicRadius: 188,
    discoveredBy: "Masataka Ogawa", yearDiscovered: 1925,
    summary: "Rhenium is one of the rarest elements in Earth's crust with one of the highest melting points.",
    commonUses: ["Jet engine components", "Catalysts", "Electrical contacts", "Thermocouples"]
  },
  {
    atomicNumber: 76, symbol: "Os", name: "Osmium", atomicMass: 190.23,
    category: "transition metal", group: 8, period: 6, block: "d",
    xpos: 8, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d⁶ 6s²", shells: [2, 8, 18, 32, 14, 2],
    phase: "Solid", density: 22.59, meltingPoint: 3306, boilingPoint: 5285,
    electronegativity: 2.2, ionizationEnergy: 840, atomicRadius: 185,
    discoveredBy: "Smithson Tennant", yearDiscovered: 1803,
    summary: "Osmium is the densest naturally occurring element and has a bluish-white appearance.",
    commonUses: ["Fountain pen nibs", "Electrical contacts", "Catalysts", "Scientific instruments"]
  },
  {
    atomicNumber: 77, symbol: "Ir", name: "Iridium", atomicMass: 192.22,
    category: "transition metal", group: 9, period: 6, block: "d",
    xpos: 9, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d⁷ 6s²", shells: [2, 8, 18, 32, 15, 2],
    phase: "Solid", density: 22.56, meltingPoint: 2719, boilingPoint: 4403,
    electronegativity: 2.2, ionizationEnergy: 880, atomicRadius: 180,
    discoveredBy: "Smithson Tennant", yearDiscovered: 1803,
    summary: "Iridium is the most corrosion-resistant metal known. The meter bar was made of platinum-iridium.",
    commonUses: ["Spark plugs", "Crucibles", "International prototype kilogram", "Compass bearings"]
  },
  {
    atomicNumber: 78, symbol: "Pt", name: "Platinum", atomicMass: 195.08,
    category: "transition metal", group: 10, period: 6, block: "d",
    xpos: 10, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d⁹ 6s¹", shells: [2, 8, 18, 32, 17, 1],
    phase: "Solid", density: 21.45, meltingPoint: 2041.4, boilingPoint: 4098,
    electronegativity: 2.28, ionizationEnergy: 870, atomicRadius: 177,
    discoveredBy: "Antonio de Ulloa", yearDiscovered: 1735,
    summary: "Platinum is a dense, malleable, precious metal highly resistant to corrosion.",
    commonUses: ["Catalytic converters", "Jewelry", "Dental equipment", "Laboratory equipment"]
  },
  {
    atomicNumber: 79, symbol: "Au", name: "Gold", atomicMass: 196.97,
    category: "transition metal", group: 11, period: 6, block: "d",
    xpos: 11, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹", shells: [2, 8, 18, 32, 18, 1],
    phase: "Solid", density: 19.3, meltingPoint: 1337.33, boilingPoint: 3243,
    electronegativity: 2.54, ionizationEnergy: 890, atomicRadius: 174,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Gold is a chemical element in a class of its own — prized for millennia for its rarity and beauty.",
    commonUses: ["Jewelry", "Currency", "Electronics", "Medical devices"]
  },
  {
    atomicNumber: 80, symbol: "Hg", name: "Mercury", atomicMass: 200.59,
    category: "transition metal", group: 12, period: 6, block: "d",
    xpos: 12, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s²", shells: [2, 8, 18, 32, 18, 2],
    phase: "Liquid", density: 13.534, meltingPoint: 234.321, boilingPoint: 629.88,
    electronegativity: 2.0, ionizationEnergy: 1007, atomicRadius: 171,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Mercury is the only metallic element that is liquid at standard conditions.",
    commonUses: ["Thermometers", "Fluorescent lamps", "Dental amalgams", "Batteries"]
  },
  {
    atomicNumber: 81, symbol: "Tl", name: "Thallium", atomicMass: 204.38,
    category: "post-transition metal", group: 13, period: 6, block: "p",
    xpos: 13, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", shells: [2, 8, 18, 32, 18, 3],
    phase: "Solid", density: 11.85, meltingPoint: 577, boilingPoint: 1746,
    electronegativity: 1.62, ionizationEnergy: 589, atomicRadius: 156,
    discoveredBy: "William Crookes", yearDiscovered: 1861,
    summary: "Thallium is a soft grey post-transition metal that is highly toxic.",
    commonUses: ["Electronics", "Medical imaging", "Infrared detectors", "Semiconductors"]
  },
  {
    atomicNumber: 82, symbol: "Pb", name: "Lead", atomicMass: 207.2,
    category: "post-transition metal", group: 14, period: 6, block: "p",
    xpos: 14, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", shells: [2, 8, 18, 32, 18, 4],
    phase: "Solid", density: 11.34, meltingPoint: 600.61, boilingPoint: 2022,
    electronegativity: 2.33, ionizationEnergy: 716, atomicRadius: 154,
    discoveredBy: "Ancient", yearDiscovered: null,
    summary: "Lead is a heavy, malleable post-transition metal with many industrial applications.",
    commonUses: ["Batteries", "Radiation shielding", "Cable sheaths", "Pigments (historical)"]
  },
  {
    atomicNumber: 83, symbol: "Bi", name: "Bismuth", atomicMass: 208.98,
    category: "post-transition metal", group: 15, period: 6, block: "p",
    xpos: 15, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", shells: [2, 8, 18, 32, 18, 5],
    phase: "Solid", density: 9.807, meltingPoint: 544.552, boilingPoint: 1837,
    electronegativity: 2.02, ionizationEnergy: 703, atomicRadius: 143,
    discoveredBy: "Claude François Geoffroy", yearDiscovered: 1753,
    summary: "Bismuth is a brittle, coarse crystalline metal with an iridescent oxide tarnish.",
    commonUses: ["Medications (Pepto-Bismol)", "Cosmetics", "Alloys", "Fire detection systems"]
  },
  {
    atomicNumber: 84, symbol: "Po", name: "Polonium", atomicMass: 209,
    category: "post-transition metal", group: 16, period: 6, block: "p",
    xpos: 16, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", shells: [2, 8, 18, 32, 18, 6],
    phase: "Solid", density: 9.196, meltingPoint: 527, boilingPoint: 1235,
    electronegativity: 2.0, ionizationEnergy: 812, atomicRadius: 135,
    discoveredBy: "Marie Curie", yearDiscovered: 1898,
    summary: "Polonium is a radioactive element discovered by Marie Curie. All its isotopes are radioactive.",
    commonUses: ["Anti-static devices", "Research", "Nuclear batteries"]
  },
  {
    atomicNumber: 85, symbol: "At", name: "Astatine", atomicMass: 210,
    category: "halogen", group: 17, period: 6, block: "p",
    xpos: 17, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", shells: [2, 8, 18, 32, 18, 7],
    phase: "Solid", density: null, meltingPoint: 575, boilingPoint: 610,
    electronegativity: 2.2, ionizationEnergy: 920, atomicRadius: 127,
    discoveredBy: "Dale R. Corson", yearDiscovered: 1940,
    summary: "Astatine is the rarest naturally occurring element. It is highly radioactive.",
    commonUses: ["Cancer treatment research", "Radiotherapy", "Nuclear medicine research"]
  },
  {
    atomicNumber: 86, symbol: "Rn", name: "Radon", atomicMass: 222,
    category: "noble gas", group: 18, period: 6, block: "p",
    xpos: 18, ypos: 6, electronConfiguration: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", shells: [2, 8, 18, 32, 18, 8],
    phase: "Gas", density: 0.00973, meltingPoint: 202, boilingPoint: 211.5,
    electronegativity: null, ionizationEnergy: 1037, atomicRadius: 120,
    discoveredBy: "Friedrich Ernst Dorn", yearDiscovered: 1900,
    summary: "Radon is a radioactive noble gas that occurs naturally as the decay product of radium.",
    commonUses: ["Cancer radiotherapy", "Earthquake prediction research", "Research"]
  },
  {
    atomicNumber: 87, symbol: "Fr", name: "Francium", atomicMass: 223,
    category: "alkali metal", group: 1, period: 7, block: "s",
    xpos: 1, ypos: 7, electronConfiguration: "[Rn] 7s¹", shells: [2, 8, 18, 32, 18, 8, 1],
    phase: "Solid", density: null, meltingPoint: 281, boilingPoint: 890,
    electronegativity: 0.7, ionizationEnergy: 393, atomicRadius: null,
    discoveredBy: "Marguerite Perey", yearDiscovered: 1939,
    summary: "Francium is the second rarest naturally occurring element. It is extremely radioactive.",
    commonUses: ["Scientific research", "Atomic structure studies"]
  },
  {
    atomicNumber: 88, symbol: "Ra", name: "Radium", atomicMass: 226,
    category: "alkaline earth metal", group: 2, period: 7, block: "s",
    xpos: 2, ypos: 7, electronConfiguration: "[Rn] 7s²", shells: [2, 8, 18, 32, 18, 8, 2],
    phase: "Solid", density: 5.5, meltingPoint: 973, boilingPoint: 2010,
    electronegativity: 0.9, ionizationEnergy: 509, atomicRadius: null,
    discoveredBy: "Marie Curie", yearDiscovered: 1898,
    summary: "Radium is a radioactive element discovered by Marie and Pierre Curie.",
    commonUses: ["Cancer treatment (historical)", "Atomic research", "Luminous paint (historical)"]
  },
  {
    atomicNumber: 89, symbol: "Ac", name: "Actinium", atomicMass: 227,
    category: "actinide", group: 3, period: 7, block: "f",
    xpos: 3, ypos: 10, electronConfiguration: "[Rn] 6d¹ 7s²", shells: [2, 8, 18, 32, 18, 9, 2],
    phase: "Solid", density: 10.07, meltingPoint: 1323, boilingPoint: 3471,
    electronegativity: 1.1, ionizationEnergy: 499, atomicRadius: null,
    discoveredBy: "Friedrich Oskar Giesel", yearDiscovered: 1899,
    summary: "Actinium is a radioactive element that glows blue in the dark. It is used in neutron sources.",
    commonUses: ["Neutron sources", "Cancer treatment", "Research"]
  },
  {
    atomicNumber: 90, symbol: "Th", name: "Thorium", atomicMass: 232.04,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 4, ypos: 10, electronConfiguration: "[Rn] 6d² 7s²", shells: [2, 8, 18, 32, 18, 10, 2],
    phase: "Solid", density: 11.72, meltingPoint: 2115, boilingPoint: 5061,
    electronegativity: 1.3, ionizationEnergy: 587, atomicRadius: null,
    discoveredBy: "Jöns Jacob Berzelius", yearDiscovered: 1829,
    summary: "Thorium is a radioactive actinide metal used as a potential nuclear fuel.",
    commonUses: ["Nuclear fuel research", "Gas mantles", "Alloys", "Ceramics"]
  },
  {
    atomicNumber: 91, symbol: "Pa", name: "Protactinium", atomicMass: 231.04,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 5, ypos: 10, electronConfiguration: "[Rn] 5f² 6d¹ 7s²", shells: [2, 8, 18, 32, 20, 9, 2],
    phase: "Solid", density: 15.37, meltingPoint: 1841, boilingPoint: 4300,
    electronegativity: 1.5, ionizationEnergy: 568, atomicRadius: null,
    discoveredBy: "William Crookes", yearDiscovered: 1913,
    summary: "Protactinium is a dense radioactive actinide metal that is highly toxic.",
    commonUses: ["Research", "Nuclear science"]
  },
  {
    atomicNumber: 92, symbol: "U", name: "Uranium", atomicMass: 238.03,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 6, ypos: 10, electronConfiguration: "[Rn] 5f³ 6d¹ 7s²", shells: [2, 8, 18, 32, 21, 9, 2],
    phase: "Solid", density: 19.05, meltingPoint: 1405.3, boilingPoint: 4404,
    electronegativity: 1.38, ionizationEnergy: 598, atomicRadius: null,
    discoveredBy: "Martin Heinrich Klaproth", yearDiscovered: 1789,
    summary: "Uranium is the heaviest naturally occurring element and is used as fuel in nuclear reactors.",
    commonUses: ["Nuclear fuel", "Nuclear weapons", "Radiation shielding", "Geological dating"]
  },
  {
    atomicNumber: 93, symbol: "Np", name: "Neptunium", atomicMass: 237,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 7, ypos: 10, electronConfiguration: "[Rn] 5f⁴ 6d¹ 7s²", shells: [2, 8, 18, 32, 22, 9, 2],
    phase: "Solid", density: 20.45, meltingPoint: 912, boilingPoint: 4447,
    electronegativity: 1.36, ionizationEnergy: 605, atomicRadius: null,
    discoveredBy: "Edwin McMillan", yearDiscovered: 1940,
    summary: "Neptunium is the first transuranium element, produced artificially by neutron bombardment.",
    commonUses: ["Neutron detectors", "Plutonium-238 production", "Research"]
  },
  {
    atomicNumber: 94, symbol: "Pu", name: "Plutonium", atomicMass: 244,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 8, ypos: 10, electronConfiguration: "[Rn] 5f⁶ 7s²", shells: [2, 8, 18, 32, 24, 8, 2],
    phase: "Solid", density: 19.84, meltingPoint: 912.5, boilingPoint: 3505,
    electronegativity: 1.28, ionizationEnergy: 585, atomicRadius: null,
    discoveredBy: "Glenn T. Seaborg", yearDiscovered: 1940,
    summary: "Plutonium is a radioactive actinide metal used in nuclear weapons and reactors.",
    commonUses: ["Nuclear reactors", "Nuclear weapons", "Space power sources (RTGs)"]
  },
  {
    atomicNumber: 95, symbol: "Am", name: "Americium", atomicMass: 243,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 9, ypos: 10, electronConfiguration: "[Rn] 5f⁷ 7s²", shells: [2, 8, 18, 32, 25, 8, 2],
    phase: "Solid", density: 13.69, meltingPoint: 1449, boilingPoint: 2880,
    electronegativity: 1.3, ionizationEnergy: 578, atomicRadius: null,
    discoveredBy: "Glenn T. Seaborg", yearDiscovered: 1944,
    summary: "Americium is a synthetic radioactive actinide metal. It is used in smoke detectors.",
    commonUses: ["Smoke detectors", "Research", "Industrial gauges"]
  },
  {
    atomicNumber: 96, symbol: "Cm", name: "Curium", atomicMass: 247,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 10, ypos: 10, electronConfiguration: "[Rn] 5f⁷ 6d¹ 7s²", shells: [2, 8, 18, 32, 25, 9, 2],
    phase: "Solid", density: 13.51, meltingPoint: 1613, boilingPoint: 3383,
    electronegativity: 1.3, ionizationEnergy: 581, atomicRadius: null,
    discoveredBy: "Glenn T. Seaborg", yearDiscovered: 1944,
    summary: "Curium is a hard dense radioactive silvery actinide metal. It glows red in the dark.",
    commonUses: ["Research", "Space batteries (RTGs)", "Alpha particle sources"]
  },
  {
    atomicNumber: 97, symbol: "Bk", name: "Berkelium", atomicMass: 247,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 11, ypos: 10, electronConfiguration: "[Rn] 5f⁹ 7s²", shells: [2, 8, 18, 32, 26, 9, 2],
    phase: "Solid", density: 14.79, meltingPoint: 1259, boilingPoint: null,
    electronegativity: 1.3, ionizationEnergy: 601, atomicRadius: null,
    discoveredBy: "Glenn T. Seaborg", yearDiscovered: 1949,
    summary: "Berkelium is a radioactive actinide metal. It was the fifth transuranium element synthesized.",
    commonUses: ["Scientific research", "Synthesis of heavier elements"]
  },
  {
    atomicNumber: 98, symbol: "Cf", name: "Californium", atomicMass: 251,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 12, ypos: 10, electronConfiguration: "[Rn] 5f¹⁰ 7s²", shells: [2, 8, 18, 32, 28, 8, 2],
    phase: "Solid", density: 15.1, meltingPoint: 1173, boilingPoint: null,
    electronegativity: 1.3, ionizationEnergy: 608, atomicRadius: null,
    discoveredBy: "Glenn T. Seaborg", yearDiscovered: 1950,
    summary: "Californium is a radioactive actinide element used as a neutron source.",
    commonUses: ["Neutron sources", "Cancer treatment", "Oil well logging", "Nuclear reactors startup"]
  },
  {
    atomicNumber: 99, symbol: "Es", name: "Einsteinium", atomicMass: 252,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 13, ypos: 10, electronConfiguration: "[Rn] 5f¹¹ 7s²", shells: [2, 8, 18, 32, 29, 8, 2],
    phase: "Solid", density: null, meltingPoint: 1133, boilingPoint: null,
    electronegativity: 1.3, ionizationEnergy: 619, atomicRadius: null,
    discoveredBy: "Albert Ghiorso", yearDiscovered: 1952,
    summary: "Einsteinium is a synthetic element first discovered in the fallout from a hydrogen bomb test.",
    commonUses: ["Research only", "Synthesis of heavier elements"]
  },
  {
    atomicNumber: 100, symbol: "Fm", name: "Fermium", atomicMass: 257,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 14, ypos: 10, electronConfiguration: "[Rn] 5f¹² 7s²", shells: [2, 8, 18, 32, 30, 8, 2],
    phase: "Solid", density: null, meltingPoint: 1125, boilingPoint: null,
    electronegativity: 1.3, ionizationEnergy: 627, atomicRadius: null,
    discoveredBy: "Albert Ghiorso", yearDiscovered: 1952,
    summary: "Fermium is a synthetic radioactive actinide element produced in nuclear reactions.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 101, symbol: "Md", name: "Mendelevium", atomicMass: 258,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 15, ypos: 10, electronConfiguration: "[Rn] 5f¹³ 7s²", shells: [2, 8, 18, 32, 31, 8, 2],
    phase: "Solid", density: null, meltingPoint: 1100, boilingPoint: null,
    electronegativity: 1.3, ionizationEnergy: 635, atomicRadius: null,
    discoveredBy: "Glenn T. Seaborg", yearDiscovered: 1955,
    summary: "Mendelevium was the first element to be synthesized one atom at a time.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 102, symbol: "No", name: "Nobelium", atomicMass: 259,
    category: "actinide", group: null, period: 7, block: "f",
    xpos: 16, ypos: 10, electronConfiguration: "[Rn] 5f¹⁴ 7s²", shells: [2, 8, 18, 32, 32, 8, 2],
    phase: "Solid", density: null, meltingPoint: 1100, boilingPoint: null,
    electronegativity: 1.3, ionizationEnergy: 642, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 1966,
    summary: "Nobelium is a synthetic radioactive element. Only minute amounts have ever been produced.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 103, symbol: "Lr", name: "Lawrencium", atomicMass: 266,
    category: "actinide", group: 3, period: 7, block: "d",
    xpos: 17, ypos: 10, electronConfiguration: "[Rn] 5f¹⁴ 7s² 7p¹", shells: [2, 8, 18, 32, 32, 8, 3],
    phase: "Solid", density: null, meltingPoint: 1900, boilingPoint: null,
    electronegativity: null, ionizationEnergy: 479, atomicRadius: null,
    discoveredBy: "Albert Ghiorso", yearDiscovered: 1961,
    summary: "Lawrencium is the last actinide and a synthetic radioactive element.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 104, symbol: "Rf", name: "Rutherfordium", atomicMass: 267,
    category: "transition metal", group: 4, period: 7, block: "d",
    xpos: 4, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d² 7s²", shells: [2, 8, 18, 32, 32, 10, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: 580, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 1964,
    summary: "Rutherfordium is a synthetic element. Only a few atoms have ever been produced.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 105, symbol: "Db", name: "Dubnium", atomicMass: 268,
    category: "transition metal", group: 5, period: 7, block: "d",
    xpos: 5, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d³ 7s²", shells: [2, 8, 18, 32, 32, 11, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 1970,
    summary: "Dubnium is a synthetic radioactive element. Only a few atoms have ever been produced.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 106, symbol: "Sg", name: "Seaborgium", atomicMass: 269,
    category: "transition metal", group: 6, period: 7, block: "d",
    xpos: 6, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d⁴ 7s²", shells: [2, 8, 18, 32, 32, 12, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Albert Ghiorso", yearDiscovered: 1974,
    summary: "Seaborgium is a synthetic radioactive element that decays rapidly.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 107, symbol: "Bh", name: "Bohrium", atomicMass: 270,
    category: "transition metal", group: 7, period: 7, block: "d",
    xpos: 7, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d⁵ 7s²", shells: [2, 8, 18, 32, 32, 13, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Gesellschaft für Schwerionenforschung", yearDiscovered: 1981,
    summary: "Bohrium is a synthetic element with very short half-lives.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 108, symbol: "Hs", name: "Hassium", atomicMass: 269,
    category: "transition metal", group: 8, period: 7, block: "d",
    xpos: 8, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d⁶ 7s²", shells: [2, 8, 18, 32, 32, 14, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Gesellschaft für Schwerionenforschung", yearDiscovered: 1984,
    summary: "Hassium is a synthetic element that decays through spontaneous fission.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 109, symbol: "Mt", name: "Meitnerium", atomicMass: 278,
    category: "unknown", group: 9, period: 7, block: "d",
    xpos: 9, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d⁷ 7s²", shells: [2, 8, 18, 32, 32, 15, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Gesellschaft für Schwerionenforschung", yearDiscovered: 1982,
    summary: "Meitnerium is a synthetic element named after Lise Meitner.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 110, symbol: "Ds", name: "Darmstadtium", atomicMass: 281,
    category: "unknown", group: 10, period: 7, block: "d",
    xpos: 10, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d⁸ 7s²", shells: [2, 8, 18, 32, 32, 16, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Gesellschaft für Schwerionenforschung", yearDiscovered: 1994,
    summary: "Darmstadtium is a synthetic element with very short half-lives.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 111, symbol: "Rg", name: "Roentgenium", atomicMass: 282,
    category: "unknown", group: 11, period: 7, block: "d",
    xpos: 11, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d⁹ 7s²", shells: [2, 8, 18, 32, 32, 17, 2],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Gesellschaft für Schwerionenforschung", yearDiscovered: 1994,
    summary: "Roentgenium is a synthetic element named after Wilhelm Röntgen.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 112, symbol: "Cn", name: "Copernicium", atomicMass: 285,
    category: "transition metal", group: 12, period: 7, block: "d",
    xpos: 12, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s²", shells: [2, 8, 18, 32, 32, 18, 2],
    phase: "Gas", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Gesellschaft für Schwerionenforschung", yearDiscovered: 1996,
    summary: "Copernicium is a synthetic element. It may be a gas at room temperature.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 113, symbol: "Nh", name: "Nihonium", atomicMass: 286,
    category: "post-transition metal", group: 13, period: 7, block: "p",
    xpos: 13, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", shells: [2, 8, 18, 32, 32, 18, 3],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "RIKEN", yearDiscovered: 2004,
    summary: "Nihonium is the first element discovered in Asia. It was confirmed in 2004.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 114, symbol: "Fl", name: "Flerovium", atomicMass: 289,
    category: "post-transition metal", group: 14, period: 7, block: "p",
    xpos: 14, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", shells: [2, 8, 18, 32, 32, 18, 4],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 1999,
    summary: "Flerovium is a synthetic element. It may have properties similar to lead.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 115, symbol: "Mc", name: "Moscovium", atomicMass: 290,
    category: "unknown", group: 15, period: 7, block: "p",
    xpos: 15, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", shells: [2, 8, 18, 32, 32, 18, 5],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 2003,
    summary: "Moscovium is a synthetic element named after the Moscow Oblast.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 116, symbol: "Lv", name: "Livermorium", atomicMass: 293,
    category: "unknown", group: 16, period: 7, block: "p",
    xpos: 16, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", shells: [2, 8, 18, 32, 32, 18, 6],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 2000,
    summary: "Livermorium is a synthetic element named after Lawrence Livermore National Laboratory.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 117, symbol: "Ts", name: "Tennessine", atomicMass: 294,
    category: "unknown", group: 17, period: 7, block: "p",
    xpos: 17, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", shells: [2, 8, 18, 32, 32, 18, 7],
    phase: "Solid", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 2010,
    summary: "Tennessine is a synthetic element, the second-heaviest known element.",
    commonUses: ["Research only"]
  },
  {
    atomicNumber: 118, symbol: "Og", name: "Oganesson", atomicMass: 294,
    category: "noble gas", group: 18, period: 7, block: "p",
    xpos: 18, ypos: 7, electronConfiguration: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", shells: [2, 8, 18, 32, 32, 18, 8],
    phase: "Gas", density: null, meltingPoint: null, boilingPoint: null,
    electronegativity: null, ionizationEnergy: null, atomicRadius: null,
    discoveredBy: "Joint Institute for Nuclear Research", yearDiscovered: 2002,
    summary: "Oganesson is the heaviest element and the only synthetic noble gas. Only a few atoms have been made.",
    commonUses: ["Research only"]
  },
];

export default elements;
