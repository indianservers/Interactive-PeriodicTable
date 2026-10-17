// A shared compound name or apparatus setting alone does not establish a match.
export const comparisonScopes = {
  'medicinal-chemistry': ['Cell-free IC50 (nM), acid forms of statins', 'PDB geometry and calculated contact distances (Å)', 'The structure tools do not predict enzyme IC50. Endpoint and units differ; raw inhibition curves are absent.'],
  'api-synthesis': ['Mechanochemical paracetamol synthesis; reported isolated amount and mass', 'Solution-phase teaching reactor', 'The reactor route is different. Only the narrower amount-to-mass consistency check below is supported.'],
  preformulation: ['Flow and angle of repose of binder-specific paracetamol granules', 'Illustrative pure-drug particle, solubility, DSC and PXRD models', 'The granule formulations and measured flow endpoints have no corresponding model in this workspace.'],
  'tablet-formulation': ['PGTBIS/Starch 1500 tablets, 20–50% drug, compressed at 17 kN', 'A different excipient formulation and exploratory compression coefficients', 'Matching compression force does not match formulation, geometry, material properties or model calibration.'],
  dissolution: ['45-minute endpoints of coded marketed tablets; phosphate pH 5.8, 900 mL, 50 rpm, 37 ± 1 °C', 'A generic release model with assumed hardness and formulation factors', 'Apparatus settings can coincide, but coded study tablets have no matched formulation/hardness preset. One endpoint cannot identify a release curve.'],
  hplc: ['Milk-matrix HPLC validation: 80:20 buffer/methanol, 10 µL, 243 nm, 30 °C', 'An illustrative chromatographic response model with separate coefficients', 'Changing method settings does not supply a validated matrix/column response model. Individual calibration injections and raw signals are not published in the imported dataset.'],
  stability: ['Instant jelly in the selected packaging and storage condition', 'A separate study-specific first-order model fitted to that same group', 'The tablet/blister teaching simulator is not used in this comparison. This is calibration to the displayed measurements, not independent validation.'],
  adme: ['Fasted effervescent paracetamol crossover study in healthy adults', 'Immediate-release teaching PK with assumed absorption and disposition parameters', 'Formulation-specific absorption, bioavailability and distribution inputs are not established for these subjects. Summary Cmax/AUC/Tmax do not supply an independent concentration-time dataset.'],
  toxicology: ['Aged male Wistar rats; repeated APAP exposure; serum biochemistry', 'Human dose/weight arithmetic and qualitative evidence context', 'Species, exposure protocol and endpoint differ. The calculator does not predict rat ALT/AST or human toxicity probabilities.'],
  dosage: ['Characterization of one effervescent product: weight, hardness, pH and effervescence time', 'Generic mathematical release mechanisms for other dosage-form presets', 'There is no matching effervescent formulation model or corresponding measured release time series.'],
  qc: ['Published UV assay and dosage-unit statistics for coded batches', 'A relative-standard area/concentration calculator', 'Raw sample/standard responses, dilution records and individual unit measurements are absent. Published assay percentages cannot be reverse-engineered into measured instrument inputs.'],
  buffers: ['Measured PBS, LB and bicarbonate solution pH at 22 °C', 'Ideal acetate equilibrium calculator at 25 °C', 'Buffer chemistry, composition and temperature do not match. No measured acetate titration/capacity dataset is available here.'],
};

export function reportedMeanSd(cell) {
  const match = String(cell).trim().match(/^([+-]?\d+(?:\.\d+)?)\s*±\s*(\d+(?:\.\d+)?)$/u);
  if (!match) throw new TypeError('A published mean ± SD is required; missing uncertainty is not filled.');
  return { mean: Number(match[1]), sd: Number(match[2]) };
}

