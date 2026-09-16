# Protein studio completion audit

The full reference-matching objective is **not complete**.

## Verified evidence

- `verify-protein-data.mjs` passes: original 1MBN file hash, 153 residues,
  eight helix records, 1,260 atoms and 43 heme atoms.
- AlphaFold explorer browser check passes: live EMBL-EBI download of P02185,
  154 residues, WebGL rendering, confidence/rainbow switching, sticks,
  fit and dialog cleanup. No page errors were observed in that check.
- Latest desktop screenshot and layout measurements show no document overflow
  at 1920 × 1080; mutation and timeline panels remain within the viewport.

## Not yet proven or incomplete

- 95% similarity: not achieved by current visual evidence. The reference's
  illustrated molecular silhouette differs from authentic coordinates.
- The four timeline previews do not yet communicate sufficiently distinct
  unfolded, secondary, packing and native states. Their coordinate morph is
  illustrative, not a molecular-dynamics trajectory.
- Full control regression is still being run after the contact connector fix.
  The previous run failed the hydrogen-bond visual-change assertion.
- Surface/core visibility needs visual improvement despite surface toggle
  pixel changes being verified.
- Responsive layouts and all controls require a complete current-state run.
- Existing enhancement tools contain placeholder options and must be audited;
  a toast alone is not evidence of an implemented scientific operation.
- Mutation estimates are labeled teaching heuristics, not validated ΔΔG.
  Neither AlphaFold nor external-tool links establish mutation energetics.
- ColabFold and OpenMM are linked resources, not installed/running backends.

Do not use the passing data/AlphaFold checks to claim full studio completion.
