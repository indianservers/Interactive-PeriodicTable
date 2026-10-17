"""Build the remaining workspaces' evidence records from archived primary publications."""
import hashlib
import json
import re
import xml.etree.ElementTree as E
from pathlib import Path
import importlib.util

BASE = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('base_extractor', BASE / 'scripts/extract-pharma-published-data.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)

def expanded(table):
    output, spans = [], {}
    for tr in table.findall('.//tbody/tr'):
        row = {j: value[0] for j, value in spans.items()}
        spans = {j: (value[0], value[1]-1) for j, value in spans.items() if value[1] > 1}
        j = 0
        for td in tr:
            while j in row:
                j += 1
            for k in range(int(td.get('colspan', '1'))):
                row[j+k] = helper.text(td) if k == 0 else ''
                if int(td.get('rowspan', '1')) > 1:
                    spans[j+k] = (row[j+k], int(td.get('rowspan'))-1)
            j += int(td.get('colspan', '1'))
        if row:
            values = [row.get(k, '') for k in range(max(row)+1)]
            if any(values):
                output.append(values)
    return output

def dataset(pmcid, table_id, title, formulation, conditions, limitations, headers, columns=None):
    meta, table = helper.source(pmcid, table_id)
    values = expanded(table)
    if columns is not None:
        values = [[row[i] for i in columns] for row in values]
    return dict(**meta, displayTitle=title, formulation=formulation, conditions=conditions,
        limitations=limitations, transcriptionMethod='Extracted from archived JATS table cells; rowspans expanded without inventing observations.',
        groups=[helper.group(title, headers, values)])

def extract():
    data = {}
    data['adme'] = dataset('PMC11536717', 'Tab2', 'Measured human pharmacokinetics',
        'Paracetamol effervescent test product and Efferalgan reference product',
        'Randomized, single-dose, two-way crossover in 12 healthy male adults; fasted overnight; 7-day washout. Reference: 500 mg paracetamol. Blood sampled through 480 minutes. Table 2 summaries retain reported mean ± SD and standard error.',
        'These are study-specific pharmacokinetic summaries, not a measured concentration-time series or individual patient data. Table 2 gives reference Tmax 0.83 ± 0.25 h; the narrative also prints 0.93, so the table value is retained and the inconsistency disclosed. No bioequivalence conclusion or food/organ-function effects are inferred here.',
        ['Parameter (source units)', 'Product', 'N', 'Mean ± SD', 'Standard error'], [0,1,2,3,4])
    data['dosage'] = dataset('PMC11536717', 'Tab1', 'Measured effervescent tablet properties',
        'Published in-house paracetamol effervescent test product',
        'Study Table 1 reports in-vitro characterization of the test dosage form. Solution pH was measured after effervescing in 200 mL purified water. Specifications are the authors’ study specifications.',
        'This dataset characterizes one effervescent product, not all dosage forms in the designer. Units including hardness Kg/cm2 are retained as printed. “Comply” is the authors’ report, not a new release certification. No replicate count or variability is added where absent.',
        ['Test', 'Study specification', 'Reported result'])
    data['tablet-formulation'] = dataset('PMC10567489', 'tab4', 'Measured tablet compression outcomes',
        'Paracetamol tablets with pregelatinized Tacca involucrata starch (PGTBIS) or Starch 1500',
        'Direct compression at 17 kN, paracetamol loadings of 20, 30, 40 and 50%. TBF: tablet breaking force; TS: tensile strength; DT: disintegration time. Original summary values and “Friable” entries are retained.',
        'A different formulation from the teaching line. This table does not validate its model coefficients. Replicate counts and uncertainty should be interpreted using the source methods; no missing individual-tablet records are generated.',
        ['Drug (%)', 'Starch', 'Weight (mg)', 'Breaking force (N)', 'Tensile strength (MPa)', 'Friability (%)', 'Disintegration (min)'])
    data['preformulation'] = dataset('PMC8531771', 'tab7', 'Measured pre-compression granule flow',
        'Paracetamol granules made with Acacia etbaica gum (AET), PVP K-30 or Acacia BP (ABP)',
        'Published Table 7; n = 3, mean ± SD. Within each binder family the source labels 1–4 denote binder concentrations of 2, 4, 6 and 8% w/w. Flow rate and angle of repose characterize the prepared granules.',
        'These are pre-compression flow measurements, not pure-drug DSC/PXRD traces, polymorph data or universal excipient compatibility results. Study formulation codes remain unchanged.',
        ['Study formulation', 'Flow rate (g/s), mean ± SD', 'Angle of repose (degrees), mean ± SD'])
    data['qc'] = dataset('PMC10865243', 'tbl2', 'Measured pharmaceutical assay results',
        '15 coded marketed paracetamol tablet samples from Freetown',
        'Table 2: measured assay content and reported dosage-unit acceptance values. The study used UV spectrophotometry for assay. The original percentage scale, ± SD and published specifications are retained.',
        'Published batch-specific results, not current market surveillance or certification of a product entered in the calculator. Acceptance values are reported statistics, not raw individual-unit data. Source specifications are not silently applied to another batch.',
        ['Study sample', 'Assay (%), mean ± SD', 'Study assay limits (%)', 'Reported AV ± SD', 'Study AV criterion'])
    data['buffers'] = dataset('PMC11487416', 'sensors-24-05751-t001', 'Measured biological buffer pH',
        'Six buffer test solutions from a published dilution-monitoring experiment',
        'Undiluted solutions measured using a Schott CG 842 pH tester at 22 °C. PBS: phosphate-buffered saline; LB: Luria–Bertani culture medium. Filter and NAP-5 treatments and the source’s PBS s.f. label are retained.',
        'These are experimental pH readings for the listed biological buffers, not measurements of the acetate calculator. No measured buffer capacities or titration curves are supplied by this table; pH precision and replicates are not invented.',
        ['Study solution', 'Source solution name / treatment', 'Measured pH'])
    data['toxicology'] = dataset('PMC11018404', 'tab1', 'Measured animal toxicology endpoints',
        'Aged male Wistar rats exposed to acetaminophen (APAP)',
        'Rats were 24 months old; APAP-treated animals received 500 mg/kg body weight daily. Five treated and five control animals were sacrificed at 4, 6, 8, 10 and 12 weeks. The source reports one control row and means with SD. Letter suffixes a/b/c are the source’s statistical grouping annotations.',
        'Animal research only. These observations are not human dose limits, safety probabilities or treatment guidance. No human risk prediction, interpolation between time points or unreported control series is created. Units, statistical letters and the single published control row are retained.',
        ['Study group', 'ALT (U/L)', 'AST (U/L)', 'ALP (U/L)', 'Urea (mg/dL)', 'Creatinine (mg/dL)', 'Total protein (mg/dL), source unit'])
    data['toxicology'].update(license='CC BY-NC 4.0', licenseUrl='https://creativecommons.org/licenses/by-nc/4.0/')
    meta, _ = helper.source('PMC6321105', 'sec2-molecules-23-03163')
    root = E.parse(helper.ARCHIVE / 'PMC6321105.xml').getroot()
    paragraph = next(helper.text(p) for p in root.findall('.//p') if '0.99 g' in helper.text(p))
    match = re.search(r'p-2c \((10) mmol, (1\.09) g\) and 6 \((6\.6) mmol, (0\.99) g\).*?\((99)%\)', paragraph)
    if not match:
        raise ValueError('Published gram-scale synthesis paragraph no longer matches extraction')
    a,b,c,d,yield_percent = match.groups()
    data['api-synthesis'] = dict(**meta, displayTitle='Reported gram-scale synthesis yields',
        formulation='Mechanochemical preparation of 4-aminophenol and paracetamol',
        conditions='Primary research, Results section and Scheme 2b. The acetylation used equimolar 4-aminophenol and acetic anhydride, milling for 30 minutes with silica in Teflon equipment. The authors report isolated products on a gram scale.',
        limitations='This published solid-state route differs from the solution-phase teaching reactor. Yield, amount and mass are quoted as reported; no replicate uncertainty, reaction time-course or TLC observations are invented. The two yields are individual steps, not an asserted overall route yield.',
        transcriptionMethod='Amounts, isolated masses and step yields extracted from the archived Results paragraph mentioning 0.99 g; not calculated from simulator parameters.',
        groups=[helper.group('Published isolated products', ['Product', 'Reported amount (mmol)', 'Isolated mass (g)', 'Reported isolated yield (%)'], [['4-Aminophenol (p-2c)',a,b,yield_percent],['Paracetamol (6)',c,d,yield_percent]])])
    path = helper.ARCHIVE / 'statin-assay-transcription.json'
    medicinal = json.loads(path.read_text(encoding='utf-8'))
    medicinal.update(sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(), kind='Published experimental summaries',
        displayTitle='Measured statin enzyme inhibition', formulation='Acid forms of four statins in a cell-free HMG-CoA reductase assay',
        conditions='Primary study Table 2. Eight compound concentrations incubated with HMG-CoA (20 µM) and HMG-CoA reductase (0.9 µg/mL) for 3 minutes. Selected compounds: triplicate incubations; IC50 mean ± SD in nM.',
        limitations='Assay-specific in-vitro IC50 values, not docking scores or clinical efficacy. Simvastatin acid is distinguished from simvastatin lactone. No dose-response points, raw inhibition traces or new potency estimates are reconstructed.')
    data['medicinal-chemistry'] = medicinal
    return data

if __name__ == '__main__':
    target = BASE / 'src/modules/pharma-lab/data/remainingPublishedExperiments.json'
    target.write_text(json.dumps(extract(), ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
