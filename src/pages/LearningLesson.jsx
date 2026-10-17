import { useMemo, useState } from "react";
import { elements } from "../data/elements.js";
import { ElectronShellDiagram } from "../components/visualizers/ElectronShellDiagram.jsx";
import LabMoleculeStage from "../modules/core-simulations/LabMoleculeStage.jsx";
import KnowledgeCheck from "../components/common/KnowledgeCheck.jsx";
import "./learningLesson.css";

export const learningUnits = {
  "Atomic Structure": {
    route: "atom",
    lessons: [
      [
        "Particles and isotopes",
        "An atom contains a positive nucleus of protons and neutrons, surrounded by electrons. Atomic number Z counts protons; mass number A counts protons and neutrons. Isotopes share Z but differ in A. A neutral atom has Z electrons.",
        "How many electrons does a neutral sodium atom (Z = 11) contain?",
        "11",
        "23",
      ],
      [
        "Electron shells and orbitals",
        "Shells have principal quantum number n. An orbital holds at most two electrons with opposite spin. The Aufbau principle fills lower-energy orbitals first; Hund’s rule places electrons singly in equal-energy orbitals before pairing.",
        "What is the maximum occupancy of one orbital?",
        "Two electrons",
        "Eight electrons",
      ],
      [
        "Valence electrons",
        "Outer-shell electrons strongly influence main-group chemistry. Sodium commonly loses one electron to form Na+, while chlorine commonly gains one to form Cl−. Shell diagrams simplify the quantum description.",
        "What changes when a sodium atom forms Na+?",
        "It loses one electron",
        "It loses one proton",
      ],
    ],
  },
  Stoichiometry: {
    route: "balancer",
    lessons: [
      [
        "Moles and molar mass",
        "The mole relates particle count to measurable mass: n = m/M. M is molar mass in g/mol and m is mass in grams. One mole contains 6.02214076 × 10²³ specified entities.",
        "How many moles are in 36.03 g of water (M = 18.015 g/mol)?",
        "2 mol",
        "18 mol",
      ],
      [
        "Balanced equations",
        "A balanced equation conserves every element. In 2 H₂ + O₂ → 2 H₂O, coefficients describe mole ratios, not the masses of reactants. Never alter a formula’s subscripts to balance an equation.",
        "What is the H2:O2 mole ratio in water formation?",
        "2:1",
        "1:2",
      ],
      [
        "Limiting reagents and yield",
        "Divide the available amount of each reactant by its stoichiometric coefficient. The smallest quotient determines the reaction extent. Percent yield = actual yield / theoretical yield × 100.",
        "With 2 mol H2 and 2 mol O2, what limits water formation?",
        "Hydrogen",
        "Oxygen",
      ],
    ],
  },
  Equilibrium: {
    route: "acid-base-solutions",
    lessons: [
      [
        "Dynamic equilibrium",
        "In a closed system at equilibrium, forward and reverse reaction rates are equal. Reactants and products remain present; their concentrations are constant but need not be equal.",
        "At dynamic equilibrium, what is equal?",
        "Forward and reverse reaction rates",
        "Reactant and product concentrations",
      ],
      [
        "Equilibrium constants",
        "For aA + bB ⇌ cC + dD, Kc = [C]^c[D]^d / ([A]^a[B]^b), using equilibrium concentrations. Pure solids and pure liquids do not appear in this expression.",
        "Which quantities belong in Kc?",
        "Equilibrium concentrations",
        "Only initial concentrations",
      ],
      [
        "Predicting changes",
        "Compare the reaction quotient Q with K. If Q < K, the reaction proceeds forward; if Q > K, it proceeds in reverse. A catalyst accelerates approach to equilibrium without changing K.",
        "What does a catalyst change?",
        "Time to reach equilibrium",
        "The equilibrium constant",
      ],
    ],
  },
  "Chemical Bonding": {
    route: "molecule-polarity",
    lessons: [
      [
        "Bond types",
        "Ionic bonding involves electrostatic attraction between ions. Covalent bonding involves shared electron density. Metallic bonding involves mobile electrons within a metal lattice. Real bonds often lie between idealised extremes.",
        "What is shared in a covalent bond?",
        "Electron density",
        "Atomic nuclei",
      ],
      [
        "Molecular geometry",
        "VSEPR predicts shapes from electron domains around a central atom. Water has two bonding pairs and two lone pairs, producing a bent shape; carbon dioxide has two bonding domains, producing a linear shape.",
        "What is the shape of water?",
        "Bent",
        "Linear",
      ],
      [
        "Polarity and symmetry",
        "A molecule’s net dipole is the vector sum of its bond dipoles. Polar bonds can cancel in symmetric molecules such as CO₂. Bent water has a nonzero resultant dipole.",
        "Why is CO2 nonpolar?",
        "Its opposing bond dipoles cancel",
        "Its C–O bonds have no polarity",
      ],
    ],
  },
  Thermodynamics: {
    route: "thermodynamics",
    lessons: [
      [
        "Energy and enthalpy",
        "The first law is ΔU = q + w, with work defined as work done on the system. At constant pressure with only pressure–volume work, heat transferred equals ΔH. Exothermic processes have negative ΔH.",
        "What is the sign of ΔH for an exothermic reaction?",
        "Negative",
        "Positive",
      ],
      [
        "Entropy",
        "Entropy reflects the distribution of energy among accessible microstates. The second law requires total entropy of an isolated system to increase for a spontaneous irreversible change.",
        "Which entropy determines spontaneity for an isolated system?",
        "Total entropy",
        "Only the reacting substance’s entropy",
      ],
      [
        "Gibbs energy",
        "At constant temperature and pressure, ΔG = ΔH − TΔS. Negative ΔG favours forward change. Temperature must be in kelvin and entropy units must match enthalpy units.",
        "What does negative ΔG indicate?",
        "A thermodynamically favourable forward change",
        "An always-fast reaction",
      ],
    ],
  },
  Spectroscopy: {
    route: "spectroscopy-interpreter",
    lessons: [
      [
        "Light and energy",
        "Photon energy is E = hν = hc/λ. Shorter wavelengths have greater photon energies. Absorption requires an allowed transition matching the energy gap.",
        "Which has higher photon energy?",
        "Ultraviolet light",
        "Infrared light",
      ],
      [
        "Infrared spectra",
        "IR spectroscopy probes vibrational transitions. A vibration is IR active when it changes the molecular dipole moment. Characteristic absorptions help identify functional groups.",
        "What makes a vibration IR active?",
        "A changing dipole moment",
        "A permanent electric charge",
      ],
      [
        "NMR and mass spectra",
        "NMR reports chemical environments of magnetic nuclei. Mass spectrometry measures mass-to-charge ratios of ions and their fragments. Combine evidence from several methods to identify a structure.",
        "What does a mass spectrum measure?",
        "Mass-to-charge ratio",
        "Bond angles",
      ],
    ],
  },
  "Organic Chemistry": {
    route: "organic-mechanisms",
    lessons: [
      [
        "Functional groups",
        "Functional groups are recurring atom arrangements that influence reactivity, including alcohols, carbonyl compounds and carboxylic acids. Identify the group before predicting a reaction.",
        "Which group identifies an alcohol?",
        "Hydroxyl bonded to saturated carbon",
        "A carbon–carbon double bond",
      ],
      [
        "Reaction mechanisms",
        "Curved arrows describe electron-pair movement from electron-rich sites to electron-poor sites. Track bonds, formal charge and atom conservation at each step.",
        "Where does an electron-pair arrow start?",
        "At a bond or lone pair",
        "At an empty orbital",
      ],
      [
        "Isomerism",
        "Constitutional isomers differ in connectivity; stereoisomers share connectivity but differ in spatial arrangement. Chirality and restricted rotation can produce distinct stereoisomers.",
        "What differs between constitutional isomers?",
        "Atom connectivity",
        "The number of atoms of each element",
      ],
    ],
  },
  "Inorganic Chemistry": {
    route: "inorganic-coordination",
    lessons: [
      [
        "Coordination compounds",
        "A coordination compound contains a central metal bonded to ligands that donate electron pairs. Coordination number counts donor atoms directly bonded to the metal.",
        "What does coordination number count?",
        "Donor atoms bonded to the metal",
        "Only the number of ligand molecules",
      ],
      [
        "Crystals and lattices",
        "A crystal repeats a unit cell through space. Ionic lattice stability depends on electrostatic attraction, ionic charges and distances. Crystal structure affects material properties.",
        "What repeats in a crystal lattice?",
        "A unit cell",
        "A single isolated molecule in every case",
      ],
      [
        "Periodic patterns",
        "Effective nuclear charge, shielding and electron configurations explain broad periodic trends. Transition-metal behaviour also depends on partially occupied d orbitals and multiple accessible oxidation states.",
        "What helps explain periodic trends?",
        "Nuclear charge and electron shielding",
        "Atomic mass alone",
      ],
    ],
  },
  Biochemistry: {
    route: "bio-proteins",
    lessons: [
      [
        "Biomolecules",
        "Proteins, nucleic acids, carbohydrates and lipids play distinct roles in cells. Their functions depend on molecular structure, interactions and chemical environment.",
        "What links amino acids in a protein?",
        "Peptide bonds",
        "Phosphodiester bonds",
      ],
      [
        "Enzymes",
        "Enzymes accelerate reactions by lowering activation barriers. They do not change the reaction’s equilibrium constant. Activity depends on substrate, pH, temperature and inhibitors.",
        "What does an enzyme lower?",
        "The activation barrier",
        "The equilibrium free-energy difference",
      ],
      [
        "Metabolism",
        "Metabolic pathways couple reactions and regulate material and energy flow. ATP hydrolysis can drive otherwise unfavourable processes when reactions are chemically coupled.",
        "How can an unfavourable process proceed?",
        "By coupling to a favourable reaction",
        "By violating energy conservation",
      ],
    ],
  },
};

