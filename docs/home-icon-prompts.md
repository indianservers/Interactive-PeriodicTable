# Home PNG icon generation

Generated individually with the built-in image-generation tool. Final app assets: `public/assets/home-icons/*.png` (192 × 192 PNG, with alpha preserved). Original generated files are recorded in `home-icon-sources.json`. Related concepts reuse the same relevant subject icon; `src/data/homeIconManifest.js` maps all 8 categories, 18 subcategories, and 67 concepts.

## Simulator icon prompt

Use case: scientific-educational. Asset type: PNG app icon. Create one polished square icon of a glass Erlenmeyer flask containing cyan liquid with three rising bubbles, representing chemistry simulators and virtual labs. Dark midnight navy background (#09182b), luminous cyan and blue glass, subtle 3D shading, clean centered silhouette, generous 18% padding, readable at 48px. No text, no lettering, no border, no watermark. Save the generated PNG for use in the local project.

## Prompt template for the remaining 42 icons

Use case: scientific-educational. Asset type: individual square PNG icon for a chemistry learning app. Subject: {subject}. A single centered polished small 3D illustration, crisp simple recognizable silhouette at 48px, midnight navy background #09182b, cyan/blue accents with the scientifically relevant colors stated, gentle rim illumination, generous 18 percent padding. Consistent premium educational app icon style. No text, no labels, no logos, no watermark. Produce exactly ONE icon, not a sheet.

## Exact subjects

- **atom.png:** a blue atomic nucleus with three glowing elliptical electron orbits
- **gas.png:** a glass cylinder with a metallic piston above scattered blue gas particles
- **phases.png:** three glass chambers side by side with particles in ordered solid lattice, clustered liquid, and widely spaced gas
- **acid.png:** two small laboratory beakers, one pink acidic solution and one blue basic solution, with a pH test strip
- **stoichiometry.png:** red and blue molecular pairs combining, with one blue particle left over
- **polarity.png:** a bent water molecule with a directional dipole arrow and opposite color electrical poles
- **light.png:** a beam of rainbow light striking a small molecule
- **periodic.png:** a recognizable stepped periodic table of colorful square element tiles without lettering
- **trends.png:** three growing atomic spheres along a rising chart arrow
- **compare.png:** two different atomic spheres balanced on the two pans of a comparison balance scale
- **organic.png:** a six-membered carbon molecular ring with shaded blue and gray atoms
- **mechanism.png:** a carbon molecular ring with two curved glowing electron-flow arrows
- **synthesis.png:** three small molecule fragments and converging arrows assembling one larger molecule
- **isomer.png:** two mirrored tetrahedral molecules on opposite sides of a thin glass mirror
- **naming.png:** a small branched carbon molecule with a blank hanging identification tag
- **test.png:** three test tubes showing blue, violet and orange chemical test solutions
- **polymer.png:** a long curved chain of repeating blue and purple molecular beads
- **crystal.png:** an isometric cubic crystal lattice of blue spheres and connecting rods
- **coordination.png:** one purple central metal sphere coordinated to six cyan ligand spheres in an octahedral arrangement
- **metallurgy.png:** a glowing orange crucible pouring molten metal beside a small metallic ingot
- **protein.png:** a folded cyan and green protein ribbon with a helix and pleated strand
- **carbohydrate.png:** a hexagonal glucose-like molecular ring with small oxygen-red and carbon-blue spheres
- **membrane.png:** a small cutaway lipid bilayer with two rows of phospholipid heads and tails
- **dna.png:** an elegant blue and mint DNA double helix with visible connecting base-pair rungs
- **metabolism.png:** three energy-cycle arrows surrounding a cluster of three linked phosphate-like glowing spheres
- **drug.png:** a golden and blue capsule next to a small ball-and-stick molecule
- **adme.png:** a capsule with four small curved arrows leading through simplified body-organ silhouettes
- **dosage.png:** three pharmaceutical dosage forms: capsule, round tablet, and a small dropper bottle
- **quality.png:** a laboratory sample vial beside a magnifying glass with a check mark
- **buffer.png:** two connected laboratory flasks with blue and purple liquid and a balanced horizontal pH gauge
- **toxicology.png:** a red warning triangle beside a metal ion sphere enclosed by a curved chelating molecular chain
- **symmetry.png:** a luminous four-lobed purple and cyan molecular orbital with a vertical mirror plane
- **immersive.png:** a sleek dark VR headset with a floating cyan molecule above it
- **inventor.png:** a small molecular model on a blueprint tile with a luminous lightbulb
- **balance.png:** a chemistry balance scale with red and blue molecular clusters balanced on each side
- **spectroscopy.png:** a glass prism splitting a light beam into rainbow colors over a clean spectrum with three peaks
- **research.png:** a microscope next to a small blue scientific graph
- **learn.png:** an open midnight-blue book with a tiny cyan atom floating above its pages
- **quiz.png:** a dark-blue clipboard with three cyan checkbox marks and a pencil
- **saved.png:** a glowing blue bookmark layered over two small science reference cards
- **progress.png:** three ascending blue bars with a cyan upward arrow
- **curriculum.png:** a branching learning map of connected blue nodes with one mint highlighted destination

## Asset preparation

`scripts/prepare-home-icons.mjs` downsizes the generated source artwork to 192 × 192 and writes optimized PNGs. It uses Sharp via the `HOME_ICON_SHARP` environment variable, or a locally installed `sharp` package. `scripts/home-icon-contact-sheet.mjs` creates the labeled visual review sheet.

