import {appendFile,readFile} from 'node:fs/promises';

const rows=JSON.parse(await readFile('docs/chemistry-91-route-manifest.json','utf8'));
const row=rows.find(r=>r.id===39);
if(row.afterSSIMPercent!==76.5||rows.length!==91||rows.some(r=>r.status!=='In Progress'))throw Error('Checkpoint evidence/status mismatch');
const checkpoint=`

## Lab39 dedicated mechanism checkpoint — 2026-10-19

| Scope | Baseline | Latest verified evidence |
|---|---:|---|
| Lab39 desktop image similarity |49.8%|76.5% SSIM; after-desktop-39-v3.jpg|
| Mechanisms |Shared qualitative page|Eight curated pathways,22 stable mapped-atom stages; original SVG pair/fishhook animation and live Three.js graph views|
| Routing and sub tabs |Partial|Five sections,five legacy aliases,five exploration views; history/reload tested|
| Chemistry and data |Unverified|3342 counted model checks; five section/five alias/22 SVG render checks;24 actual UI observations and168 independently checked numeric CSV fields|
| Responsive behavior |Baseline captures|Final five mobile/tablet sections and five mobile views: no page overflow or broken images|
| Full91 acceptance |In Progress|All91 remain In Progress; visual/device/accessibility/performance and exhaustive stress acceptance remain open|

This dedicated module supersedes the earlier Lab39 interim shared-page/chart correction. It implements polar/radical HBr addition, two competing E2 branches, reductive ozonolysis, one/two equivalent alkyne HBr additions and a balanced net permanganate/diol comparison. Atom/formula/charge/total-electron conservation and electron-arrow bond/nonbonding bookkeeping are checked. Qualitative presentation timing is not reaction kinetics, energy, rate or yield prediction. No mockup crops or reference diagram pixels are used.

Organic conformers are generated with fixed-seed RDKit embedding; fragment placement, inorganic geometries and solid/net-unit icons follow documented assumptions. E2 examples show selected anti geometries without claiming universal product exclusivity. ZnO represents a formal net oxygen sink, not precipitation or final zinc speciation in every workup. MnO2 icons represent solid formula units, not freely dissolved ions or a lattice calculation. Alkyne and permanganate net transformations do not assert unsupported elementary mechanisms. Primary reference links and assumptions are in the module's Theory content and model inventory.

Actual browser evidence covers playback/pause/final stop, four sliders,five speeds, three 3D styles, atom maps/hydrogens, mapped-atom picking, orbit/pan/zoom/reset/fullscreen, diagram zoom/Fit/full reset, graphs, assessment, exports, forged/reordered-key imports, paused replay/fresh IDs and notebook persistence/isolation. Latest responsive evidence: chemistry-91-audit/hydrocarbon-final-responsive.json. Detailed evidence: chemistry-91-audit/hydrocarbon-browser-verification.json, hydrocarbon-ui-notebook.json, hydrocarbon-ui-observations.csv and hydrocarbon-export-validation.txt. Desktop/tablet/mobile comparison images are after-desktop-39-v3.jpg, after-tablet-39-v3.jpg and after-mobile-39-v3.jpg. Image similarity alone is not scientific or functional acceptance; older laboratory/studio captures retain their capture dates and are not fresh whole-app recaptures.

Regression suites for Labs37/38, studio/lab routing, selector isolation, model defaults/control bounds and catalogue/search navigation passed in this checkpoint. These are scoped checks, not proof that all91 routes are fully accepted. Next dedicated implementation: Lab40 EAS directing groups. No commit or push is performed by this checkpoint.
`;
for(const file of ['chemistry-ui-audit.md','chemistry-visual-comparison.md','chemistry-scientific-validation.md','chemistry-functional-test-results.md','chemistry-implementation-progress.md','chemistry-studio-lab-status.md'])await appendFile(`docs/${file}`,checkpoint);
console.log('Recorded Lab39 evidence in six Markdown reports; manifest preserves all91 In Progress.');
