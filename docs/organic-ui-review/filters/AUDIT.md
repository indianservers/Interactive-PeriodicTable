# Organic network filter and visual audit

## Root causes corrected

- The original dataset only contained four ethanol reactions. Selecting other families could not produce their own source molecules or reactions.
- Alcohols was an always-matching OR condition, so selecting another checkbox often changed nothing.
- The selected reaction was independent of filtered results, leaving a hidden reaction's inspector and stepper visible.
- Syllabus selection changed only a text label. This misleading selector was removed; coverage is explicitly representative examples, not a complete exam-board syllabus.

## Current behavior

Choose one topic network. Each has a distinct starting molecule. Reaction types are OR alternatives within that network; the molecule/reagent search intersects with both. Topic search only narrows the list of topic choices. Counts show available reactions within the active topic and search. Zero-result types are disabled; selected types remain removable. Changing topics clears the previous network's search and reaction-type selections. Clear filters preserves the chosen topic.

| Topic | Source | Included pathways |
|---|---|---|
| Alkanes | Methane | Radical chlorination |
| Alkenes | Ethene | Hydration, hydrogenation, HBr addition |
| Haloalkanes | Bromoethane | Hydrolysis, elimination, ammonia substitution |
| Alcohols | Ethanol | Partial oxidation, dehydration, full oxidation, esterification |
| Carbonyl compounds | Ethanal | Reduction, oxidation |
| Carboxylic acids | Ethanoic acid | Esterification |
| Esters | Ethyl ethanoate | Acid and alkaline hydrolysis |
| Amines | Ethanamine | Protonation |
| Aromatic compounds | Benzene | Nitration |

Selection is derived from visible results. Empty results have no reaction equation or stepper. The source model remains labeled as the topic's starting molecule. Product cards and the reaction inspector are synchronized with selection.

## Chemical and visual accuracy

- One molecular graph defines each formula, explicit-group 2D drawing, and 3D ball-and-stick connectivity. Double bonds are rendered as two bonds; formal charges appear in 2D ionic and nitro structures.
- Atom counts, valence, formal charge, displayed formulas, and both sides of every displayed equation are validated. Coproducts are retained in the equations, including ethanol from ester hydrolysis. Alkaline hydrolysis yields carboxylate, not free acid.
- Alkene hydrogenation is both addition and reduction; haloalkane hydrolysis is both substitution and hydrolysis. Carbonyl reduction is also nucleophilic addition.
- Methane uses tetrahedral H directions, ethene is planar/trigonal, and benzene's six-carbon ring is planar. Coordinates remain teaching schematics, not calculated or measured conformers. Benzene and carboxylate resonance representations are explicitly qualified.
- Removed the fixed 78 °C instruction for ethanol oxidation. Gentle heating with product removal by distillation is distinguished from reflux for further oxidation.
- Energy graphics are explicitly unquantified schematic barriers, not measured profiles or claims about reaction enthalpy. The stepper explains overall transformations, not complete elementary mechanisms.
- Reversible transformations have bidirectional network arrows and equilibrium equations.

## References used in the audit

These are source checks for the representative transformations, not a claim of complete curriculum alignment. Each reaction links to its reference in the inspector.

- [AQA organic chemistry specification](https://www.aqa.org.uk/subjects/chemistry/a-level/chemistry-7405/specification/subject-content/organic-chemistry)
- [RSC ethanol oxidation](https://edu.rsc.org/experiments/oxidation-of-ethanol/1757.article)
- [OpenStax ester chemistry](https://openstax.org/books/organic-chemistry/pages/21-6-chemistry-of-esters)
- [OpenStax amine basicity](https://openstax.org/books/organic-chemistry/pages/24-3-basicity-of-amines)
- [OpenStax alkene hydration](https://openstax.org/books/organic-chemistry/pages/8-4-hydration-of-alkenes-addition-of-h2o-by-oxymercuration)
- [OpenStax alkene hydrogenation](https://openstax.org/books/organic-chemistry/pages/8-6-reduction-of-alkenes-hydrogenation)
- [OpenStax radical halogenation](https://openstax.org/books/organic-chemistry/pages/10-2-preparing-alkyl-halides-from-alkanes-radical-halogenation)
- [OpenStax aromatic substitution](https://openstax.org/books/organic-chemistry/pages/16-2-other-aromatic-substitutions)

## Repeatable verification

- `node scripts/verify-organic-chemistry.mjs`: all 14 molecular graphs, 18 balanced reactions, nine topics, and 2,304 topic/type subsets; Unicode formula/reagent search; representative geometry assertions.
- `node scripts/verify-organic-filters.mjs`: real browser topic changes, all reaction selections, 2D/3D source identity, model atom counts/bond orders, type counts and availability, combinations, search, reset, empty-state synchronization, inspector content, mobile drawers, and label/node layout checks.
- `node scripts/verify-organic-workspace.mjs`: six viewport sizes and general control/navigation regressions.
- `node scripts/verify-organic-scroll.mjs`: wheel, keyboard, and scrollbar dragging in the canvas and both panels on desktop/mobile.
- `npm run build`: production compilation.

Browser scripts use Playwright. Set `ORGANIC_QA_MODULE_ROOT` to the installed runtime's node_modules directory if Playwright is not installed in this repository. Browser verification results are written to `verification.json`; screenshots in this directory show every topic.
