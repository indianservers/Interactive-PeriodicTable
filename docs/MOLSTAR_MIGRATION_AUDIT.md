# Mol* migration audit

Updated: 2026-09-09

## Platform

- React 18.3.1 with Vite 5.4.x and hash-based application routing in `src/App.jsx`.
- npm/package-lock is the existing package workflow.
- Mol* 4.18.0 is installed. 3Dmol.js 2.5.5 and Three.js 0.168.0 remain because specialist teaching renderers still use them.
- Available commands are `npm run dev` and `npm run build`; the project does not currently declare lint, typecheck, or unit-test scripts.
- Local coordinate assets used by the completed migrations: `public/assets/proteins/1MBN.pdb`, 13 nucleic-acid/protein-complex mmCIF samples under `public/assets/nucleic-acid/structures`, eight validated nucleotide SDF samples with corresponding 2D structures, the experimental 5IKR COX-2 complex plus its ID8 mefenamic-acid component under `public/assets/drug-discovery/structures`, and a PubChem CID 2519 caffeine 3D SDF under `public/assets/research-toolkit`.

## Renderer inventory

- Direct 3Dmol usage is isolated to `src/components/visualizers/ProteinMolecule.jsx`. It is retained only for the schematic folding-stage previews; the Protein Studio's coordinate-backed main viewport and AlphaFold inset now use the shared Mol* component.
- Three.js remains in the molecule editor, crystal/lattice builder, inorganic geometry tools, molecule-polarity simulation, orbital/surface/dynamics lessons, and molecular-symmetry overlay engine. Those are hybrid or intentionally non-Mol* surfaces.
- `src/modules/nucleic-acid-explorer/MolecularViewer.jsx` is now a thin page adapter over the shared Mol* component. It no longer initializes or disposes its own plugin instance.

## Route-to-file map

| Requested route | Current implementation |
| --- | --- |
| `/visuals/bio/proteins` | `src/pages/ProteinTargetPage.jsx` |
| `/visuals/bio/nucleic-acids` | `src/modules/nucleic-acid-explorer/NucleicAcidExplorer.jsx` plus `WorkspacePages.jsx` |
| `/drug-discovery` | `src/modules/drug-discovery/DrugDiscoveryTargetPage.jsx` |
| `/research-toolkit` | `src/pages/ResearchToolkitDashboardPage.jsx` |
| `/modules/biochemistry` | `src/pages/BiochemistryTargetPage.jsx` |
| `/visuals/bio` | `src/pages/BioVisualsTargetPage.jsx` |
| `/visuals/bio/membranes` | `src/pages/MembraneTargetPage.jsx` |
| `/visuals/bio/metabolism` | `src/pages/MetabolismTargetPage.jsx` |
| `/visuals/bio/carbohydrates` | `src/pages/CarbohydrateTargetPage.jsx` |
| `/visuals/pharma/toxicology` | `src/pages/ToxicologyTargetPage.jsx` |
| `/visuals/inorganic/crystals` | `src/pages/CrystalTargetPage.jsx` plus `src/components/crystal/CrystalScene.jsx` |
| `/molecule` | `src/pages/MoleculeScenePage.jsx` plus `src/components/visualizers/MoleculeScene.jsx` |
| `/visuals/organic` | `src/pages/OrganicVisualsTargetPage.jsx` |
| `/modules/inorganic` | `src/pages/InorganicDeepTargetPage.jsx` |
| `/molecular-symmetry` | `src/modules/molecular-symmetry/MolecularSymmetryModule.jsx` |
| `/simulations/molecule-polarity` | `src/modules/core-simulations/MoleculePolarityPage.jsx` |
| `/modules/spectroscopy` | `src/pages/SpectroscopyTargetPage.jsx` |
| `/visuals/organic/isomerism` | `src/pages/IsomerismTargetPage.jsx` |
| `/modules/retrosynthesis` | `src/pages/RetrosynthesisTargetPage.jsx` |
| `/visuals/organic/mechanisms` | `src/pages/OrganicMechanismTargetPage.jsx` |
| `/chemistry-inventor` | `src/modules/chemistry-inventor/ChemistryInventorTargetPage.jsx` |
| `/visuals/inorganic/coordination` | `src/pages/CoordinationTargetPage.jsx` |
| `/visuals/organic/polymers` | `src/pages/PolymerTargetPage.jsx` |
| `/visuals/inorganic/p-block` | `src/pages/PBlockTargetPage.jsx` |
| `/visuals/pharma` | `src/pages/PharmaVisualsTargetPage.jsx` |