export function fitPublishedStability(dataset, groupIndex = 0) {
  if (dataset?.pmcid !== 'PMC8950020' || dataset.tableId !== 'gels-08-00144-t004') throw new RangeError('Unsupported study protocol');
  if (!Number.isInteger(groupIndex) || groupIndex < 0 || groupIndex > 3) throw new RangeError('Select a published storage group');
  const row = dataset.groups[0].rows[groupIndex];
  const expected = [['Packaging 1','Real-time'],['Packaging 1','Accelerated'],['Packaging 2','Real-time'],['Packaging 2','Accelerated']][groupIndex];
  if (row[0] !== expected[0] || row[1] !== expected[1]) throw new RangeError('Storage group does not match the source protocol');
  // Do not convert the 2-week observation into an invented fractional month.
  const points = [2,4,5,6].map((column, month) => ({ month, reported: row[column], ...reportedMeanSd(row[column]) }));
  if (points.some(p => p.mean <= 0)) throw new RangeError('First-order log fitting requires positive means');
  const baseline = points[0].mean;
  const k = -points.slice(1).reduce((sum,p) => sum + p.month * Math.log(p.mean / baseline), 0) / 14;
  if (k < 0) throw new RangeError('These observations do not support a positive first-order decay rate');
  const results = points.map(p => { const calculated = baseline * Math.exp(-k * p.month); return { ...p, calculated, difference: calculated - p.mean }; });
  return {
    kind: 'calibrated-first-order-fit', independentValidation: false,
    group: expected.join(' · '), temperatureC: row[1] === 'Real-time' ? 30 : 40, rhPercent: 75,
    packaging: row[0] === 'Packaging 1' ? 'Sealed plastic sachets' : 'Sealed aluminium bags inside screw-capped amber glass bottles',
    baseline, kPerMonth: k, fittedMonthlyMeans: 3,
    method: 'Unweighted least squares of ln(C/C0) versus calendar-month labels, with C0 fixed to the shared published baseline. Fitted on months 1, 2 and 3. The 2-week observation is excluded because a month/day conversion is not reported.',
    rmse: Math.sqrt(results.slice(1).reduce((sum,p) => sum + p.difference ** 2, 0) / 3),
    results,
  };
}

export function synthesisMassComparison(dataset, identity) {
  if (dataset?.pmcid !== 'PMC6321105') throw new RangeError('Unsupported synthesis study');
  const row = dataset.groups[0].rows.find(row => row[0] === 'Paracetamol (6)');
  if (!row) throw new RangeError('Published paracetamol amount and mass are required');
  const amountMmol = Number(row[1]), reportedGrams = Number(row[2]);
  if (![amountMmol, reportedGrams].every(v => Number.isFinite(v) && v > 0)) throw new RangeError('Positive published amount and mass are required');
  if (identity?.CID !== 1983) throw new RangeError('Verified paracetamol identity is required');
  const molarMass = Number(identity.MolecularWeight);
  if (!Number.isFinite(molarMass) || molarMass <= 0 || !identity.sourceUrl) throw new RangeError('Sourced positive molar mass is required');
  const calculatedGrams = amountMmol / 1000 * molarMass;
  return { kind:'amount-mass-consistency', independentValidation:false, amountMmol, reportedGrams, reportedText:row[2], molarMass, calculatedGrams, differenceGrams:calculatedGrams-reportedGrams,
    identitySource:identity.sourceUrl,
    method:'m (g) = reported isolated amount (mmol) ÷ 1000 × PubChem molar mass (g/mol). Both amount and isolated mass come from the same paper; this is a rounded-quantity consistency check, not an independent yield or reactor prediction.' };
}

export function comparePublished(lab, dataset, { groupIndex = 0, identity } = {}) {
  if (!dataset || !comparisonScopes[lab]) throw new RangeError('Unknown pharmaceutical evidence workspace');
  const scope = comparisonScopes[lab];
  const base = { lab, sourceId:dataset.pmcid || dataset.sourceId, sourceUrl:dataset.sourceUrl, doi:dataset.doi, sourceSha256:dataset.sourceSha256, experimentalScope:scope[0], workspaceScope:scope[1], limitation:scope[2] };
  if (lab === 'stability') return { ...base, ...fitPublishedStability(dataset, groupIndex) };
  if (lab === 'api-synthesis') return { ...base, ...synthesisMassComparison(dataset, identity) };
  return { ...base, kind:'unmatched', independentValidation:false, results:[], reason:scope[2] };
}