export default function LearningLesson({ unit, onBack, onNavigate }) {
  const [index, setIndex] = useState(0),
    [section, setSection] = useState("Study"),
    [atom, setAtom] = useState(10),
    [mass, setMass] = useState(36.03),
    [molecule, setMolecule] = useState("H2O");
  const [done, setDone] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("chemistry-lessons-completed") || "[]",
      );
    } catch {
      return [];
    }
  });
  const topic = learningUnits[unit],
    lesson = topic.lessons[index],
    key = `${unit}:${index}`;
  const questions = useMemo(
    () => [
      {
        prompt: lesson[2],
        correct: 0,
        options: [
          { id: 0, label: lesson[3] },
          { id: 1, label: lesson[4] },
        ],
      },
    ],
    [lesson],
  );
  const complete = () => {
    const next = Array.from(new Set([...done, key]));
    setDone(next);
    localStorage.setItem("chemistry-lessons-completed", JSON.stringify(next));
  };
  return (
    <div className="learning-lesson">
      <header>
        <button onClick={onBack}>← Learning Path</button>
        <h1>{unit}</h1>
        <nav>
          {["Study", "Explore", "Tools", "Progress", "Resources"].map(
            (name) => (
              <button
                key={name}
                aria-pressed={section === name}
                onClick={() => setSection(name)}
              >
                {name}
              </button>
            ),
          )}
        </nav>
      </header>
      <div className="lesson-layout">
        <aside>
          <h2>Lessons</h2>
          {topic.lessons.map(([name], i) => (
            <button
              key={name}
              aria-current={index === i ? "page" : undefined}
              onClick={() => {
                setIndex(i);
                setSection("Study");
              }}
            >
              {done.includes(`${unit}:${i}`) ? "✓ " : ""}
              {i + 1}. {name}
            </button>
          ))}
        </aside>
        <main>
          {section === "Study" && (
            <>
              <h2>{lesson[0]}</h2>
              <p>{lesson[1]}</p>
              {unit === "Atomic Structure" && (
                <>
                  <label>
                    Element
                    <select
                      value={atom}
                      onChange={(e) => setAtom(+e.target.value)}
                    >
                      {elements.map((e, i) => (
                        <option key={e.symbol} value={i}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="lesson-atom">
                    <ElectronShellDiagram element={elements[atom]} />
                  </div>
                </>
              )}
              {unit === "Stoichiometry" && (
                <label>
                  Water mass (g)
                  <input
                    type="number"
                    min="0"
                    value={mass}
                    onChange={(e) => setMass(e.target.value)}
                  />
                  <output>
                    {Number.isFinite(+mass) && +mass >= 0
                      ? `${(+mass / 18.015).toFixed(4)} mol`
                      : "Enter a nonnegative mass"}
                  </output>
                </label>
              )}
              {unit === "Chemical Bonding" && (
                <>
                  <select
                    aria-label="Lesson molecule"
                    value={molecule}
                    onChange={(e) => setMolecule(e.target.value)}
                  >
                    <option value="H2O">Water</option>
                    <option value="CO2">Carbon dioxide</option>
                    <option value="CH4">Methane</option>
                  </select>
                  <LabMoleculeStage moleculeId={molecule} />
                </>
              )}
              <h3>Knowledge check</h3>
              <KnowledgeCheck key={key} questions={questions} />
              <button onClick={complete}>
                {done.includes(key)
                  ? "Lesson completed"
                  : "Mark lesson complete"}
              </button>
            </>
          )}
          {section === "Explore" && (
            <>
              <h2>Explore {unit}</h2>
              <p>Apply this lesson in the interactive workspace.</p>
              <button onClick={() => onNavigate(topic.route)}>
                Open {unit} activity
              </button>
            </>
          )}
          {section === "Tools" && (
            <>
              <h2>Practice tools</h2>
              <button onClick={() => onNavigate(topic.route)}>
                Open related simulation
              </button>
              <button onClick={() => onNavigate("balancer")}>
                Equation balancer
              </button>
              <button onClick={() => onNavigate("quiz")}>
                Chemistry challenges
              </button>
            </>
          )}
          {section === "Progress" && (
            <>
              <h2>Your progress</h2>
              <p>
                {
                  topic.lessons.filter((_, i) => done.includes(`${unit}:${i}`))
                    .length
                }{" "}
                / {topic.lessons.length} lessons completed
              </p>
              {topic.lessons.map(([name], i) => (
                <p key={name}>
                  {done.includes(`${unit}:${i}`) ? "Completed" : "To study"}:{" "}
                  {name}
                </p>
              ))}
            </>
          )}
          {section === "Resources" && (
            <>
              <h2>Unit resources</h2>
              <p>{topic.lessons.map((l) => l[0]).join(" · ")}</p>
              <button onClick={() => onNavigate(topic.route)}>
                Related interactive reference
              </button>
              <button onClick={() => onNavigate("library")}>
                Chemistry library
              </button>
            </>
          )}
          <footer>
            <button
              disabled={index === 0}
              onClick={() => {
                setIndex((i) => i - 1);
                setSection("Study");
              }}
            >
              Previous lesson
            </button>
            <button
              onClick={() => {
                if (index < topic.lessons.length - 1) {
                  setIndex((i) => i + 1);
                  setSection("Study");
                } else onBack();
              }}
            >
              {index < topic.lessons.length - 1
                ? "Next lesson"
                : "Return to Learning Path"}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