## Shared foundation

`src/components/molecular-viewer` owns Mol* initialization, coordinate loading, lazy representation construction and visibility, synchronous compiled selection queries, coordinate-backed atom callbacks, ligand/residue camera focus, camera controls, screenshots, resize handling, lifecycle cleanup, loading/error states, format normalization, and scoped Mol* styling. Protein, DNA/RNA, and Drug Discovery are lazy-loaded at route level.

The main Protein Studio supports local PDB/mmCIF upload, direct RCSB PDB-ID loading, local 1MBN fallback, synchronized sequence selection, real coordinate-derived metadata, CPK ligand atoms, cartoon/stick/surface representations, camera reset/rotate/pan/zoom, fullscreen request, PNG export, and the existing lesson/measurement/mutation workflow. Remote load errors preserve the current local structure.

## Stage gate

- Stage 1 foundation: implemented for the Protein Studio migration and ready for reuse.
- Protein Structure Studio: migrated and browser-verified against `TargetUI/051__visuals__bio__proteins.jpg`.
- DNA & RNA Studio: consolidated onto the shared Mol* foundation and browser-verified against `TargetUI/054__visuals__bio__nucleic__acids.jpg`. All ten left-menu workspaces are working routes; Mol* is used for coordinate inspection while the nucleotide editor and replication/transcription mechanisms remain specialist hybrid surfaces.
- Drug Discovery Studio: migrated and browser-verified against `TargetUI/028__drug__discovery.jpg`. Its primary viewport uses the authentic experimental 5IKR COX-2–mefenamic-acid complex, supports single-site ligand focus, protein/ligand/complex modes, representations, coordinate selections, measurement capture, upload, and fullscreen/reset controls. The virtual C-17 optimization and ADME workflow is preserved but explicitly labelled as calculated/educational rather than experimental binding evidence.
- Chemistry Research Toolkit: migrated and browser-verified against `TargetUI/036__research__toolkit.jpg`. The former SVG pseudo-3D caffeine panel is now a shared Mol* workspace with local PDB/mmCIF/SDF samples, PDB-ID loading, PDB/mmCIF/CIF/MOL/SDF uploads, atom inspection, calculated distance capture, representation/camera/fullscreen/image controls, coordinate export, provenance, recent samples, and research notes. The unrelated 6DF4 provenance claim was removed after verification showed that entry is a TAF1 inhibitor complex, not caffeine.
- Biochemistry Virtual Lab: migrated and browser-verified against `TargetUI/064__modules__biochemistry.jpg`. The 25-lab simulation engine remains intact, while the six structure-appropriate investigations now use the shared Mol* viewer with a local experimental 1HEW lysozyme–tri-N-acetylchitotriose complex, ligand and catalytic-residue focus, atom inspection, representation controls, reset/fullscreen actions, and explicit structural-reference provenance. Specialist non-structure simulations remain unchanged.
- Crystal Lattice Explorer: migrated and browser-verified against `TargetUI/046__visuals__inorganic__crystals.jpg`. The custom Three.js construction engine remains the default for lattice repetition, defects, cutaways, polyhedra, Miller planes, and simulated diffraction. A complementary shared Mol* CIF-inspection mode now loads experimental COD 9008678 NaCl (Fm-3m, a = 5.64056 Å) from a local fallback, expands crystallographic symmetry, displays the unit cell, supports element-colored space-filling/ball-and-stick views, atom-coordinate inspection, reset/fullscreen, and validated CIF upload.
- Membrane Structure Studio: migrated and browser-verified against `TargetUI/052__visuals__bio__membranes.jpg`. The transport schematic, composition/environment controls, gradients, membrane potential, flux model, transport modes, and pump-cycle animation remain intact. A synchronized molecular mode now uses local experimental PDB 4HQJ (Na+-bound Na+/K+-ATPase, X-ray diffraction, 4.30 Å), with chain focus for the α/β/FXYD subunits, Na+/ADP/cholesterol ligand focus, atom-coordinate inspection, representation/camera/fullscreen controls, approximate labeled membrane-plane regions, and pump-step-driven ligand focus.
- Metabolism Studio and later pages: not yet migrated.
