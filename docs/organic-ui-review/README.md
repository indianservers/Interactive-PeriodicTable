# Organic workspace redesign review

Route: http://localhost:2411/#visuals/organic

The layout was rebuilt against the supplied target. The old 70-pixel bottom reservation and duplicate floating controls were removed for this route. Panels now occupy the viewport, with internal scrolling. The canvas includes connected curved arrows, reagent cards, vector structures, a clear central molecule, element legend and a compact stepper. The inspector includes the energy chart in Overview and a blue mechanism action.

## Changed source files

- src/pages/OrganicVisualsTargetPage.jsx — workspace components, drawers, controls and inspector.
- src/pages/organicNetworkData.js — typed reaction data, positions, conditions and searchable metadata.
- src/pages/organicVisualsTarget.css — viewport layout, responsive drawers, network styling.
- src/components/visualizers/OrganicMoleculeScene.jsx — transparent Three.js scene, atom hover/click, projected labels, keyboard rotation and camera reset.
- src/components/layout/AppShell.jsx — suppress duplicate floating controls only on organic-visuals.
- scripts/verify-organic-workspace.mjs — browser regression and screenshot checks.

No application libraries were added. Three.js and lucide-react were already installed. Browser verification used Playwright from the bundled development runtime.

## Chemistry corrections

- Ethanal boiling point is 20.2 °C; ethanol is 78.4 °C. The incorrect target-image product value was not copied.
- Ethene now has exactly two carbons joined by a double bond.
- Ethanal explicitly shows an aldehydic H, avoiding an implicit extra carbon at the line endpoint.
- Both the acid and ester drawings include a carbonyl double bond; the ester includes its oxygen linkage.
- Esterification uses ethanoic acid with concentrated sulfuric acid as catalyst.
- Inspector equations, functional groups, reagents and steps change with the selected pathway.

## Verification

- Production build: passed. Existing Vite chunk-size advisory remains.
- Changed-file whitespace check: passed.
- Browser audit: passed, zero captured console errors and page exceptions.
- Six viewport captures: 1672×941, 1366×768, 1536×864, 1920×1080, 820×1180, 390×844.
- Checked page overflow, card bounds, nonzero SVG path geometry, all four pathway selections, reaction and topic filters, formula and natural-language search.
- Verified real mouse-drag molecule rotation, wheel zoom, Fit, network zoom, labels, atom hover and selection.
- Verified filter/inspector collapse and restoration, mobile bottom sheets, all inspector tabs, play/pause/reset behavior, Home/Learn/Resources/My Lab routing.

Raw results: verification.json and layout-measurements.json.

## Visual comparison and limitations

Desktop and mobile captures are included in this folder. This is a reference-based reconstruction, not a measured 95% pixel match. The molecule pose and lighting differ from the raster reference. Scientifically incorrect features in the target were corrected. Smaller screens use compact controls and scrollable drawers.

The energy graph is qualitative, not measured thermochemical data. The mechanism view explains exam-level transformations and synchronized stages; it does not simulate a full elementary curved-arrow mechanism or continuous atom-by-atom bond rearrangement. The central model remains the ethanol source as the surrounding product pathway is explored.

